"use server";

import {
  companionAvatars,
  FREE_COMPANION_LIMIT,
  languages,
  lessonDurations,
  speakingStyles,
  voiceOptions,
} from "@/constants";
import { Subject } from "@/generated/prisma/enums";
import { createCompanionDescription } from "@/lib/companion-description";
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

type GetCompanionsInput = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

type CreateCompanionInput = {
  name: string;
  companionIcon: string;
  voiceProvider: string;
  voiceId: string;
  language: string;
  speakingStyle: string;
  isPublic: boolean;
  lesson: {
    name: string;
    topic: string;
    subject: Subject;
    targetDurationMinutes: number;
  };
};

function parseCreateCompanionInput(input: unknown): CreateCompanionInput | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }

  const values = input as Record<string, unknown>;
  const lessonValues = values.lesson;
  if (
    typeof lessonValues !== "object" ||
    lessonValues === null ||
    Array.isArray(lessonValues)
  ) {
    return null;
  }

  const lesson = lessonValues as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const companionIcon = values.companionIcon;
  const voiceProvider = values.voiceProvider;
  const voiceId = values.voiceId;
  const language = values.language;
  const speakingStyle =
    typeof values.speakingStyle === "string" ? values.speakingStyle.trim() : "";
  const lessonName =
    typeof lesson.name === "string" ? lesson.name.trim() : "";
  const topic = typeof lesson.topic === "string" ? lesson.topic.trim() : "";
  const subject =
    typeof lesson.subject === "string"
      ? findEnumValue(Object.values(Subject), lesson.subject)
      : undefined;
  const targetDurationMinutes = lesson.targetDurationMinutes;
  const styles = speakingStyle.split(",").map((style) => style.trim());

  if (
    !name ||
    name.length > 100 ||
    typeof companionIcon !== "string" ||
    !companionAvatars.includes(companionIcon as (typeof companionAvatars)[number]) ||
    typeof voiceProvider !== "string" ||
    typeof voiceId !== "string" ||
    !voiceOptions.some(
      (voice) => voice.provider === voiceProvider && voice.id === voiceId
    ) ||
    typeof language !== "string" ||
    !languages.some((supportedLanguage) => supportedLanguage === language) ||
    !speakingStyle ||
    styles.some(
      (style) =>
        !speakingStyles.some(
          (supportedStyle) => supportedStyle.toLowerCase() === style.toLowerCase()
        )
    ) ||
    typeof values.isPublic !== "boolean" ||
    !lessonName ||
    lessonName.length > 100 ||
    !topic ||
    topic.length > 500 ||
    !subject ||
    typeof targetDurationMinutes !== "number" ||
    !Number.isSafeInteger(targetDurationMinutes) ||
    !lessonDurations.some((duration) => duration === targetDurationMinutes)
  ) {
    return null;
  }

  return {
    name,
    companionIcon,
    voiceProvider,
    voiceId,
    language,
    speakingStyle,
    isPublic: values.isPublic,
    lesson: {
      name: lessonName,
      topic,
      subject,
      targetDurationMinutes,
    },
  };
}

export async function getCompanionsAction(input: GetCompanionsInput = {}) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const sortFields = ["createdAt", "name", "id"] as const;
    const requestedSortBy = input.sortBy ?? "createdAt";
    const requestedSortOrder = input.sortOrder ?? "desc";

    if (!isValidPagination(page, limit)) {
      return failure("Invalid pagination parameters", 400);
    }
    if (!sortFields.some((field) => field === requestedSortBy)) {
      return failure("Invalid sort field", 400);
    }
    if (requestedSortOrder !== "asc" && requestedSortOrder !== "desc") {
      return failure("Invalid sort order", 400);
    }

    const companions = await prisma.companion.findMany({
      where: { OR: [{ userId }, { isPublic: true }] },
      include: {
        defaultLessons: {
          where: { OR: [{ createdById: userId }, { isPublic: true }] },
        },
      },
      orderBy: { [requestedSortBy]: requestedSortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return success({
      companions: companions.map((companion) => ({
        ...companion,
        lessons: companion.defaultLessons,
        isOwned: companion.userId === userId,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch companions:", error);
    return failure("Failed to fetch companions", 500);
  }
}

export async function createCompanionAction(input: unknown) {
  try {
    const { userId, has } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    const details = parseCreateCompanionInput(input);
    if (!details) return failure("Invalid companion details", 400);
    const isPro = has({ plan: "pro" });

    const { name, speakingStyle, lesson } = details;
    const companion = await prisma.$transaction(
      async (transaction) => {
        await transaction.user.upsert({
          where: { id: userId },
          update: {},
          create: { id: userId },
        });

        if (!isPro) {
          const companionCount = await transaction.companion.count({
            where: { userId },
          });
          if (companionCount >= FREE_COMPANION_LIMIT) return null;
        }

        return transaction.companion.create({
          data: {
            name,
            description: createCompanionDescription(name, speakingStyle),
            companionIcon: details.companionIcon,
            voiceProvider: details.voiceProvider,
            voiceId: details.voiceId,
            language: details.language,
            speakingStyle,
            isPublic: details.isPublic,
            userId,
            defaultLessons: {
              create: [
                {
                  ...lesson,
                  createdById: userId,
                  isPublic: details.isPublic,
                },
              ],
            },
          },
        });
      },
      { isolationLevel: "Serializable" }
    );

    if (!companion) {
      return failure(
        "The free plan allows up to 3 companions. Upgrade to Pro to create more.",
        403
      );
    }

    revalidatePath("/companions");
    return success(companion, 201);
  } catch (error) {
    console.error("Failed to create companion:", error);
    return failure("Failed to create companion", 500);
  }
}

export async function getCompanionByIdAction(id: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(id)) {
      return failure("Invalid companion ID", 400);
    }

    const companion = await prisma.companion.findFirst({
      where: { id, OR: [{ userId }, { isPublic: true }] },
      include: {
        defaultLessons: {
          where: { OR: [{ createdById: userId }, { isPublic: true }] },
        },
      },
    });
    if (!companion) return failure("Companion not found", 404);

    return success({
      ...companion,
      lessons: companion.defaultLessons,
      isOwned: companion.userId === userId,
    });
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
    if (!isValidId(id)) {
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
    return success(companion);
  } catch (error) {
    console.error("Failed to update companion visibility:", error);
    return failure("Failed to update companion visibility", 500);
  }
}

export async function updateCompanionAction(id: number, input: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(id)) {
      return failure("Invalid companion ID", 400);
    }
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return failure("Invalid companion details", 400);
    }

    const values = input as Record<string, unknown>;
    const name = typeof values.name === "string" ? values.name.trim() : "";
    const companionIcon = values.companionIcon;
    const voiceProvider = values.voiceProvider;
    const voiceId = values.voiceId;
    const language = values.language;
    const speakingStyle =
      typeof values.speakingStyle === "string" ? values.speakingStyle.trim() : "";
    const styles = speakingStyle.split(",").map((style) => style.trim());

    if (
      !name ||
      name.length > 100 ||
      typeof companionIcon !== "string" ||
      !companionAvatars.some((avatar) => avatar === companionIcon) ||
      typeof voiceProvider !== "string" ||
      typeof voiceId !== "string" ||
      !voiceOptions.some(
        (voice) => voice.provider === voiceProvider && voice.id === voiceId
      ) ||
      typeof language !== "string" ||
      !languages.some((supportedLanguage) => supportedLanguage === language) ||
      !speakingStyle ||
      styles.some(
        (style) =>
          !speakingStyles.some(
            (supportedStyle) =>
              supportedStyle.toLowerCase() === style.toLowerCase()
          )
      ) ||
      typeof values.isPublic !== "boolean"
    ) {
      return failure("Invalid companion details", 400);
    }

    const result = await prisma.companion.updateMany({
      where: { id, userId },
      data: {
        name,
        description: createCompanionDescription(name, speakingStyle),
        companionIcon,
        voiceProvider,
        voiceId,
        language,
        speakingStyle,
        isPublic: values.isPublic,
      },
    });
    if (result.count === 0) return failure("Companion not found", 404);

    const companion = await prisma.companion.findUnique({ where: { id } });
    if (!companion) return failure("Companion not found", 404);
    revalidatePath("/companions");
    revalidatePath(`/companions/${id}`);
    revalidatePath(`/companions/${id}/lessons`);
    revalidatePath("/lessons");
    revalidatePath("/learning-sessions");
    revalidatePath("/my-journey");
    return success(companion);
  } catch (error) {
    console.error("Failed to update companion:", error);
    return failure("Failed to update companion", 500);
  }
}

export async function deleteCompanionAction(id: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(id)) {
      return failure("Invalid companion ID", 400);
    }

    const result = await prisma.companion.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) return failure("Companion not found", 404);

    revalidatePath("/companions");
    revalidatePath("/lessons");
    revalidatePath("/learning-sessions");
    revalidatePath("/my-journey");
    return success({ message: "Companion deleted successfully" });
  } catch (error) {
    console.error("Failed to delete companion:", error);
    return failure("Failed to delete companion", 500);
  }
}
