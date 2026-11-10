import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPublicMap from "@/components/maps/DynamicPublicMap";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function PetaPantauPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { nama: true, ikon: true },
      },
    },
    take: 150,
  });

  return (
    <>
      <Navbar />

      <main className="flex-1 py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold mb-2">
                <span className="material-symbols-outlined !text-base">map</span>
                Geospasial Interaktif
              </div>
              <h1 className="text-headline-lg font-bold text-on-surface">
                Peta Pantau Laporan Warga
              </h1>
              <p className="text-sm text-secondary mt-1">
                Visualisasi titik persebaran kerusakan infrastruktur di seluruh kecamatan Kota Bandar Lampung
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-secondary">
              <span className="bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-lg shadow-sm">
                Total Pin Peta: <strong className="text-primary">{reports.length}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Map Component */}
          <DynamicPublicMap reports={reports} />
        </div>
      </main>

      <Footer />
    </>
  );
}

