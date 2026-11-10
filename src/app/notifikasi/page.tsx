"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface NotificationItem {
  id: string;
  pesan: string;
  dibaca: boolean;
  createdAt: string;
  report: {
    id: string;
    ticketCode: string;
    alamat: string;
    status: string;
  } | null;
}

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then(async (res) => {
        if (res.status === 401) {
          setUnauthorized(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 bg-background">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-headline-md font-bold text-on-surface">Notifikasi Saya</h1>
              <p className="text-xs text-secondary mt-0.5">
                Pemberitahuan resmi perkembangan status laporan pengaduan Anda
              </p>
            </div>
            {notifications.some((n) => !n.dibaca) && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined !text-base">done_all</span>
                Tandai semua dibaca
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-secondary">
              <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
                progress_activity
              </span>
              <p className="text-sm font-semibold">Memuat notifikasi...</p>
            </div>
          ) : unauthorized ? (
            <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant text-center">
              <span className="material-symbols-outlined !text-5xl text-primary mb-3">
                lock
              </span>
              <h3 className="text-base font-bold text-on-surface">Silakan Masuk Terlebih Dahulu</h3>
              <p className="text-xs text-secondary mt-1 mb-6 max-w-sm mx-auto">
                Anda perlu masuk ke akun warga untuk melihat riwayat pemberitahuan laporan pengaduan Anda.
              </p>
              <Link
                href="/masuk?redirect=/notifikasi"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition shadow-sm"
              >
                <span className="material-symbols-outlined !text-base">login</span>
                Masuk ke Akun
              </Link>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant text-center">
              <span className="material-symbols-outlined !text-5xl text-secondary mb-3">
                notifications_off
              </span>
              <h3 className="text-sm font-bold text-on-surface">Belum Ada Notifikasi</h3>
              <p className="text-xs text-secondary mt-1">
                Setiap perubahan status tiket laporan Anda akan muncul di halaman ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition ${
                    n.dibaca
                      ? "bg-surface-container-lowest border-outline-variant"
                      : "bg-primary-fixed/20 border-primary shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          n.dibaca
                            ? "bg-surface-container-high text-secondary"
                            : "bg-primary text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined !text-xl">notifications</span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface font-medium leading-relaxed">
                          {n.pesan}
                        </p>
                        <p className="text-[11px] text-secondary mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {n.report && (
                      <Link
                        href={`/laporan/${n.report.id}`}
                        className="text-xs font-bold text-primary hover:underline shrink-0 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant"
                      >
                        Lihat Tiket
                      </Link>
                    )}
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

