import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Verifikasi Magic Bytes (File Signature Header) untuk mencegah pemalsuan MIME Type
 */
function hasValidImageSignature(buf: Buffer, ext: string): boolean {
  if (buf.length < 4) return false;
  if (ext === "jpg") {
    // JPEG dimulai dengan FF D8 FF
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (ext === "png") {
    // PNG dimulai dengan 89 50 4E 47
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (ext === "webp") {
    // WEBP dimulai dengan "RIFF" (52 49 46 46) dan "WEBP" pada byte 8..11
    if (buf.length < 12) return false;
    return (
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    );
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`upload:${ip}`, 30, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { message: `Batas unggah foto tercapai. Silakan coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "File gambar tidak ditemukan dalam formulir" },
        { status: 400 }
      );
    }

    // Validasi ukuran maks 10 MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Ukuran file terlalu besar. Maksimal 10 MB." },
        { status: 400 }
      );
    }

    // Validasi tipe file dan petakan ekstensi secara aman (mencegah spoofing ekstensi berbahaya)
    const safeExt = MIME_TO_EXT[file.type];
    if (!safeExt) {
      return NextResponse.json(
        { message: "Format file tidak didukung. Harap unggah foto berekstensi JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validasi Magic Bytes (File Signature) untuk mencegah upload file non-citra yang memalsukan MIME header
    if (!hasValidImageSignature(buffer, safeExt)) {
      return NextResponse.json(
        { message: "Isi biner file tidak sesuai dengan format gambar yang sah (JPG/PNG/WEBP)." },
        { status: 400 }
      );
    }

    // Buat nama file unik dengan ekstensi terverifikasi
    const uniqueName = `lapor_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "Foto berhasil diunggah",
      url: `/uploads/${uniqueName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Gagal mengunggah foto. Silakan coba kembali." },
      { status: 500 }
    );
  }
}

