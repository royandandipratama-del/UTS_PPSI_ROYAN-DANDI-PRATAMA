import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function StatistikPage() {
  const total = await prisma.report.count();
  const completed = await prisma.report.count({ where: { status: "Selesai" } });
  const pending = await prisma.report.count({ where: { status: "Menunggu" } });
  const inProgress = await prisma.report.count({
    where: { status: { in: ["Diproses", "Sedang Dikerjakan"] } },
  });

  // Kategori Breakdown
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { reports: true } },
    },
    orderBy: { reports: { _count: "desc" } },
  });

  // Status Breakdown
  const statusStats = [
    { label: "Menunggu Validasi", count: pending, color: "bg-red-500", text: "text-red-700" },
    { label: "Dalam Penanganan / Diproses", count: inProgress, color: "bg-amber-500", text: "text-amber-800" },
    { label: "Selesai Ditangani", count: completed, color: "bg-emerald-500", text: "text-emerald-800" },
  ];

  // Kecamatan Breakdown (Top 8)
  const kecamatanGroups = await prisma.report.groupBy({
    by: ["kecamatan"],
    _count: { _all: true },
    orderBy: { _count: { kecamatan: "desc" } },
    take: 8,
  });

  const maxKecCount = kecamatanGroups.length > 0 ? kecamatanGroups[0]._count._all : 1;

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold mb-2">
              <span className="material-symbols-outlined !text-base">analytics</span>
              Transparansi Kinerja Kota
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Statistik Pelayanan &amp; Pengaduan
            </h1>
            <p className="text-sm text-secondary mt-1">
              Data analitik pengaduan warga Kota Bandar Lampung berdasarkan kategori, status, dan kecamatan
            </p>
          </div>

          {/* KPI Mini Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <span className="text-xs font-semibold text-secondary">Total Masuk</span>
              <p className="text-2xl font-bold text-on-surface mt-1">{total}</p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <span className="text-xs font-semibold text-red-700">Menunggu Validasi</span>
              <p className="text-2xl font-bold text-red-600 mt-1">{pending}</p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <span className="text-xs font-semibold text-amber-800">Sedang Ditangani</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{inProgress}</p>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <span className="text-xs font-semibold text-emerald-800">Terselesaikan</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{completed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Breakdown Per Kategori */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary !text-xl">category</span>
                Sebaran per Kategori Infrastruktur
              </h2>
              <div className="space-y-4">
                {categories.map((c) => {
                  const percentage = total > 0 ? Math.round((c._count.reports / total) * 100) : 0;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary !text-base">
                            {c.ikon}
                          </span>
                          {c.nama}
                        </span>
                        <span className="text-secondary font-mono">
                          {c._count.reports} Aduan ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown Per Status */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary !text-xl">donut_large</span>
                Komposisi Status Penanganan
              </h2>
              <div className="space-y-5">
                {statusStats.map((st) => {
                  const percentage = total > 0 ? Math.round((st.count / total) * 100) : 0;
                  return (
                    <div key={st.label}>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className={st.text}>{st.label}</span>
                        <span className="text-secondary font-mono">
                          {st.count} Tiket ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
                        <div
                          className={`${st.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-secondary leading-relaxed">
                <strong className="text-on-surface block mb-1">Tingkat Ketuntasan Kota:</strong>
                Persentase penyelesaian aduan warga saat ini mencapai{" "}
                <strong className="text-emerald-700">
                  {total > 0 ? ((completed / total) * 100).toFixed(1) : 0}%
                </strong>
                . Semua laporan berstatus selesai telah dilengkapi bukti foto before/after dan catatan hasil uji kelayakan fisik.
              </div>
            </div>
          </div>

          {/* Breakdown Per Kecamatan (Wilayah) */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h2 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary !text-xl">location_city</span>
              Aktivitas Laporan Tertinggi per Kecamatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kecamatanGroups.map((kg) => {
                const percentage = Math.round((kg._count._all / maxKecCount) * 100);
                return (
                  <div
                    key={kg.kecamatan}
                    className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-low"
                  >
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-on-surface">Kecamatan {kg.kecamatan}</span>
                      <span className="text-primary font-mono">{kg._count._all} Laporan</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-container h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

