import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d"; // "24h" | "7d" | "all"

    const where: Prisma.ReportWhereInput = {};

    if (range === "24h") {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      where.createdAt = { gte: yesterday };
    } else if (range === "7d") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      where.createdAt = { gte: lastWeek };
    }

    const reports = await prisma.report.findMany({
      where,
      select: {
        id: true,
        ticketCode: true,
        deskripsi: true,
        alamat: true,
        kecamatan: true,
        lat: true,
        lng: true,
        status: true,
        prioritas: true,
        createdAt: true,
      },
    });

    // Agregasi Grid ~500 meter (step approx 0.005 derajat)
    const GRID_SIZE = 0.005;
    const gridMap = new Map<
      string,
      {
        gridKey: string;
        centerLat: number;
        centerLng: number;
        count: number;
        reports: typeof reports;
      }
    >();

    for (const r of reports) {
      const snapLat = Math.round(r.lat / GRID_SIZE) * GRID_SIZE;
      const snapLng = Math.round(r.lng / GRID_SIZE) * GRID_SIZE;
      const key = `${snapLat.toFixed(4)}_${snapLng.toFixed(4)}`;

      if (!gridMap.has(key)) {
        gridMap.set(key, {
          gridKey: key,
          centerLat: snapLat,
          centerLng: snapLng,
          count: 0,
          reports: [],
        });
      }

      const item = gridMap.get(key)!;
      item.count += 1;
      item.reports.push(r);
    }

    // Klasifikasi kepadatan: >20 merah, 10-20 amber, <10 hijau
    const clusters = Array.from(gridMap.values()).map((c) => {
      let level: "tinggi" | "sedang" | "rendah" = "rendah";
      let color = "#10b981"; // hijau
      let radius = 250; // meter

      if (c.count > 20) {
        level = "tinggi";
        color = "#ef4444"; // merah
        radius = 450;
      } else if (c.count >= 10) {
        level = "sedang";
        color = "#f59e0b"; // amber
        radius = 350;
      }

      return {
        key: c.gridKey,
        lat: c.centerLat,
        lng: c.centerLng,
        count: c.count,
        level,
        color,
        radius,
      };
    });

    // Dapatkan pin kritis (P1 Kritis) yang belum selesai untuk animasi berdenyut
    const criticalReports = reports.filter(
      (r) => r.prioritas === "P1 Kritis" && r.status !== "Selesai"
    );

    return NextResponse.json({
      totalReports: reports.length,
      clusters,
      criticalReports,
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    return NextResponse.json({ message: "Gagal menghitung titik panas" }, { status: 500 });
  }
}
