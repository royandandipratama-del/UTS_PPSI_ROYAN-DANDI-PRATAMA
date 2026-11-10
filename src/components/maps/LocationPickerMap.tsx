"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { DEFAULT_BANDAR_LAMPUNG_CENTER, KECAMATAN_BANDAR_LAMPUNG } from "@/lib/constants";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number; alamat?: string; kecamatan?: string }) => void;
}

function detectKecamatanFromNominatim(displayName: string, address: Record<string, string> = {}): string | undefined {
  const suburb = (address.suburb || address.city_district || address.village || "").toLowerCase();
  const lowerDisplay = displayName.toLowerCase();
  for (const kec of KECAMATAN_BANDAR_LAMPUNG) {
    if (lowerDisplay.includes(kec.toLowerCase()) || suburb.includes(kec.toLowerCase())) {
      return kec;
    }
  }
  return undefined;
}

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState("");

  // Helper untuk reverse geocode titik koordinat ke alamat & kecamatan
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      setAddressFeedback("Mengidentifikasi alamat...");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "id" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const displayName = data.display_name || "";
      const address = data.address || {};

      const detectedKecamatan = detectKecamatanFromNominatim(displayName, address);
      const shortAddress = displayName.split(",").slice(0, 3).join(",").trim();

      setAddressFeedback(shortAddress);
      onChangeRef.current({
        lat: latitude,
        lng: longitude,
        alamat: shortAddress || undefined,
        kecamatan: detectedKecamatan,
      });
    } catch {
      setAddressFeedback("");
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Inisialisasi peta
      const initialLat = lat || DEFAULT_BANDAR_LAMPUNG_CENTER.lat;
      const initialLng = lng || DEFAULT_BANDAR_LAMPUNG_CENTER.lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // OpenStreetMap Tile Layer resmi & bebas API key
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="background-color: #004ac6; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 3px solid white;">
            <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 18px;">location_on</span>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // Event saat marker digeser (dragend)
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onChangeRef.current({ lat: position.lat, lng: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      // Event saat peta diklik
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        onChangeRef.current({ lat: clickLat, lng: clickLng });
        reverseGeocode(clickLat, clickLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reverseGeocode]);

  // Sync saat prop lat/lng berubah (misalnya dari EXIF atau input form)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lng) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Tombol GPS Geolocation Warga
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat atau peramban Anda tidak mendukung sensor GPS lokasi.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setIsLocating(false);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([userLat, userLng]);
          mapInstanceRef.current.flyTo([userLat, userLng], 16);
          onChangeRef.current({ lat: userLat, lng: userLng });
          reverseGeocode(userLat, userLng);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation warning:", err);
        alert("Izin GPS tidak diberikan atau sinyal lokasi tidak ditemukan.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Pencarian Alamat via Nominatim
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = encodeURIComponent(`${searchQuery}, Bandar Lampung, Lampung, Indonesia`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&addressdetails=1`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        const displayName = data[0].display_name || "";
        const detectedKecamatan = detectKecamatanFromNominatim(displayName, data[0].address || {});
        const shortAddress = displayName.split(",").slice(0, 3).join(",").trim();

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([foundLat, foundLng]);
          mapInstanceRef.current.flyTo([foundLat, foundLng], 16);
          onChangeRef.current({
            lat: foundLat,
            lng: foundLng,
            alamat: shortAddress || undefined,
            kecamatan: detectedKecamatan,
          });
          setAddressFeedback(shortAddress);
        }
      } else {
        alert("Alamat tidak ditemukan di wilayah Bandar Lampung. Coba kata kunci lain atau geser pin langsung pada peta.");
      }
    } catch {
      alert("Gagal melakukan pencarian alamat. Silakan klik langsung pada titik peta.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search Bar & GPS Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchAddress} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary !text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jalan atau nama tempat di Bandar Lampung..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition disabled:opacity-60 flex items-center gap-1"
          >
            {isSearching ? "Mencari..." : "Cari"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-fixed text-on-primary-fixed rounded-lg text-sm font-semibold hover:bg-primary-fixed-dim transition disabled:opacity-60"
        >
          <span className="material-symbols-outlined !text-lg">
            {isLocating ? "sync" : "my_location"}
          </span>
          {isLocating ? "Mencari GPS..." : "Gunakan Lokasi GPS Saya"}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-outline-variant shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-20 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-medium text-secondary shadow-sm flex items-center gap-1.5 pointer-events-none">
          <span className="material-symbols-outlined text-primary !text-base">touch_app</span>
          Klik atau geser pin merah untuk mengarahkan titik laporan
        </div>
      </div>

      {/* Baris Informasi Koordinat */}
      <div className="flex flex-wrap items-center justify-between text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface flex items-center gap-1">
            <span className="material-symbols-outlined text-primary !text-sm">pin_drop</span>
            Koordinat Terpilih:
          </span>
          <span className="font-mono text-secondary bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </div>
        {addressFeedback && (
          <p className="text-secondary truncate max-w-sm" title={addressFeedback}>
            📍 {addressFeedback}
          </p>
        )}
      </div>
    </div>
  );
}

