"use client";

import dynamic from "next/dynamic";
import React from "react";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center justify-center text-secondary">
      <span className="material-symbols-outlined animate-spin !text-3xl text-primary mb-2">
        progress_activity
      </span>
      <p className="text-sm font-medium">Memuat peta lokasi interaktif...</p>
    </div>
  ),
});

export default LocationPickerMap;

