import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TentangPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-14 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined !text-3xl">account_balance</span>
              </div>
              <div>
                <h1 className="text-headline-lg font-bold text-on-surface">Tentang LaporWarga</h1>
                <p className="text-xs text-secondary">Pemerintah Kota Bandar Lampung</p>
              </div>
            </div>

            <p className="text-body-md text-on-surface-variant leading-relaxed">
              <strong>LaporWarga</strong> adalah platform civic crowdsourcing modern yang dibangun untuk mempercepat penyampaian aspirasi dan aduan kerusakan infrastruktur publik di wilayah Kota Bandar Lampung. Melalui integrasi titik koordinat GPS dan foto bukti lapangan, setiap keluhan warga dapat ditindaklanjuti secara presisi oleh instansi teknis terkait (Dinas PUPR, DLH, BPBD, dll.).
            </p>

            <h2 className="text-headline-md font-bold text-on-surface pt-4 border-t border-outline-variant">
              Kemitraan Akademik &amp; Riset
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Aplikasi ini dikembangkan dalam rangka inisiatif riset kolaboratif antara akademisi dan praktisi tata kelola perkotaan:
            </p>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-1 text-sm">
              <p><strong>Pengembang Utama:</strong> Royan Dandi Pratama</p>
              <p><strong>Dosen Pembimbing / Penasihat:</strong> Dr. Erliyan Redy Susanto, M.Kom.</p>
              <p><strong>Institusi Mitra:</strong> Universitas Teknokrat Indonesia</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

