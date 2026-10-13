
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const companionId = Number(id);

    if (!Number.isInteger(companionId) || companionId <= 0) {
      return Response.json(
        { error: "Invalid companion ID" },
        { status: 400 }
      );
    }

    const companion = await prisma.companion.findFirst({
      where: {
        id: companionId,
        userId,
      },
    });

    if (!companion) {
      return Response.json(
        { error: "Companion not found" },
        { status: 404 }
      );
    }

    return Response.json(companion);
  } catch (error) {
    console.error("Failed to fetch companion:", error);

    return Response.json(
      { error: "Failed to fetch companion" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const companionId = Number(id);

    if (!Number.isInteger(companionId) || companionId <= 0) {
      return Response.json(
        { error: "Invalid companion ID" },
        { status: 400 }
      );
    }

    const result = await prisma.companion.deleteMany({
      where: {
        id: companionId,
        userId,
      },
    });

    if (result.count === 0) {
      return Response.json(
        { error: "Companion not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Companion deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete companion:", error);

    return Response.json(
      { error: "Failed to delete companion" },
      { status: 500 }
    );
  }
}