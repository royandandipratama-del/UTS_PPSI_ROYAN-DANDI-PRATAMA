"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ReportDetail {
  id: string;
  ticketCode: string;
  deskripsi: string;
  alamat: string;
  kecamatan: string;
  lat: number;
  lng: number;
  status: string;
  prioritas: string;
  fotoUrl: string;
  createdAt: string;
  updatedAt: string;
  category: {
    nama: string;
    ikon: string;
  };
  createdBy: {
    nama: string;
    email: string;
  } | null;
  assignment: {
    unit: string;
    catatan: string | null;
    assignedAt: string;
  } | null;
  completionProof: {
    fotoUrl: string;
    catatan: string;
    selesaiAt: string;
  } | null;
  statusHistory: Array<{
    id: string;
    dari: string;
    ke: string;
    catatan: string | null;
    createdAt: string;
    oleh: {
      nama: string;
      role: string;
    } | null;
  }>;
  _count: {
    votes: number;
  };
}

export default function DetailLaporanPage() {
  const params = useParams();
  const idParam = params.id as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trackingCodeInput, setTrackingCodeInput] = useState("");

  const fetchDetail = useCallback(() => {
    setLoading(true);
    fetch(`/api/reports/${idParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.report) {
          setReport(data.report);
          setHasVoted(data.hasVoted || false);
          setVoteCount(data.report._count.votes || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [idParam]);

  useEffect(() => {
    if (idParam) fetchDetail();
  }, [idParam, fetchDetail]);

  const handleVoteToggle = async () => {
    if (!report) return;
    try {
      const res = await fetch(`/api/reports/${report.id}/vote`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Silakan masuk untuk memberi dukungan.");
        window.location.href = "/masuk";
        return;
      }
      setHasVoted(data.voted);
      setVoteCount(data.totalVotes);
    } catch {
      alert("Terjadi kendala jaringan saat memberi dukungan.");
    }
  };

  const handleSearchOtherTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) return;
    const cleanCode = trackingCodeInput.trim().replace("#", "");
    window.location.href = `/laporan/${cleanCode}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-24 flex flex-col items-center justify-center text-secondary">
          <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
            progress_activity
          </span>
          <p className="text-sm font-semibold">Memuat data tiket dan riwayat perbaikan...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-20 bg-surface-container-low flex items-center justify-center">
          <div className="max-w-md w-full mx-4 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm text-center">
            <span className="material-symbols-outlined !text-5xl text-secondary mb-3">
              search_off
            </span>
            <h1 className="text-lg font-bold text-on-surface mb-2">Tiket Tidak Ditemukan</h1>
            <p className="text-xs text-secondary mb-6">
              Nomor tiket atau identifikasi laporan yang Anda cari tidak terdaftar dalam sistem.
            </p>
            <form onSubmit={handleSearchOtherTicket} className="flex gap-2 mb-4">
              <input
                type="text"
                value={trackingCodeInput}
                onChange={(e) => setTrackingCodeInput(e.target.value)}
                placeholder="Masukkan #TKT-xxxx..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-outline-variant"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg"
              >
                Lacak
              </button>
            </form>
            <Link
              href="/laporan"
              className="text-xs font-semibold text-primary hover:underline block"
            >
              Kembali ke Feed Laporan Warga
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6 text-xs text-secondary">
            <div className="flex items-center gap-1.5 truncate">
              <Link href="/" className="hover:text-primary transition">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/laporan" className="hover:text-primary transition">
                Feed Laporan
              </Link>
              <span>/</span>
              <span className="font-bold text-on-surface truncate">{report.ticketCode}</span>
            </div>

            <Link
              href="/laporan"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline shrink-0"
            >
              <span className="material-symbols-outlined !text-base">arrow_back</span>
              Daftar Laporan
            </Link>
          </div>

          {/* Header Tiket Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xl md:text-2xl font-extrabold text-primary font-mono tracking-wide">
                    {report.ticketCode}
                  </span>
                  <StatusBadge status={report.status} />
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-surface-container-high text-on-surface-variant">
                    {report.prioritas}
                  </span>
                </div>
                <h1 className="text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary !text-2xl">
                    {report.category?.ikon || "construction"}
                  </span>
                  {report.category?.nama}
                </h1>
                <p className="text-xs text-secondary mt-1">
                  Diajukan pada {new Date(report.createdAt).toLocaleString("id-ID")} • Kecamatan{" "}
                  {report.kecamatan}
                </p>
              </div>

              {/* Tombol Dukungan Warga */}
              <button
                type="button"
                onClick={handleVoteToggle}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition ${
                  hasVoted
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined !text-xl">thumb_up</span>
                <span>{hasVoted ? "Didukung" : "Beri Dukungan"}</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs">
                  {voteCount}
                </span>
              </button>
            </div>

            {/* PROGRESS BAR 3 TAHAP */}
            <div className="py-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">
                Progres Penanganan Laporan
              </h3>
              <ProgressBar status={report.status} />
            </div>

            {/* FOTO SEBELUM VS SESUDAH (JIKA SELESAI) */}
            <div className="pt-6 border-t border-outline-variant">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">
                Dokumentasi Lapangan {report.status === "Selesai" && "(Sebelum vs Sesudah)"}
              </h3>

              <div
                className={`grid gap-6 ${
                  report.status === "Selesai" && report.completionProof
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 max-w-lg"
                }`}
              >
                {/* Foto Awal / Laporan Warga */}
                <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low">
                  <div className="bg-surface-container-high px-4 py-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-red-700 flex items-center gap-1">
                      <span className="material-symbols-outlined !text-sm">photo_camera</span>
                      Foto Awal Laporan Warga (Sebelum)
                    </span>
                    <span className="text-secondary font-mono">
                      {new Date(report.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="h-64 overflow-hidden bg-slate-900">
                    <img
                      src={report.fotoUrl}
                      alt="Foto Awal Kerusakan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-xs text-secondary bg-surface-container-lowest border-t border-outline-variant">
                    <p className="line-clamp-2 italic">&quot;{report.deskripsi}&quot;</p>
                  </div>
                </div>

                {/* Foto Bukti Penyelesaian Kru Teknis (Jika Selesai) */}
                {report.status === "Selesai" && report.completionProof && (
                  <div className="rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50/40">
                    <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined !text-sm">verified</span>
                        Foto Bukti Selesai Kru Dinas (Sesudah)
                      </span>
                      <span className="font-mono">
                        {new Date(report.completionProof.selesaiAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className="h-64 overflow-hidden bg-slate-900">
                      <img
                        src={report.completionProof.fotoUrl}
                        alt="Foto Bukti Perbaikan Selesai"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 text-xs text-emerald-950 bg-emerald-50 border-t border-emerald-200">
                      <p className="font-bold mb-0.5">Catatan Pekerjaan &amp; Material:</p>
                      <p>{report.completionProof.catatan}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rincian Tiket & Timeline Riwayat Penanganan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kolom 1 & 2: Riwayat Status Timeline */}
            <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <h2 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary !text-xl">history</span>
                Riwayat Penanganan Tiket
              </h2>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                {report.statusHistory.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Bullet Pin */}
                    <div
                      className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                        index === report.statusHistory.length - 1
                          ? "bg-primary shadow-sm"
                          : "bg-secondary"
                      }`}
                    >
                      <span className="material-symbols-outlined !text-sm">
                        {index === report.statusHistory.length - 1 ? "radio_button_checked" : "done"}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-on-surface">
                          Status: {item.ke}
                        </span>
                        <span className="text-xs font-mono text-secondary">
                          {new Date(item.createdAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.catatan || "Pembaruan status operasional lapangan."}
                      </p>
                      {item.oleh && (
                        <p className="text-[11px] text-secondary mt-1 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined !text-xs">badge</span>
                          Oleh: {item.oleh.nama} ({item.oleh.role})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom 3: Rincian Wilayah & Unit */}
            <div className="space-y-6">
              {/* Unit Penugasan */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary !text-lg">engineering</span>
                  Unit Pelaksana Dinas
                </h3>
                {report.assignment ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-sm font-bold text-on-surface">
                      {report.assignment.unit}
                    </p>
                    <p className="text-secondary">
                      Ditugaskan: {new Date(report.assignment.assignedAt).toLocaleString("id-ID")}
                    </p>
                    {report.assignment.catatan && (
                      <p className="text-on-surface-variant italic bg-surface-container-low p-2 rounded-lg">
                        &quot;{report.assignment.catatan}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-secondary bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                    <p className="font-semibold text-on-surface mb-0.5">Belum Ada Penugasan Kru</p>
                    <p>Tiket masih dalam antrean validasi awal staf pengelola.</p>
                  </div>
                )}
              </div>

              {/* Rincian Lokasi & Koordinat */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary !text-lg">pin_drop</span>
                  Titik Geospasial
                </h3>
                <div className="space-y-2.5 text-xs text-secondary">
                  <div>
                    <span className="block font-semibold text-on-surface">Alamat / Patokan:</span>
                    <span className="text-on-surface-variant">{report.alamat}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-on-surface">Wilayah Kecamatan:</span>
                    <span className="text-on-surface-variant">Kecamatan {report.kecamatan}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-on-surface">Koordinat Lat/Lng:</span>
                    <span className="font-mono bg-surface-container-low px-2 py-1 rounded inline-block text-[11px] text-on-surface font-semibold border border-outline-variant mt-1">
                      {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
