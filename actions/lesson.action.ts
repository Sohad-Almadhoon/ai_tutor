"use server";

import { Subject } from "@/generated/prisma/enums";
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

function parseLessonDetails(input: unknown) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }

  const name = "name" in input && typeof input.name === "string" ? input.name.trim() : "";
  const topic = "topic" in input && typeof input.topic === "string" ? input.topic.trim() : "";
  const subject = Object.values(Subject).find(
    (value) =>
      "subject" in input &&
      typeof input.subject === "string" &&
      value.toLowerCase() === input.subject.toLowerCase()
  );
  const targetDurationMinutes =
    "targetDurationMinutes" in input ? Number(input.targetDurationMinutes) : NaN;

  if (
    !name ||
    name.length > 100 ||
    !topic ||
    topic.length > 500 ||
    !subject ||
    !Number.isSafeInteger(targetDurationMinutes) ||
    targetDurationMinutes < 1
  ) {
    return null;
  }

  return { name, topic, subject, targetDurationMinutes };
}

export async function getCompanionLessonsAction(companionId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(companionId) || companionId <= 0) {
      return failure("Invalid companion ID", 400);
    }

    const companion = await prisma.companion.findFirst({
      where: { id: companionId, OR: [{ userId }, { isPublic: true }] },
      include: { lessons: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
    });
    if (!companion) return failure("Companion not found", 404);

    return { success: true as const, status: 200 as const, data: companion.lessons };
  } catch (error) {
    console.error("Failed to fetch companion lessons:", error);
    return failure("Failed to fetch companion lessons", 500);
  }
}

export async function createLessonAction(companionId: number, input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(companionId) || companionId <= 0) {
      return failure("Invalid companion ID", 400);
    }

    const details = parseLessonDetails(input);
    if (!details) return failure("Invalid lesson details", 400);

    const companion = await prisma.companion.findFirst({
      where: { id: companionId, userId },
      select: { id: true },
    });
    if (!companion) return failure("Companion not found", 404);

    const lesson = await prisma.lesson.create({
      data: { ...details, companionId },
      include: { companion: true },
    });

    revalidatePath("/companions");
    return { success: true as const, status: 201 as const, data: lesson };
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
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return failure("Invalid pagination parameters", 400);
    }

    const rawSubject = input.subject?.trim();
    const subject = rawSubject
      ? Object.values(Subject).find(
          (value) => value.toLowerCase() === rawSubject.toLowerCase()
        )
      : undefined;
    if (rawSubject && !subject) return failure("Invalid subject", 400);

    const title = input.title?.trim();
    const where = {
      companion: { isPublic: true },
      ...(subject ? { subject } : {}),
      ...(title
        ? {
            OR: [
              { name: { contains: title, mode: "insensitive" as const } },
              { topic: { contains: title, mode: "insensitive" as const } },
              {
                companion: {
                  name: { contains: title, mode: "insensitive" as const },
                  isPublic: true,
                },
              },
            ],
          }
        : {}),
    };
    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: { companion: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ]);

    return {
      success: true as const,
      status: 200 as const,
      data: {
        lessons,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  } catch (error) {
    console.error("Failed to discover lessons:", error);
    return failure("Failed to discover lessons", 500);
  }
}

export async function getLessonByIdAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
      return failure("Invalid lesson ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, companion: { OR: [{ userId }, { isPublic: true }] } },
      include: { companion: true },
    });
    if (!lesson) return failure("Lesson not found", 404);

    return { success: true as const, status: 200 as const, data: lesson };
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return failure("Failed to fetch lesson", 500);
  }
}

export async function updateLessonAction(lessonId: number, input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
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
      const subject = Object.values(Subject).find(
        (value) =>
          typeof input.subject === "string" &&
          value.toLowerCase() === input.subject.toLowerCase()
      );
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
    if (Object.keys(data).length === 0) {
      return failure("No lesson changes provided", 400);
    }

    const result = await prisma.lesson.updateMany({
      where: { id: lessonId, companion: { userId } },
      data,
    });
    if (result.count === 0) return failure("Lesson not found", 404);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { companion: true },
    });
    revalidatePath("/companions");
    return { success: true as const, status: 200 as const, data: lesson };
  } catch (error) {
    console.error("Failed to update lesson:", error);
    return failure("Failed to update lesson", 500);
  }
}

export async function deleteLessonAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
      return failure("Invalid lesson ID", 400);
    }

    const result = await prisma.lesson.deleteMany({
      where: { id: lessonId, companion: { userId } },
    });
    if (result.count === 0) return failure("Lesson not found", 404);

    revalidatePath("/companions");
    return {
      success: true as const,
      status: 200 as const,
      data: { message: "Lesson deleted successfully" },
    };
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return failure("Failed to delete lesson", 500);
  }
}
