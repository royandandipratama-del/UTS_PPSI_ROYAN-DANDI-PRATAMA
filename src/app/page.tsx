import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Dynamic server component

export default async function HomePage() {
  // Ambil data metrik nyata dari database
  const totalReports = await prisma.report.count();
  const completedReports = await prisma.report.count({
    where: { status: "Selesai" },
  });

  // Hitung rata-rata waktu penanganan dari laporan yang selesai
  const completedList = await prisma.completionProof.findMany({
    include: { report: { select: { createdAt: true } } },
    take: 50,
  });

  let avgHours = 24;
  if (completedList.length > 0) {
    const totalMs = completedList.reduce((acc, curr) => {
      return acc + (curr.selesaiAt.getTime() - curr.report.createdAt.getTime());
    }, 0);
    avgHours = Math.round(totalMs / (completedList.length * 1000 * 60 * 60));
  }
  const avgResolutionTime = avgHours >= 24 ? `${(avgHours / 24).toFixed(1)} Hari` : `${avgHours} Jam`;

  // 6 Laporan Terbaru
  const latestReports = await prisma.report.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { votes: true } },
    },
  });

  // Kategori
  const categories = await prisma.category.findMany({
    include: { _count: { select: { reports: true } } },
  });

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-background py-16 md:py-24 border-b border-outline-variant">
          {/* Subtle dot pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#004ac6 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
            {/* Badge Pemerintah Kota */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold mb-6 shadow-sm">
              <span className="material-symbols-outlined !text-base">verified</span>
              Portal Resmi Pengaduan Kota Bandar Lampung
            </div>

            {/* Headline Sesuai PRD / Prompt */}
            <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface max-w-4xl mx-auto mb-6 tracking-tight">
              Satu Suara Warga, Wujudkan Kota yang Lebih Baik
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Laporkan jalan berlubang, lampu jalan padam, saluran mampet, dan kerusakan fasilitas umum langsung ke dinas teknis secara transparan dengan koordinat geospasial akurat.
            </p>

            {/* 2 CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/laporkan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg px-6 py-3.5 font-semibold shadow-sm active:scale-95 transition duration-150"
              >
                <span className="material-symbols-outlined !text-xl">campaign</span>
                Buat Laporan Baru
              </Link>
              <Link
                href="/peta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant rounded-lg px-6 py-3.5 font-semibold shadow-sm active:scale-95 transition duration-150"
              >
                <span className="material-symbols-outlined text-primary !text-xl">map</span>
                Pantau Laporan Terkini
              </Link>
            </div>

            {/* 3 METRIC CARDS (REAL DATA DARI DATABASE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 text-left">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-secondary">Aduan Selesai</span>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-2xl">task_alt</span>
                  </div>
                </div>
                <p className="text-headline-lg font-bold text-on-surface mb-1">
                  {completedReports.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-secondary">
                  Telah dituntaskan oleh kru teknis dinas
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-secondary">Rata-rata Penanganan</span>
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined !text-2xl">schedule</span>
                  </div>
                </div>
                <p className="text-headline-lg font-bold text-on-surface mb-1">
                  {avgResolutionTime}
                </p>
                <p className="text-xs text-secondary">
                  Waktu rata-rata verifikasi hingga penyelesaian
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-secondary">Total Laporan Masuk</span>
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined !text-2xl">inventory_2</span>
                  </div>
                </div>
                <p className="text-headline-lg font-bold text-on-surface mb-1">
                  {totalReports.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-secondary">
                  Partisipasi warga se-Kota Bandar Lampung
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION KATEGORI PENGADUAN */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Kategori Layanan
              </p>
              <h2 className="text-headline-lg text-on-surface">
                Infrastruktur yang Dapat Dilaporkan
              </h2>
            </div>
            <p className="text-sm text-secondary max-w-md mt-2 md:mt-0">
              Setiap aduan akan otomatis diteruskan ke dinas teknis terkait sesuai dengan jenis kerusakannya.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/laporan?category=${cat.id}`}
                className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:border-primary hover:shadow-md transition group text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition">
                  <span className="material-symbols-outlined !text-2xl">{cat.ikon}</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition line-clamp-2">
                  {cat.nama}
                </h3>
                <span className="text-xs text-secondary mt-1">
                  {cat._count.reports} Laporan
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION CARA KERJA (ALUR 3 TAHAP) */}
        <section className="py-16 bg-surface-container-low border-y border-outline-variant">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Alur Transparan
              </p>
              <h2 className="text-headline-lg text-on-surface">
                Bagaimana Laporan Anda Ditindaklanjuti
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant relative">
                <span className="text-4xl font-extrabold text-primary/20 absolute top-6 right-6">
                  01
                </span>
                <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined !text-2xl">send</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">1. Warga Melapor</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Kirim foto kerusakan dengan koordinat GPS akurat dan deskripsi singkat masalah infrastruktur di sekitar Anda.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant relative">
                <span className="text-4xl font-extrabold text-primary/20 absolute top-6 right-6">
                  02
                </span>
                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined !text-2xl">engineering</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">2. Penugasan Kru Lapangan</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Admin memverifikasi laporan dan langsung menerjunkan tim reaksi cepat dinas teknis dengan surat perintah kerja.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant relative">
                <span className="text-4xl font-extrabold text-primary/20 absolute top-6 right-6">
                  03
                </span>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined !text-2xl">verified_user</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">3. Selesai &amp; Bukti Foto</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Tiket ditutup dengan melampirkan foto hasil perbaikan (sebelum vs sesudah) yang dapat diinspeksi oleh seluruh publik.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION LAPORAN TERKINI */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Transparansi Publik
              </p>
              <h2 className="text-headline-lg text-on-surface">
                Laporan Warga Terkini
              </h2>
            </div>
            <Link
              href="/laporan"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Lihat Semua Laporan
              <span className="material-symbols-outlined !text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestReports.map((report) => (
              <div
                key={report.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* Gambar Thumbnail */}
                <div className="relative h-48 bg-surface-container-low overflow-hidden">
                  <img
                    src={report.fotoUrl}
                    alt={report.deskripsi}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      {report.ticketCode}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>

                {/* Konten Kartu */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
                    <span className="material-symbols-outlined !text-base text-primary">
                      {report.category?.ikon || "location_on"}
                    </span>
                    <span>{report.category?.nama}</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>

                  <p className="text-sm font-semibold text-on-surface mb-3 line-clamp-2 leading-snug">
                    {report.deskripsi}
                  </p>

                  <div className="mt-auto pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-secondary">
                    <span className="flex items-center gap-1 truncate max-w-[190px]">
                      <span className="material-symbols-outlined !text-sm">pin_drop</span>
                      {report.alamat}, {report.kecamatan}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <span className="material-symbols-outlined !text-sm">thumb_up</span>
                      {report._count.votes} Dukungan
                    </span>
                  </div>

                  <Link
                    href={`/laporan/${report.id}`}
                    className="mt-4 w-full text-center py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs rounded-lg transition"
                  >
                    Pantau Progres Tiket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

