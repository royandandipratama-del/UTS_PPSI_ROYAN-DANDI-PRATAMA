"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { DEFAULT_BANDAR_LAMPUNG_CENTER } from "@/lib/constants";

interface HeatmapCluster {
  key: string;
  lat: number;
  lng: number;
  count: number;
  level: "tinggi" | "sedang" | "rendah";
  color: string;
  radius: number;
}

interface CriticalReport {
  id: string;
  ticketCode: string;
  deskripsi: string;
  alamat: string;
  kecamatan: string;
  lat: number;
  lng: number;
  prioritas: string;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function DashboardHeatmap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const criticalLayerRef = useRef<L.LayerGroup | null>(null);

  const [range, setRange] = useState<"24h" | "7d">("7d");
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<{
    totalReports: number;
    clusters: HeatmapCluster[];
    criticalReports: CriticalReport[];
  }>({ totalReports: 0, clusters: [], criticalReports: [] });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Map Gelap Tema Slate-950
      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_BANDAR_LAMPUNG_CENTER.lat, DEFAULT_BANDAR_LAMPUNG_CENTER.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Tile Layer Gelap (CartoDB DarkMatter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      const clusterLayer = L.layerGroup().addTo(map);
      const criticalLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      clusterLayerRef.current = clusterLayer;
      criticalLayerRef.current = criticalLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch data heatmap saat range berubah
  useEffect(() => {
    setLoading(true);
    fetch(`/api/heatmap?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        renderLayers(data.clusters || [], data.criticalReports || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [range]);

  const renderLayers = (clusters: HeatmapCluster[], criticalReports: CriticalReport[]) => {
    if (!clusterLayerRef.current || !criticalLayerRef.current) return;

    clusterLayerRef.current.clearLayers();
    criticalLayerRef.current.clearLayers();

    // 1. Render Blob Lingkaran Titik Panas Agregasi 500m
    clusters.forEach((c) => {
      // Lingkaran gradient blob
      const circle = L.circle([c.lat, c.lng], {
        radius: c.radius,
        fillColor: c.color,
        fillOpacity: c.level === "tinggi" ? 0.6 : c.level === "sedang" ? 0.45 : 0.3,
        color: c.color,
        weight: 1.5,
        opacity: 0.8,
      });

      const popupHtml = `
        <div style="background: #0f172a; color: white; padding: 12px; border-radius: 8px; font-family: inherit;">
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: ${c.color}">
            Area Kepadatan ${c.level.toUpperCase()}
          </h4>
          <p style="font-size: 12px; margin: 0; color: #cbd5e1;">
            Konsentrasi: <strong>${c.count} Aduan</strong> dalam radius ~500 meter.
          </p>
          <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 0 0;">
            Grid Lat: ${c.lat.toFixed(4)}, Lng: ${c.lng.toFixed(4)}
          </p>
        </div>
      `;

      circle.bindPopup(popupHtml);
      clusterLayerRef.current?.addLayer(circle);
    });

    // 2. Render Pin Kritis Berdenyut (P1 Kritis)
    criticalReports.forEach((cr) => {
      const pulseHtml = `
        <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background: rgba(239, 68, 68, 0.7); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background: #dc2626; border: 2px solid #ffffff; box-shadow: 0 0 10px #ef4444; display: flex; align-items: center; justify-content: center; color: white;">
            <span class="material-symbols-outlined" style="font-size: 11px;">priority_high</span>
          </div>
        </div>
      `;

      const pulseIcon = L.divIcon({
        className: "custom-critical-pin",
        html: pulseHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const criticalMarker = L.marker([cr.lat, cr.lng], { icon: pulseIcon });

      const safeTicketCode = escapeHtml(cr.ticketCode);
      const safeDeskripsi = escapeHtml(cr.deskripsi);
      const safeAlamat = escapeHtml(cr.alamat);
      const safeKecamatan = escapeHtml(cr.kecamatan);

      const criticalPopupHtml = `
        <div style="background: #1e1b4b; color: white; padding: 12px; border-radius: 8px; font-family: inherit; border: 1px solid #dc2626;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">P1 KRITIS</span>
            <span style="font-size: 11px; font-weight: bold; color: #cbd5e1;">${safeTicketCode}</span>
          </div>
          <p style="font-size: 12px; font-weight: 600; margin: 0 0 4px 0; color: white;">${safeDeskripsi}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">📍 ${safeAlamat}, ${safeKecamatan}</p>
        </div>
      `;

      criticalMarker.bindPopup(criticalPopupHtml);
      criticalLayerRef.current?.addLayer(criticalMarker);
    });
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-200 px-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-400 !text-base">local_fire_department</span>
          Rentang Waktu:
        </span>
        <button
          type="button"
          onClick={() => setRange("24h")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            range === "24h"
              ? "bg-primary text-white shadow-md"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          24 Jam Terakhir
        </button>
        <button
          type="button"
          onClick={() => setRange("7d")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            range === "7d"
              ? "bg-primary text-white shadow-md"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          7 Hari Terakhir
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-2 border-l border-slate-700">
          {statsData.totalReports} Titik
        </span>
      </div>

      {/* Floating Dark Map Legend */}
      <div className="absolute bottom-6 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl text-slate-200 min-w-[220px]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary-fixed !text-base">layers</span>
          Legenda Titik Panas
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span>Kepadatan Tinggi (&gt; 20 Aduan)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span>Kepadatan Sedang (10 - 20 Aduan)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span>Kepadatan Rendah (&lt; 10 Aduan)</span>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white animate-pulse" />
            <span className="text-red-400 font-semibold">Pin Kritis P1 (Berdenyut)</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-4 right-4 z-20 bg-slate-900/90 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin !text-sm">sync</span>
          Memperbarui klaster...
        </div>
      )}

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

