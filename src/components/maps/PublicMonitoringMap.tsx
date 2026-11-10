"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { DEFAULT_BANDAR_LAMPUNG_CENTER } from "@/lib/constants";

interface ReportPin {
  id: string;
  ticketCode: string;
  deskripsi: string;
  alamat: string;
  kecamatan: string;
  lat: number;
  lng: number;
  status: string;
  prioritas: string;
  fotoUrl: string;
  category?: {
    nama: string;
    ikon: string;
  };
}

interface PublicMonitoringMapProps {
  reports: ReportPin[];
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

export default function PublicMonitoringMap({ reports }: PublicMonitoringMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

  const getPinColor = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "#dc2626"; // red-600
      case "Diproses":
      case "Sedang Dikerjakan":
        return "#d97706"; // amber-600
      case "Selesai":
        return "#059669"; // emerald-600
      default:
        return "#4b5563";
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_BANDAR_LAMPUNG_CENTER.lat, DEFAULT_BANDAR_LAMPUNG_CENTER.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Light OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Pin Markers setiap kali laporan atau filter berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered =
      activeFilter === "Semua"
        ? reports
        : reports.filter((r) => r.status === activeFilter);

    filtered.forEach((r) => {
      const color = getPinColor(r.status);
      const isCritical = r.prioritas === "P1 Kritis" && r.status !== "Selesai";

      const safeIconName = escapeHtml(r.category?.ikon || "location_on");
      const pinHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          ${isCritical ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ""}
          <div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.25); border: 2px solid white; z-index: 10;">
            <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 16px;">${safeIconName}</span>
            </div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-map-pin",
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([r.lat, r.lng], { icon });

      // Konten Popup dengan Sanitasi XSS
      const statusBadgeHtml =
        r.status === "Menunggu"
          ? '<span style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600;">Menunggu Validasi</span>'
          : r.status === "Selesai"
          ? '<span style="background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600;">Selesai</span>'
          : '<span style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600;">Dalam Penanganan</span>';

      const safeFotoUrl = escapeHtml(r.fotoUrl);
      const safeTicketCode = escapeHtml(r.ticketCode);
      const safeCatName = escapeHtml(r.category?.nama || "Infrastruktur");
      const safeDeskripsi = escapeHtml(r.deskripsi);
      const safeAlamat = escapeHtml(r.alamat);
      const safeKecamatan = escapeHtml(r.kecamatan);
      const safeId = encodeURIComponent(r.id);

      const popupContent = `
        <div style="width: 250px; font-family: inherit; overflow: hidden; border-radius: 12px;">
          <div style="position: relative; height: 110px; background: #e2e8f0; overflow: hidden;">
            <img src="${safeFotoUrl}" alt="Foto Laporan" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/uploads/placeholder-jalan.svg'"/>
            <span style="position: absolute; top: 8px; left: 8px; font-size: 11px; font-weight: 700; background: rgba(0, 74, 198, 0.9); color: white; padding: 2px 6px; border-radius: 6px;">
              ${safeTicketCode}
            </span>
          </div>
          <div style="padding: 12px; background: white;">
            <div style="margin-bottom: 6px;">${statusBadgeHtml}</div>
            <h4 style="font-size: 13px; font-weight: 700; color: #191c1d; margin: 0 0 4px 0; line-height: 1.3;">
              ${safeCatName}
            </h4>
            <p style="font-size: 11px; color: #575e70; margin: 0 0 6px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${safeDeskripsi}
            </p>
            <p style="font-size: 11px; color: #737686; margin: 0 0 10px 0;">
              📍 ${safeAlamat}, ${safeKecamatan}
            </p>
            <a href="/laporan/${safeId}" style="display: block; text-align: center; background: #004ac6; color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;">
              Lihat Detail &amp; Lacak Tiket
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, activeFilter]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-outline-variant shadow-md">
      {/* Floating Status Filter Controls */}
      <div className="absolute top-4 left-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md p-2 rounded-xl border border-outline-variant shadow-lg flex flex-wrap gap-1.5 items-center">
        <span className="text-xs font-bold text-on-surface px-2">Filter:</span>
        {["Semua", "Menunggu", "Diproses", "Sedang Dikerjakan", "Selesai"].map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container"
              }`}
            >
              {f === "Menunggu"
                ? "Menunggu Validasi"
                : f === "Sedang Dikerjakan"
                ? "Dalam Penanganan"
                : f}
            </button>
          );
        })}
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-6 left-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant shadow-lg hidden sm:block">
        <p className="text-xs font-bold text-on-surface mb-2">Legenda Status Peta</p>
        <div className="space-y-1.5 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            <span>Menunggu Validasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>Dalam Penanganan / Diproses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>Telah Diselesaikan</span>
          </div>
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

