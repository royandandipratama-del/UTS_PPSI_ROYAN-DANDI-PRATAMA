import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Kolom 1: Tautan Cepat */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined !text-xl">account_balance</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LaporWarga</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Portal partisipasi publik dan pengaduan infrastruktur terpadu Pemerintah Kota Bandar Lampung.
              Menghubungkan suara warga langsung dengan dinas teknis terkait.
            </p>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-2">
              Tautan Cepat
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/tentang" className="hover:text-white transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-white transition">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-white transition">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Bantuan & Darurat */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed !text-xl">emergency</span>
              Bantuan &amp; Darurat
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-400 font-medium">Pusat Layanan Warga</p>
                <p className="text-base font-bold text-white tracking-wide mt-0.5">
                  +62 721 701-999
                </p>
                <p className="text-xs text-gray-400">Senin - Jumat (08.00 - 16.00 WIB)</p>
              </div>
              <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
                <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined !text-sm">crisis_alert</span>
                  Hotline Darurat Kebencanaan Kota
                </p>
                <p className="text-base font-bold text-red-300 tracking-wide mt-0.5">
                  112 / 119 Call Center Kota
                </p>
                <p className="text-xs text-gray-400">Siaga 24 Jam Bebas Pulsa</p>
              </div>
            </div>
          </div>

          {/* Kolom 3: Kemitraan */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed !text-xl">handshake</span>
              Kemitraan
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Inisiatif pengembangan sistem civic crowdsourcing hasil kolaborasi riset akademik dan tata kelola smart city.
            </p>
            <div className="flex flex-row items-center justify-start gap-4 flex-wrap">
              {/* Logo Pemerintah Kota */}
              <div className="h-14 rounded-xl bg-white/10 border border-gray-700 px-3 py-2 flex items-center justify-center">
                <Image
                  src="/logo-pemda.png"
                  alt="Logo Pemerintah Kota Bandar Lampung"
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain"
                  style={{ maxHeight: "40px" }}
                />
              </div>
              {/* Logo Universitas Teknokrat Indonesia */}
              <div className="h-14 rounded-xl bg-white/10 border border-gray-700 px-3 py-2 flex items-center justify-center">
                <Image
                  src="/logo-uti.png"
                  alt="Logo Universitas Teknokrat Indonesia"
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain"
                  style={{ maxHeight: "40px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bilah Bawah Persis sesuai Prompt */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-xs md:text-sm text-gray-400 font-medium">
            Copyright©2026 by Royan Dandi Pratama dan Dr. Erliyan Redy Susanto, M.Kom.
          </p>
        </div>
      </div>
    </footer>
  );
}

