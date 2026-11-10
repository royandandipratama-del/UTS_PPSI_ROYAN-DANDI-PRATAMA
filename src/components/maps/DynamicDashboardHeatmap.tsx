"use client";

import dynamic from "next/dynamic";
import React from "react";

const DashboardHeatmap = dynamic(() => import("./DashboardHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-400">
      <span className="material-symbols-outlined animate-spin !text-4xl text-primary mb-3">
        progress_activity
      </span>
      <p className="text-base font-semibold text-slate-300">Menghitung matriks geospasial titik panas...</p>
    </div>
  ),
});

export default DashboardHeatmap;

