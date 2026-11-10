import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Pada lingkungan Vercel Serverless, filesystem utama (/var/task) bersifat read-only.
  // Salin basis data SQLite awal (prisma/dev.db) ke /tmp/dev.db agar operasi baca & tulis tetap berjalan lancar.
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
      ];
      for (const srcPath of candidates) {
        if (fs.existsSync(srcPath)) {
          try {
            fs.copyFileSync(srcPath, tmpDbPath);
            break;
          } catch (err) {
            console.warn("Gagal menyalin database ke /tmp/dev.db:", err);
          }
        }
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      return new PrismaClient({
        datasources: {
          db: {
            url: `file:${tmpDbPath}`,
          },
        },
      });
    }
  }

  return new PrismaClient();
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
