import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUserWithProfile();
    if (!user || (user.role !== "petugas" && user.role !== "admin")) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const kecamatan = searchParams.get("kecamatan");
    const prioritas = searchParams.get("prioritas");
    const search = searchParams.get("search");

    const where: Prisma.ReportWhereInput = {};
    if (category && category !== "Semua") where.categoryId = category;
    if (status && status !== "Semua") where.status = status;
    if (kecamatan && kecamatan !== "Semua") where.kecamatan = kecamatan;
    if (prioritas && prioritas !== "Semua") where.prioritas = prioritas;
    if (search && search.trim() !== "") {
      where.OR = [
        { ticketCode: { contains: search } },
        { deskripsi: { contains: search } },
        { alamat: { contains: search } },
        { kecamatan: { contains: search } },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        createdBy: { select: { nama: true, email: true } },
        assignment: true,
      },
    });

    // Buat format CSV dengan header Bahasa Indonesia
    const headers = [
      "ID Tiket",
      "Kategori",
      "Deskripsi Masalah",
      "Alamat Lokasi",
      "Kecamatan",
      "Latitude",
      "Longitude",
      "Prioritas",
      "Status",
      "Unit Ditugaskan",
      "Nama Pelapor",
      "Tanggal Laporan",
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      let clean = str.replace(/"/g, '""');
      // Cegah CSV Formula Injection (OWASP CWE-1236) jika diawali karakter formula spreadsheet
      if (/^[=+\-@\t\r]/.test(clean)) {
        clean = `'${clean}`;
      }
      return `"${clean}"`;
    };

    const rows = reports.map((r) => [
      escapeCsv(r.ticketCode),
      escapeCsv(r.category?.nama),
      escapeCsv(r.deskripsi),
      escapeCsv(r.alamat),
      escapeCsv(r.kecamatan),
      r.lat.toFixed(6),
      r.lng.toFixed(6),
      escapeCsv(r.prioritas),
      escapeCsv(r.status),
      escapeCsv(r.assignment?.unit || "-"),
      escapeCsv(r.createdBy?.nama || "Warga"),
      escapeCsv(new Date(r.createdAt).toLocaleString("id-ID")),
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM untuk Excel
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="LaporWarga_Data_Tiket_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json({ message: "Gagal mengekspor data CSV" }, { status: 500 });
  }
}
