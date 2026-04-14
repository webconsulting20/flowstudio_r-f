import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(video);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const video = await prisma.video.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(video);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.video.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
