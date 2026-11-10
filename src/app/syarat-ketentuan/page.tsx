import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SyaratKetentuanPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-14 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant shadow-sm space-y-6">
            <h1 className="text-headline-lg font-bold text-on-surface">Syarat &amp; Ketentuan Penggunaan</h1>
            <p className="text-xs text-secondary">Berlaku efektif sejak 2026</p>

            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-base font-bold text-on-surface">1. Ketentuan Laporan Aduan</h2>
              <p>
                Warga diharapkan mengunggah informasi yang benar, akurat, dan tidak mengandung unsur hoaks, fitnah, pornografi, atau konten yang melanggar hukum Negara Kesatuan Republik Indonesia.
              </p>

              <h2 className="text-base font-bold text-on-surface">2. Hak Pengelolaan Data</h2>
              <p>
                Foto bukti dan koordinat yang diunggah ke dalam sistem bersifat terbuka untuk kepentingan publikasi penanganan fasilitas daerah dan perencanaan tata ruang kota.
              </p>

              <h2 className="text-base font-bold text-on-surface">3. Prioritas Penanganan</h2>
              <p>
                Dinas teknis berwenang menentukan skala prioritas tindakan (P1 Kritis, P2 Mendesak, P3 Rutin) berdasarkan tingkat bahaya terhadap keselamatan jiwa dan kelancaran mobilitas warga.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

