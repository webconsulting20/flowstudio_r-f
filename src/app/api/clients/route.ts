import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// List all admin and viewer accounts (not superadmin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const clients = await prisma.user.findMany({
    where: { role: { in: ["admin", "viewer"] } },
    select: { id: true, email: true, name: true, role: true, canDownload: true, passwordNote: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// Create an admin or viewer account
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { email, name, password, role } = await request.json();

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Email, nom et mot de passe sont requis" }, { status: 400 });
  }

  const assignedRole = role === "admin" ? "admin" : "viewer";

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword, role: assignedRole, passwordNote: password },
    select: { id: true, email: true, name: true, role: true, canDownload: true, passwordNote: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
