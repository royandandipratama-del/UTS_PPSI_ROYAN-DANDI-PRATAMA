import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import DynamicDashboardHeatmap from "@/components/maps/DynamicDashboardHeatmap";

export const revalidate = 0;

export default async function DashboardOverviewPage() {
  // Hitung KPI Nyata dari Database
  const openTickets = await prisma.report.count({
    where: { status: { notIn: ["Selesai", "Diarsipkan"] } },
  });

  const pendingVerification = await prisma.report.count({
    where: { status: "Menunggu" },
  });

  const onFieldAgents = await prisma.report.count({
    where: { status: "Sedang Dikerjakan" },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const resolvedToday = await prisma.completionProof.count({
    where: { selesaiAt: { gte: todayStart } },
  });

  // Ambil 5 Tiket Prioritas Tinggi yang butuh tindakan segera
  const urgentReports = await prisma.report.findMany({
    where: {
      status: { notIn: ["Selesai", "Diarsipkan"] },
    },
    orderBy: [{ prioritas: "asc" }, { createdAt: "desc" }],
    take: 5,
    include: {
      category: true,
      assignment: true,
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Dasbor Pantau &amp; Kendali
          </h1>
          <p className="text-sm text-secondary mt-1">
            Pusat Komando Operasional Pengaduan Infrastruktur Kota Bandar Lampung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/api/reports/export/csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base text-primary">download</span>
            Ekspor CSV
          </Link>
          <Link
            href="/api/reports/export/geojson"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base text-primary">map</span>
            Ekspor GeoJSON
          </Link>
          <Link
            href="/dashboard/tiket"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base">view_list</span>
            Buka Antrean Tiket
          </Link>
        </div>
      </div>

      {/* 4 KOLOM KARTU KPI DENGAN KOTAK IKON BERWARNA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Tiket Terbuka */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary block mb-1">
              Total Tiket Terbuka
            </span>
            <span className="text-3xl font-bold text-on-surface tracking-tight">
              {openTickets}
            </span>
            <span className="text-[11px] text-secondary block mt-1">
              Menunggu &amp; dalam pengerjaan
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-2xl">pending_actions</span>
          </div>
        </div>

        {/* KPI 2: Menunggu Verifikasi */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary block mb-1">
              Menunggu Verifikasi
            </span>
            <span className="text-3xl font-bold text-red-600 tracking-tight">
              {pendingVerification}
            </span>
            <span className="text-[11px] text-red-700 block mt-1">
              Perlu segera ditinjau admin
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-2xl">mark_email_unread</span>
          </div>
        </div>

        {/* KPI 3: Petugas di Lapangan */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary block mb-1">
              Petugas di Lapangan
            </span>
            <span className="text-3xl font-bold text-amber-700 tracking-tight">
              {onFieldAgents}
            </span>
            <span className="text-[11px] text-amber-800 block mt-1">
              Unit sedang aktif bekerja
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-2xl">engineering</span>
          </div>
        </div>

        {/* KPI 4: Terselesaikan Hari Ini */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary block mb-1">
              Terselesaikan Hari Ini
            </span>
            <span className="text-3xl font-bold text-emerald-700 tracking-tight">
              {resolvedToday}
            </span>
            <span className="text-[11px] text-emerald-800 block mt-1">
              Laporan tervalidasi selesai
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-2xl">task_alt</span>
          </div>
        </div>
      </div>

      {/* PETA TITIK PANAS DASBOR GELAP (SLATE-950) */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary !text-xl">local_fire_department</span>
              Peta Titik Panas Agregasi Spasial (~500m)
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Konsentrasi laporan warga dengan blob kepadatan (Merah &gt;20, Amber 10-20, Hijau &lt;10) &amp; pin kritis berdenyut
            </p>
          </div>
          <Link
            href="/dashboard/peta"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Buka Layar Penuh
            <span className="material-symbols-outlined !text-sm">open_in_new</span>
          </Link>
        </div>

        <DynamicDashboardHeatmap />
      </div>

      {/* TABEL ANTREAN PRIORITAS CEPAT */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">
              Aduan Kritis &amp; Mendesak yang Memerlukan Tindakan
            </h3>
            <p className="text-xs text-secondary">
              Tiket prioritas tinggi (P1 Kritis / P2 Mendesak) yang belum diselesaikan
            </p>
          </div>
          <Link
            href="/dashboard/tiket"
            className="text-xs font-bold text-primary hover:underline"
          >
            Kelola Semua Tiket &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-secondary font-bold uppercase tracking-wider">
                <th className="p-3">ID Tiket</th>
                <th className="p-3">Foto</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Lokasi &amp; Koordinat</th>
                <th className="p-3">Prioritas</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {urgentReports.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition">
                  <td className="p-3 font-bold font-mono text-primary">{r.ticketCode}</td>
                  <td className="p-3">
                    <img
                      src={r.fotoUrl}
                      alt="Thumbnail"
                      className="w-12 h-10 object-cover rounded border border-outline-variant"
                    />
                  </td>
                  <td className="p-3 font-semibold text-on-surface">{r.category?.nama}</td>
                  <td className="p-3 max-w-xs">
                    <p className="truncate font-medium text-on-surface">{r.alamat}</p>
                    <span className="font-mono text-[11px] text-secondary">
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)} ({r.kecamatan})
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.prioritas === "P1 Kritis"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.prioritas}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/dashboard/tiket?search=${encodeURIComponent(r.ticketCode)}`}
                      className="px-3 py-1.5 bg-primary-fixed text-on-primary-fixed rounded-lg font-bold text-xs hover:bg-primary-fixed-dim transition"
                    >
                      Proses
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

