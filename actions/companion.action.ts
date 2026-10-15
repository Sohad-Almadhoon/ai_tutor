"use server";

import { Subject } from "@/generated/prisma/enums";
import { voiceOptions } from "@/constants";
import { createCompanionDescription } from "@/lib/companion-description";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ActionError = {
  success: false;
  error: string;
  status: 400 | 401 | 404 | 500;
};

function failure(
  error: string,
  status: ActionError["status"]
): ActionError {
  return { success: false, error, status };
}

export async function getCompanionsAction(input: {
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
      return failure(
        "page must be a positive integer and limit must be between 1 and 100",
        400
      );
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
      userId,
      ...(subject ? { lessons: { some: { subject } } } : {}),
      ...(title
        ? {
            OR: [
              { name: { contains: title, mode: "insensitive" as const } },
              {
                lessons: {
                  some: {
                    OR: [
                      { name: { contains: title, mode: "insensitive" as const } },
                      { topic: { contains: title, mode: "insensitive" as const } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [companions, total] = await Promise.all([
      prisma.companion.findMany({
        where,
        include: { lessons: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.companion.count({ where }),
    ]);

    return {
      success: true as const,
      status: 200 as const,
      data: {
        companions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch companions:", error);
    return failure("Failed to fetch companions", 500);
  }
}

export async function createCompanionAction(input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return failure("Invalid companion details", 400);
    }

    const name =
      "name" in input && typeof input.name === "string" ? input.name.trim() : "";
    const companionIcon =
      "companionIcon" in input && typeof input.companionIcon === "string"
        ? input.companionIcon.trim()
        : "";
    const voiceProvider =
      "voiceProvider" in input && typeof input.voiceProvider === "string"
        ? input.voiceProvider.trim()
        : "11labs";
    const voiceId =
      "voiceId" in input && typeof input.voiceId === "string"
        ? input.voiceId.trim()
        : "";
    const language =
      "language" in input && typeof input.language === "string"
        ? input.language.trim()
        : "";
    const speakingStyle =
      "speakingStyle" in input && typeof input.speakingStyle === "string"
        ? input.speakingStyle.trim()
        : "";
    const isPublic = "isPublic" in input ? input.isPublic : false;

    if (
      !name ||
      name.length > 100 ||
      !companionIcon ||
      companionIcon.length > 500 ||
      !voiceId ||
      voiceId.length > 200 ||
      !language ||
      language.length > 50 ||
      !speakingStyle ||
      speakingStyle.length > 200
    ) {
      return failure("Invalid companion details", 400);
    }

    if (
      !voiceOptions.some(
        (voice) => voice.provider === voiceProvider && voice.id === voiceId
      )
    ) {
      return failure("Invalid voice selection", 400);
    }

    if (typeof isPublic !== "boolean") {
      return failure("isPublic must be a boolean", 400);
    }

    let lesson:
      | {
          name: string;
          topic: string;
          subject: Subject;
          targetDurationMinutes: number;
        }
      | undefined;

    if ("lesson" in input) {
      const lessonInput = input.lesson;
      if (
        typeof lessonInput !== "object" ||
        lessonInput === null ||
        Array.isArray(lessonInput) ||
        !("name" in lessonInput) ||
        !("topic" in lessonInput) ||
        !("subject" in lessonInput) ||
        !("targetDurationMinutes" in lessonInput)
      ) {
        return failure("Invalid lesson details", 400);
      }

      const lessonName =
        typeof lessonInput.name === "string" ? lessonInput.name.trim() : "";
      const topic =
        typeof lessonInput.topic === "string" ? lessonInput.topic.trim() : "";
      const subject = Object.values(Subject).find(
        (value) =>
          typeof lessonInput.subject === "string" &&
          value.toLowerCase() === lessonInput.subject.toLowerCase()
      );
      const targetDurationMinutes = Number(lessonInput.targetDurationMinutes);

      if (
        !lessonName ||
        lessonName.length > 100 ||
        !topic ||
        topic.length > 500 ||
        !subject ||
        !Number.isSafeInteger(targetDurationMinutes) ||
        targetDurationMinutes < 1 ||
        targetDurationMinutes > 240
      ) {
        return failure("Invalid lesson details", 400);
      }

      lesson = { name: lessonName, topic, subject, targetDurationMinutes };
    }

    const companion = await prisma.companion.create({
      data: {
        name,
        description: createCompanionDescription(name, speakingStyle),
        companionIcon,
        voiceProvider,
        voiceId,
        language,
        speakingStyle,
        isPublic,
        userId,
        ...(lesson ? { lessons: { create: lesson } } : {}),
      },
      include: { lessons: true },
    });

    revalidatePath("/companions");
    return { success: true as const, status: 201 as const, data: companion };
  } catch (error) {
    console.error("Failed to create companion:", error);
    return failure("Failed to create companion", 500);
  }
}

export async function getCompanionByIdAction(id: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return failure("Invalid companion ID", 400);
    }

    const companion = await prisma.companion.findFirst({
      where: { id, OR: [{ userId }, { isPublic: true }] },
      include: { lessons: true },
    });
    if (!companion) return failure("Companion not found", 404);

    return { success: true as const, status: 200 as const, data: companion };
  } catch (error) {
    console.error("Failed to fetch companion:", error);
    return failure("Failed to fetch companion", 500);
  }
}

export async function updateCompanionVisibilityAction(
  id: number,
  isPublic: unknown
) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return failure("Invalid companion ID", 400);
    }
    if (typeof isPublic !== "boolean") {
      return failure("isPublic must be a boolean", 400);
    }

    const result = await prisma.companion.updateMany({
      where: { id, userId },
      data: { isPublic },
    });
    if (result.count === 0) return failure("Companion not found", 404);

    const companion = await prisma.companion.findUnique({ where: { id } });
    revalidatePath("/companions");
    return { success: true as const, status: 200 as const, data: companion };
  } catch (error) {
    console.error("Failed to update companion visibility:", error);
    return failure("Failed to update companion visibility", 500);
  }
}

export async function deleteCompanionAction(id: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return failure("Invalid companion ID", 400);
    }

    const result = await prisma.companion.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) return failure("Companion not found", 404);

    revalidatePath("/companions");
    return {
      success: true as const,
      status: 200 as const,
      data: { message: "Companion deleted successfully" },
    };
  } catch (error) {
    console.error("Failed to delete companion:", error);
    return failure("Failed to delete companion", 500);
  }
}
