"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { failure, success } from "@/actions/action-helpers";

export async function getCurrentUserAction() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companions: {
          include: {
            defaultLessons: {
              where: { OR: [{ createdById: userId }, { isPublic: true }] },
            },
          },
        },
        lessons: true,
      },
    });
    if (!user) return failure("User not found", 404);

    return success(user);
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return failure("Failed to fetch user", 500);
  }
}

export async function getUserByIdAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);
    if (!id.trim()) return failure("Invalid user ID", 404);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        companions: {
          where: id === userId ? {} : { isPublic: true },
          include: {
            defaultLessons: {
              where:
                id === userId
                  ? { OR: [{ createdById: id }, { isPublic: true }] }
                  : { isPublic: true },
            },
          },
        },
        lessons: {
          where: id === userId ? {} : { isPublic: true },
        },
      },
    });
    if (!user) return failure("User not found", 404);

    return success(user);
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
    return failure("Failed to fetch user", 500);
  }
}
