import React from "react";

export default function PusatBantuanPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Pusat Bantuan &amp; Panduan Staf</h1>
        <p className="text-sm text-secondary mt-1">
          Panduan operasional dispatching dan alur verifikasi pengaduan infrastruktur
        </p>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-on-surface mb-2">Standar Alur Status Tiket</h2>
          <div className="space-y-2 text-xs text-secondary leading-relaxed">
            <p>
              1. <strong>Menunggu:</strong> Laporan baru dari warga. Tugas admin adalah meninjau foto dan kecocokan kategori. Klik &quot;Setujui&quot; untuk mengubah menjadi &quot;Diproses&quot;.
            </p>
            <p>
              2. <strong>Diproses:</strong> Tiket telah sah dan diteruskan ke dinas teknis (mis. PUPR / Kebersihan). Klik &quot;Kirim Kru Petugas&quot; untuk mengubah menjadi &quot;Sedang Dikerjakan&quot;.
            </p>
            <p>
              3. <strong>Sedang Dikerjakan:</strong> Tim lapangan telah berada di lokasi pengerjaan. Setelah selesai, klik &quot;Verifikasi Bukti&quot; dan unggah foto hasil perbaikan (After) untuk mengubah status menjadi &quot;Selesai&quot;.
            </p>
            <p>
              4. <strong>Selesai:</strong> Tiket tuntas. Sistem otomatis mengirim notifikasi resmi ke akun warga pelapor.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <h2 className="text-sm font-bold text-on-surface mb-2">Kontak Dukungan Teknis Sistem</h2>
          <p className="text-xs text-secondary leading-relaxed">
            Jika mengalami kendala teknis sistem atau server, hubungi Administrator IT Command Center melalui email internal:{" "}
            <a href="mailto:admin@laporwarga.id" className="text-primary font-bold hover:underline">
              admin@laporwarga.id
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
