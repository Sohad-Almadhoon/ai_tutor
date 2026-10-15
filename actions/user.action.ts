"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type ActionError = {
  success: false;
  error: string;
  status: 401 | 404 | 500;
};

function failure(error: string, status: ActionError["status"]): ActionError {
  return { success: false, error, status };
}

export async function getCurrentUserAction() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companions: { include: { lessons: true } } },
    });
    if (!user) return failure("User not found", 404);

    return { success: true as const, status: 200 as const, data: user };
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
          include: { lessons: true },
        },
      },
    });
    if (!user) return failure("User not found", 404);

    return { success: true as const, status: 200 as const, data: user };
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
    return failure("Failed to fetch user", 500);
  }
}
