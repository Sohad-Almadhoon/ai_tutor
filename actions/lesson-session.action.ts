"use server";

import { LessonSessionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  failure,
  findEnumValue,
  isValidId,
  isValidPagination,
  success,
} from "@/actions/action-helpers";

export async function getLessonSessionsAction(input: {
  page?: number;
  limit?: number;
  status?: string | null;
}) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    if (!isValidPagination(page, limit)) {
      return failure("Invalid pagination parameters", 400);
    }

    const rawStatus = input.status ?? "COMPLETED";
    const status =
      rawStatus.toUpperCase() === "ALL"
        ? null
        : findEnumValue(Object.values(LessonSessionStatus), rawStatus);
    if (rawStatus.toUpperCase() !== "ALL" && !status) {
      return failure("Invalid session status", 400);
    }

    const where = { userId, ...(status ? { status } : {}) };
    const total = await prisma.lessonSession.count({ where });
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const sessions = await prisma.lessonSession.findMany({
      where,
      select: {
        id: true,
        status: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
        companion: { select: { name: true, companionIcon: true } },
        lesson: {
          select: {
            id: true,
            name: true,
            subject: true,
            topic: true,
            targetDurationMinutes: true,
            defaultCompanion: { select: { name: true, companionIcon: true } },
          },
        },
      },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });

    return success({
      sessions,
      pagination: { page: currentPage, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Failed to fetch lesson sessions:", error);
    return failure("Failed to fetch lesson sessions", 500);
  }
}

export async function getLessonSessionAction(sessionId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(sessionId)) {
      return failure("Invalid session ID", 400);
    }

    const session = await prisma.lessonSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        companion: { select: { name: true } },
        lesson: { select: { id: true, name: true, subject: true } },
      },
    });
    if (!session) return failure("Lesson session not found", 404);

    return success(session);
  } catch (error) {
    console.error("Failed to fetch lesson session:", error);
    return failure("Failed to fetch lesson session", 500);
  }
}

export async function getLessonSessionOverviewAction() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const groupedSessions = await prisma.lessonSession.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
      _sum: { durationSeconds: true },
    });

    const summary = {
      total: 0,
      completed: 0,
      inProgress: 0,
      abandoned: 0,
      durationSeconds: 0,
    };

    for (const group of groupedSessions) {
      summary.total += group._count._all;
      summary.durationSeconds += group._sum.durationSeconds ?? 0;
      if (group.status === LessonSessionStatus.COMPLETED) {
        summary.completed = group._count._all;
      } else if (group.status === LessonSessionStatus.IN_PROGRESS) {
        summary.inProgress = group._count._all;
      } else if (group.status === LessonSessionStatus.ABANDONED) {
        summary.abandoned = group._count._all;
      }
    }

    return success(summary);
  } catch (error) {
    console.error("Failed to fetch lesson session overview:", error);
    return failure("Failed to fetch lesson session overview", 500);
  }
}

export async function startLessonSessionAction(
  lessonId: number,
  companionId?: number
) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(lessonId)) {
      return failure("Invalid lesson ID", 400);
    }
    if (
      companionId !== undefined &&
      !isValidId(companionId)
    ) {
      return failure("Invalid companion ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, OR: [{ createdById: userId }, { isPublic: true }] },
      select: { id: true, defaultCompanionId: true },
    });
    if (!lesson) return failure("Lesson not found", 404);

    const selectedCompanionId = companionId ?? lesson.defaultCompanionId;
    if (selectedCompanionId === null) {
      return failure("A companion must be selected to start this lesson", 400);
    }
    const selectedCompanion = await prisma.companion.findFirst({
      where: {
        id: selectedCompanionId,
        OR: [{ userId }, { isPublic: true }],
      },
      select: { id: true },
    });
    if (!selectedCompanion) return failure("Companion not found", 404);

    const session = await prisma.$transaction(async (transaction) => {
      await transaction.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
      });

      return transaction.lessonSession.create({
        data: {
          userId,
          lessonId,
          companionId: selectedCompanion.id,
        },
        include: {
          companion: true,
          lesson: { include: { defaultCompanion: true } },
        },
      });
    });

    revalidatePath("/my-journey");
    revalidatePath("/learning-sessions");
    return success(session, 201);
  } catch (error) {
    console.error("Failed to start lesson session:", error);
    return failure("Failed to start lesson session", 500);
  }
}

async function finishLessonSessionAction(
  sessionId: number,
  status: "COMPLETED" | "ABANDONED",
  transcript: { role: "user" | "assistant"; text: string }[]
) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(sessionId)) {
      return failure("Invalid session ID", 400);
    }
    if (
      !Array.isArray(transcript) ||
      transcript.length > 1000 ||
      transcript.some(
        (entry) =>
          typeof entry !== "object" ||
          entry === null ||
          (entry.role !== "user" && entry.role !== "assistant") ||
          typeof entry.text !== "string" ||
          entry.text.length > 5000
      ) ||
      transcript.reduce((length, entry) => length + entry.text.length, 0) >
        100_000
    ) {
      return failure("Invalid lesson transcript", 400);
    }

    const session = await prisma.$transaction(async (transaction) => {
      const current = await transaction.lessonSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: LessonSessionStatus.IN_PROGRESS,
        },
        select: { startedAt: true },
      });
      if (!current) return null;

      const endedAt = new Date();
      const durationSeconds = Math.floor(
        (endedAt.getTime() - current.startedAt.getTime()) / 1000
      );
      const update = await transaction.lessonSession.updateMany({
        where: {
          id: sessionId,
          userId,
          status: LessonSessionStatus.IN_PROGRESS,
        },
        data: {
          status,
          endedAt,
          durationSeconds,
          transcript,
        },
      });
      if (update.count !== 1) return null;

      return transaction.lessonSession.findUnique({
        where: { id: sessionId },
        include: {
          companion: true,
          lesson: { include: { defaultCompanion: true } },
        },
      });
    });

    if (!session) return failure("In-progress lesson session not found", 404);

    revalidatePath("/my-journey");
    revalidatePath("/learning-sessions");
    return success(session);
  } catch (error) {
    console.error(`Failed to finish lesson session as ${status}:`, error);
    return failure("Failed to finish lesson session", 500);
  }
}

export async function completeLessonSessionAction(
  sessionId: number,
  transcript: { role: "user" | "assistant"; text: string }[]
) {
  return finishLessonSessionAction(
    sessionId,
    LessonSessionStatus.COMPLETED,
    transcript
  );
}

export async function abandonLessonSessionAction(
  sessionId: number,
  transcript: { role: "user" | "assistant"; text: string }[]
) {
  return finishLessonSessionAction(
    sessionId,
    LessonSessionStatus.ABANDONED,
    transcript
  );
}
