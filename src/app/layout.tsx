import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaporWarga - Portal Pengaduan Infrastruktur Warga Bandar Lampung",
  description:
    "Portal aspirasi dan pelaporan perbaikan infrastruktur jalan, drainase, lampu jalan, dan kebersihan lingkungan terpadu Kota Bandar Lampung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
        {children}
      </body>
    </html>
  );
}

