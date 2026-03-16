import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin (upsert = safe, won't duplicate)
  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@flowcloud.fr" },
    update: {},
    create: {
      email: "admin@flowcloud.fr",
      name: "Admin Flow Cloud",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create demo viewer (upsert = safe)
  const viewerPassword = await hash("demo2024", 12);
  await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      name: "Client Demo",
      password: viewerPassword,
      role: "viewer",
    },
  });

  // ⚠️ NE PAS supprimer les vidéos existantes
  // Les vidéos sont gérées uniquement via l'admin
  const videoCount = await prisma.video.count();
  console.log(`✅ Seed terminé — FLOW CLOUD`);
  console.log(`   Admin  : admin@flowcloud.fr / admin123`);
  console.log(`   Client : client@demo.com / demo2024`);
  console.log(`   Vidéos existantes conservées : ${videoCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
