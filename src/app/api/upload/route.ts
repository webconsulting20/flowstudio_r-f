import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // "video" | "thumbnail"

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Si Cloudinary est configuré, uploader vers le cloud
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const isVideo = type === "video" || file.type.startsWith("video/");
      const folder = isVideo ? "videos" : "thumbnails";
      const resourceType = isVideo ? "video" : "image";
      const url = await uploadToCloudinary(buffer, folder, resourceType);
      return NextResponse.json({ url, filename: file.name });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      return NextResponse.json({ error: "Erreur upload: " + error.message }, { status: 500 });
    }
  }

  // Sinon, sauvegarder en local (développement)
  const subfolder = type === "video" ? "videos" : "thumbnails";
  const uploadDir = join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const url = `/uploads/${subfolder}/${filename}`;
  return NextResponse.json({ url, filename });
}
