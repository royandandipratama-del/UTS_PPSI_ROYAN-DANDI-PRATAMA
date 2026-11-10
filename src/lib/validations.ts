import { z } from "zod";
import { KECAMATAN_BANDAR_LAMPUNG, PRIORITAS_LIST, STATUS_LIST } from "./constants";

export const reportSchema = z.object({
  categoryId: z.string({
    required_error: "Kategori laporan wajib dipilih",
  }).min(1, "Kategori laporan wajib dipilih"),
  deskripsi: z
    .string({
      required_error: "Deskripsi masalah wajib diisi",
    })
    .min(15, "Deskripsi minimal 15 karakter agar mudah dipahami petugas")
    .max(500, "Deskripsi tidak boleh melebihi 500 karakter"),
  fotoUrl: z
    .string({
      required_error: "Foto bukti wajib diunggah",
    })
    .min(1, "Foto bukti wajib diunggah")
    .refine(
      (val) =>
        (val.startsWith("/uploads/") && !val.includes("..")) ||
        /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(val),
      "Path foto bukti harus berasal dari direktori unggahan resmi (/uploads/)"
    ),
  lat: z.number({
    required_error: "Titik koordinat latitude wajib ditentukan",
  }).min(-90).max(90),
  lng: z.number({
    required_error: "Titik koordinat longitude wajib ditentukan",
  }).min(-180).max(180),
  alamat: z
    .string({
      required_error: "Alamat atau patokan lokasi wajib diisi",
    })
    .min(5, "Alamat lokasi minimal 5 karakter")
    .max(250, "Alamat lokasi maksimal 250 karakter"),
  kecamatan: z.enum(KECAMATAN_BANDAR_LAMPUNG, {
    errorMap: () => ({ message: "Pilih kecamatan yang sah di wilayah Kota Bandar Lampung" }),
  }),
  namaPelapor: z.string().max(100, "Nama pelapor maksimal 100 karakter").optional(),
  kontakPelapor: z.string().max(50, "Kontak pelapor maksimal 50 karakter").optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .max(150, "Email maksimal 150 karakter")
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Kata sandi wajib diisi" })
    .min(6, "Kata sandi minimal 6 karakter")
    .max(128, "Kata sandi maksimal 128 karakter"),
});

export const registerSchema = z.object({
  nama: z
    .string({ required_error: "Nama lengkap wajib diisi" })
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string({ required_error: "Email wajib diisi" })
    .max(150, "Email maksimal 150 karakter")
    .email("Format email tidak valid"),
  noTelepon: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(20, "Nomor telepon maksimal 20 digit")
    .optional()
    .or(z.literal("")),
  password: z
    .string({ required_error: "Kata sandi wajib diisi" })
    .min(6, "Kata sandi minimal 6 karakter")
    .max(128, "Kata sandi maksimal 128 karakter"),
  konfirmasiPassword: z
    .string({ required_error: "Konfirmasi kata sandi wajib diisi" })
    .max(128, "Konfirmasi kata sandi maksimal 128 karakter"),
}).refine((data) => data.password === data.konfirmasiPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["konfirmasiPassword"],
});

export const statusUpdateSchema = z.object({
  ke: z.enum(STATUS_LIST, {
    errorMap: () => ({ message: "Status tujuan tidak valid" }),
  }),
  catatan: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  unit: z.string().max(120, "Nama unit maksimal 120 karakter").optional(), // Jika menugaskan kru
  prioritas: z.enum(PRIORITAS_LIST).optional(),
  completionProof: z
    .object({
      fotoUrl: z
        .string()
        .min(1, "Foto bukti perbaikan wajib diunggah")
        .refine(
          (val) =>
            (val.startsWith("/uploads/") && !val.includes("..")) ||
            /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(val),
          "Path foto bukti perbaikan harus berasal dari direktori unggahan resmi (/uploads/)"
        ),
      catatan: z
        .string()
        .min(5, "Catatan material/pekerjaan wajib diisi")
        .max(500, "Catatan material/pekerjaan maksimal 500 karakter"),
    })
    .optional(),
});

