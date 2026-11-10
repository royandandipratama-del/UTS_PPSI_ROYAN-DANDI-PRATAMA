export const KECAMATAN_BANDAR_LAMPUNG = [
  "Kedaton",
  "Rajabasa",
  "Tanjung Karang Pusat",
  "Tanjung Karang Barat",
  "Tanjung Karang Timur",
  "Teluk Betung Selatan",
  "Teluk Betung Barat",
  "Teluk Betung Utara",
  "Teluk Betung Timur",
  "Labuhan Ratu",
  "Way Halim",
  "Sukarame",
  "Enggal",
  "Kemiling",
  "Langkapura",
  "Kedamaian",
  "Bumi Waras",
  "Panjang",
  "Sukabumi",
  "Tanjung Senang",
] as const;

export const STATUS_LIST = [
  "Menunggu",
  "Diproses",
  "Sedang Dikerjakan",
  "Selesai",
  "Diarsipkan",
] as const;

export type ReportStatus = (typeof STATUS_LIST)[number];

export const PRIORITAS_LIST = ["P1 Kritis", "P2 Mendesak", "P3 Rutin"] as const;
export type PriorityLevel = (typeof PRIORITAS_LIST)[number];

/**
 * Alur transisi status yang sah (divalidasi di server):
 * Menunggu -> Diproses -> Sedang Dikerjakan -> Selesai -> Diarsipkan
 */
export const VALID_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  Menunggu: ["Diproses", "Diarsipkan"],
  Diproses: ["Sedang Dikerjakan", "Menunggu", "Diarsipkan"],
  "Sedang Dikerjakan": ["Selesai", "Diproses"],
  Selesai: ["Diarsipkan", "Diproses"],
  Diarsipkan: ["Menunggu"],
};

export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string; stage: number }
> = {
  Menunggu: {
    label: "Menunggu Validasi",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
    borderClass: "border-red-200",
    stage: 1,
  },
  Diproses: {
    label: "Diproses",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-300",
    stage: 2,
  },
  "Sedang Dikerjakan": {
    label: "Dalam Penanganan",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-300",
    stage: 2,
  },
  Selesai: {
    label: "Selesai",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-300",
    stage: 3,
  },
  Diarsipkan: {
    label: "Diarsipkan",
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    borderClass: "border-gray-300",
    stage: 3,
  },
};

export const DEFAULT_BANDAR_LAMPUNG_CENTER = {
  lat: -5.39714,
  lng: 105.26679,
  zoom: 13,
};

