import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get video IDs this client has access to
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const accesses = await prisma.clientVideoAccess.findMany({
    where: { userId: params.id },
    select: { videoId: true },
  });

  return NextResponse.json(accesses.map((a) => a.videoId));
}

// Replace the full set of video access for this client
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { videoIds } = await request.json() as { videoIds: string[] };

  // Delete all existing access then create new ones
  await prisma.clientVideoAccess.deleteMany({ where: { userId: params.id } });

  if (videoIds && videoIds.length > 0) {
    await prisma.clientVideoAccess.createMany({
      data: videoIds.map((videoId: string) => ({ userId: params.id, videoId })),
    });
  }

  return NextResponse.json({ success: true });
}
