import React from "react";
import { STATUS_CONFIG, ReportStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as ReportStatus] || {
    label: status,
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    borderClass: "border-gray-200",
  };

  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-xs font-medium" : "px-3 py-1 text-label-sm font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "Menunggu"
            ? "bg-red-500"
            : status === "Selesai"
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />
      {config.label}
    </span>
  );
}

