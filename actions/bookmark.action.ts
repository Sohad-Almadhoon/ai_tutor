"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { failure, isValidId, success } from "@/actions/action-helpers";

export async function getBookmarksAction() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        lesson: { OR: [{ createdById: userId }, { isPublic: true }] },
      },
      include: { lesson: { include: { defaultCompanion: true } } },
      orderBy: { createdAt: "desc" },
    });

    return success(bookmarks);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return failure("Failed to fetch bookmarks", 500);
  }
}

export async function createBookmarkAction(lessonId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(lessonId)) {
      return failure("Invalid lesson ID", 400);
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, OR: [{ createdById: userId }, { isPublic: true }] },
      select: { id: true },
    });
    if (!lesson) return failure("Lesson not found", 404);
    const bookmark = await prisma.bookmark.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId },
      update: {},
    });
    revalidatePath("/my-journey");
    revalidatePath("/bookmarks");
    revalidatePath("/lessons");
    return success(bookmark, 201);
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return failure("Failed to create bookmark", 500);
  }
}

export async function deleteBookmarkAction(bookmarkId: number) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!isValidId(bookmarkId)) {
      return failure("Invalid bookmark ID", 400);
    }

    const result = await prisma.bookmark.deleteMany({
      where: { id: bookmarkId, userId },
    });
    if (result.count === 0) return failure("Bookmark not found", 404);

    revalidatePath("/my-journey");
    revalidatePath("/bookmarks");
    revalidatePath("/lessons");
    return success({ message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return failure("Failed to delete bookmark", 500);
  }
}
