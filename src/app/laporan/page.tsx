"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ReportItem {
  id: string;
  ticketCode: string;
  deskripsi: string;
  alamat: string;
  kecamatan: string;
  status: string;
  prioritas: string;
  fotoUrl: string;
  createdAt: string;
  category: {
    id: string;
    nama: string;
    ikon: string;
  };
  _count: {
    votes: number;
  };
}

interface CategoryItem {
  id: string;
  nama: string;
}

function FeedLaporanContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "Semua";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"terbaru" | "dukungan">("terbaru");

  // Auth User
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUserId(data.user.userId);
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const fetchReports = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== "Semua") params.set("category", selectedCategory);
    if (selectedStatus !== "Semua") params.set("status", selectedStatus);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    params.set("sort", sortBy);
    params.set("limit", "60");

    fetch(`/api/reports?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) setReports(data.reports);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedStatus, searchQuery, sortBy]);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleVote = async (reportId: string) => {
    if (!currentUserId) {
      alert("Silakan masuk terlebih dahulu untuk memberikan dukungan suara.");
      window.location.href = "/masuk";
      return;
    }

    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Gagal memberikan dukungan");
        return;
      }

      // Update count lokal
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              _count: { votes: data.totalVotes },
            };
          }
          return r;
        })
      );
    } catch {
      alert("Terjadi kendala saat memberikan dukungan.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold mb-2">
                <span className="material-symbols-outlined !text-base">dynamic_feed</span>
                Kanal Aspirasi Warga
              </div>
              <h1 className="text-headline-lg font-bold text-on-surface">
                Daftar &amp; Feed Laporan Warga
              </h1>
              <p className="text-sm text-secondary mt-1">
                Pantau seluruh pengaduan infrastruktur Kota Bandar Lampung secara transparan dan berikan dukungan
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary !text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari jalan, kode tiket, atau keluhan..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Filter Bar & Sort Buttons */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Kategori & Status */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="text-xs font-semibold text-secondary mr-2">Kategori:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Semua">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary mr-2">Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu">Menunggu Validasi</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Sedang Dikerjakan">Dalam Penanganan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Urutkan (Terbaru vs Dukungan Terbanyak) */}
            <div className="flex items-center gap-1.5 self-end md:self-center">
              <span className="text-xs font-semibold text-secondary mr-1">Urutkan:</span>
              <button
                type="button"
                onClick={() => setSortBy("terbaru")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  sortBy === "terbaru"
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : "bg-surface-container-low text-secondary hover:bg-surface-container"
                }`}
              >
                Terbaru
              </button>
              <button
                type="button"
                onClick={() => setSortBy("dukungan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  sortBy === "dukungan"
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : "bg-surface-container-low text-secondary hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined !text-sm">thumb_up</span>
                Dukungan Terbanyak
              </button>
            </div>
          </div>

          {/* Grid Laporan */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-secondary">
              <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
                progress_activity
              </span>
              <p className="text-sm font-semibold">Memuat feed laporan...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant">
              <span className="material-symbols-outlined !text-5xl text-secondary mb-3">
                folder_off
              </span>
              <h3 className="text-base font-bold text-on-surface">Tidak Ada Laporan yang Cocok</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau reset filter kategori/status untuk melihat data lainnya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  {/* Foto Thumbnail */}
                  <div className="relative h-48 bg-surface-container-low overflow-hidden">
                    <img
                      src={report.fotoUrl}
                      alt={report.deskripsi}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = "/uploads/placeholder-jalan.svg";
                      }}
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

                  {/* Konten */}
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

                    <div className="text-xs text-secondary mb-4 flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined !text-sm text-primary">pin_drop</span>
                      <span>{report.alamat}, {report.kecamatan}</span>
                    </div>

                    {/* Tombol Aksi: Dukungan & Detail */}
                    <div className="mt-auto pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(report.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-bold text-on-surface hover:bg-primary-fixed/30 hover:border-primary transition"
                        title="Beri dukungan untuk mendesak prioritas perbaikan"
                      >
                        <span className="material-symbols-outlined !text-base text-primary">
                          thumb_up
                        </span>
                        <span>{report._count.votes} Dukungan</span>
                      </button>

                      <Link
                        href={`/laporan/${report.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs rounded-lg transition"
                      >
                        Detail &amp; Lacak
                        <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function FeedLaporanPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="flex-1 py-20 flex flex-col items-center justify-center text-secondary">
            <span className="material-symbols-outlined animate-spin text-primary !text-4xl mb-3">
              progress_activity
            </span>
            <p className="text-sm font-semibold">Memuat filter feed pengaduan...</p>
          </main>
          <Footer />
        </>
      }
    >
      <FeedLaporanContent />
    </Suspense>
  );
}
