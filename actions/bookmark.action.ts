"use server";

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

export async function getBookmarksAction() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        lesson: { companion: { OR: [{ userId }, { isPublic: true }] } },
      },
      include: { lesson: { include: { companion: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, status: 200 as const, data: bookmarks };
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return failure("Failed to fetch bookmarks", 500);
  }
}

export async function createBookmarkAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
      return failure("Invalid lesson ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, companion: { OR: [{ userId }, { isPublic: true }] } },
      select: { id: true },
    });
    if (!lesson) return failure("Lesson not found", 404);

    const bookmark = await prisma.bookmark.create({
      data: { userId, lessonId },
    });
    revalidatePath("/my-journey");
    return { success: true as const, status: 201 as const, data: bookmark };
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return failure("Failed to create bookmark", 500);
  }
}

export async function deleteBookmarkAction(bookmarkId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!Number.isSafeInteger(bookmarkId) || bookmarkId <= 0) {
      return failure("Invalid bookmark ID", 400);
    }

    const result = await prisma.bookmark.deleteMany({
      where: { id: bookmarkId, userId },
    });
    if (result.count === 0) return failure("Bookmark not found", 404);

    revalidatePath("/my-journey");
    return {
      success: true as const,
      status: 200 as const,
      data: { message: "Bookmark deleted successfully" },
    };
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return failure("Failed to delete bookmark", 500);
  }
}
