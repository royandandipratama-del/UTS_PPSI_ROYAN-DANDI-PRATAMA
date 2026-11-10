import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`vote:${ip}`, 60, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { message: `Terlalu banyak aktivitas dukungan. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const user = await getCurrentUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { message: "Anda harus masuk terlebih dahulu untuk memberikan dukungan pada laporan ini" },
        { status: 401 }
      );
    }

    const reportId = params.id;
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Periksa apakah sudah pernah vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId: user.id,
        },
      },
    });

    let voted = false;
    if (existingVote) {
      // Cabut dukungan
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      voted = false;
    } else {
      // Tambah dukungan
      await prisma.vote.create({
        data: {
          reportId,
          userId: user.id,
        },
      });
      voted = true;
    }

    const totalVotes = await prisma.vote.count({
      where: { reportId },
    });

    return NextResponse.json({
      message: voted ? "Dukungan berhasil ditambahkan" : "Dukungan ditarik kembali",
      voted,
      totalVotes,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses dukungan" },
      { status: 500 }
    );
  }
}

