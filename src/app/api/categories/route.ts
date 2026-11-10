import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nama: "asc" },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ message: "Gagal memuat kategori" }, { status: 500 });
  }
}

