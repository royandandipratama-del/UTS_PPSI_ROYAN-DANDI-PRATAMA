"use client";

import React, { useState, useEffect } from "react";

export default function PengaturanSistemPage() {
  const [autoNotify, setAutoNotify] = useState(true);
  const [autoPriority, setAutoPriority] = useState(true);
  const [requireProofPhoto, setRequireProofPhoto] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("laporwarga_system_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.autoNotify === "boolean") setAutoNotify(parsed.autoNotify);
        if (typeof parsed.autoPriority === "boolean") setAutoPriority(parsed.autoPriority);
        if (typeof parsed.requireProofPhoto === "boolean") setRequireProofPhoto(parsed.requireProofPhoto);
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        "laporwarga_system_settings",
        JSON.stringify({ autoNotify, autoPriority, requireProofPhoto })
      );
    } catch {
      // Abaikan jika gagal tulis ke storage
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Pengaturan Sistem</h1>
        <p className="text-sm text-secondary mt-1">
          Konfigurasi operasional portal pengaduan LaporWarga Kota Bandar Lampung
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-2.5 text-xs font-semibold shadow-sm">
          <span className="material-symbols-outlined !text-lg text-emerald-700">check_circle</span>
          <span>Konfigurasi sistem berhasil disimpan dan diterapkan.</span>
        </div>
      )}

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-2">Informasi Instansi &amp; Basis Data</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="text-secondary block mb-1">Penyedia Basis Data:</span>
              <strong className="text-on-surface font-mono text-sm">SQLite (dev.db)</strong>
              <p className="text-[11px] text-secondary mt-1">
                Dapat dialihkan ke PostgreSQL + PostGIS untuk produksi kota.
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="text-secondary block mb-1">Zona Waktu Operasional:</span>
              <strong className="text-on-surface text-sm">Asia/Jakarta (WIB) GMT+7</strong>
              <p className="text-[11px] text-secondary mt-1">
                Pencatatan waktu tiket dan riwayat status otomatis.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <h3 className="text-sm font-bold text-on-surface mb-3">Batas Ambang Otomatisasi &amp; Notifikasi</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoNotify}
                onChange={(e) => setAutoNotify(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Kirim notifikasi otomatis ke warga saat status tiket berubah menjadi Selesai.</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPriority}
                onChange={(e) => setAutoPriority(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Prioritaskan laporan secara otomatis jika memperoleh lebih dari 5 dukungan warga.</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireProofPhoto}
                onChange={(e) => setRequireProofPhoto(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Wajibkan lampiran foto bukti (before/after) sebelum menutup tiket.</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 active:scale-95 transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-base">save</span>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}

