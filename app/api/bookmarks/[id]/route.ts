
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const bookmarkId = Number(id);

    if (!Number.isInteger(bookmarkId) || bookmarkId <= 0) {
      return Response.json(
        { error: "Invalid bookmark ID" },
        { status: 400 }
      );
    }
    await prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    return Response.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return Response.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
