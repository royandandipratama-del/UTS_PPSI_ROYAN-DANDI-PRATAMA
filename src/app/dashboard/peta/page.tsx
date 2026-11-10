import React from "react";
import DynamicDashboardHeatmap from "@/components/maps/DynamicDashboardHeatmap";

export const revalidate = 0;

export default function AnalisisGeospasialPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Analisis Geospasial &amp; Titik Panas
          </h1>
          <p className="text-sm text-secondary mt-1">
            Visualisasi klaster kepadatan kerusakan infrastruktur perkotaan berbasis grid 500 meter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export/geojson"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-low transition shadow-sm"
          >
            <span className="material-symbols-outlined !text-base text-primary">download</span>
            Unduh Lapisan GeoJSON
          </a>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <DynamicDashboardHeatmap />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
          <span className="text-xs font-bold text-red-600 block mb-1">Zona Merah (&gt; 20 Aduan)</span>
          <p className="text-xs text-secondary leading-relaxed">
            Wilayah dengan konsentrasi kerusakan tinggi. Memerlukan intervensi pemeliharaan terpadu atau pengaspalan ulang skala besar.
          </p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
          <span className="text-xs font-bold text-amber-700 block mb-1">Zona Amber (10 - 20 Aduan)</span>
          <p className="text-xs text-secondary leading-relaxed">
            Wilayah berkembang dengan frekuensi laporan sedang. Penanganan terjadwal oleh tim patroli rutin dinas.
          </p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
          <span className="text-xs font-bold text-emerald-700 block mb-1">Zona Hijau (&lt; 10 Aduan)</span>
          <p className="text-xs text-secondary leading-relaxed">
            Kondisi infrastruktur relatif terpelihara atau aduan terisolasi yang dapat ditangani cepat oleh kru reaksi cepat.
          </p>
        </div>
      </div>
    </div>
  );
}

