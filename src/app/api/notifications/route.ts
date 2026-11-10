import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Harap masuk terlebih dahulu" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        report: {
          select: {
            id: true,
            ticketCode: true,
            alamat: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ message: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Harap masuk terlebih dahulu" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: user.userId, dibaca: false },
      data: { dibaca: true },
    });

    return NextResponse.json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ message: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

