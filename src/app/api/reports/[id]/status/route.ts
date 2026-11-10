import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { statusUpdateSchema } from "@/lib/validations";
import { VALID_STATUS_TRANSITIONS, ReportStatus } from "@/lib/constants";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi eksistensi akun & role aktual di database (mencegah penggunaan sesi basi/dicabut)
    const user = await getCurrentUserWithProfile();
    if (!user || (user.role !== "petugas" && user.role !== "admin")) {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya petugas atau admin yang berwenang mengubah status tiket." },
        { status: 403 }
      );
    }

    const reportId = params.id;
    const body = await req.json();

    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Data perubahan status tidak valid" },
        { status: 400 }
      );
    }

    const { ke, catatan, unit, prioritas, completionProof } = parsed.data;

    // Ambil laporan saat ini
    const currentReport = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        assignment: true,
        completionProof: true,
      },
    });

    if (!currentReport) {
      return NextResponse.json(
        { message: "Laporan tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentStatus = currentReport.status as ReportStatus;

    // Validasi alur transisi di server
    const allowedTargets = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(ke as ReportStatus)) {
      return NextResponse.json(
        {
          message: `Transisi status tidak valid! Dari '${currentStatus}' tidak diizinkan langsung berubah ke '${ke}'.`,
        },
        { status: 422 }
      );
    }

    // Jika beralih ke Selesai, WAJIB ada foto bukti perbaikan dan catatan material
    if (ke === "Selesai") {
      if (!completionProof || !completionProof.fotoUrl || !completionProof.catatan) {
        return NextResponse.json(
          {
            message: "Untuk menyelesaikan laporan, wajib menyertakan foto bukti perbaikan dan catatan material/pekerjaan.",
          },
          { status: 400 }
        );
      }
    }

    // Eksekusi update dalam transaksi database
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update data Report
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: ke,
          prioritas: prioritas || currentReport.prioritas,
        },
      });

      // 2. Simpan Unit Penugasan jika ada input unit
      if (unit && unit.trim() !== "") {
        await tx.assignment.upsert({
          where: { reportId },
          update: {
            unit: unit.trim(),
            catatan: catatan || "Penugasan tim operasional dinas.",
            assignedAt: new Date(),
          },
          create: {
            reportId,
            unit: unit.trim(),
            catatan: catatan || "Penugasan tim operasional dinas.",
            assignedAt: new Date(),
          },
        });
      }

      // 3. Simpan CompletionProof jika status Selesai
      if (ke === "Selesai" && completionProof) {
        await tx.completionProof.upsert({
          where: { reportId },
          update: {
            fotoUrl: completionProof.fotoUrl,
            catatan: completionProof.catatan,
            selesaiAt: new Date(),
          },
          create: {
            reportId,
            fotoUrl: completionProof.fotoUrl,
            catatan: completionProof.catatan,
            selesaiAt: new Date(),
          },
        });
      }

      // 4. Catat riwayat status
      await tx.statusHistory.create({
        data: {
          reportId,
          dari: currentStatus,
          ke,
          catatan: catatan || `Perubahan status menjadi ${ke} oleh ${user.nama}.`,
          olehId: user.id,
        },
      });

      // 5. Buat notifikasi untuk warga pelapor
      if (currentReport.createdById) {
        let pesanNotif = `Status laporan ${currentReport.ticketCode} diperbarui menjadi '${ke}'.`;
        if (ke === "Diproses") {
          pesanNotif = `Laporan Anda ${currentReport.ticketCode} telah disetujui dan sedang diproses oleh dinas.`;
        } else if (ke === "Sedang Dikerjakan") {
          pesanNotif = `Kru lapangan telah dikerahkan ke lokasi untuk penanganan tiket ${currentReport.ticketCode}.`;
        } else if (ke === "Selesai") {
          pesanNotif = `Selamat! Laporan perbaikan ${currentReport.ticketCode} (${currentReport.alamat}) telah rampung dikerjakan.`;
        }

        await tx.notification.create({
          data: {
            userId: currentReport.createdById,
            reportId: currentReport.id,
            pesan: pesanNotif,
          },
        });
      }

      return updatedReport;
    });

    return NextResponse.json({
      message: `Status tiket berhasil diubah menjadi '${ke}'`,
      report: result,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui status laporan" },
      { status: 500 }
    );
  }
}

