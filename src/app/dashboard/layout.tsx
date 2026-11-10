"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

interface UserProfile {
  nama: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/masuk";
  };

  const navMenuItems = [
    { label: "Dasbor Pantau", href: "/dashboard", icon: "dashboard" },
    { label: "Manajemen Tiket", href: "/dashboard/tiket", icon: "confirmation_number" },
    { label: "Analisis Geospasial", href: "/dashboard/peta", icon: "map" },
    { label: "Pengaturan Sistem", href: "/dashboard/pengaturan", icon: "settings" },
    { label: "Pusat Bantuan", href: "/dashboard/bantuan", icon: "help" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-outline-variant">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined !text-2xl">account_balance</span>
        </div>
        <div>
          <span className="text-base font-bold text-on-surface tracking-tight block">
            LaporWarga Admin
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
            Command Center Balam
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="space-y-1.5 flex-1">
        {navMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? "bg-secondary-container text-on-secondary-fixed shadow-sm"
                  : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined !text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-outline-variant">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined !text-xl">public</span>
            <span>Kunjungi Portal Publik</span>
          </Link>
        </div>
      </nav>

      {/* Profil Petugas Card */}
      <div className="pt-4 border-t border-outline-variant">
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant mb-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">
              {user?.nama || "Petugas Lapangan"}
            </p>
            <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
              {user?.role || "Petugas"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-error bg-error-container/40 hover:bg-error-container rounded-lg transition"
        >
          <span className="material-symbols-outlined !text-base">logout</span>
          Keluar Akun
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Topbar */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg text-secondary hover:bg-surface-container"
            aria-label="Buka menu navigasi"
          >
            <span className="material-symbols-outlined !text-2xl">menu</span>
          </button>
          <span className="text-sm font-bold text-on-surface">LaporWarga Dasbor</span>
        </div>
        <div className="text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">
          {user?.role?.toUpperCase()}
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-64 h-full bg-surface-container-lowest"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Fixed Desktop Sidebar w-64 */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
          {sidebarContent}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

