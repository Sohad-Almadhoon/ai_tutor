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

    const companions = await prisma.companion.findMany({
      where: {
        userId,
      },
    });

    return Response.json(companions);
  } catch (error) {
    console.error("Failed to fetch companions:", error);

    return Response.json(
      { error: "Failed to fetch companions" },
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

    const {
      name,
      topic,
      subject,
      duration,
      companionIcon,
      voiceId,
      language,
      speakingStyle,
    } = await request.json();

    const companion = await prisma.companion.create({
      data: {
        name,
        topic,
        subject,
        duration,
        companionIcon,
        voiceId,
        language,
        speakingStyle,
        userId,
      },
    });

    return Response.json(companion, { status: 201 });
  } catch (error) {
    console.error("Failed to create companion:", error);

    return Response.json(
      { error: "Failed to create companion" },
      { status: 500 }
    );
  }
}