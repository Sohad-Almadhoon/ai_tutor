
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

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
      },
      include: {
        companion: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(bookmarks);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);

    return Response.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companionId } = await request.json();
    const parsedCompanionId = Number(companionId);

    if (
      !Number.isInteger(parsedCompanionId) ||
      parsedCompanionId <= 0
    ) {
      return Response.json(
        { error: "Invalid companion ID" },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        companionId: parsedCompanionId,
      },
    });

    return Response.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Failed to create bookmark:", error);

    return Response.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
