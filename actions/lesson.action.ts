"use server";

import { Subject } from "@/generated/prisma/enums";
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

function parseLessonDetails(input: unknown) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }

  const name = "name" in input && typeof input.name === "string" ? input.name.trim() : "";
  const topic = "topic" in input && typeof input.topic === "string" ? input.topic.trim() : "";
  const subject =
    "subject" in input && typeof input.subject === "string"
      ? findEnumValue(Object.values(Subject), input.subject)
      : undefined;
  const targetDurationMinutes =
    "targetDurationMinutes" in input ? Number(input.targetDurationMinutes) : NaN;
  const defaultCompanionId =
    "defaultCompanionId" in input ? Number(input.defaultCompanionId) : NaN;
  const isPublic = "isPublic" in input ? input.isPublic : undefined;

  if (
    !name ||
    name.length > 100 ||
    !topic ||
    topic.length > 500 ||
    !subject ||
    !Number.isSafeInteger(targetDurationMinutes) ||
    targetDurationMinutes < 1 ||
    !isValidId(defaultCompanionId) ||
    typeof isPublic !== "boolean"
  ) {
    return null;
  }

  return { name, topic, subject, targetDurationMinutes, defaultCompanionId, isPublic };
}

export async function getCompanionLessonsAction(companionId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(companionId)) {
      return failure("Invalid companion ID", 400);
    }

    const companion = await prisma.companion.findFirst({
      where: { id: companionId, OR: [{ userId }, { isPublic: true }] },
      select: {
        id: true,
        name: true,
        companionIcon: true,
        description: true,
        language: true,
        defaultLessons: {
          where: { OR: [{ createdById: userId }, { isPublic: true }] },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        },
      },
    });
    if (!companion) return failure("Companion not found", 404);

    return success({
      companion: {
        id: companion.id,
        name: companion.name,
        companionIcon: companion.companionIcon,
        description: companion.description,
        language: companion.language,
      },
      lessons: companion.defaultLessons.map((lesson) => ({
        ...lesson,
        isOwned: lesson.createdById === userId,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch companion lessons:", error);
    return failure("Failed to fetch companion lessons", 500);
  }
}

export async function createLessonAction(input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const details = parseLessonDetails(input);
    if (!details) return failure("Invalid lesson details", 400);

    const companion = await prisma.companion.findFirst({
      where: {
        id: details.defaultCompanionId,
        OR: [{ userId }, { isPublic: true }],
      },
      select: { id: true },
    });
    if (!companion) return failure("Companion not found", 404);

    const { defaultCompanionId, isPublic, ...lessonDetails } = details;
    const lesson = await prisma.lesson.create({
      data: {
        ...lessonDetails,
        isPublic,
        createdById: userId,
        defaultCompanionId,
      },
      include: { defaultCompanion: true },
    });

    revalidatePath("/lessons");
    revalidatePath("/companions");
    return success(lesson, 201);
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return failure("Failed to create lesson", 500);
  }
}

export async function discoverLessonsAction(input: {
  page?: number;
  limit?: number;
  subject?: string | null;
  title?: string | null;
}) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    if (!isValidPagination(page, limit)) {
      return failure("Invalid pagination parameters", 400);
    }

    const rawSubject = input.subject?.trim();
    const subject = rawSubject
      ? findEnumValue(Object.values(Subject), rawSubject)
      : undefined;
    if (rawSubject && !subject) return failure("Invalid subject", 400);

    const title = input.title?.trim();
    const where = {
      OR: [{ createdById: userId }, { isPublic: true }],
      ...(subject ? { subject } : {}),
      ...(title
        ? {
            AND: [
              {
                OR: [
              { name: { contains: title, mode: "insensitive" as const } },
              { topic: { contains: title, mode: "insensitive" as const } },
              {
                defaultCompanion: {
                  name: { contains: title, mode: "insensitive" as const },
                },
              },
                ],
              },
            ],
          }
        : {}),
    };
    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: {
          defaultCompanion: true,
          bookmarks: {
            where: { userId },
            select: { id: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ]);

    const visibleLessons = lessons.map((lesson) => {
      const { bookmarks, ...lessonDetails } = lesson;
      const bookmark = bookmarks[0] ?? null;
      return {
        ...lessonDetails,
        isOwned: lesson.createdById === userId,
        bookmarkId: bookmark?.id ?? null,
        defaultCompanion:
          lesson.defaultCompanion &&
          (lesson.defaultCompanion.isPublic || lesson.defaultCompanion.userId === userId)
            ? lesson.defaultCompanion
            : null,
      };
    });

    return success({
      lessons: visibleLessons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to discover lessons:", error);
    return failure("Failed to discover lessons", 500);
  }
}

export async function getLessonByIdAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(lessonId)) {
      return failure("Invalid lesson ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, OR: [{ createdById: userId }, { isPublic: true }] },
      include: { defaultCompanion: true },
    });
    if (!lesson) return failure("Lesson not found", 404);

    return success(lesson);
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return failure("Failed to fetch lesson", 500);
  }
}

export async function updateLessonAction(lessonId: number, input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(lessonId)) {
      return failure("Invalid lesson ID", 400);
    }
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return failure("Invalid lesson details", 400);
    }

    const data: {
      name?: string;
      topic?: string;
      subject?: Subject;
      targetDurationMinutes?: number;
      isPublic?: boolean;
    } = {};
    if ("name" in input) {
      if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 100) {
        return failure("Invalid lesson name", 400);
      }
      data.name = input.name.trim();
    }
    if ("topic" in input) {
      if (typeof input.topic !== "string" || !input.topic.trim() || input.topic.trim().length > 500) {
        return failure("Invalid lesson topic", 400);
      }
      data.topic = input.topic.trim();
    }
    if ("subject" in input) {
      const subject =
        typeof input.subject === "string"
          ? findEnumValue(Object.values(Subject), input.subject)
          : undefined;
      if (!subject) return failure("Invalid subject", 400);
      data.subject = subject;
    }
    if ("targetDurationMinutes" in input) {
      const targetDurationMinutes = Number(input.targetDurationMinutes);
      if (
        !Number.isSafeInteger(targetDurationMinutes) ||
        targetDurationMinutes < 1
      ) {
        return failure("Invalid target duration", 400);
      }
      data.targetDurationMinutes = targetDurationMinutes;
    }
    if ("isPublic" in input) {
      if (typeof input.isPublic !== "boolean") {
        return failure("Invalid lesson visibility", 400);
      }
      data.isPublic = input.isPublic;
    }
    if (Object.keys(data).length === 0) {
      return failure("No lesson changes provided", 400);
    }

    const result = await prisma.lesson.updateMany({
      where: { id: lessonId, createdById: userId },
      data,
    });
    if (result.count === 0) return failure("Lesson not found", 404);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { defaultCompanion: true },
    });
    if (!lesson) return failure("Lesson not found", 404);
    revalidatePath("/lessons");
    revalidatePath(`/lessons/${lessonId}`);
    revalidatePath("/bookmarks");
    revalidatePath("/companions");
    if (lesson.defaultCompanionId) {
      revalidatePath(`/companions/${lesson.defaultCompanionId}/lessons`);
    }
    revalidatePath("/learning-sessions");
    revalidatePath("/my-journey");
    return success(lesson);
  } catch (error) {
    console.error("Failed to update lesson:", error);
    return failure("Failed to update lesson", 500);
  }
}

export async function deleteLessonAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(lessonId)) {
      return failure("Invalid lesson ID", 400);
    }

    const result = await prisma.lesson.deleteMany({
      where: { id: lessonId, createdById: userId },
    });
    if (result.count === 0) return failure("Lesson not found", 404);

    revalidatePath("/lessons");
    revalidatePath("/bookmarks");
    revalidatePath("/companions");
    revalidatePath("/learning-sessions");
    revalidatePath("/my-journey");
    return success({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return failure("Failed to delete lesson", 500);
  }
}
