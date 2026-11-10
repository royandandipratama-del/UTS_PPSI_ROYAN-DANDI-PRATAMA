import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reportSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const kecamatan = searchParams.get("kecamatan");
    const prioritas = searchParams.get("prioritas");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "terbaru"; // "terbaru" | "dukungan"
    const parsedLimit = parseInt(searchParams.get("limit") || "50", 10);
    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(parsedLimit, 200);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};

    if (category && category !== "Semua") {
      where.categoryId = category;
    }

    if (status && status !== "Semua") {
      where.status = status;
    }

    if (kecamatan && kecamatan !== "Semua") {
      where.kecamatan = kecamatan;
    }

    if (prioritas && prioritas !== "Semua") {
      where.prioritas = prioritas;
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { ticketCode: { contains: search } },
        { deskripsi: { contains: search } },
        { alamat: { contains: search } },
        { kecamatan: { contains: search } },
      ];
    }

    const total = await prisma.report.count({ where });

    let orderBy: Prisma.ReportOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "dukungan") {
      orderBy = { votes: { _count: "desc" } };
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      include: {
        category: true,
        createdBy: {
          select: { id: true, nama: true },
        },
        _count: {
          select: { votes: true },
        },
        assignment: true,
        completionProof: true,
      },
    });

    return NextResponse.json({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { message: "Gagal memuat daftar laporan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`create-report:${ip}`, 20, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { message: `Terlalu banyak pengiriman laporan dalam waktu singkat. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const user = await getCurrentUser();
    const body = await req.json();

    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Data formulir laporan tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Hasilkan nomor tiket unik format #TKT-XXXX tanpa risiko tabrakan (collision-free)
    const allTicketCodes = await prisma.report.findMany({
      select: { ticketCode: true },
    });
    let maxTicketNum = 1000;
    for (const item of allTicketCodes) {
      const match = item.ticketCode.match(/^#TKT-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxTicketNum) maxTicketNum = num;
      }
    }
    const ticketCode = `#TKT-${(maxTicketNum + 1).toString().padStart(4, "0")}`;

    const report = await prisma.report.create({
      data: {
        ticketCode,
        categoryId: data.categoryId,
        deskripsi: data.deskripsi,
        fotoUrl: data.fotoUrl,
        lat: data.lat,
        lng: data.lng,
        alamat: data.alamat,
        kecamatan: data.kecamatan,
        status: "Menunggu",
        prioritas: "P3 Rutin",
        createdById: user?.userId || null,
      },
      include: {
        category: true,
      },
    });

    // Susun catatan awal beserta info pelapor opsional jika ada
    const infoPelaporParts: string[] = [];
    if (data.namaPelapor?.trim()) {
      infoPelaporParts.push(`Pelapor: ${data.namaPelapor.trim()}`);
    }
    if (data.kontakPelapor?.trim()) {
      infoPelaporParts.push(`Kontak: ${data.kontakPelapor.trim()}`);
    }
    const suffixPelapor =
      infoPelaporParts.length > 0 ? ` (${infoPelaporParts.join(", ")})` : "";

    // Buat riwayat status pertama
    await prisma.statusHistory.create({
      data: {
        reportId: report.id,
        dari: "Draft",
        ke: "Menunggu",
        catatan: `Laporan baru berhasil diajukan oleh warga melalui portal web.${suffixPelapor}`,
        olehId: user?.userId || null,
      },
    });

    // Jika pelapor terhubung akun, buat notifikasi awal konfirmasi
    if (user?.userId) {
      await prisma.notification.create({
        data: {
          userId: user.userId,
          reportId: report.id,
          pesan: `Laporan Anda dengan kode tiket ${ticketCode} telah diterima dan sedang menunggu validasi petugas.`,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Laporan pengaduan berhasil dikirim",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { message: "Gagal mengirimkan laporan pengaduan" },
      { status: 500 }
    );
  }
}
