import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding basis data LaporWarga...");

  // 1. Bersihkan data lama
  await prisma.notification.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.completionProof.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash password demo
  const passwordHash = await bcrypt.hash("Demo12345!", 10);

  // Buat User Demo
  const userWarga = await prisma.user.create({
    data: {
      nama: "Ahmad Rizky Pratama",
      email: "warga@laporwarga.id",
      passwordHash,
      role: "warga",
      noTelepon: "081278901234",
    },
  });

  const userPetugas = await prisma.user.create({
    data: {
      nama: "Budi Santoso, S.T.",
      email: "petugas@laporwarga.id",
      passwordHash,
      role: "petugas",
      noTelepon: "081369123456",
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      nama: "Ir. Hendra Wijaya, M.T.",
      email: "admin@laporwarga.id",
      passwordHash,
      role: "admin",
      noTelepon: "081172009999",
    },
  });

  // Buat Warga Tambahan untuk variasi dukungan (vote)
  const warga2 = await prisma.user.create({
    data: {
      nama: "Siti Rahmawati",
      email: "siti.rahma@gmail.com",
      passwordHash,
      role: "warga",
      noTelepon: "082155443322",
    },
  });

  const warga3 = await prisma.user.create({
    data: {
      nama: "Dedi Setiawan",
      email: "dedi.setiawan@yahoo.com",
      passwordHash,
      role: "warga",
      noTelepon: "085211223344",
    },
  });

  console.log("✅ User demo berhasil dibuat");

  // 3. Buat 6 Kategori
  const categoriesData = [
    {
      nama: "Jalan Berlubang & Rusak",
      ikon: "construction",
      deskripsi: "Kerusakan aspal, amblas, lubang jalan yang membahayakan pengendara.",
    },
    {
      nama: "Penerangan Jalan Umum",
      ikon: "lightbulb",
      deskripsi: "Lampu penerangan jalan padam, korsleting kabel, atau tiang miring.",
    },
    {
      nama: "Drainase & Saluran Air",
      ikon: "water_drop",
      deskripsi: "Saluran mampet, gorong-gorong jebol, atau luapan air saat hujan.",
    },
    {
      nama: "Sampah & Kebersihan",
      ikon: "delete",
      deskripsi: "Penumpukan sampah liar, TPS meluap, atau limbah di ruang publik.",
    },
    {
      nama: "Taman & Fasilitas Publik",
      ikon: "park",
      deskripsi: "Fasilitas taman kota, trotoar pejalan kaki, atau halte bus rusak.",
    },
    {
      nama: "Pohon Tumbang & Rawan Roboh",
      ikon: "nature",
      deskripsi: "Pohon tumbang menutup jalan atau dahan rapuh membahayakan kabel/warga.",
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) => prisma.category.create({ data: c }))
  );
  console.log(`✅ ${categories.length} Kategori berhasil dibuat`);

  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.nama] = c.id;
  });

  // 4. Daftar 46 Laporan Nyata di Bandar Lampung
  const rawReports = [
    // Klaster 1: Kedaton & Rajabasa (Jl. ZA Pagar Alam - Kampus & Perdagangan)
    {
      ticketCode: "#TKT-1001",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Lubang jalan sedalam 15 cm di depan ruko seberang Mall Boemi Kedaton, sering membuat motor oleng.",
      lat: -5.3789,
      lng: 105.2576,
      alamat: "Jl. Teuku Umar No. 12, Kedaton (Dekat MBK)",
      kecamatan: "Kedaton",
      status: "Menunggu",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1002",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Aspal mengelupas parah di jalur lambat depan Universitas Teknokrat Indonesia sepanjang 10 meter.",
      lat: -5.3795,
      lng: 105.2582,
      alamat: "Jl. Zainal Abidin Pagar Alam No. 9, Labuhan Ratu",
      kecamatan: "Labuhan Ratu",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1003",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "3 tiang PJU berturut-turut padam sejak 4 hari lalu di bawah flyover MBK, jalanan gelap rawan begal.",
      lat: -5.3778,
      lng: 105.2568,
      alamat: "Jl. Zainal Abidin Pagar Alam (Bawah Flyover Mall Boemi Kedaton)",
      kecamatan: "Kedaton",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1004",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Gorong-gorong tersumbat endapan lumpur, air meluap ke badan jalan setiap kali turun hujan deras.",
      lat: -5.3762,
      lng: 105.2551,
      alamat: "Jl. Sultan Agung No. 45, Way Halim",
      kecamatan: "Way Halim",
      status: "Selesai",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1005",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Tumpukan sampah liar di sudut tikungan dekat Pasar Koga menimbulkan bau menyengat hingga ke pemukiman.",
      lat: -5.3855,
      lng: 105.2592,
      alamat: "Jl. Teuku Umar (Belakang Pasar Koga)",
      kecamatan: "Kedaton",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1006",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan amblas di perempatan lampu merah Rajabasa menuju Terminal Induk, sangat berisiko untuk truk dan bus.",
      lat: -5.3712,
      lng: 105.2448,
      alamat: "Jl. ZA Pagar Alam Simpang Terminal Rajabasa",
      kecamatan: "Rajabasa",
      status: "Sedang Dikerjakan",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1007",
      cat: "Pohon Tumbang & Rawan Roboh",
      foto: "/uploads/placeholder-pohon.svg",
      deskripsi: "Dahan pohon beringin tua patah dan menjuntai rendah menutupi rambu lalu lintas serta kabel telepon PLN.",
      lat: -5.3735,
      lng: 105.2482,
      alamat: "Jl. Pramuka Raya No. 18, Rajabasa",
      kecamatan: "Rajabasa",
      status: "Diproses",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1008",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "Lampu penerangan jalan berkedip-kedip dan kadang mati mendadak di jalan masuk Perumahan Bukit Bilabong.",
      lat: -5.3888,
      lng: 105.2395,
      alamat: "Jl. Bilabong Jaya, Langkapura",
      kecamatan: "Langkapura",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },

    // Klaster 2: Tanjung Karang Pusat & Enggal (Pusat Kota & Jl. Raden Intan)
    {
      ticketCode: "#TKT-1009",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Lubang menganga di lajur kanan depan Ramayana Tanjung Karang, mengakibatkan kemacetan panjang.",
      lat: -5.4121,
      lng: 105.2598,
      alamat: "Jl. Raden Intan No. 88, Tanjung Karang Pusat",
      kecamatan: "Tanjung Karang Pusat",
      status: "Selesai",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1010",
      cat: "Taman & Fasilitas Publik",
      foto: "/uploads/placeholder-taman.svg",
      deskripsi: "Trotoar di sepanjang Tugu Adipura jebol, penutup bak kontrol hilang dan membahayakan pejalan kaki tunanetra.",
      lat: -5.4198,
      lng: 105.2582,
      alamat: "Bundaran Tugu Adipura, Enggal",
      kecamatan: "Enggal",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1011",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "Lampu sorot taman Lapangan Saburai padam, area parkir menjadi sangat gelap pada malam hari.",
      lat: -5.4215,
      lng: 105.2591,
      alamat: "Jl. Sriwijaya Lapangan Saburai, Enggal",
      kecamatan: "Enggal",
      status: "Selesai",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1012",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Sampah sisa dagangan malam menumpuk di depan ruko Jl. RA Kartini belum terangkut oleh armada dinas kebersihan.",
      lat: -5.4155,
      lng: 105.2542,
      alamat: "Jl. RA Kartini No. 40, Tanjung Karang Pusat",
      kecamatan: "Tanjung Karang Pusat",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1013",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Saluran drainase depan Stasiun Kereta Api Tanjung Karang tidak mengalir, bau got menyengat para penumpang.",
      lat: -5.4082,
      lng: 105.2575,
      alamat: "Jl. Kotaraja Depan Stasiun KA Tanjung Karang",
      kecamatan: "Tanjung Karang Pusat",
      status: "Menunggu",
      prioritas: "P2 Mendesak",
    },

    // Klaster 3: Teluk Betung (Selatan & Utara - Kawasan Pesisir & Sentra Bisnis)
    {
      ticketCode: "#TKT-1014",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan bergelombang dan berlubang parah di sekitar Gudang Garam - Jl. Yos Sudarso akibat muatan kontainer.",
      lat: -5.4385,
      lng: 105.2755,
      alamat: "Jl. Yos Sudarso Km. 4, Teluk Betung Selatan",
      kecamatan: "Teluk Betung Selatan",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1015",
      cat: "Pohon Tumbang & Rawan Roboh",
      foto: "/uploads/placeholder-pohon.svg",
      deskripsi: "Pohon kelapa roboh menghalangi separuh badan jalan di tanjakan dekat Pantai Pasir Putih arah Teluk Betung.",
      lat: -5.4412,
      lng: 105.2811,
      alamat: "Jl. Ikan Tenggiri, Teluk Betung Selatan",
      kecamatan: "Teluk Betung Selatan",
      status: "Selesai",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1016",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Limbah kantong plastik kiriman pasang air laut berserakan di bibir pantai dan tanggul penahan ombak.",
      lat: -5.4452,
      lng: 105.2855,
      alamat: "Kawasan Pesisir Gudang Lelang, Teluk Betung Selatan",
      kecamatan: "Teluk Betung Selatan",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1017",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "PJU padam sepanjang Jl. Basuki Rahmat depan kantor dinas, membahayakan pengendara malam hari.",
      lat: -5.4312,
      lng: 105.2632,
      alamat: "Jl. Basuki Rahmat No. 22, Teluk Betung Utara",
      kecamatan: "Teluk Betung Utara",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },

    // Klaster 4: Way Halim & Sukarame (Kawasan Pemukiman & Kampus)
    {
      ticketCode: "#TKT-1018",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan berlubang besar tepat di bundaran Way Halim samping PKOR, motor rem mendadak sering tertabrak dari belakang.",
      lat: -5.3882,
      lng: 105.2785,
      alamat: "Jl. Way Sekampung, Kompleks PKOR Way Halim",
      kecamatan: "Way Halim",
      status: "Sedang Dikerjakan",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1019",
      cat: "Taman & Fasilitas Publik",
      foto: "/uploads/placeholder-taman.svg",
      deskripsi: "Lampu jogging track PKOR Way Halim pecah dan kabel terbuka, sangat rawan tersengat saat hujan.",
      lat: -5.3895,
      lng: 105.2798,
      alamat: "Kawasan Jogging Track PKOR, Way Halim",
      kecamatan: "Way Halim",
      status: "Selesai",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1020",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Gorong-gorong Jl. Endro Suratmin Sukarame tersumbat sampah plastik, menggenang sampai 40 cm.",
      lat: -5.3821,
      lng: 105.2942,
      alamat: "Jl. Endro Suratmin Depan UIN RIL, Sukarame",
      kecamatan: "Sukarame",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1021",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Kerusakan jalan paving block di pintu masuk perumahan Permata Biru, banyak paving copot.",
      lat: -5.3805,
      lng: 105.2988,
      alamat: "Jl. Permata Biru Blok D, Sukarame",
      kecamatan: "Sukarame",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },

    // Laporan Tambahan Sebaran Wilayah Lainnya di Bandar Lampung
    {
      ticketCode: "#TKT-1022",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Retakan melintang di tanjakan Jl. Pangeran Antasari arah Kali Balok, membahayakan minibus.",
      lat: -5.3995,
      lng: 105.2742,
      alamat: "Jl. Pangeran Antasari No. 110, Kedamaian",
      kecamatan: "Kedamaian",
      status: "Selesai",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1023",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "Tiang PJU di tikungan Jl. Hayam Wuruk miring 30 derajat tertabrak truk, kabel menjuntai.",
      lat: -5.4052,
      lng: 105.2715,
      alamat: "Jl. Hayam Wuruk No. 55, Kedamaian",
      kecamatan: "Kedamaian",
      status: "Sedang Dikerjakan",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1024",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Bak sampah komunal TPS Kemiling penuh meluber hingga menutupi sebagian badan jalan raya.",
      lat: -5.3965,
      lng: 105.2285,
      alamat: "Jl. Imam Bonjol Dekat Flyover Kemiling",
      kecamatan: "Kemiling",
      status: "Diproses",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1025",
      cat: "Pohon Tumbang & Rawan Roboh",
      foto: "/uploads/placeholder-pohon.svg",
      deskripsi: "Pohon akasia condong ke arah rumah warga di gang sempit, warga khawatir roboh saat angin kencang.",
      lat: -5.4012,
      lng: 105.2241,
      alamat: "Jl. Teuku Cik Ditiro Gg. Langgar, Kemiling",
      kecamatan: "Kemiling",
      status: "Menunggu",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1026",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Tanggul drainase kali kecil di Tanjung Senang jebol sepanjang 5 meter akibat debit air tinggi.",
      lat: -5.3688,
      lng: 105.2815,
      alamat: "Jl. Ratu Dibalau Gg. Dahlia, Tanjung Senang",
      kecamatan: "Tanjung Senang",
      status: "Sedang Dikerjakan",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1027",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Lubang tersembunyi genangan air di depan Pasar Tamin, sudah memakan korban 2 pengendara motor jatuh.",
      lat: -5.4088,
      lng: 105.2445,
      alamat: "Jl. Cut Nyak Dien Depan Pasar Tamin, Tanjung Karang Barat",
      kecamatan: "Tanjung Karang Barat",
      status: "Menunggu",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1028",
      cat: "Taman & Fasilitas Publik",
      foto: "/uploads/placeholder-taman.svg",
      deskripsi: "Papan nama taman Makam Pahlawan Kedaton rusak dan cat mengelupas, huruf sebagian tanggal.",
      lat: -5.3842,
      lng: 105.2588,
      alamat: "Jl. Teuku Umar Depan TMP Kedaton",
      kecamatan: "Kedaton",
      status: "Selesai",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1029",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan penghubung Labuhan Ratu - Rajabasa banyak kerikil tajam berhamburan dari sisa galian pipa.",
      lat: -5.3755,
      lng: 105.2512,
      alamat: "Jl. Untung Suropati, Labuhan Ratu",
      kecamatan: "Labuhan Ratu",
      status: "Diproses",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1030",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "Kabel PJU terkelupas menggelantung rendah di atas jalan, berjarak hanya 2 meter dari permukaan tanah.",
      lat: -5.4245,
      lng: 105.2685,
      alamat: "Jl. Dr. Susilo Depan Kantor Pos, Teluk Betung Utara",
      kecamatan: "Teluk Betung Utara",
      status: "Selesai",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1031",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Warga membuang puing-puing bangunan liar di lahan kosong samping ruko, debu mengganggu pengguna jalan.",
      lat: -5.3922,
      lng: 105.2655,
      alamat: "Jl. Arif Rahman Hakim, Way Halim",
      kecamatan: "Way Halim",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1032",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Tutup bak kontrol got hilang dicuri orang, lubang selebar 1 meter terbuka di trotoar ramai pejalan kaki.",
      lat: -5.4135,
      lng: 105.2581,
      alamat: "Jl. Raden Intan Depan Bank Mandiri",
      kecamatan: "Tanjung Karang Pusat",
      status: "Selesai",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1033",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan berlubang besar di depan Polsek Teluk Betung Selatan, kendaraan terpaksa zig-zag melawan arus.",
      lat: -5.4352,
      lng: 105.2688,
      alamat: "Jl. Pattimura, Teluk Betung Selatan",
      kecamatan: "Teluk Betung Selatan",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1034",
      cat: "Pohon Tumbang & Rawan Roboh",
      foto: "/uploads/placeholder-pohon.svg",
      deskripsi: "Pohon trembesi rindang menutupi lampu pengatur lalu lintas simpang perempatan lampu merah.",
      lat: -5.4045,
      lng: 105.2625,
      alamat: "Jl. Jenderal Sudirman Simpang Rawalaut, Enggal",
      kecamatan: "Enggal",
      status: "Selesai",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1035",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Aspal melepuh dan terkelupas di area tikungan Sukabumi menuju Campang Raya.",
      lat: -5.3985,
      lng: 105.3055,
      alamat: "Jl. Pangeran Tirtayasa No. 90, Sukabumi",
      kecamatan: "Sukabumi",
      status: "Menunggu",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1036",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "PJU sepanjang jembatan flyover Gajah Mada mati total selama seminggu penuh.",
      lat: -5.4095,
      lng: 105.2692,
      alamat: "Flyover Jl. Gajah Mada, Tanjung Karang Timur",
      kecamatan: "Tanjung Karang Timur",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1037",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Sampah pasar subuh tumpah ruah ke badan jalan Panjang, menghambat akses angkutan barang.",
      lat: -5.4655,
      lng: 105.3125,
      alamat: "Jl. Yos Sudarso Pasar Panjang, Panjang",
      kecamatan: "Panjang",
      status: "Diproses",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1038",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Jalan akses pelabuhan Panjang bergelombang parah dan retak buaya karena tonase berat.",
      lat: -5.4682,
      lng: 105.3188,
      alamat: "Jl. Soekarno Hatta By Pass Depan Pelabuhan Panjang",
      kecamatan: "Panjang",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1039",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Saluran primer Bumi Waras tersumbat batang kayu dan kasur bekas, berpotensi banjir rob.",
      lat: -5.4398,
      lng: 105.2715,
      alamat: "Jl. Ikan Hiu Gg. Bahari, Bumi Waras",
      kecamatan: "Bumi Waras",
      status: "Menunggu",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1040",
      cat: "Taman & Fasilitas Publik",
      foto: "/uploads/placeholder-taman.svg",
      deskripsi: "Ayunan dan perosotan anak di RTH Gajah Mada rusak patah bautnya, sangat berbahaya untuk anak balita.",
      lat: -5.4112,
      lng: 105.2678,
      alamat: "Taman Ramah Anak RTH Gajah Mada, Tanjung Karang Timur",
      kecamatan: "Tanjung Karang Timur",
      status: "Selesai",
      prioritas: "P3 Rutin",
    },
    {
      ticketCode: "#TKT-1041",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Lubang jalan bertubi-tubi sedalam 10-18 cm di depan pom bensin Jl. ZA Pagar Alam Rajabasa.",
      lat: -5.3725,
      lng: 105.2471,
      alamat: "Jl. ZA Pagar Alam Dekat SPBU Rajabasa",
      kecamatan: "Rajabasa",
      status: "Menunggu",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1042",
      cat: "Jalan Berlubang & Rusak",
      foto: "/uploads/placeholder-jalan.svg",
      deskripsi: "Aspal ambrol di deket halte bus kampus Unila, pengendara motor sering terperosok saat malam.",
      lat: -5.3718,
      lng: 105.2465,
      alamat: "Jl. Prof. Sumantri Brojonegoro Pintu Gerbang Unila",
      kecamatan: "Rajabasa",
      status: "Diproses",
      prioritas: "P1 Kritis",
    },
    {
      ticketCode: "#TKT-1043",
      cat: "Penerangan Jalan Umum",
      foto: "/uploads/placeholder-lampu.svg",
      deskripsi: "PJU padam 5 titik di Jl. Komarudin Rajabasa Raya, rawan tindak kejahatan jalanan.",
      lat: -5.3685,
      lng: 105.2492,
      alamat: "Jl. H. Komarudin No. 14, Rajabasa",
      kecamatan: "Rajabasa",
      status: "Menunggu",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1044",
      cat: "Sampah & Kebersihan",
      foto: "/uploads/placeholder-sampah.svg",
      deskripsi: "Sampah menumpuk di tepi sungai jembatan perbatasan Kedaton - Labuhan Ratu.",
      lat: -5.3812,
      lng: 105.2571,
      alamat: "Jembatan Jl. Untung Suropati, Labuhan Ratu",
      kecamatan: "Labuhan Ratu",
      status: "Sedang Dikerjakan",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1045",
      cat: "Drainase & Saluran Air",
      foto: "/uploads/placeholder-drainase.svg",
      deskripsi: "Saluran drainase perkotaan di depan Pasar Bambu Kuning tertutup beton tanpa lubang kontrol pembersihan.",
      lat: -5.4142,
      lng: 105.2538,
      alamat: "Jl. Imam Bonjol Dekat Pasar Bambu Kuning, Tanjung Karang Pusat",
      kecamatan: "Tanjung Karang Pusat",
      status: "Selesai",
      prioritas: "P2 Mendesak",
    },
    {
      ticketCode: "#TKT-1046",
      cat: "Pohon Tumbang & Rawan Roboh",
      foto: "/uploads/placeholder-pohon.svg",
      deskripsi: "Akar pohon angsana besar di trotoar Jl. Raden Intan mencuat mengangkat konblok dan miring ke arah badan jalan.",
      lat: -5.4168,
      lng: 105.2589,
      alamat: "Jl. Raden Intan Depan Hotel Grand Anom",
      kecamatan: "Tanjung Karang Pusat",
      status: "Sedang Dikerjakan",
      prioritas: "P1 Kritis",
    },
  ];

  console.log(`⏳ Memasukkan ${rawReports.length} laporan dengan riwayat status & bukti...`);

  for (let i = 0; i < rawReports.length; i++) {
    const r = rawReports[i];
    const categoryId = catMap[r.cat] || categories[0].id;
    // Tentukan waktu pembuatan variatif dalam 7 hari terakhir (pastikan laporan Selesai minimal dibuat >= 26 jam lalu agar selesaiAt tidak di masa depan)
    const minHoursAgo = r.status === "Selesai" ? 26 : 6;
    const totalHoursAgo = minHoursAgo + ((i * 7) % 120);
    const createdAt = new Date(Date.now() - totalHoursAgo * 1000 * 60 * 60);

    const report = await prisma.report.create({
      data: {
        ticketCode: r.ticketCode,
        categoryId,
        deskripsi: r.deskripsi,
        fotoUrl: r.foto,
        lat: r.lat,
        lng: r.lng,
        alamat: r.alamat,
        kecamatan: r.kecamatan,
        status: r.status,
        prioritas: r.prioritas,
        createdById: userWarga.id,
        createdAt,
        updatedAt: new Date(),
      },
    });

    // Buat riwayat status awal
    await prisma.statusHistory.create({
      data: {
        reportId: report.id,
        dari: "Draft",
        ke: "Menunggu",
        catatan: "Laporan berhasil diajukan oleh warga melalui portal web.",
        olehId: userWarga.id,
        createdAt,
      },
    });

    // Tambah dukungan suara (Votes) acak
    if (i % 2 === 0) {
      await prisma.vote.create({
        data: { reportId: report.id, userId: warga2.id },
      });
    }
    if (i % 3 === 0) {
      await prisma.vote.create({
        data: { reportId: report.id, userId: warga3.id },
      });
    }

    // Jika status Diproses / Sedang Dikerjakan / Selesai -> beri Penugasan Kru
    if (r.status === "Diproses" || r.status === "Sedang Dikerjakan" || r.status === "Selesai") {
      await prisma.assignment.create({
        data: {
          reportId: report.id,
          unit: "Dinas PUPR Bandar Lampung (Tim Reaksi Cepat 03)",
          catatan: "Penugasan tim inspeksi dan unit perbaikan infrastruktur jalan/saluran.",
          assignedAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 2),
        },
      });

      await prisma.statusHistory.create({
        data: {
          reportId: report.id,
          dari: "Menunggu",
          ke: "Diproses",
          catatan: "Laporan telah diverifikasi oleh admin dinas dan ditugaskan ke tim lapangan.",
          olehId: userPetugas.id,
          createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 2),
        },
      });
    }

    if (r.status === "Sedang Dikerjakan" || r.status === "Selesai") {
      await prisma.statusHistory.create({
        data: {
          reportId: report.id,
          dari: "Diproses",
          ke: "Sedang Dikerjakan",
          catatan: "Kru teknis sudah tiba di lokasi dan mulai melakukan tindakan perbaikan.",
          olehId: userPetugas.id,
          createdAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 5),
        },
      });
    }

    // Jika Selesai -> beri CompletionProof & StatusHistory Selesai
    if (r.status === "Selesai") {
      const selesaiAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24);
      await prisma.completionProof.create({
        data: {
          reportId: report.id,
          fotoUrl: "/uploads/placeholder-selesai.svg",
          catatan:
            "Pekerjaan perbaikan telah selesai 100%. Pengaspalan hotmix selesai dan saluran telah dinormalisasi. Telah lulus uji fungsi lapangan.",
          selesaiAt,
        },
      });

      await prisma.statusHistory.create({
        data: {
          reportId: report.id,
          dari: "Sedang Dikerjakan",
          ke: "Selesai",
          catatan: "Verifikasi lapangan disetujui. Laporan ditutup dengan status Selesai.",
          olehId: userPetugas.id,
          createdAt: selesaiAt,
        },
      });

      // Kirim Notifikasi ke warga
      await prisma.notification.create({
        data: {
          userId: userWarga.id,
          reportId: report.id,
          pesan: `Laporan Anda ${r.ticketCode} (${r.alamat}) telah selesai dikerjakan oleh petugas dinas!`,
          dibaca: false,
          createdAt: selesaiAt,
        },
      });
    }
  }

  console.log("🎉 Seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

