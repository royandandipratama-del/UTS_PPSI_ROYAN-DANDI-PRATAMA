# LaporWarga - Portal Pengaduan & Aspirasi Infrastruktur Kota Bandar Lampung

Portal pengaduan infrastruktur perkotaan (*civic crowdsourcing*) yang menghubungkan warga Kota Bandar Lampung secara langsung dan transparan dengan instansi teknis Pemerintah Kota (PUPR, Dinas Lingkungan Hidup, BPBD, dll.). Warga dapat melaporkan masalah (jalan berlubang, lampu jalan padam, saluran mampet, sampah liar, pohon tumbang, taman rusak) dengan foto bukti dan titik koordinat geospasial presisi. Petugas dinas memvalidasi, menugaskan kru lapangan, dan menutup tiket dengan melampirkan foto bukti perbaikan (*Before vs After*).

---

## 🚀 Fitur Utama

### A. Portal Warga (Publik)
1. **Beranda Interaktif:** Hero inspiratif, metrik langsung dari basis data (jumlah selesai, rata-rata waktu penanganan, total laporan), dan alur transparansi 3 tahap.
2. **Formulir Pengaduan 3 Langkah:**
   - **Langkah 1:** Pemilihan kategori infrastruktur (chips), unggah foto bukti (drag & drop, maks 10 MB), pembacaan otomatis metadata EXIF GPS via library `exifr`, serta deskripsi masalah dengan penghitung karakter (maks 500 karakter).
   - **Langkah 2:** Pemilih titik peta Leaflet + OpenStreetMap (klik/geser pin, pencarian alamat via Nominatim OSM, tombol *"Gunakan Lokasi GPS Saya"*, serta deteksi otomatis nama jalan dan kecamatan).
   - **Langkah 3:** Input kontak pelapor (opsional), ringkasan pratinjau aduan, dan pembuatan nomor tiket unik format `#TKT-XXXX` lengkap dengan halaman sukses.
3. **Feed Laporan & Sistem Dukungan (*Upvote*):** Grid kartu responsif, filter kategori dan status, pengurutan *"Terbaru"* atau *"Dukungan Terbanyak"*. Aturan: 1 akun warga hanya dapat memberikan 1 dukungan per laporan (wajib login).
4. **Detail Laporan & Pelacakan Progres Tiket:** Pelacakan kode tiket, bilah progres 3 tahap (*Diterima &rarr; Penugasan Kru &rarr; Selesai*), dokumentasi komparasi foto awal warga (*Sebelum*) vs foto bukti kru dinas (*Sesudah*), riwayat status kronologis, dan informasi unit teknis pelaksana.
5. **Peta Pantau Publik:** Peta geospasial gaya terang yang memetakan seluruh laporan warga di Kota Bandar Lampung dengan pin berwarna sesuai status (*Menunggu*, *Dalam Penanganan*, *Selesai*).
6. **Statistik & Kinerja Kota:** Visualisasi analitik aduan per kategori, per status penanganan, dan kecamatan dengan aktivitas tertinggi.
7. **Pusat Notifikasi Warga:** Pemberitahuan otomatis ketika laporan warga disetujui, ditugaskan ke kru, atau selesai dikerjakan.

### B. Dasbor Pengelola / Petugas (Admin & Command Center)
1. **Sidebar Tetap:** Navigasi Dasbor Pantau, Manajemen Tiket, Analisis Geospasial, Pengaturan Sistem, Pusat Bantuan, dan profil petugas (menjadi *drawer* responsif di perangkat seluler).
2. **4 Kartu Indikator Kinerja Utama (KPI):**
   - Total Tiket Terbuka
   - Menunggu Verifikasi
   - Petugas di Lapangan
   - Terselesaikan Hari Ini (dihitung dari data nyata database)
3. **Peta Titik Panas (*Spatial Heatmap*) Dasbor Gelap (`slate-950`):**
   - Agregasi spasial laporan per grid ~500 meter dihitung di server.
   - Blob lingkaran berwarna menurut kepadatan: **&gt;20 Merah** (kepadatan tinggi), **10–20 Amber** (kepadatan sedang), **&lt;10 Hijau** (kepadatan rendah).
   - Filter rentang waktu: 24 Jam Terakhir / 7 Hari Terakhir.
   - Pin berdenyut (*pulse animation*) untuk tiket kritis (**P1 Kritis**).
4. **Tabel Antrean Tiket:**
   - Kolom: `ID TIKET` (`#TKT-XXXX`), `FOTO` (thumbnail), `KATEGORI`, `LOKASI & KOORDINAT` (font mono), `PRIORITAS`, `STATUS`, dan `TINDAKAN`.
   - Filter prioritas (*P1 Kritis, P2 Mendesak, P3 Rutin*), pencarian jalan/kecamatan, dan filter status.
   - **Validasi Alur Status di Sisi Server (*Server-Side Validation*):**
     `Menunggu` &rarr; (Setujui) &rarr; `Diproses` &rarr; (Kirim Kru Petugas) &rarr; `Sedang Dikerjakan` &rarr; (Verifikasi Bukti) &rarr; `Selesai` &rarr; (Arsipkan). Transisi ilegal otomatis ditolak dengan kode respons HTTP 422.
5. **Panel Verifikasi Penyelesaian (*Proof of Work*):**
   - Komparasi foto warga (*Before*) vs foto unggahan kru (*After*).
   - Pengisian unit pelaksana dinas, pencatatan material perbaikan, dan waktu selesai otomatis.
   - Tombol *"Konfirmasi Penyelesaian & Beri Tahu Warga"* yang otomatis mengirimkan entri ke tabel notifikasi warga.
6. **Ekspor Data:** Fitur unduh berkas **CSV** (dengan BOM Excel dan header bahasa Indonesia) serta **GeoJSON** standar RFC 7946 untuk integrasi GIS daerah.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling & Design System:** Tailwind CSS + Google Font Plus Jakarta Sans + Material Symbols Outlined
- **Database:** SQLite via Prisma ORM (`prisma/schema.prisma`, file lokal `dev.db`)
- **Peta & Geospasial:** Leaflet + OpenStreetMap + CartoDB Dark (dimuat dinamis tanpa SSR)
- **Autentikasi & Keamanan:** JWT sesi cookie `httpOnly` via `jose` + Hashing kata sandi `bcryptjs`
- **Form & Validasi:** Zod + React Hook Form
- **Metadata EXIF:** Library `exifr` untuk ekstraksi koordinat GPS langsung dari file gambar

---

## 👥 Akun Demo untuk Pengujian

Semua akun menggunakan kata sandi standar yang sama: **`Demo12345!`**

| Role | Alamat Email | Kata Sandi | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Warga** | `warga@laporwarga.id` | `Demo12345!` | Portal Publik, Melapor, Memberi Dukungan, Notifikasi |
| **Petugas** | `petugas@laporwarga.id` | `Demo12345!` | Dasbor, Manajemen Tiket, Disposisi Kru, Verifikasi Bukti |
| **Admin** | `admin@laporwarga.id` | `Demo12345!` | Akses Penuh Dasbor, Heatmap, Ekspor CSV/GeoJSON, Pengaturan |

*(Pada halaman masuk `/masuk`, tersedia tombol klik instan untuk mengisi otomatis akun demo di atas).*

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18.18+ atau versi 20+
- NPM

### 2. Pemasangan Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="rahasia_kunci_jwt_laporwarga_bandar_lampung_2026_super_aman_12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sinkronisasi Skema Basis Data & Seeding Data Nyata
Jalankan perintah berikut untuk membuat file `dev.db` dan mengisi 46 laporan realistis di Bandar Lampung beserta riwayat, kategori, dan akun demo:
```bash
npx prisma db push
npm run seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 6. Membangun untuk Produksi (*Production Build*)
```bash
npm run build
npm run start
```

---

## 📁 Struktur Direktori Proyek

```
ROYAN DANDI PRATAMA/
├── prisma/
│   ├── schema.prisma           # Skema model data & panduan PostGIS
│   └── seed.ts                 # Seeder: 3 akun demo, 6 kategori, 46 laporan nyata
├── public/
│   └── uploads/                # Direktori penyimpanan foto bukti & placeholder SVG
├── src/
│   ├── app/
│   │   ├── api/                # API Endpoints (Auth, Reports, Status, Heatmap, Stats, Export)
│   │   │   ├── auth/           # Login, Register, Logout, Me
│   │   │   ├── categories/     # Kategori infrastruktur
│   │   │   ├── heatmap/        # Agregasi spasial grid 500m
│   │   │   ├── notifications/  # Notifikasi warga
│   │   │   ├── reports/        # CRUD laporan, vote, status transition, export CSV/GeoJSON
│   │   │   ├── stats/          # Metrik kota & KPI dasbor
│   │   │   └── upload/         # Upload foto lokal maks 10 MB
│   │   ├── daftar/             # Halaman registrasi warga
│   │   ├── dashboard/          # Dasbor pengelola (dilindungi middleware)
│   │   │   ├── bantuan/        # Panduan SOP penanganan
│   │   │   ├── pengaturan/     # Konfigurasi sistem
│   │   │   ├── peta/           # Analisis geospasial layar penuh
│   │   │   ├── tiket/          # Tabel antrean & modal verifikasi before/after
│   │   │   ├── layout.tsx      # Sidebar tetap w-64 + footer
│   │   │   └── page.tsx        # KPI 4 kolom & ringkasan aduan kritis
│   │   ├── laporan/            # Feed laporan publik & pelacakan detail by ID
│   │   ├── laporkan/           # Formulir pengaduan 3 langkah (Foto+EXIF, Peta, Kontak)
│   │   ├── masuk/              # Halaman login dengan tombol isi cepat demo
│   │   ├── notifikasi/         # Halaman riwayat notifikasi warga
│   │   ├── peta/               # Peta pantau publik gaya terang
│   │   ├── statistik/          # Halaman statistik & keterbukaan informasi
│   │   ├── globals.css         # Styling global, animasi pin, dan leaflet
│   │   ├── layout.tsx          # Root layout, Plus Jakarta Sans, Material Symbols
│   │   └── page.tsx            # Beranda portal warga
│   ├── components/
│   │   ├── maps/               # Komponen Leaflet (LocationPicker, PublicMap, DarkHeatmap)
│   │   ├── Footer.tsx          # Footer wajib 3 kolom + teks atribusi resmi
│   │   ├── Navbar.tsx          # Navbar sticky putih h-16
│   │   ├── ProgressBar.tsx     # Bilah progres 3 tahap (h-2 rounded-full)
│   │   └── StatusBadge.tsx     # Badge status sesuai token warna wajib
│   ├── lib/
│   │   ├── auth.ts             # JWT helper (jose), bcrypt hashing, session cookies
│   │   ├── constants.ts        # Daftar kecamatan, status, dan alur transisi sah
│   │   ├── prisma.ts           # Client Prisma singleton
│   │   └── validations.ts      # Skema validasi Zod berbahasa Indonesia
│   └── middleware.ts           # Pelindung rute /dashboard untuk petugas & admin
├── tailwind.config.ts          # Konfigurasi token warna, font, dan ukuran
├── tsconfig.json               # Konfigurasi TypeScript
└── README.md                   # Dokumentasi lengkap proyek
```

---

## 🗺️ Panduan Migrasi ke PostgreSQL + PostGIS (Lingkungan Produksi Skala Kota)

Saat ini aplikasi menggunakan SQLite (`dev.db`) dengan koordinat `lat` dan `lng` bertipe `Float` dan indeks komposit `@@index([lat, lng])` agar dapat langsung dijalankan secara lokal tanpa dependensi server luar.

Untuk meningkatkan skalabilitas ke tingkat produksi perkotaan (*enterprise smart city*):

1. **Ubah Konfigurasi Datasource di `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Aktifkan Ekstensi PostGIS di PostgreSQL:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Perkaya Kolom Spasial:**
   Tambahkan kolom geometri native point pada model `Report`:
   ```prisma
   // Pada schema.prisma:
   lokasi Unsupported("geometry(Point, 4326)")?
   ```

4. **Buat Spatial Index (GIST) untuk Kueri Sub-Milidetik:**
   ```sql
   CREATE INDEX idx_reports_geom ON "Report" USING GIST (lokasi);
   ```

5. **Optimalisasi Kueri Titik Panas & Deteksi Duplikat:**
   - **Deteksi Laporan Ganda dalam Radius 15 Meter:**
     ```sql
     SELECT id, "ticketCode" FROM "Report"
     WHERE ST_DWithin(
       lokasi,
       ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
       15
     );
     ```
   - **Agregasi Grid Titik Panas Berbasis Spasial Native:**
     ```sql
     SELECT ST_SnapToGrid(lokasi, 0.005, 0.005) AS grid_cell, COUNT(*) AS jumlah
     FROM "Report"
     WHERE "createdAt" >= NOW() - INTERVAL '7 days'
     GROUP BY grid_cell;
     ```

---

## ⚖️ Asumsi yang Diambil Selama Pengembangan

1. **Penyimpanan Berkas Foto:** Foto disimpan secara lokal pada direktori `/public/uploads`. Dalam lingkungan produksi cloud, handler ini dapat diarahkan ke object storage (S3/GCS/MinIO) tanpa mengubah antarmuka API `/api/upload`.
2. **Reverse Geocoding & Nominatim:** Pencarian nama jalan dan kecamatan menggunakan endpoint publik Nominatim OpenStreetMap dengan header identifikasi bahasa Indonesia (`Accept-Language: id`). Untuk ketersediaan offline tanpa internet sama sekali, sistem tetap menyediakan pilihan manual dropdown kecamatan dan koordinat numerik.
3. **Koordinat Default:** Titik pusat peta diarahkan pada koordinat Kota Bandar Lampung (`-5.39714, 105.26679`) dengan zoom level 13–14.
4. **Keamanan Sesi:** Cookie sesi `laporwarga_token` dikonfigurasi `httpOnly` dengan umur kedaluwarsa 7 hari, dilindungi middleware yang mengecek role `petugas` atau `admin` untuk akses ke `/dashboard`.

---

## 🏛️ Identitas & Hak Cipta

Footer resmi tercantum di seluruh halaman aplikasi:
> **Copyright©2026 by Royan Dandi Pratama dan Dr. Erliyan Redy Susanto, M.Kom.**
> *Kemitraan Inisiatif Riset: Universitas Teknokrat Indonesia &amp; Pemerintah Kota Bandar Lampung.*

