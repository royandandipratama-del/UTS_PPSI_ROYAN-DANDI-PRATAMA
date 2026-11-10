import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { message: `Terlalu banyak permintaan pendaftaran. Silakan coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Data pendaftaran tidak valid" },
        { status: 400 }
      );
    }

    const { nama, email, password, noTelepon } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        nama,
        email: email.toLowerCase(),
        passwordHash,
        role: "warga",
        noTelepon: noTelepon || null,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      nama: user.nama,
      role: "warga",
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: "Pendaftaran berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}

