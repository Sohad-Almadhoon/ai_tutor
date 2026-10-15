"use server";

import { LessonSessionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ActionError = {
  success: false;
  error: string;
  status: 400 | 401 | 404 | 500;
};

function failure(error: string, status: ActionError["status"]): ActionError {
  return { success: false, error, status };
}

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
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return failure("Invalid pagination parameters", 400);
    }

    const rawStatus = input.status ?? "COMPLETED";
    const status = Object.values(LessonSessionStatus).find(
      (value) => value.toLowerCase() === rawStatus.toLowerCase()
    );
    if (!status) return failure("Invalid session status", 400);

    const where = { userId, status };
    const [sessions, total] = await Promise.all([
      prisma.lessonSession.findMany({
        where,
        include: {
          companion: true,
          lesson: { include: { companion: true } },
        },
        orderBy: [{ endedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lessonSession.count({ where }),
    ]);

    return {
      success: true as const,
      status: 200 as const,
      data: {
        sessions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  } catch (error) {
    console.error("Failed to fetch lesson sessions:", error);
    return failure("Failed to fetch lesson sessions", 500);
  }
}

export async function startLessonSessionAction(
  lessonId: number,
  companionId?: number
) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
      return failure("Invalid lesson ID", 400);
    }
    if (
      companionId !== undefined &&
      (!Number.isSafeInteger(companionId) || companionId <= 0)
    ) {
      return failure("Invalid companion ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, companion: { OR: [{ userId }, { isPublic: true }] } },
      select: { id: true, companionId: true },
    });
    if (!lesson) return failure("Lesson not found", 404);

    const selectedCompanionId = companionId ?? lesson.companionId;
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
          lesson: { include: { companion: true } },
        },
      });
    });

    revalidatePath("/my-journey");
    return { success: true as const, status: 201 as const, data: session };
  } catch (error) {
    console.error("Failed to start lesson session:", error);
    return failure("Failed to start lesson session", 500);
  }
}

export async function completeLessonSessionAction(sessionId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return failure("Invalid session ID", 400);
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
          status: LessonSessionStatus.COMPLETED,
          endedAt,
          durationSeconds,
        },
      });
      if (update.count !== 1) return null;

      return transaction.lessonSession.findUnique({
        where: { id: sessionId },
        include: {
          companion: true,
          lesson: { include: { companion: true } },
        },
      });
    });

    if (!session) return failure("In-progress lesson session not found", 404);

    revalidatePath("/my-journey");
    return { success: true as const, status: 200 as const, data: session };
  } catch (error) {
    console.error("Failed to complete lesson session:", error);
    return failure("Failed to complete lesson session", 500);
  }
}
