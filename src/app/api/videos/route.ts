import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { title, client, description, category, subcategory, thumbnailUrl, videoUrl, imageUrls, sortOrder } = body;

  if (!title || !client || !category || !thumbnailUrl) {
    return NextResponse.json({ error: "Titre, client, catégorie et miniature sont requis" }, { status: 400 });
  }

  const maxOrder = await prisma.video.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const video = await prisma.video.create({
    data: {
      title,
      client,
      description: description || "",
      category,
      subcategory: subcategory || "",
      thumbnailUrl,
      videoUrl: videoUrl || "",
      imageUrls: imageUrls || "[]",
      sortOrder: sortOrder ?? nextOrder,
    },
  });

  return NextResponse.json(video, { status: 201 });
}
