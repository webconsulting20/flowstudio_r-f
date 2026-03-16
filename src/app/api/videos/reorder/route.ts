import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  // Update sort order for each video
  const updates = orderedIds.map((id: string, index: number) =>
    prisma.video.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true });
}
