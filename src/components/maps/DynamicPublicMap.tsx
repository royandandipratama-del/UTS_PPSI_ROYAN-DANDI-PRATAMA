"use client";

import dynamic from "next/dynamic";
import React from "react";

const PublicMonitoringMap = dynamic(() => import("./PublicMonitoringMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col items-center justify-center text-secondary">
      <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
        progress_activity
      </span>
      <p className="text-base font-semibold">Memuat data Peta Pantau Kota...</p>
    </div>
  ),
});

export default PublicMonitoringMap;

