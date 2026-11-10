import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KebijakanPrivasiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-14 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant shadow-sm space-y-6">
            <h1 className="text-headline-lg font-bold text-on-surface">Kebijakan Privasi</h1>
            <p className="text-xs text-secondary">Komitmen Perlindungan Data Warga</p>

            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <h2 className="text-base font-bold text-on-surface">1. Pengumpulan Informasi Pribadi</h2>
              <p>
                Informasi seperti nama, email, dan nomor kontak yang Anda berikan hanya digunakan untuk keperluan konfirmasi tindak lanjut laporan dan pengiriman notifikasi penyelesaian tiket.
              </p>

              <h2 className="text-base font-bold text-on-surface">2. Penggunaan Data Lokasi GPS</h2>
              <p>
                Data koordinat lokasi yang diekstraksi dari foto atau pemilih peta hanya digunakan untuk mengidentifikasi titik kerusakan fisik di lapangan dan tidak digunakan untuk melacak aktivitas pribadi pelapor di luar konteks laporan terkait.
              </p>

              <h2 className="text-base font-bold text-on-surface">3. Keamanan Informasi</h2>
              <p>
                Kata sandi pengguna dienkripsi dengan standar pengacakan satu arah (bcrypt) dan autentikasi sesi dilindungi melalui token JWT httpOnly yang aman dari eksploitasi skrip pihak ketiga.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

