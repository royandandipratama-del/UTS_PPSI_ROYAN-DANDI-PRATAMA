"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicLocationPicker from "@/components/maps/DynamicLocationPicker";
import { KECAMATAN_BANDAR_LAMPUNG, DEFAULT_BANDAR_LAMPUNG_CENTER } from "@/lib/constants";
import exifr from "exifr";
import Link from "next/link";

interface CategoryItem {
  id: string;
  nama: string;
  ikon: string;
  deskripsi: string | null;
}

export default function LaporkanPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [lat, setLat] = useState(DEFAULT_BANDAR_LAMPUNG_CENTER.lat);
  const [lng, setLng] = useState(DEFAULT_BANDAR_LAMPUNG_CENTER.lng);
  const [alamat, setAlamat] = useState("");
  const [kecamatan, setKecamatan] = useState<string>(KECAMATAN_BANDAR_LAMPUNG[0]);
  const [namaPelapor, setNamaPelapor] = useState("");
  const [kontakPelapor, setKontakPelapor] = useState("");
  const [exifFound, setExifFound] = useState(false);

  // Success State
  const [createdTicketCode, setCreatedTicketCode] = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch((err) => console.error("Load categories error:", err));

    // Ambil data user jika sedang login untuk auto-fill nama & kontak
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setNamaPelapor(data.user.nama || "");
        }
      })
      .catch(() => {});
  }, []);

  // Handler Upload Foto + Ekstraksi EXIF GPS
  const handlePhotoUpload = async (file: File) => {
    setErrorMsg(null);
    setExifFound(false);

    // Validasi tipe dan ukuran (maks 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran file terlalu besar. Maksimal 10 MB.");
      return;
    }

    setFotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      // 1. Baca EXIF GPS via exifr
      try {
        const exifData = await exifr.gps(file);
        if (exifData && exifData.latitude && exifData.longitude) {
          setLat(exifData.latitude);
          setLng(exifData.longitude);
          setExifFound(true);
        }
      } catch (exifErr) {
        console.log("Tidak ada metadata EXIF GPS dalam foto:", exifErr);
      }

      // 2. Upload file ke endpoint lokal
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengunggah foto.");
      }

      setFotoUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah foto. Silakan coba kembali.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Validasi Step 1
  const handleNextToStep2 = () => {
    setErrorMsg(null);
    if (!categoryId) {
      setErrorMsg("Silakan pilih kategori infrastruktur terlebih dahulu.");
      return;
    }
    if (!fotoUrl) {
      setErrorMsg("Harap unggah foto bukti kerusakan infrastruktur.");
      return;
    }
    if (deskripsi.trim().length < 15) {
      setErrorMsg("Deskripsi masalah minimal 15 karakter agar petugas memahami rincian kondisi lapangan.");
      return;
    }
    if (deskripsi.length > 500) {
      setErrorMsg("Deskripsi masalah maksimal 500 karakter.");
      return;
    }
    setCurrentStep(2);
  };

  // Validasi Step 2
  const handleNextToStep3 = () => {
    setErrorMsg(null);
    if (!alamat || alamat.trim().length < 5) {
      setErrorMsg("Harap masukkan nama jalan atau patokan alamat minimal 5 karakter.");
      return;
    }
    if (!kecamatan) {
      setErrorMsg("Silakan pilih kecamatan lokasi kejadian.");
      return;
    }
    setCurrentStep(3);
  };

  // Submit Final Step 3
  const handleSubmitReport = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          deskripsi,
          fotoUrl,
          lat,
          lng,
          alamat,
          kecamatan,
          namaPelapor,
          kontakPelapor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan laporan.");
      }

      setCreatedTicketCode(data.report.ticketCode);
      setCreatedReportId(data.report.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengirim pengaduan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Layar Sukses Pengiriman Tiket
  if (createdTicketCode && createdReportId) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-16 bg-surface-container-low flex items-center justify-center">
          <div className="max-w-xl w-full mx-4 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined !text-4xl">check_circle</span>
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface mb-2">
              Laporan Berhasil Diajukan!
            </h1>
            <p className="text-body-md text-secondary mb-6 leading-relaxed">
              Terima kasih atas kepedulian Anda terhadap fasilitas publik Kota Bandar Lampung.
              Aduan Anda telah didaftarkan ke sistem dan diteruskan ke dinas terkait.
            </p>

            <div className="bg-primary-fixed/30 border border-primary-fixed p-5 rounded-xl mb-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
                Nomor Kode Pelacakan Tiket Anda
              </p>
              <p className="text-3xl font-extrabold text-primary tracking-wider font-mono">
                {createdTicketCode}
              </p>
              <p className="text-xs text-secondary mt-2">
                Simpan nomor tiket ini untuk melacak perkembangan penanganan di portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/laporan/${createdReportId}`}
                className="flex-1 py-3 px-4 bg-primary-container hover:bg-primary text-on-primary font-semibold text-sm rounded-lg transition text-center"
              >
                Pantau Laporan Ini
              </Link>
              <Link
                href="/peta"
                className="flex-1 py-3 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm rounded-lg border border-outline-variant transition text-center"
              >
                Lihat di Peta Pantau
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 md:py-14 bg-background">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {/* Header Form */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold mb-3">
              <span className="material-symbols-outlined !text-base">add_location_alt</span>
              Pengaduan Resmi Warga
            </div>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Formulir Laporan Kerusakan
            </h1>
            <p className="text-body-sm text-secondary mt-1">
              Ikuti 3 langkah mudah untuk menyampaikan aduan infrastruktur Anda
            </p>
          </div>

          {/* STEPPER INDICATOR 3 TAHAP */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`flex flex-col items-center pb-2 border-b-2 text-center transition ${
                  currentStep >= 1 ? "border-primary text-primary" : "border-outline-variant text-secondary"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    currentStep >= 1 ? "bg-primary text-white" : "bg-surface-container-high text-secondary"
                  }`}
                >
                  1
                </div>
                <span className="text-xs font-semibold">Foto &amp; Deskripsi</span>
              </div>

              <div
                className={`flex flex-col items-center pb-2 border-b-2 text-center transition ${
                  currentStep >= 2 ? "border-primary text-primary" : "border-outline-variant text-secondary"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    currentStep >= 2 ? "bg-primary text-white" : "bg-surface-container-high text-secondary"
                  }`}
                >
                  2
                </div>
                <span className="text-xs font-semibold">Titik Lokasi Peta</span>
              </div>

              <div
                className={`flex flex-col items-center pb-2 border-b-2 text-center transition ${
                  currentStep >= 3 ? "border-primary text-primary" : "border-outline-variant text-secondary"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    currentStep >= 3 ? "bg-primary text-white" : "bg-surface-container-high text-secondary"
                  }`}
                >
                  3
                </div>
                <span className="text-xs font-semibold">Ringkasan &amp; Kirim</span>
              </div>
            </div>
          </div>

          {/* PESAN KESALAHAN VALIDASI */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container border border-red-300 flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined !text-xl text-error">error</span>
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {/* CARD CONTAINER FORMULIR */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant shadow-sm">
            {/* ===================== LANGKAH 1 ===================== */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* 1. Kategori (Chips) */}
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    Pilih Kategori Infrastruktur <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {categories.map((cat) => {
                      const isSelected = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                            isSelected
                              ? "border-primary bg-primary-fixed/40 text-on-primary-fixed shadow-sm"
                              : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined !text-xl ${
                              isSelected ? "text-primary" : "text-secondary"
                            }`}
                          >
                            {cat.ikon}
                          </span>
                          <span className="text-xs font-semibold leading-tight line-clamp-2">
                            {cat.nama}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Upload Foto Bukti (Drag & Drop + EXIF) */}
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    Foto Bukti Kerusakan <span className="text-error">*</span>
                    <span className="text-xs font-normal text-secondary ml-1">
                      (JPG/PNG, Maksimal 10 MB)
                    </span>
                  </label>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center min-h-[190px] ${
                      fotoPreview
                        ? "border-primary bg-primary-fixed/10"
                        : "border-outline hover:border-primary bg-surface-container-low"
                    }`}
                  >
                    {fotoPreview ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={fotoPreview}
                          alt="Pratinjau Foto"
                          className="h-44 object-cover rounded-lg shadow-sm border border-outline-variant mb-3"
                        />
                        {exifFound && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-2">
                            <span className="material-symbols-outlined !text-sm">gps_fixed</span>
                            Koordinat GPS berhasil terdeteksi dari foto!
                          </div>
                        )}
                        <label className="cursor-pointer text-xs font-bold text-primary hover:underline">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined !text-2xl">add_photo_alternate</span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface mb-1">
                          Tarik &amp; lepas foto di sini, atau telusuri file
                        </p>
                        <p className="text-xs text-secondary mb-4">
                          Ambil langsung foto di lokasi dengan GPS aktif untuk akurasi peta otomatis
                        </p>
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-primary/90 transition shadow-sm">
                          <span className="material-symbols-outlined !text-base">upload</span>
                          Pilih Foto dari Galeri / Kamera
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePhotoUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Mengunggah &amp; membaca EXIF foto...
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Deskripsi Masalah (Penghitung Karakter Maks 500) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-on-surface">
                      Deskripsi Kerusakan <span className="text-error">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-medium ${
                        deskripsi.length > 500 ? "text-error font-bold" : "text-secondary"
                      }`}
                    >
                      {deskripsi.length}/500 karakter
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    maxLength={550}
                    placeholder="Jelaskan kondisi kerusakan secara detail, perkiraan kedalaman lubang, atau dampak kemacetan/bahaya yang ditimbulkan..."
                    className="w-full p-3.5 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                  <p className="text-xs text-secondary mt-1">
                    Minimal 15 karakter. Gunakan kalimat yang jelas dan objektif.
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={handleNextToStep2}
                    className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg px-6 py-3 font-semibold text-sm shadow-sm active:scale-95 transition"
                  >
                    Lanjut: Titik Lokasi Peta
                    <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================== LANGKAH 2 ===================== */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-1">
                    Tentukan Titik Kerusakan pada Peta <span className="text-error">*</span>
                  </h3>
                  <p className="text-xs text-secondary mb-3">
                    {exifFound
                      ? "Titik koordinat otomatis disesuaikan dari metadata GPS foto kamera Anda."
                      : "Klik pada peta atau geser pin merah untuk menandai lokasi yang tepat."}
                  </p>

                  <DynamicLocationPicker
                    lat={lat}
                    lng={lng}
                    onChange={(coords) => {
                      setLat(coords.lat);
                      setLng(coords.lng);
                      if (coords.alamat) {
                        setAlamat(coords.alamat);
                      }
                      if (coords.kecamatan) {
                        setKecamatan(coords.kecamatan);
                      }
                    }}
                  />
                </div>

                {/* Input Alamat & Patokan */}
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    Nama Jalan / Patokan Tempat <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Contoh: Jl. Teuku Umar No. 15, depan gerbang kampus..."
                    className="w-full p-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Dropdown Kecamatan */}
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    Kecamatan Kota Bandar Lampung <span className="text-error">*</span>
                  </label>
                  <select
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {KECAMATAN_BANDAR_LAMPUNG.map((kec) => (
                      <option key={kec} value={kec}>
                        Kecamatan {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-secondary hover:bg-surface-container-low transition"
                  >
                    <span className="material-symbols-outlined !text-lg">arrow_back</span>
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={handleNextToStep3}
                    className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg px-6 py-3 font-semibold text-sm shadow-sm active:scale-95 transition"
                  >
                    Lanjut: Ringkasan &amp; Kontak
                    <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================== LANGKAH 3 ===================== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-on-surface mb-3">
                    Kontak Pelapor (Opsional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={namaPelapor}
                        onChange={(e) => setNamaPelapor(e.target.value)}
                        placeholder="Nama Anda"
                        className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        Nomor WhatsApp / Telepon
                      </label>
                      <input
                        type="tel"
                        value={kontakPelapor}
                        onChange={(e) => setKontakPelapor(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Ringkasan Laporan Sebelum Kirim */}
                <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-low space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Ringkasan Aduan Anda
                  </h4>

                  <div className="flex gap-4 items-start">
                    {fotoPreview && (
                      <img
                        src={fotoPreview}
                        alt="Bukti"
                        className="w-24 h-24 object-cover rounded-lg border border-outline-variant shrink-0"
                      />
                    )}
                    <div className="text-xs space-y-1 text-secondary">
                      <p className="text-sm font-bold text-on-surface">
                        {selectedCategoryObj?.nama}
                      </p>
                      <p className="line-clamp-2 text-on-surface-variant">{deskripsi}</p>
                      <p className="pt-1 font-medium text-on-surface">
                        📍 {alamat}, Kec. {kecamatan}
                      </p>
                      <p className="font-mono text-[11px] text-secondary">
                        Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-primary-fixed/20 rounded-xl border border-primary-fixed/40 flex items-start gap-2.5 text-xs text-on-primary-fixed">
                  <span className="material-symbols-outlined !text-lg text-primary shrink-0">info</span>
                  <p>
                    Dengan mengirimkan laporan ini, Anda menyatakan bahwa informasi yang disampaikan adalah benar dan dapat dipertanggungjawabkan untuk kepentingan pelayanan publik Kota Bandar Lampung.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-secondary hover:bg-surface-container-low transition disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined !text-lg">arrow_back</span>
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg px-8 py-3.5 font-bold text-sm shadow-md active:scale-95 transition disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined !text-xl">
                      {isSubmitting ? "sync" : "send"}
                    </span>
                    {isSubmitting ? "Mendaftarkan Tiket..." : "Kirim Laporan Pengaduan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

