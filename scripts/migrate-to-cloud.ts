/**
 * Script de migration : SQLite local → Turso + Cloudinary
 * Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... npx tsx scripts/migrate-to-cloud.ts
 */

import { createClient } from "@libsql/client";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(localPath: string, folder: string, resourceType: "image" | "video"): Promise<string> {
  const fullPath = path.join(process.cwd(), "public", localPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️  Fichier introuvable: ${fullPath}`);
    return localPath; // garder l'URL locale si le fichier n'existe pas
  }

  const result = await cloudinary.uploader.upload(fullPath, {
    folder: `flowstudio/${folder}`,
    resource_type: resourceType,
  });
  return result.secure_url;
}

async function main() {
  console.log("🚀 Début de la migration vers Turso + Cloudinary\n");

  // 1. Lire les données depuis SQLite local
  console.log("📖 Lecture de la base SQLite locale...");
  const localPrisma = new PrismaClient({
    datasources: { db: { url: `file:${path.join(process.cwd(), "prisma", "dev.db")}` } },
  });

  const users = await localPrisma.user.findMany();
  const videos = await localPrisma.video.findMany();
  let settings = await localPrisma.siteSettings.findUnique({ where: { id: "main" } });

  console.log(`  ✅ ${users.length} utilisateurs`);
  console.log(`  ✅ ${videos.length} vidéos`);
  console.log(`  ✅ Settings: ${settings ? "trouvés" : "aucun"}\n`);

  // 2. Créer les tables dans Turso
  console.log("🗄️  Création des tables dans Turso...");
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await turso.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Video (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      client TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL DEFAULT '',
      thumbnailUrl TEXT NOT NULL,
      videoUrl TEXT NOT NULL DEFAULT '',
      imageUrls TEXT NOT NULL DEFAULT '[]',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SiteSettings (
      id TEXT PRIMARY KEY,
      siteTitle TEXT NOT NULL DEFAULT 'FLOW STUDIO',
      subtitle TEXT NOT NULL DEFAULT 'NOS RÉALISATIONS',
      logoUrl TEXT NOT NULL DEFAULT '',
      footerText TEXT NOT NULL DEFAULT 'Flow Studio. Tous droits réservés.'
    );
  `);
  console.log("  ✅ Tables créées\n");

  // 3. Uploader les fichiers vers Cloudinary et migrer les données
  console.log("☁️  Upload des fichiers vers Cloudinary...\n");

  // Migrer les utilisateurs
  console.log("👥 Migration des utilisateurs...");
  for (const user of users) {
    await turso.execute({
      sql: "INSERT OR REPLACE INTO User (id, email, password, name, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      args: [user.id, user.email, user.password, user.name, user.role, user.createdAt.toISOString()],
    });
    console.log(`  ✅ ${user.name} (${user.role})`);
  }

  // Migrer les vidéos avec upload Cloudinary
  console.log("\n🎬 Migration des vidéos...");
  for (const video of videos) {
    let newThumbnailUrl = video.thumbnailUrl;
    let newVideoUrl = video.videoUrl;
    let newImageUrls = video.imageUrls;

    // Upload thumbnail
    if (video.thumbnailUrl.startsWith("/uploads/")) {
      console.log(`  📸 Upload thumbnail: ${video.title}...`);
      try {
        newThumbnailUrl = await uploadFile(video.thumbnailUrl, "thumbnails", "image");
        console.log(`     ✅ OK`);
      } catch (e: any) {
        console.error(`     ❌ Erreur: ${e.message}`);
      }
    }

    // Upload video
    if (video.videoUrl && video.videoUrl.startsWith("/uploads/")) {
      console.log(`  🎥 Upload vidéo: ${video.title}...`);
      try {
        newVideoUrl = await uploadFile(video.videoUrl, "videos", "video");
        console.log(`     ✅ OK`);
      } catch (e: any) {
        console.error(`     ❌ Erreur: ${e.message}`);
      }
    }

    // Upload images (Marketing Digital / Site Web)
    if (video.imageUrls && video.imageUrls !== "[]") {
      try {
        const images: string[] = JSON.parse(video.imageUrls);
        const newImages: string[] = [];
        for (const img of images) {
          if (img.startsWith("/uploads/")) {
            console.log(`  🖼️  Upload image: ${video.title}...`);
            try {
              const newUrl = await uploadFile(img, "images", "image");
              newImages.push(newUrl);
              console.log(`     ✅ OK`);
            } catch (e: any) {
              console.error(`     ❌ Erreur: ${e.message}`);
              newImages.push(img);
            }
          } else {
            newImages.push(img);
          }
        }
        newImageUrls = JSON.stringify(newImages);
      } catch {}
    }

    await turso.execute({
      sql: `INSERT OR REPLACE INTO Video (id, title, client, description, category, subcategory, thumbnailUrl, videoUrl, imageUrls, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        video.id, video.title, video.client, video.description,
        video.category, video.subcategory || "", newThumbnailUrl, newVideoUrl,
        newImageUrls, video.sortOrder,
        video.createdAt.toISOString(), video.updatedAt.toISOString(),
      ],
    });
    console.log(`  ✅ ${video.title} migré`);
  }

  // Migrer les settings
  if (settings) {
    console.log("\n⚙️  Migration des paramètres...");
    let newLogoUrl = settings.logoUrl;
    if (settings.logoUrl && settings.logoUrl.startsWith("/uploads/")) {
      try {
        newLogoUrl = await uploadFile(settings.logoUrl, "settings", "image");
      } catch {}
    }
    await turso.execute({
      sql: "INSERT OR REPLACE INTO SiteSettings (id, siteTitle, subtitle, logoUrl, footerText) VALUES (?, ?, ?, ?, ?)",
      args: [settings.id, settings.siteTitle, settings.subtitle, newLogoUrl, settings.footerText],
    });
    console.log("  ✅ Paramètres migrés");
  }

  console.log("\n🎉 Migration terminée avec succès !");
  console.log("Tu peux maintenant déployer sur Vercel.");

  await localPrisma.$disconnect();
  turso.close();
}

main().catch(console.error);
