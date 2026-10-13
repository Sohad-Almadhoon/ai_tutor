
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userInfo = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        companions: {
          select: {
            id: true,
            name: true,
            topic: true,
            subject: true,
            duration: true,
            companionIcon: true,
            voiceId: true,
            language: true,
            speakingStyle: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userInfo) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(userInfo);
  } catch (error) {
    console.error("Failed to fetch user:", error);

    return Response.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
