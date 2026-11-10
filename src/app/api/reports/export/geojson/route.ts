import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Verifikasi eksistensi akun & role aktual di database (SEC-07)
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
        assignment: true,
        completionProof: true,
      },
    });

    // Susun format GeoJSON FeatureCollection standar RFC 7946
    const geojson = {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84",
        },
      },
      features: reports.map((r) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [r.lng, r.lat],
        },
        properties: {
          id: r.id,
          ticketCode: r.ticketCode,
          kategori: r.category?.nama,
          deskripsi: r.deskripsi,
          alamat: r.alamat,
          kecamatan: r.kecamatan,
          status: r.status,
          prioritas: r.prioritas,
          unit: r.assignment?.unit || null,
          fotoUrl: r.fotoUrl,
          createdAt: r.createdAt.toISOString(),
        },
      })),
    };

    return new NextResponse(JSON.stringify(geojson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Content-Disposition": `attachment; filename="LaporWarga_Geospasial_${Date.now()}.geojson"`,
      },
    });
  } catch (error) {
    console.error("Export GeoJSON error:", error);
    return NextResponse.json({ message: "Gagal mengekspor data GeoJSON" }, { status: 500 });
  }
}
