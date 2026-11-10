# Product Requirement Document (PRD)
**Nama Produk:** Platform Partisipasi Publik & Pelaporan Warga (Civic Crowdsourcing)
**Platform:** Web Application (Responsive Mobile-Web)
**Dokumen Versi:** 1.0
**Tahun:** 2026

---

## 1. Executive Summary & Goals

### Executive Summary
Platform "Civic Crowdsourcing" adalah aplikasi berbasis web yang dirancang untuk menjembatani kesenjangan komunikasi antara warga dan Pemerintah Daerah. Platform ini memungkinkan warga untuk melaporkan masalah infrastruktur kota (jalan rusak, sampah, lampu jalan mati) secara *real-time* dengan informasi geospasial yang akurat. Dengan antarmuka interaktif dan *dashboard* analitik, pemerintah dapat memprioritaskan penyelesaian masalah secara efisien dan transparan.

### Product Goals
1. **Meningkatkan Transparansi:** Memberikan visibilitas status laporan (diterima, dikerjakan, selesai) kepada pelapor dan publik.
2. **Efisiensi Penanganan Masalah:** Memangkas waktu birokrasi pemrosesan aduan melalui sistem *smart dispatching* ke dinas terkait.
3. **Pengambilan Keputusan Berbasis Data:** Menyediakan *heatmap* geospasial bagi pimpinan daerah untuk alokasi anggaran pemeliharaan infrastruktur yang tepat sasaran.

---

## 2. Target User & User Persona

### 1. Masyarakat (Pelapor & Pengawas)
*   **Persona:** Budi (28 tahun, Pekerja Swasta). Mobilitas tinggi di dalam kota. Sering menemui kemacetan akibat jalan berlubang atau tumpukan sampah yang memakan bahu jalan.
*   **Kebutuhan:** Ingin cara instan melaporkan masalah tanpa harus datang ke kantor dinas atau bingung harus lapor ke instansi mana. Ingin tahu apakah laporannya benar-benar diurus.

### 2. Admin Pemda / Dispatcher (*Command Center*)
*   **Persona:** Siti (35 tahun, Staf Diskominfo/Command Center). Bertugas menyaring ribuan aduan yang masuk dari berbagai kanal.
*   **Kebutuhan:** *Dashboard* terpusat yang bisa mendeteksi laporan ganda (*spam*), memetakan lokasi laporan di atas peta kota secara akurat, dan merutekan tiket otomatis ke Dinas terkait.

### 3. Eksekutor Lapangan (Dinas Teknis)
*   **Persona:** Joko (42 tahun, Mandor Dinas PU). Menerima perintah kerja pemeliharaan jalan.
*   **Kebutuhan:** Daftar tugas harian berbasis titik lokasi terdekat, kemudahan mengunggah foto *Before-After* pengerjaan sebagai bukti selesai.

---

## 3. User Stories & Functional Requirements

### 3.1. Antarmuka Web (Citizen Web Portal)
*   **US-1 (Pelaporan Aduan):** Sebagai warga, saya bisa membuat laporan baru dengan mengunggah foto, mendeskripsikan masalah, dan menentukan titik kordinat (menggunakan *Map Picker* interaktif) agar petugas tahu persis lokasinya.
*   **US-2 (Sistem Dukungan/Upvote):** Sebagai warga, saya bisa melihat laporan orang lain di peta dan memberikan *upvote* pada masalah yang juga berdampak pada saya, sehingga status prioritas laporan tersebut naik.
*   **US-3 (Pelacakan Status):** Sebagai warga, saya bisa melacak *timeline* laporan saya (Menunggu Validasi -> Diproses -> Selesai) secara *real-time*.

### 3.2. Panel Admin & Dashboard Dinas (Web Panel)
*   **US-4 (Dashboard Peta Spasial):** Sebagai Admin, saya bisa melihat *Spatial Heatmap* di *dashboard* untuk memantau konsentrasi masalah perkotaan (misal: zona merah untuk area banyak jalan rusak).
*   **US-5 (Manajemen Tiket & Smart Routing):** Sebagai Admin, saya bisa menyetujui laporan masuk dan sistem otomatis meneruskannya ke dinas terkait (misal: Kategori Sampah -> Dinas Lingkungan Hidup).
*   **US-6 (Laporan Penyelesaian):** Sebagai Eksekutor Dinas, saya bisa mengubah status tiket menjadi "Selesai" dengan wajib mengunggah foto bukti (*proof of work*).

---

## 4. Non-Functional Requirements (NFR)

1.  **Keamanan (Security):**
    *   Autentikasi menggunakan JWT (*JSON Web Tokens*) dengan *Role-Based Access Control* (RBAC) ketat antara Warga, Admin, dan Dinas.
    *   Perlindungan terhadap SQL Injection, XSS, dan CSRF pada form pelaporan.
    *   *Rate limiting* pada API pelaporan untuk mencegah serangan bot/spam.
2.  **Aksesibilitas Web (Accessibility):**
    *   Kepatuhan pada WCAG 2.1 Level AA (kontras warna yang baik, dukungan *screen reader* untuk difabel).
3.  **Responsivitas (Mobile-Web):**
    *   UI wajib menggunakan prinsip *Mobile-First Design*. Pengalaman menggunakan *map picker* dan unggah foto harus mulus saat diakses via *browser* di *smartphone*.
4.  **Performa:**
    *   API Backend harus merespons dalam waktu `< 200ms` untuk kueri standar.
    *   *Load time* awal web portal di bawah 3 detik.

---

## 5. Spesifikasi Teknis & Arsitektur

Untuk menjamin performa tinggi, konkurensi besar (banyak laporan masuk bersamaan), serta kapabilitas pencarian lokasi yang presisi, arsitektur teknis disusun sebagai berikut:

*   **Backend Server:** **Rust**
    *   *Framework:* Actix-Web atau Axum (Dipilih karena performa tinggi, memori rendah, dan sangat aman berkat sistem *memory-safety* bawaan Rust).
    *   *API Paradigm:* RESTful API untuk operasi CRUD biasa, dan GraphQL (menggunakan *library* Async-GraphQL) untuk *query* *dashboard* analitik yang kompleks dari sisi klien.
*   **Database:** **PostgreSQL + PostGIS**
    *   PostgreSQL digunakan sebagai *Relational Database Management System* utama.
    *   Ekstensi **PostGIS** WAJIB digunakan untuk menangani tipe data *Geometry/Geography*.
    *   *Validasi Sinergi:* Kemampuan PostGIS menghitung *bounding box*, radius terdekat (contoh: menggabungkan laporan duplikat dalam radius 10 meter), dan *spatial indexing* (GIST) sangat sempurna dipasangkan dengan Rust (melalui *crate* `sqlx` atau `diesel` yang mendukung ekstensi geospasial) untuk menghasilkan *query* peta spasial super cepat pada web *dashboard*.
*   **Frontend Web:** React.js / Next.js atau Vue.js (Diakses via Browser). Map dirender menggunakan Leaflet.js atau Mapbox GL JS.

---

## 6. Spesifikasi UI/UX Web Layout

### Struktur Layout General
1.  **Header/Navbar:** Logo Aplikasi, Menu Navigasi (Beranda, Lapor, Peta Aduan, Statistik), Profil Pengguna/Login.
2.  **Hero Section:** CTA (*Call to Action*) utama untuk "Buat Laporan Sekarang" dengan *background* gambar kota.
3.  **Main Content:**
    *   *Tab Warga:* Form interaktif *step-by-step*, Peta interaktif laporan terkini, *Leaderboard* isu paling banyak di-upvote.
    *   *Tab Admin:* *Sidebar* menu navigasi kerja, *Heatmap* analitik layar penuh, Tabel Manajemen Data.

### Spesifikasi Khusus: Web Footer Layout
Sesuai arahan rancangan arsitektur antarmuka, komponen *Footer* harus disusun secara profesional dengan pembagian kolom berikut:

*   **Kiri:** Tautan cepat (Tentang Kami, Syarat & Ketentuan, Kebijakan Privasi).
*   **Tengah:** Pusat Bantuan dan Kontak Darurat.
*   **Kanan (Slot Kemitraan & Identitas Resmi):**
    *   Menampilkan **Logo Pemda** (Pemerintah Daerah setempat) secara proporsional.
    *   Menampilkan **Logo Universitas Teknokrat Indonesia** (sebagai mitra riset/akademik).
*   **Bottom Bar (Copyright & Attribution):**
    Di bagian paling bawah layar (*center aligned*, huruf berukuran 12px-14px), wajib tercantum teks:
    > **Copyright©2026 by Royan Dandi Pratama dan Dr. Erliyan Redy Susanto, M.Kom.**

---
*Dokumen ini disusun untuk divalidasi oleh Tim Developer (Backend Rust, DBA PostgreSQL, dan Frontend Web) sebelum tahapan Sprint Planning dimulai.*