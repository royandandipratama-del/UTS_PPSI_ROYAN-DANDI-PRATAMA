"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserSession {
  userId: string;
  email: string;
  nama: string;
  role: "warga" | "petugas" | "admin";
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          fetch("/api/notifications")
            .then((nRes) => (nRes.ok ? nRes.json() : null))
            .then((nData) => {
              if (nData?.notifications) {
                const unread = nData.notifications.filter((n: { dibaca: boolean }) => !n.dibaca).length;
                setUnreadCount(unread);
              }
            })
            .catch(() => {});
        } else {
          setUser(null);
          setUnreadCount(0);
        }
      })
      .catch(() => {
        setUser(null);
        setUnreadCount(0);
      });
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/masuk";
  };

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Laporkan", href: "/laporkan" },
    { label: "Feed Laporan", href: "/laporan" },
    { label: "Peta Pantau", href: "/peta" },
    { label: "Statistik", href: "/statistik" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant h-16 transition-shadow">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined !text-2xl">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-on-surface tracking-tight">LaporWarga</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                Balam
              </span>
            </div>
            <p className="text-[11px] text-secondary font-medium hidden sm:block">
              Kota Bandar Lampung
            </p>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-fixed"
                    : "text-secondary hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/laporkan"
            className="hidden sm:inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg px-4 py-2 text-sm font-semibold shadow-sm active:scale-95 transition duration-150"
          >
            <span className="material-symbols-outlined !text-lg">add_location_alt</span>
            Laporkan Masalah
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition"
              >
                <div className="relative w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-xs flex items-center justify-center">
                  {user.nama.charAt(0).toUpperCase()}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-600 border-2 border-white" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold leading-tight text-on-surface max-w-[120px] truncate">
                    {user.nama}
                  </p>
                  <p className="text-[10px] text-secondary capitalize">{user.role}</p>
                </div>
                <span className="material-symbols-outlined text-secondary !text-lg">
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <p className="text-xs text-secondary">Masuk sebagai</p>
                    <p className="text-sm font-bold text-on-surface truncate">{user.nama}</p>
                    <p className="text-xs text-secondary truncate">{user.email}</p>
                  </div>

                  {(user.role === "petugas" || user.role === "admin") && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-primary-fixed/30"
                    >
                      <span className="material-symbols-outlined !text-lg">dashboard</span>
                      Dasbor Pengelola
                    </Link>
                  )}

                  <Link
                    href="/notifikasi"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined !text-lg">notifications</span>
                      Notifikasi Saya
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/30 border-t border-outline-variant mt-1"
                  >
                    <span className="material-symbols-outlined !text-lg">logout</span>
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition"
            >
              <span className="material-symbols-outlined !text-lg">login</span>
              Masuk
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-secondary hover:bg-surface-container"
            aria-label="Buka menu navigasi"
          >
            <span className="material-symbols-outlined !text-2xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-outline-variant px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                pathname === link.href
                  ? "bg-secondary-container text-on-secondary-fixed"
                  : "text-secondary hover:bg-surface-container-low"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/laporkan"
            onClick={() => setIsMenuOpen(false)}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-primary-container text-on-primary rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            <span className="material-symbols-outlined !text-lg">add_location_alt</span>
            Laporkan Masalah
          </Link>
        </div>
      )}
    </header>
  );
}

