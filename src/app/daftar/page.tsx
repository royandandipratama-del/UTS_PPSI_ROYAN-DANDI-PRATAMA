"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== konfirmasiPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, noTelepon, password, konfirmasiPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Pendaftaran gagal.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 py-14 bg-surface-container-low flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
              <span className="material-symbols-outlined !text-2xl">person_add</span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface">Pendaftaran Warga</h1>
            <p className="text-xs text-secondary mt-1">
              Buat akun untuk melacak pengaduan dan memberi dukungan
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium border border-red-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-error !text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Nama Lengkap <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama sesuai KTP"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Alamat Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Kata Sandi <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Konfirmasi Kata Sandi <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <span className="material-symbols-outlined animate-spin !text-lg">sync</span>}
              {loading ? "Mendaftarkan..." : "Daftar Akun Warga"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-secondary">
            Sudah memiliki akun?{" "}
            <Link href="/masuk" className="text-primary font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

