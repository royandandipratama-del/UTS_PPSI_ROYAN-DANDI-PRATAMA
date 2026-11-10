"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ReportItem {
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
  category: {
    nama: string;
    ikon: string;
  };
  assignment: {
    unit: string;
    catatan: string | null;
  } | null;
  completionProof: {
    fotoUrl: string;
    catatan: string;
    selesaiAt: string;
  } | null;
}

function ManajemenTiketContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [priorityFilter, setPriorityFilter] = useState("Semua");

  // Modal State for Action / Verification
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [actionType, setActionType] = useState<
    "setujui" | "tugaskan_kru" | "verifikasi_selesai" | "arsipkan" | null
  >(null);

  // Form Fields inside Action Modals
  const [unitField, setUnitField] = useState("Dinas PUPR Bandar Lampung (Tim Reaksi Cepat)");
  const [catatanField, setCatatanField] = useState("");
  const [proofFotoUrl, setProofFotoUrl] = useState("/uploads/placeholder-selesai.svg");
  const [proofCatatan, setProofCatatan] = useState(
    "Perbaikan telah rampung 100%, pengaspalan rata dan telah lulus inspeksi lapangan."
  );
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTickets = useCallback((customSearch?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    const activeSearch = customSearch !== undefined ? customSearch : search;
    if (activeSearch.trim()) params.set("search", activeSearch.trim());
    if (statusFilter !== "Semua") params.set("status", statusFilter);
    if (priorityFilter !== "Semua") params.set("prioritas", priorityFilter);
    params.set("limit", "100");

    fetch(`/api/reports?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.reports) setReports(data.reports);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  // Buka Modal Aksi Berdasarkan Status
  const openActionModal = (
    report: ReportItem,
    type: "setujui" | "tugaskan_kru" | "verifikasi_selesai" | "arsipkan"
  ) => {
    setSelectedReport(report);
    setActionType(type);
    setActionError(null);

    if (type === "setujui") {
      setCatatanField("Laporan diverifikasi valid dan diteruskan ke bagian pemeliharaan.");
    } else if (type === "tugaskan_kru") {
      setUnitField(
        report.assignment?.unit || "Dinas PUPR Bandar Lampung (Tim Reaksi Cepat 02)"
      );
      setCatatanField("Kru lapangan bergerak menuju titik koordinat untuk perbaikan.");
    } else if (type === "verifikasi_selesai") {
      setProofFotoUrl("/uploads/placeholder-selesai.svg");
      setProofCatatan(
        "Pekerjaan perbaikan infrastruktur telah selesai dilakukan dengan baik dan teruji fungsi."
      );
    }
  };

  // Submit Perubahan Status ke Server API
  const handleExecuteStatusChange = async () => {
    if (!selectedReport || !actionType) return;
    setActionError(null);
    setSubmittingAction(true);

    let targetStatus = "Diproses";
    const payload: any = {};

    if (actionType === "setujui") {
      targetStatus = "Diproses";
      payload.ke = targetStatus;
      payload.catatan = catatanField;
      payload.unit = unitField;
    } else if (actionType === "tugaskan_kru") {
      targetStatus = "Sedang Dikerjakan";
      payload.ke = targetStatus;
      payload.catatan = catatanField;
      payload.unit = unitField;
    } else if (actionType === "verifikasi_selesai") {
      targetStatus = "Selesai";
      payload.ke = targetStatus;
      payload.catatan = proofCatatan;
      payload.completionProof = {
        fotoUrl: proofFotoUrl,
        catatan: proofCatatan,
      };
    } else if (actionType === "arsipkan") {
      targetStatus = "Diarsipkan";
      payload.ke = targetStatus;
      payload.catatan = "Tiket diarsipkan oleh pengelola.";
    }

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui status tiket.");
      }

      // Sukses: tutup modal & refresh tabel
      setSelectedReport(null);
      setActionType(null);
      fetchTickets();
    } catch (err: any) {
      setActionError(err.message || "Terjadi kesalahan saat memproses status tiket.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Upload Foto Bukti Selesai
  const handleProofPhotoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setProofFotoUrl(data.url);
      } else {
        alert(data.message || "Gagal mengunggah foto bukti.");
      }
    } catch {
      alert("Gagal mengunggah foto bukti.");
    }
  };

  // Filter Query String untuk tombol ekspor
  const exportParams = new URLSearchParams();
  if (search.trim()) exportParams.set("search", search.trim());
  if (statusFilter !== "Semua") exportParams.set("status", statusFilter);
  if (priorityFilter !== "Semua") exportParams.set("prioritas", priorityFilter);
  const exportQueryStr = exportParams.toString() ? `?${exportParams.toString()}` : "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Manajemen Antrean Tiket</h1>
          <p className="text-sm text-secondary mt-1">
            Validasi aduan, tugaskan kru pelaksana, dan verifikasi bukti foto penyelesaian
          </p>
        </div>

        {/* Tombol Ekspor CSV & GeoJSON dari Hasil Filter */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export/csv${exportQueryStr}`}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base text-primary">download</span>
            Ekspor CSV
          </a>
          <a
            href={`/api/reports/export/geojson${exportQueryStr}`}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base text-primary">map</span>
            Ekspor GeoJSON
          </a>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary !text-lg">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID tiket, nama jalan, atau kecamatan..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto self-end md:self-center">
          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-secondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold bg-surface-container-low text-on-surface"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu Validasi</option>
              <option value="Diproses">Diproses</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Selesai">Selesai</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
          </div>

          {/* Filter Prioritas */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-secondary">Prioritas:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold bg-surface-container-low text-on-surface"
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="P1 Kritis">P1 Kritis</option>
              <option value="P2 Mendesak">P2 Mendesak</option>
              <option value="P3 Rutin">P3 Rutin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Tiket Sesuai Format Wajib Prompt */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-secondary">
            <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
              progress_activity
            </span>
            <p className="text-sm font-semibold">Memuat data antrean tiket...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined !text-4xl text-secondary mb-2">inbox</span>
            <p className="text-sm font-bold text-on-surface">Tidak ada data tiket</p>
            <p className="text-xs text-secondary mt-1">
              Sesuaikan kata kunci pencarian atau filter status Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-secondary font-bold uppercase tracking-wider">
                  <th className="p-3.5">ID TIKET</th>
                  <th className="p-3.5">FOTO</th>
                  <th className="p-3.5">KATEGORI</th>
                  <th className="p-3.5">LOKASI &amp; KOORDINAT</th>
                  <th className="p-3.5">PRIORITAS</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/70 transition">
                    {/* ID TIKET (#TKT-0000, warna primary) */}
                    <td className="p-3.5 font-mono font-bold text-primary text-sm">
                      {r.ticketCode}
                    </td>

                    {/* FOTO (thumbnail) */}
                    <td className="p-3.5">
                      <div className="w-14 h-11 rounded-lg overflow-hidden border border-outline-variant bg-slate-800">
                        <img
                          src={r.fotoUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.target.src = "/uploads/placeholder-jalan.svg";
                          }}
                        />
                      </div>
                    </td>

                    {/* KATEGORI */}
                    <td className="p-3.5 font-semibold text-on-surface">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary !text-base">
                          {r.category?.ikon || "location_on"}
                        </span>
                        <span>{r.category?.nama}</span>
                      </div>
                    </td>

                    {/* LOKASI & KOORDINAT (font mono) */}
                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-on-surface truncate">{r.alamat}</p>
                      <p className="text-secondary text-[11px] font-medium">
                        Kecamatan {r.kecamatan}
                      </p>
                      <span className="font-mono text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant inline-block mt-0.5">
                        {r.lat.toFixed(6)}, {r.lng.toFixed(6)}
                      </span>
                    </td>

                    {/* PRIORITAS */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.prioritas === "P1 Kritis"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : r.prioritas === "P2 Mendesak"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-surface-container-high text-secondary border border-outline-variant"
                        }`}
                      >
                        {r.prioritas}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-3.5">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    {/* TINDAKAN (Alur Status Server Validated) */}
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* Alur Menunggu -> (Setujui) -> Diproses */}
                      {r.status === "Menunggu" && (
                        <button
                          type="button"
                          onClick={() => openActionModal(r, "setujui")}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition shadow-sm"
                        >
                          Setujui
                        </button>
                      )}

                      {/* Alur Diproses -> (Kirim Kru Petugas) -> Sedang Dikerjakan */}
                      {r.status === "Diproses" && (
                        <button
                          type="button"
                          onClick={() => openActionModal(r, "tugaskan_kru")}
                          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition shadow-sm"
                        >
                          Kirim Kru Petugas
                        </button>
                      )}

                      {/* Alur Sedang Dikerjakan -> (Verifikasi Bukti) -> Selesai */}
                      {r.status === "Sedang Dikerjakan" && (
                        <button
                          type="button"
                          onClick={() => openActionModal(r, "verifikasi_selesai")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition shadow-sm flex items-center gap-1 inline-flex"
                        >
                          <span className="material-symbols-outlined !text-sm">verified</span>
                          Verifikasi Bukti
                        </button>
                      )}

                      {/* Alur Selesai -> Arsipkan */}
                      {r.status === "Selesai" && (
                        <button
                          type="button"
                          onClick={() => openActionModal(r, "arsipkan")}
                          className="px-3 py-1.5 bg-secondary text-white rounded-lg font-bold text-xs hover:bg-secondary/90 transition"
                        >
                          Arsipkan
                        </button>
                      )}

                      <Link
                        href={`/laporan/${r.id}`}
                        className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-container inline-block"
                        title="Lihat Detail Tiket"
                      >
                        <span className="material-symbols-outlined !text-base">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== MODAL VERIFIKASI SELESAI (BEFORE vs AFTER) ===================== */}
      {selectedReport && actionType === "verifikasi_selesai" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl border border-outline-variant shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 !text-xl">verified</span>
                  Panel Verifikasi Penyelesaian Tiket {selectedReport.ticketCode}
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Bandingkan foto warga dengan foto bukti kerja kru dinas sebelum menutup tiket
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined !text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {actionError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base text-error">error</span>
                  <span>{actionError}</span>
                </div>
              )}

              {/* Komparasi Foto Sebelum vs Sesudah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Sebelum (Warga) */}
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
                  <div className="p-2 bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined !text-sm">photo_camera</span>
                    Foto Awal Warga (Sebelum)
                  </div>
                  <div className="h-44 bg-slate-900">
                    <img
                      src={selectedReport.fotoUrl}
                      alt="Sebelum"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="p-2 text-[11px] text-secondary italic truncate">
                    {selectedReport.deskripsi}
                  </p>
                </div>

                {/* Foto Sesudah (Kru Petugas Upload) */}
                <div className="border border-emerald-300 rounded-xl overflow-hidden bg-emerald-50/30">
                  <div className="p-2 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined !text-sm">verified</span>
                      Foto Bukti Kru (Sesudah)
                    </span>
                    <label className="cursor-pointer text-[10px] underline hover:text-emerald-100">
                      Ganti Foto
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleProofPhotoUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="h-44 bg-slate-900">
                    <img
                      src={proofFotoUrl}
                      alt="Sesudah"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-[10px] text-emerald-800 font-semibold">
                    Format resmi bukti uji lapangan
                  </div>
                </div>
              </div>

              {/* Rincian Unit & Waktu Selesai Otomatis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface-container-low p-3.5 rounded-xl border border-outline-variant">
                <div>
                  <span className="font-bold text-on-surface block mb-0.5">Unit Pelaksana:</span>
                  <span className="text-secondary font-medium">
                    {selectedReport.assignment?.unit || "Dinas PUPR Kota Bandar Lampung"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-on-surface block mb-0.5">Waktu Selesai (Otomatis):</span>
                  <span className="font-mono text-secondary font-semibold">
                    {new Date().toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Catatan Material / Pekerjaan */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Catatan Material &amp; Berita Acara Penyelesaian <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  value={proofCatatan}
                  onChange={(e) => setProofCatatan(e.target.value)}
                  placeholder="Rincian perbaikan, material yang digunakan (cth: hotmix 2 ton), serta kondisi akhir jalan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tombol Konfirmasi Penyelesaian & Beri Tahu Warga */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-secondary hover:bg-surface-container-low"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={handleExecuteStatusChange}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-base">notifications_active</span>
                  {submittingAction
                    ? "Menyimpan & Mengirim Notifikasi..."
                    : "Konfirmasi Penyelesaian & Beri Tahu Warga"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL SETUJUI / TUGASKAN KRU ===================== */}
      {selectedReport &&
        (actionType === "setujui" ||
          actionType === "tugaskan_kru" ||
          actionType === "arsipkan") && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline-variant shadow-xl overflow-hidden">
              <div className="p-5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-base font-bold text-on-surface">
                  {actionType === "setujui"
                    ? `Setujui Tiket ${selectedReport.ticketCode}`
                    : actionType === "tugaskan_kru"
                    ? `Kirim Kru Petugas (${selectedReport.ticketCode})`
                    : `Arsipkan Tiket ${selectedReport.ticketCode}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg text-secondary hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined !text-lg">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {actionError && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined !text-base text-error">error</span>
                    <span>{actionError}</span>
                  </div>
                )}

                {(actionType === "setujui" || actionType === "tugaskan_kru") && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Unit Pelaksana Dinas Teknis
                    </label>
                    <input
                      type="text"
                      value={unitField}
                      onChange={(e) => setUnitField(e.target.value)}
                      placeholder="Cth: Dinas PUPR Bandar Lampung (TRC 03)"
                      className="w-full p-2.5 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Catatan Internal / Perintah Kerja
                  </label>
                  <textarea
                    rows={3}
                    value={catatanField}
                    onChange={(e) => setCatatanField(e.target.value)}
                    placeholder="Instruksi pengerjaan atau hasil peninjauan..."
                    className="w-full p-2.5 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-secondary hover:bg-surface-container-low"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleExecuteStatusChange}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs shadow-md transition disabled:opacity-60"
                  >
                    {submittingAction ? "Memproses..." : "Konfirmasi Perubahan Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function ManajemenTiketPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center text-secondary">
          <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
            progress_activity
          </span>
          <p className="text-sm font-semibold">Memuat manajemen antrean tiket...</p>
        </div>
      }
    >
      <ManajemenTiketContent />
    </Suspense>
  );
}

