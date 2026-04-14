import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user || user.role === "superadmin") {
    return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
  }

  const body = await request.json();
  const { role, canDownload, passwordNote, newPassword } = body;

  const updateData: any = {};
  if (role !== undefined) updateData.role = role === "admin" ? "admin" : "viewer";
  if (canDownload !== undefined) updateData.canDownload = Boolean(canDownload);
  if (passwordNote !== undefined) updateData.passwordNote = passwordNote;
  if (newPassword) {
    updateData.password = await hash(newPassword, 12);
    updateData.passwordNote = newPassword;
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, canDownload: true, passwordNote: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user || user.role === "superadmin") {
    return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
