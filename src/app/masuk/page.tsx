"use client";

import React, { useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function MasukContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Email atau kata sandi tidak sesuai.");
      }

      // Validasi redirect internal yang aman (mencegah Open Redirect)
      const isSafeRedirect =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//");

      if (isSafeRedirect) {
        router.push(redirectParam);
      } else if (data.user?.role === "petugas" || data.user?.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo12345!");
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 py-14 bg-surface-container-low flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-md">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
              <span className="material-symbols-outlined !text-2xl">account_balance</span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface">Masuk ke LaporWarga</h1>
            <p className="text-xs text-secondary mt-1">
              Portal Pengaduan &amp; Aspirasi Kota Bandar Lampung
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium border border-red-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-error !text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-on-surface">
                  Kata Sandi <span className="text-error">*</span>
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full p-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined animate-spin !text-lg">sync</span>}
              {loading ? "Memverifikasi..." : "Masuk ke Akun"}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-outline-variant">
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary mb-2 text-center">
              Pilihan Akun Demo (Klik Langsung):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("warga@laporwarga.id")}
                className="p-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg border border-outline-variant text-[11px] font-semibold transition text-center"
              >
                👤 Warga
              </button>
              <button
                type="button"
                onClick={() => fillDemo("petugas@laporwarga.id")}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-200 text-[11px] font-semibold transition text-center"
              >
                👷 Petugas
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@laporwarga.id")}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 text-[11px] font-semibold transition text-center"
              >
                🛡️ Admin
              </button>
            </div>
            <p className="text-[10px] text-secondary text-center mt-2">
              Kata sandi default: <code className="font-bold text-on-surface">Demo12345!</code>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-secondary">
            Belum memiliki akun warga?{" "}
            <Link href="/daftar" className="text-primary font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="flex-1 py-20 flex flex-col items-center justify-center text-secondary">
            <span className="material-symbols-outlined animate-spin text-primary !text-4xl mb-3">
              progress_activity
            </span>
            <p className="text-sm font-semibold">Memuat halaman masuk...</p>
          </main>
          <Footer />
        </>
      }
    >
      <MasukContent />
    </Suspense>
  );
}

