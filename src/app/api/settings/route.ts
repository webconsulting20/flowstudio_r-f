import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic so settings changes are always reflected immediately
export const dynamic = "force-dynamic";

export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "main" },
    });
  }
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { siteTitle, subtitle, logoUrl, footerText, titleSize, subtitleSize, heroDescription, heroDescriptionSize, heroAlign } = body;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { siteTitle, subtitle, logoUrl, footerText, titleSize, subtitleSize, heroDescription, heroDescriptionSize, heroAlign },
    create: { id: "main", siteTitle, subtitle, logoUrl, footerText, titleSize, subtitleSize, heroDescription, heroDescriptionSize, heroAlign },
  });

  return NextResponse.json(settings);
}
