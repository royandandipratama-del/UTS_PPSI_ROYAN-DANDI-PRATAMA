---
name: laporwarga-design
description: Sistem desain (design system) LaporWarga — portal aspirasi & pengaduan infrastruktur warga Bandar Lampung dengan gaya civic-tech modern (Tailwind CSS, Plus Jakarta Sans, Material Symbols, palet biru-hijau Material 3). Gunakan skill ini SETIAP KALI pengguna meminta membuat, melanjutkan, atau menyelaraskan halaman/UI untuk LaporWarga atau CivicConnect, termasuk halaman publik warga (beranda, formulir laporan, feed laporan), dasbor admin/dispatcher/pengelola (KPI, peta titik panas PostGIS, antrean tiket, verifikasi bukti), serta halaman baru bertema pengaduan publik, layanan pemerintah daerah, pelacakan tiket, atau peta GIS — walaupun pengguna tidak menyebut kata "skill" atau "design system". Pakai juga saat diminta "buat tampilan yang konsisten dengan LaporWarga".
---

# Skill Desain LaporWarga

Panduan desain untuk membuat UI yang **konsisten** dengan dua halaman acuan LaporWarga:

1. **Portal Warga** (publik) — beranda, formulir pengaduan 3 langkah, pemilih lokasi peta, feed laporan.
2. **Dasbor Pengelola** (admin/dispatcher) — sidebar tetap, KPI, peta titik panas PostGIS, antrean tiket, modal verifikasi sebelum/sesudah.

Karakter visual: **resmi, bersih, tepercaya, ramah** — nuansa instansi pemerintah daerah yang modern. Banyak ruang putih, kartu berbatas tipis, biru sebagai aksi utama, hijau untuk "selesai", kuning/amber untuk "diproses", merah untuk "menunggu/darurat".

---

## 1. Aturan Dasar

- **Bahasa UI: Bahasa Indonesia** (`<html lang="id">`). Semua label, placeholder, status, dan tombol dalam Bahasa Indonesia. Istilah teknis (PostGIS, GeoJSON, CSV, GPS, EPSG) boleh tetap.
- **Stack**: HTML + Tailwind CSS (CDN) + Plus Jakarta Sans + Material Symbols Outlined. Tanpa framework tambahan kecuali diminta.
- **Satu file HTML mandiri** per halaman, dengan `tailwind.config` inline.
- **Responsif mobile-first**: gunakan `px-margin-mobile md:px-margin`, grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Jangan hardcode warna hex** di class; gunakan token warna (mis. `bg-primary-container`, `text-on-surface-variant`). Pengecualian: status semantik memakai palet Tailwind bawaan (`red-100/700`, `amber-100/800`, `emerald-100/800`) dan panel peta gelap (`slate-900/950`).
- **Wajib ada footer standar** (lihat bagian 7) di setiap halaman.

---

## 2. Boilerplate `<head>`

Salin persis, jangan ubah token:

```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>LaporWarga - [Judul Halaman]</title>

<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: { extend: {
    colors: {
      "primary": "#004ac6", "primary-container": "#2563eb",
      "primary-fixed": "#dbe1ff", "primary-fixed-dim": "#b4c5ff",
      "on-primary": "#ffffff", "on-primary-container": "#eeefff",
      "on-primary-fixed": "#00174b", "on-primary-fixed-variant": "#003ea8",
      "inverse-primary": "#b4c5ff", "surface-tint": "#0053db",

      "secondary": "#575e70", "secondary-container": "#d9dff5",
      "secondary-fixed": "#dce2f7", "secondary-fixed-dim": "#c0c6db",
      "on-secondary": "#ffffff", "on-secondary-container": "#5c6274",
      "on-secondary-fixed": "#141b2b", "on-secondary-fixed-variant": "#404758",

      "tertiary": "#006243", "tertiary-container": "#007d57",
      "tertiary-fixed": "#85f8c4", "tertiary-fixed-dim": "#68dba9",
      "on-tertiary": "#ffffff", "on-tertiary-container": "#bdffdc",
      "on-tertiary-fixed": "#002114", "on-tertiary-fixed-variant": "#005137",

      "error": "#ba1a1a", "error-container": "#ffdad6",
      "on-error": "#ffffff", "on-error-container": "#93000a",

      "background": "#f8f9fa", "on-background": "#191c1d",
      "surface": "#f8f9fa", "surface-bright": "#f8f9fa", "surface-dim": "#d9dadb",
      "surface-container-lowest": "#ffffff", "surface-container-low": "#f3f4f5",
      "surface-container": "#edeeef", "surface-container-high": "#e7e8e9",
      "surface-container-highest": "#e1e3e4", "surface-variant": "#e1e3e4",
      "on-surface": "#191c1d", "on-surface-variant": "#434655",
      "outline": "#737686", "outline-variant": "#c3c6d7",
      "inverse-surface": "#2e3132", "inverse-on-surface": "#f0f1f2"
    },
    borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    spacing: {
      "margin": "2rem", "margin-mobile": "1rem",
      "gutter": "1.5rem", "gutter-mobile": "1rem",
      "space-xs": "0.25rem", "space-sm": "0.5rem", "space-md": "1rem",
      "space-lg": "1.5rem", "space-xl": "2.5rem"
    },
    fontFamily: {
      "display-lg": ["Plus Jakarta Sans"], "display-lg-mobile": ["Plus Jakarta Sans"],
      "headline-lg": ["Plus Jakarta Sans"], "headline-lg-mobile": ["Plus Jakarta Sans"],
      "headline-md": ["Plus Jakarta Sans"], "body-lg": ["Plus Jakarta Sans"],
      "body-md": ["Plus Jakarta Sans"], "body-sm": ["Plus Jakarta Sans"],
      "label-md": ["Plus Jakarta Sans"], "label-sm": ["Plus Jakarta Sans"]
    },
    fontSize: {
      "display-lg":          ["3rem",     {lineHeight:"3.5rem",  letterSpacing:"-0.02em",  fontWeight:"700"}],
      "display-lg-mobile":   ["2.25rem",  {lineHeight:"2.75rem", letterSpacing:"-0.02em",  fontWeight:"700"}],
      "headline-lg":         ["2rem",     {lineHeight:"2.5rem",  letterSpacing:"-0.015em", fontWeight:"600"}],
      "headline-lg-mobile":  ["1.5rem",   {lineHeight:"2rem",    letterSpacing:"-0.01em",  fontWeight:"600"}],
      "headline-md":         ["1.25rem",  {lineHeight:"1.75rem", letterSpacing:"-0.01em",  fontWeight:"600"}],
      "body-lg":             ["1.125rem", {lineHeight:"1.75rem", fontWeight:"400"}],
      "body-md":             ["1rem",     {lineHeight:"1.5rem",  fontWeight:"400"}],
      "body-sm":             ["0.875rem", {lineHeight:"1.25rem", fontWeight:"400"}],
      "label-md":            ["0.875rem", {lineHeight:"1.25rem", letterSpacing:"0.01em",  fontWeight:"600"}],
      "label-sm":            ["0.75rem",  {lineHeight:"1rem",    letterSpacing:"0.02em",  fontWeight:"600"}]
    }
  }}
}
</script>

<style>
.material-symbols-outlined{
  font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
  display:inline-block; vertical-align:middle; line-height:1;
}
/* Ikon terisi: style="font-variation-settings:'FILL' 1;" atau data-weight="fill" */
.material-symbols-outlined[data-weight="fill"]{font-variation-settings:'FILL' 1;}
</style>
</head>
```

---

## 3. Token Desain

### 3.1 Warna — peran & penggunaan

| Peran | Token | Dipakai untuk |
|---|---|---|
| Aksi utama | `bg-primary-container` (hover `bg-primary`), teks `text-on-primary` | Tombol CTA, kategori terpilih, step aktif, logo |
| Teks/link aksen | `text-primary` | Link aktif nav, ID tiket, angka tahap aktif |
| Latar highlight biru | `bg-primary-fixed` + `text-on-primary-fixed` | Badge terverifikasi, step aktif, avatar, ikon upload |
| Sekunder | `bg-secondary-container`, `bg-secondary-fixed`, `text-secondary` | Pill info, tombol GPS, label kategori kecil |
| Sukses/selesai | `text-tertiary`, `bg-tertiary`, `bg-tertiary-fixed` | Progress selesai, ikon centang, sinkronisasi aktif |
| Error/darurat | `text-error`, `bg-error-container` + `text-on-error-container` | Status menunggu/darurat, pin marker, tombol hapus hover |
| Permukaan halaman | `bg-surface` | Latar body |
| Kartu | `bg-surface-container-lowest` (putih) | Kartu, form, tabel, KPI |
| Band bagian | `bg-surface-container-low` | Latar section selang-seling (mis. feed) |
| Input/progress kosong | `bg-surface-container`, `bg-surface-container-high` | Track progress, chip non-aktif |
| Teks utama / sekunder | `text-on-surface` / `text-on-surface-variant` | Judul & isi / deskripsi |
| Teks senyap | `text-outline` | Waktu relatif, tahap belum tercapai |
| Garis | `border-outline-variant` (portal), `border-surface-container-highest` (dasbor) | Border kartu, pemisah |

### 3.2 Status laporan (WAJIB konsisten)

| Status | Kelas badge | Titik |
|---|---|---|
| Menunggu / Menunggu Validasi | `bg-red-100 text-red-700 border border-red-200` (portal) atau `bg-error-container text-on-error-container border border-error/30` (dasbor) | `bg-red-600` |
| Dalam Penanganan / Diproses / Sedang Dikerjakan | `bg-amber-100 text-amber-800 border border-amber-300` | `bg-amber-500` + `animate-pulse` |
| Selesai | `bg-emerald-100 text-emerald-800 border border-emerald-300` | ikon `done` terisi |
| Menunggu Pengesahan Penyelia | `bg-primary-fixed text-on-primary-fixed` | — |

Bentuk badge: `inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm`.

### 3.3 Tipografi (Plus Jakarta Sans)

Gunakan **pasangan class** `text-{ukuran} font-{ukuran}` agar bobot ikut:

| Peran | Class |
|---|---|
| Hero | `text-headline-lg-mobile md:text-display-lg font-headline-lg-mobile md:font-display-lg tracking-tight text-balance` |
| Judul section | `text-headline-lg font-headline-lg` |
| Judul kartu / sub-section | `text-headline-md font-headline-md` |
| Paragraf hero | `text-body-md md:text-body-lg` |
| Isi / deskripsi | `text-body-sm font-body-sm text-on-surface-variant` |
| Label tombol & form | `text-label-md font-label-md` (tambah `font-semibold` untuk label form) |
| Eyebrow / meta | `text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold` |
| Koordinat / kode | `font-mono text-label-sm text-secondary` |

### 3.4 Spasi, radius, bayangan

- **Container**: `max-w-7xl mx-auto px-margin-mobile md:px-margin`; form `max-w-4xl mx-auto`.
- **Padding section**: `py-12` (hero `py-12 md:py-20`). Padding kartu: `p-space-lg` (feed) / `p-5` (dasbor) / `p-6 md:p-8` (form).
- **Radius**: kartu & panel `rounded-xl`; tombol & input `rounded-lg`/`rounded-md`; chip & badge `rounded-full`; thumbnail `rounded-lg`.
- **Bayangan**: kartu `shadow-sm hover:shadow-md transition-shadow`; form utama `shadow-md`; modal `shadow-lg`; peta `shadow-inner`.
- **Gap**: `gap-2`/`gap-3` antar kontrol, `gap-4` grid kecil, `gap-6` grid kartu.

---

## 4. Pola Komponen — Portal Warga (publik)

### 4.1 Top Navbar
Sticky, putih, border bawah, tinggi `h-16`, logo kiri, nav tengah, aksi kanan.

```html
<header class="bg-surface-container-lowest top-0 sticky z-50 shadow-sm border-b border-outline-variant">
  <div class="flex justify-between items-center w-full px-margin-mobile md:px-margin max-w-7xl mx-auto h-16">
    <a class="flex items-center gap-space-sm" href="#home">
      <div class="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
        <span class="material-symbols-outlined text-xl" style="font-variation-settings:'FILL' 1;">account_balance</span>
      </div>
      <span class="text-headline-md font-headline-md text-primary tracking-tight font-bold">LaporWarga</span>
    </a>
    <nav class="hidden md:flex items-center gap-6">
      <!-- AKTIF -->
      <a class="text-primary font-headline-md border-b-2 border-primary py-2" href="#home">Beranda</a>
      <!-- NON-AKTIF -->
      <a class="text-on-surface-variant font-label-md py-2 hover:text-primary transition-colors duration-150" href="#">Laporkan</a>
    </nav>
    <!-- Aksi: tombol CTA (hidden sm:inline-flex), "Masuk", avatar bulat bg-primary-fixed, hamburger md:hidden -->
  </div>
</header>
```

Item nav: **Beranda, Laporkan, Peta Pantau, Statistik**. Ikon logo selalu `account_balance`.

### 4.2 Hero
- Latar: `bg-gradient-to-b from-surface-container-low via-surface to-surface`, `border-b border-outline-variant`.
- Pola titik halus: `absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#004ac6_1px,transparent_1px)] [background-size:16px_16px]`.
- Isi terpusat `max-w-3xl mx-auto text-center`: pill live (`bg-secondary-container`, titik `bg-tertiary animate-pulse`) → H1 → paragraf → 2 tombol → 3 kartu metrik.
- **Tombol primer**: `bg-primary-container hover:bg-primary text-on-primary rounded-lg px-6 py-3 font-label-md shadow-sm flex items-center gap-2 transition duration-150 ease-in-out active:scale-95`.
- **Tombol sekunder**: `bg-surface-container-lowest hover:bg-surface-container border border-outline-variant text-on-surface rounded-lg px-6 py-3 shadow-sm`.
- Semua tombol utama: ikon Material di kiri + teks, `active:scale-95`.

### 4.3 Kartu Metrik Cepat
`grid grid-cols-1 sm:grid-cols-3 gap-4` di bawah garis `border-t`. Tiap kartu: `bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-center gap-3 shadow-sm`, ikon dalam kotak `p-2 rounded-lg` berwarna (`bg-tertiary-fixed`, `bg-primary-fixed`, `bg-secondary-fixed`) + angka `text-headline-md` + label `text-label-sm text-on-surface-variant`.

### 4.4 Formulir Pengaduan (3 langkah)
- Wadah: `bg-surface-container-lowest shadow-md rounded-xl p-6 md:p-8 border border-outline-variant max-w-4xl mx-auto`.
- Header: judul + deskripsi kiri, badge "Saluran Resmi Terverifikasi" kanan (`bg-primary-fixed`, ikon `verified_user`), dipisah `border-b pb-6 mb-8`.
- **Indikator langkah** `grid md:grid-cols-3 gap-3`:
  - Aktif: `bg-primary-fixed text-on-primary-fixed border border-primary-container`, lingkaran angka `bg-primary-container text-on-primary`.
  - Non-aktif: `bg-surface-container text-on-surface-variant border border-outline-variant`, lingkaran `bg-surface-container-highest`.
  - Langkah: **1. Rincian Masalah & Foto → 2. Titik Lokasi Peta → 3. Kontak & Konfirmasi**.
- **Chip kategori** (`flex flex-wrap gap-2`, bentuk `rounded-full px-4 py-2 text-label-sm` + ikon `text-base`):
  - Terpilih: `bg-primary-container text-on-primary shadow-sm`
  - Belum: `bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors`
  - Kategori & ikon: Jalan & Aspal Berlubang `construction`, Penerangan Jalan Umum `lightbulb`, Drainase & Banjir `water_damage`, Pengelolaan Sampah `delete`, Fasilitas Taman Publik `park`.
- **Zona unggah**: `border-2 border-dashed border-outline hover:border-primary rounded-xl p-6 text-center bg-surface cursor-pointer transition-colors group`; ikon `cloud_upload` dalam lingkaran `w-12 h-12 bg-primary-fixed text-primary` (`group-hover:scale-105`); teks "…atau **pilih berkas**" (`text-primary underline font-semibold`); keterangan format; `<input type="file" class="hidden">`. Pratinjau: thumbnail `w-16 h-16 rounded-lg` + tombol `close` di sudut kanan atas (`bg-on-background/70 hover:bg-error`) + nama berkas & ukuran.
- **Textarea**: `w-full rounded-md border border-outline-variant bg-surface-container-lowest p-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`, dengan penghitung karakter `text-label-sm` di kanan label.

### 4.5 Pemilih Titik Peta
Wadah `relative w-full h-80 rounded-xl overflow-hidden border border-outline-variant bg-surface-container shadow-inner`. Lapisan:
1. Kisi: `bg-[linear-gradient(to_right,#c3c6d7_1px,transparent_1px),linear-gradient(to_bottom,#c3c6d7_1px,transparent_1px)] bg-[size:40px_40px] opacity-40`.
2. Jalan simulasi: bilah `bg-surface-container-lowest border-y border-outline-variant` diputar sedikit.
3. Overlay pencarian kiri-atas (`sm:w-96`, `bg-surface-container-lowest rounded-lg shadow-md border`, ikon `search`).
4. Zoom kanan-bawah (`add`/`remove`, kolom bersekat).
5. Pin tengah: `location_on` `text-4xl text-error drop-shadow-md animate-bounce` + bayangan elips `bg-on-background/40 blur-[1px]`.
6. Pil koordinat kiri-bawah: `bg-surface-container-lowest/95 backdrop-blur-sm ... ` ikon `pin_drop`, teks `Lat: …, Long: … - Kecamatan, Bandar Lampung`.
- Tombol "Gunakan Lokasi GPS Saya" (`bg-secondary-fixed text-on-secondary-fixed`, ikon `my_location`) di sebelah judul.

### 4.6 Baris Submit
`pt-4 border-t flex flex-col sm:flex-row justify-between gap-4`: teks catatan verifikasi geospasial + tombol `bg-primary-container ... px-8 py-3.5 rounded-lg shadow-md` ikon `send` "Kirim Laporan Sekarang".

### 4.7 Feed & Kartu Laporan
- Section: `py-12 bg-surface-container-low border-t border-outline-variant`.
- Header: eyebrow (`Pusat Pantauan Laporan Kota`) + H2 kiri; kontrol kanan: **toggle tampilan** (`rounded-lg border bg-surface-container-lowest p-1`; tab aktif `bg-primary-container text-on-primary`), dua `<select>` filter (Status, Kategori), tombol "Dukungan Terbanyak" (ikon `trending_up`).
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
- **Kartu** `bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`:
  1. Baris atas: kategori (`text-label-sm text-secondary uppercase font-semibold`) + badge status.
  2. Judul `text-headline-md line-clamp-1`.
  3. Foto `h-44 rounded-lg object-cover border` dengan label lokasi melayang kiri-bawah (`bg-on-background/80 backdrop-blur-sm text-surface-container-lowest rounded px-2.5 py-1`, ikon `location_on`).
  4. Deskripsi `line-clamp-2`.
  5. **Progress 3 tahap**: baris label (Diterima / Penugasan Kru / Selesai) + track `h-2 rounded-full bg-surface-container flex`; segmen: Diterima `bg-primary-container` (belum ditangani) atau `bg-tertiary` (sudah lewat), Berjalan `bg-amber-500`, Selesai `bg-tertiary`, kosong `bg-surface-container-high`. Tiap segmen `w-1/3` (atau `w-full` bila selesai).
  6. Footer `pt-3 border-t`: tombol dukungan (`keyboard_arrow_up` + "N Dukungan", `rounded-lg bg-surface-container hover:bg-primary-fixed`; sudah didukung: `bg-primary-fixed/40 text-primary border border-primary-fixed`) + waktu relatif `text-label-sm text-outline` (atau "Selesai Ditangani Hari Ini" `text-tertiary` dengan ikon `task_alt`).

---

## 5. Pola Komponen — Dasbor Pengelola

### 5.1 Layout
`<body class="… flex flex-row min-h-screen">` → `<aside class="h-screen w-64 fixed left-0 top-0 …">` + `<main class="ml-64 flex-1 bg-surface p-6 min-h-screen flex flex-col justify-between overflow-x-hidden">`. Dasbor dirancang untuk desktop; bila perlu mobile, sembunyikan sidebar di bawah `md` dan ganti `ml-64` dengan `md:ml-64`.

### 5.2 Sidebar
`bg-surface border-r border-outline-variant p-space-md gap-space-md flex flex-col justify-between z-40`.
- Brand: kotak ikon `w-10 h-10 rounded-lg bg-primary-container` + "LaporWarga Pengelola" + subjudul "Operasional Tata Kota", `border-b pb-space-sm`.
- Tombol aksi cepat penuh lebar: `bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg` ikon `alt_route` "Tugaskan Unit Lapangan".
- Menu: **Dasbor Pantau** (`dashboard`), **Manajemen Tiket** (`confirmation_number`), **Analisis Geospasial** (`map`), **Pengaturan Sistem** (`settings`).
  - Aktif: `bg-secondary-container text-on-secondary-container` + ikon `data-weight="fill"`.
  - Non-aktif: `text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`.
  - Item: `flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-md`.
- Bawah: "Pusat Bantuan & Darurat" (ikon `emergency` `text-error`), "Keluar Akun" (`logout`, hover `text-error`), kartu profil petugas (`bg-surface-container-low rounded-lg`, avatar inisial `bg-primary-fixed`).

### 5.3 Header Halaman
Breadcrumb `Operasional › Konsol Petugas Lapangan` (`text-label-sm text-secondary`, terakhir `text-primary`), H1 `text-headline-lg`. Kontrol kanan, semua `h-11`: pencarian (ikon `search` absolut kiri, `pl-10`), select prioritas (Kritis P1 / Mendesak P2 / Rutin P3), **pil sinkronisasi PostGIS** (`bg-tertiary-container/10 border border-tertiary-container/30 rounded-full text-tertiary` + titik `animate-ping`), tombol lonceng dengan titik merah `bg-error ring-2 ring-surface-container-lowest`.

### 5.4 Kartu KPI
`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md my-6`. Kartu `bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-highest shadow-sm flex items-center justify-between`: label `text-label-sm uppercase tracking-wider text-secondary`, angka `text-headline-lg`, badge kecil opsional, baris tren `text-label-sm` dengan ikon 16px; kanan kotak ikon `w-12 h-12 rounded-xl` dengan warna tematik:

| KPI | Ikon | Warna |
|---|---|---|
| Total Tiket Terbuka | `inbox` | `bg-primary-fixed/50 text-primary` |
| Menunggu Verifikasi | `warning` | `bg-error-container/60 text-error` |
| Petugas di Lapangan | `engineering` | `bg-amber-100 text-amber-700` |
| Terselesaikan Hari Ini | `task_alt` | `bg-emerald-100 text-emerald-700` |

### 5.5 Peta Titik Panas (PostGIS)
- Panel putih `rounded-xl border p-5`, header: kotak ikon `explore`, judul "Analisis Titik Panas Spasial PostGIS", deskripsi, **tab segmen** (`rounded-md border bg-surface-container-low p-0.5`, aktif `bg-surface-container-lowest text-primary font-semibold`), select rentang waktu, tombol "Sinkronkan Data" (`refresh`).
- Kanvas **gelap**: `relative w-full h-[380px] rounded-xl overflow-hidden bg-slate-950 p-4 flex flex-col justify-between`.
  - Kisi titik: `bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40`.
  - Blob panas (`absolute rounded-full blur-*`): merah `bg-red-600/35 blur-3xl animate-pulse` (tinggi) + inti `bg-amber-500/40 blur-xl`; oranye `bg-orange-600/30 blur-2xl`; kuning `bg-amber-500/25 blur-2xl`.
  - SVG jalan/poligon `opacity-30 stroke-slate-600`; poligon wilayah `stroke-primary/40 fill-primary/5`.
  - **Pin**: kritis `w-8 h-8 bg-red-600 border-2 border-white ring-2 ring-red-400` + `animate-ping`; sedang `bg-amber-500`/`bg-amber-600`; tooltip `hidden group-hover:flex bg-slate-900 border-slate-700 text-white rounded shadow-xl w-52`. Unit kru: pil `bg-primary text-white rounded-full border border-white` dengan ikon `local_shipping`.
  - HUD atas: info `EPSG:4326 PostGIS Bounding Box: [...]` + tombol zoom/layer `bg-slate-900/80 border-slate-700`.
  - **Legenda** melayang: `bg-slate-900/90 backdrop-blur-md border-slate-700 rounded-lg p-3`; Tinggi (>20) merah, Sedang (10–20) amber, Rendah (<10) emerald, Kru Patroli biru.

### 5.6 Tabel Antrean Tiket
- Header panel: judul + deskripsi kiri; tombol "Unduh CSV" (`file_download`) & "Format GeoJSON" (`data_object`) kanan, `h-9 rounded-md border bg-surface-container-lowest`.
- Tabel `w-full text-left border-collapse` dalam `overflow-x-auto`; `thead` `bg-surface-container-low/50 text-label-sm uppercase tracking-wider text-secondary`; `tbody` `divide-y divide-surface-container-highest`; baris `hover:bg-surface-container-low/40`; sel `py-3.5 px-4`.
- Kolom: **ID TIKET** (`text-primary text-label-md`, format `#TKT-0000`) · **FOTO** (`w-12 h-12 rounded-lg`, overlay `zoom_in` saat hover) · **KATEGORI** (ikon berwarna + nama) · **LOKASI & KOORDINAT** (jalan `font-medium` + `font-mono` "lat, lng (Kecamatan)") · **STATUS** (badge) · **TINDAKAN** (rata kanan).
- Tombol tindakan per status: Menunggu → **Setujui** (solid primary); Diproses → **Kirim Kru Petugas** (outline primary); Sedang Dikerjakan → **Verifikasi Bukti** (`bg-tertiary-container` + ikon `verified`); Selesai → **Arsipkan** (netral).
- Baris yang sedang disorot: `bg-primary-fixed/20 border-l-4 border-l-primary`.

### 5.7 Panel Verifikasi Hasil Pekerjaan
Kartu `rounded-xl shadow-lg border-2 border-primary/20 overflow-hidden`:
- Header `bg-surface-container-low px-6 py-4`: ikon centang bulat hijau, judul "Penyelesaian Tiket #… : Verifikasi Hasil Pekerjaan", badge "Menunggu Pengesahan Penyelia".
- Isi `p-6`: **dua foto berdampingan** (`grid md:grid-cols-2 gap-6`, tinggi `h-56`): *Sebelum* (ikon `report` merah, label koordinat melayang `bg-black/70`) dan *Sesudah* (border `border-2 border-dashed border-tertiary/40`, ikon `verified_user` hijau, nama berkas bukti).
- Metadata 3 kolom: Unit Pelaksana (readonly, ikon `lock`, `cursor-not-allowed bg-surface-container-low`), Waktu Selesai (readonly mono), Catatan Lapangan (input aktif).
- Aksi kanan: **Batal** (outline) + **Konfirmasi Penyelesaian & Beri Tahu Warga** (`bg-emerald-600 hover:bg-emerald-700 text-white`, ikon `send`).

---

## 6. Interaksi & Aksesibilitas

- Transisi standar: `transition duration-150 ease-in-out`; tombol klik `active:scale-95`; kartu `hover:shadow-md`.
- Fokus input: `focus:border-primary focus:ring-2 focus:ring-primary/20` (dasbor: `focus:border-primary-container focus:ring-2 focus:ring-primary-container/20`).
- Tombol hanya ikon wajib `aria-label` (mis. "Buka menu", "Perbesar peta").
- Tombol non-submit memakai `type="button"`; form prototipe memakai `onsubmit="event.preventDefault();"`.
- Gambar wajib `alt`/`data-alt` deskriptif Bahasa Indonesia; gunakan `object-cover` dan wadah ber-radius.
- Kontras: jangan taruh teks `text-outline` untuk informasi penting; gunakan `text-on-surface-variant`.
- Pulse/ping hanya untuk indikator "live" (sinkronisasi, status diproses, pin kritis) — jangan berlebihan.

---

## 7. Footer Standar (WAJIB di semua halaman)

Latar gelap `bg-gray-900 text-gray-300 py-8 px-4`, grid 3 kolom `grid-cols-1 md:grid-cols-3 gap-8`:

- **Tautan Cepat**: Tentang Kami · Syarat & Ketentuan · Kebijakan Privasi (`text-sm text-gray-400 hover:text-white transition-colors duration-150`).
- **Bantuan & Darurat**: Pusat Layanan Warga `+62 721 701-999` · Hotline Darurat `112 / 119 Call Center Kota` (di dasbor: tautan dengan ikon `support_agent` dan `call` merah).
- **Kemitraan**: dua placeholder logo — "Logo Pemda" dan "Logo Universitas Teknokrat Indonesia" (portal: `bg-gray-200 text-gray-800 rounded-md p-3 text-xs font-semibold`; dasbor: `bg-gray-800 border border-gray-700 text-gray-200 h-12 px-4`).
- Bilah bawah: `border-t border-gray-700 mt-8 pt-4 text-center text-xs md:text-sm text-gray-400` dengan teks **persis**:

```
Copyright©2026 by Royan Dandi Pratama dan Dr. Erliyan Redy Susanto, M.Kom.
```

Di dasbor, footer berada di dalam `<main>` dengan `mt-12 rounded-xl`.

---

## 8. Konten & Data Contoh

Gunakan konteks lokal **Bandar Lampung** agar realistis:

- Kecamatan: Kedaton, Rajabasa, Tanjung Karang, Teluk Betung, Labuhan Ratu, Way Halim.
- Jalan: Jl. Zainal Abidin Pagar Alam, Jl. Teuku Umar, Jl. Raden Intan, Jl. Diponegoro.
- Koordinat sekitar lat `-5.37 … -5.42`, lng `105.24 … 105.29`.
- Dinas pelaksana: Dinas PUPR Bandar Lampung (Tim Reaksi Cepat 04).
- Format ID tiket `#TKT-8942`; waktu relatif "2 jam yang lalu", "45 menit yang lalu"; WIB untuk jam absolut.
- Kategori standar: Jalan & Aspal, Penerangan Jalan, Drainase & Saluran/Banjir, Pengelolaan Sampah, Fasilitas Taman, Pohon Tumbang.

---

## 9. Alur Kerja Saat Memakai Skill Ini

1. Tentukan jenis halaman: **portal warga** (bagian 4) atau **dasbor pengelola** (bagian 5).
2. Mulai dari boilerplate `<head>` (bagian 2) — jangan ganti font, palet, atau skala tipografi.
3. Susun halaman dari pola komponen yang ada; bila butuh komponen baru, turunkan dari token & pola serupa (kartu putih + border tipis + `rounded-xl`, ikon Material, status berwarna semantik).
4. Pakai konten Bahasa Indonesia dan data lokal (bagian 8).
5. Tutup dengan footer standar (bagian 7).
6. Periksa daftar berikut sebelum menyerahkan hasil.

### Checklist Akhir

- [ ] `lang="id"`, semua teks UI berbahasa Indonesia
- [ ] Config Tailwind & token identik dengan bagian 2
- [ ] Plus Jakarta Sans + Material Symbols dimuat
- [ ] Tombol utama `bg-primary-container hover:bg-primary` + ikon + `active:scale-95`
- [ ] Status memakai skema warna merah / amber / hijau yang konsisten
- [ ] Kartu: putih, `border-outline-variant`, `rounded-xl`, `shadow-sm`
- [ ] Peta portal terang; peta dasbor gelap (`slate-950`) dengan blob panas
- [ ] Responsif (mobile-first) dan `aria-label` pada tombol ikon
- [ ] Footer standar + teks hak cipta persis

### Hindari

- Warna di luar token (ungu, oranye pekat sebagai aksi utama, dsb.).
- Font selain Plus Jakarta Sans; ikon selain Material Symbols Outlined.
- Sudut tajam (`rounded-none`) atau bayangan tebal/gelap pada kartu.
- Gradien mencolok, animasi berlebihan, atau emoji sebagai ikon UI.
- Teks UI berbahasa Inggris pada halaman publik.
