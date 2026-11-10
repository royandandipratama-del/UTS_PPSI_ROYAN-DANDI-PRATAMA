import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawParam = decodeURIComponent(params.id);
    const user = await getCurrentUser();

    // Cek apakah parameter berupa UUID id atau ticketCode (mis. #TKT-1001 atau TKT-1001)
    const formattedTicketCode = rawParam.startsWith("#") ? rawParam : `#${rawParam}`;

    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id: rawParam }, { ticketCode: rawParam }, { ticketCode: formattedTicketCode }],
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, nama: true },
        },
        assignment: true,
        completionProof: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: {
            oleh: { select: { nama: true, role: true } },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Laporan atau tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah user saat ini sudah memberi dukungan
    let hasVoted = false;
    if (user) {
      const vote = await prisma.vote.findUnique({
        where: {
          reportId_userId: {
            reportId: report.id,
            userId: user.userId,
          },
        },
      });
      hasVoted = !!vote;
    }

    return NextResponse.json({
      report,
      hasVoted,
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data detail laporan" },
      { status: 500 }
    );
  }
}

