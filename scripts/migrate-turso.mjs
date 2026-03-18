import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = `
CREATE TABLE IF NOT EXISTS ClientVideoAccess (
  id      TEXT PRIMARY KEY NOT NULL,
  userId  TEXT NOT NULL,
  videoId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (videoId) REFERENCES Video(id) ON DELETE CASCADE,
  UNIQUE(userId, videoId)
);
`;

try {
  await client.execute(sql);
  console.log("✅ Table ClientVideoAccess créée sur Turso");
} catch (e) {
  console.error("❌ Erreur :", e.message);
}
