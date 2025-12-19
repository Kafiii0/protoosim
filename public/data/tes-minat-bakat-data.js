// Data Pertanyaan Tes Minat Bakat - Model RIASEC
// RIASEC: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
// Total: 100 pertanyaan (distribusi merata per kategori)

const riasecQuestions = [
    // REALISTIC (17 pertanyaan)
    {
        id: 1,
        question: "Saya suka merakit atau memperbaiki alat elektronik seperti handphone, laptop, atau perangkat lainnya.",
        category: "Realistic"
    },
    {
        id: 2,
        question: "Saya lebih tertarik bekerja dengan mesin dan peralatan teknis daripada bekerja di depan komputer.",
        category: "Realistic"
    },
    {
        id: 3,
        question: "Saya senang melakukan aktivitas fisik seperti olahraga, berkebun, atau membuat kerajinan tangan.",
        category: "Realistic"
    },
    {
        id: 4,
        question: "Saya merasa puas ketika bisa membangun atau membuat sesuatu yang konkret dan bisa digunakan.",
        category: "Realistic"
    },
    {
        id: 5,
        question: "Saya lebih suka bekerja di lapangan atau workshop daripada di kantor atau ruang kelas.",
        category: "Realistic"
    },
    {
        id: 6,
        question: "Saya tertarik untuk mempelajari cara kerja motor, mobil, atau mesin-mesin lainnya.",
        category: "Realistic"
    },
    {
        id: 7,
        question: "Saya senang bekerja dengan alat-alat seperti palu, obeng, gergaji, atau peralatan teknis lainnya.",
        category: "Realistic"
    },
    {
        id: 8,
        question: "Saya lebih suka pekerjaan yang melibatkan aktivitas outdoor daripada indoor.",
        category: "Realistic"
    },
    {
        id: 9,
        question: "Saya tertarik untuk bekerja di bidang konstruksi, pertanian, atau industri manufaktur.",
        category: "Realistic"
    },
    {
        id: 10,
        question: "Saya senang memperbaiki barang-barang yang rusak di rumah.",
        category: "Realistic"
    },
    {
        id: 11,
        question: "Saya lebih suka pekerjaan yang membutuhkan keterampilan teknis daripada keterampilan sosial.",
        category: "Realistic"
    },
    {
        id: 12,
        question: "Saya tertarik untuk mempelajari teknologi otomotif, robotika, atau mekatronika.",
        category: "Realistic"
    },
    {
        id: 13,
        question: "Saya senang bekerja dengan tangan untuk membuat atau merakit sesuatu.",
        category: "Realistic"
    },
    {
        id: 14,
        question: "Saya lebih nyaman dengan pekerjaan yang memiliki hasil konkret yang bisa dilihat langsung.",
        category: "Realistic"
    },
    {
        id: 15,
        question: "Saya tertarik untuk belajar tentang kelistrikan, pipa ledeng, atau sistem mekanik.",
        category: "Realistic"
    },
    {
        id: 16,
        question: "Saya senang melakukan pekerjaan yang melibatkan koordinasi fisik dan keterampilan manual.",
        category: "Realistic"
    },
    {
        id: 17,
        question: "Saya lebih suka bekerja dengan objek fisik daripada bekerja dengan ide-ide abstrak.",
        category: "Realistic"
    },

    // INVESTIGATIVE (17 pertanyaan)
    {
        id: 18,
        question: "Saya senang melakukan eksperimen atau penelitian untuk menemukan jawaban dari suatu masalah.",
        category: "Investigative"
    },
    {
        id: 19,
        question: "Saya tertarik mempelajari bagaimana sesuatu bekerja secara detail dan mendalam.",
        category: "Investigative"
    },
    {
        id: 20,
        question: "Saya suka menganalisis data, membaca jurnal ilmiah, atau mempelajari teori-teori baru.",
        category: "Investigative"
    },
    {
        id: 21,
        question: "Saya merasa tertantang ketika harus memecahkan masalah kompleks menggunakan logika dan sains.",
        category: "Investigative"
    },
    {
        id: 22,
        question: "Saya lebih suka belajar tentang sains, matematika, atau teknologi daripada mata pelajaran lainnya.",
        category: "Investigative"
    },
    {
        id: 23,
        question: "Saya senang mencari tahu 'mengapa' dan 'bagaimana' suatu fenomena terjadi.",
        category: "Investigative"
    },
    {
        id: 24,
        question: "Saya tertarik untuk bekerja di laboratorium atau pusat penelitian.",
        category: "Investigative"
    },
    {
        id: 25,
        question: "Saya senang membaca artikel atau buku tentang penemuan ilmiah terbaru.",
        category: "Investigative"
    },
    {
        id: 26,
        question: "Saya lebih suka menggunakan metode ilmiah untuk menyelesaikan masalah.",
        category: "Investigative"
    },
    {
        id: 27,
        question: "Saya tertarik mempelajari bidang kedokteran, biologi, kimia, atau fisika.",
        category: "Investigative"
    },
    {
        id: 28,
        question: "Saya senang mengumpulkan informasi dan fakta sebelum membuat kesimpulan.",
        category: "Investigative"
    },
    {
        id: 29,
        question: "Saya lebih suka pekerjaan yang membutuhkan pemikiran analitis dan kritis.",
        category: "Investigative"
    },
    {
        id: 30,
        question: "Saya tertarik untuk melakukan coding, programming, atau pengembangan software.",
        category: "Investigative"
    },
    {
        id: 31,
        question: "Saya senang memecahkan puzzle, teka-teki matematika, atau problem logic.",
        category: "Investigative"
    },
    {
        id: 32,
        question: "Saya lebih suka bekerja secara independen untuk menyelesaikan proyek penelitian.",
        category: "Investigative"
    },
    {
        id: 33,
        question: "Saya tertarik untuk mempelajari teknologi baru dan perkembangan sains terkini.",
        category: "Investigative"
    },
    {
        id: 34,
        question: "Saya senang mengamati, menganalisis, dan menarik kesimpulan dari data yang ada.",
        category: "Investigative"
    },

    // ARTISTIC (17 pertanyaan)
    {
        id: 35,
        question: "Saya suka mengekspresikan diri melalui seni, seperti menggambar, melukis, atau membuat desain visual.",
        category: "Artistic"
    },
    {
        id: 36,
        question: "Saya menikmati menulis cerita, puisi, atau konten kreatif lainnya.",
        category: "Artistic"
    },
    {
        id: 37,
        question: "Saya tertarik pada musik, teater, atau seni pertunjukan dan ingin terlibat di dalamnya.",
        category: "Artistic"
    },
    {
        id: 38,
        question: "Saya suka menciptakan sesuatu yang unik dan orisinal daripada mengikuti pola yang sudah ada.",
        category: "Artistic"
    },
    {
        id: 39,
        question: "Saya merasa bebas dan terinspirasi ketika bisa mengekspresikan ide-ide kreatif saya.",
        category: "Artistic"
    },
    {
        id: 40,
        question: "Saya senang bermain alat musik atau menyanyikan lagu.",
        category: "Artistic"
    },
    {
        id: 41,
        question: "Saya tertarik untuk bekerja di bidang desain grafis, fotografi, atau videografi.",
        category: "Artistic"
    },
    {
        id: 42,
        question: "Saya lebih suka pekerjaan yang memberikan kebebasan berekspresi dan berkreasi.",
        category: "Artistic"
    },
    {
        id: 43,
        question: "Saya senang menghadiri pameran seni, konser musik, atau pertunjukan teater.",
        category: "Artistic"
    },
    {
        id: 44,
        question: "Saya tertarik untuk membuat konten kreatif untuk media sosial atau platform digital.",
        category: "Artistic"
    },
    {
        id: 45,
        question: "Saya lebih suka lingkungan kerja yang fleksibel dan tidak terlalu terstruktur.",
        category: "Artistic"
    },
    {
        id: 46,
        question: "Saya senang mendekorasi ruangan atau merancang tampilan visual yang menarik.",
        category: "Artistic"
    },
    {
        id: 47,
        question: "Saya tertarik untuk belajar tentang fashion design, interior design, atau arsitektur.",
        category: "Artistic"
    },
    {
        id: 48,
        question: "Saya lebih suka mengekspresikan ide melalui gambar atau visual daripada kata-kata.",
        category: "Artistic"
    },
    {
        id: 49,
        question: "Saya senang bereksperimen dengan warna, bentuk, dan tekstur dalam karya seni.",
        category: "Artistic"
    },
    {
        id: 50,
        question: "Saya tertarik untuk membuat film, animasi, atau konten multimedia.",
        category: "Artistic"
    },
    {
        id: 51,
        question: "Saya merasa paling produktif ketika bisa bekerja secara kreatif dan imajinatif.",
        category: "Artistic"
    },

    // SOCIAL (17 pertanyaan)
    {
        id: 52,
        question: "Saya senang membantu orang lain mengatasi masalah mereka atau memberikan dukungan emosional.",
        category: "Social"
    },
    {
        id: 53,
        question: "Saya merasa puas ketika bisa mengajar atau membimbing orang lain untuk berkembang.",
        category: "Social"
    },
    {
        id: 54,
        question: "Saya lebih suka bekerja dalam tim dan berkolaborasi dengan banyak orang daripada bekerja sendiri.",
        category: "Social"
    },
    {
        id: 55,
        question: "Saya tertarik pada bidang kesehatan, pendidikan, atau pelayanan masyarakat.",
        category: "Social"
    },
    {
        id: 56,
        question: "Saya senang berinteraksi dengan orang lain dan memahami perasaan serta kebutuhan mereka.",
        category: "Social"
    },
    {
        id: 57,
        question: "Saya merasa bahagia ketika bisa membuat orang lain tersenyum atau merasa lebih baik.",
        category: "Social"
    },
    {
        id: 58,
        question: "Saya tertarik untuk bekerja sebagai guru, konselor, atau pekerja sosial.",
        category: "Social"
    },
    {
        id: 59,
        question: "Saya lebih suka pekerjaan yang melibatkan interaksi langsung dengan banyak orang.",
        category: "Social"
    },
    {
        id: 60,
        question: "Saya senang mendengarkan cerita dan masalah orang lain dengan empati.",
        category: "Social"
    },
    {
        id: 61,
        question: "Saya tertarik untuk terlibat dalam kegiatan sosial atau volunteering untuk membantu komunitas.",
        category: "Social"
    },
    {
        id: 62,
        question: "Saya lebih suka bekerja di lingkungan yang ramah dan kolaboratif.",
        category: "Social"
    },
    {
        id: 63,
        question: "Saya senang memberikan saran atau nasihat kepada teman yang membutuhkan.",
        category: "Social"
    },
    {
        id: 64,
        question: "Saya tertarik untuk bekerja di bidang kesehatan seperti dokter, perawat, atau terapis.",
        category: "Social"
    },
    {
        id: 65,
        question: "Saya merasa energi ketika dikelilingi oleh orang-orang dan bisa berkontribusi untuk mereka.",
        category: "Social"
    },
    {
        id: 66,
        question: "Saya lebih suka pekerjaan yang memiliki dampak positif langsung terhadap kehidupan orang lain.",
        category: "Social"
    },
    {
        id: 67,
        question: "Saya senang mengorganisir acara sosial atau kegiatan yang melibatkan banyak orang.",
        category: "Social"
    },
    {
        id: 68,
        question: "Saya tertarik untuk mempelajari psikologi, sosiologi, atau ilmu-ilmu sosial lainnya.",
        category: "Social"
    },

    // ENTERPRISING (16 pertanyaan)
    {
        id: 69,
        question: "Saya tertarik untuk memimpin proyek atau tim dan membuat keputusan strategis.",
        category: "Enterprising"
    },
    {
        id: 70,
        question: "Saya suka menjual produk, ide, atau layanan kepada orang lain.",
        category: "Enterprising"
    },
    {
        id: 71,
        question: "Saya memiliki minat untuk memulai bisnis sendiri atau menjadi pengusaha.",
        category: "Enterprising"
    },
    {
        id: 72,
        question: "Saya senang bernegosiasi, mempengaruhi orang lain, dan mencapai target yang menantang.",
        category: "Enterprising"
    },
    {
        id: 73,
        question: "Saya lebih suka bekerja di lingkungan yang dinamis dan kompetitif daripada yang stabil dan rutin.",
        category: "Enterprising"
    },
    {
        id: 74,
        question: "Saya merasa percaya diri ketika harus mempresentasikan ide atau produk di depan banyak orang.",
        category: "Enterprising"
    },
    {
        id: 75,
        question: "Saya tertarik untuk bekerja di bidang marketing, sales, atau business development.",
        category: "Enterprising"
    },
    {
        id: 76,
        question: "Saya lebih suka mengambil risiko untuk mencapai kesuksesan yang lebih besar.",
        category: "Enterprising"
    },
    {
        id: 77,
        question: "Saya senang mengatur strategi bisnis dan membuat rencana untuk mencapai tujuan.",
        category: "Enterprising"
    },
    {
        id: 78,
        question: "Saya tertarik untuk mempelajari entrepreneurship, manajemen, atau bisnis.",
        category: "Enterprising"
    },
    {
        id: 79,
        question: "Saya lebih suka posisi leadership daripada menjadi anggota tim biasa.",
        category: "Enterprising"
    },
    {
        id: 80,
        question: "Saya senang berkompetisi dan berusaha menjadi yang terbaik di bidang saya.",
        category: "Enterprising"
    },
    {
        id: 81,
        question: "Saya tertarik untuk bekerja di bidang public relations atau event management.",
        category: "Enterprising"
    },
    {
        id: 82,
        question: "Saya merasa termotivasi ketika ada target atau goal yang harus dicapai.",
        category: "Enterprising"
    },
    {
        id: 83,
        question: "Saya lebih suka pekerjaan yang memberikan peluang untuk naik jabatan dengan cepat.",
        category: "Enterprising"
    },
    {
        id: 84,
        question: "Saya senang membuat keputusan penting yang berdampak besar terhadap organisasi atau tim.",
        category: "Enterprising"
    },

    // CONVENTIONAL (16 pertanyaan)
    {
        id: 85,
        question: "Saya lebih nyaman bekerja dengan data terstruktur, angka, dan mengikuti prosedur yang jelas.",
        category: "Conventional"
    },
    {
        id: 86,
        question: "Saya suka mengorganisir informasi, membuat laporan, atau mengelola dokumen dengan rapi.",
        category: "Conventional"
    },
    {
        id: 87,
        question: "Saya tertarik pada bidang akuntansi, administrasi, atau manajemen data.",
        category: "Conventional"
    },
    {
        id: 88,
        question: "Saya lebih suka bekerja di lingkungan yang teratur dan dapat diprediksi daripada yang tidak menentu.",
        category: "Conventional"
    },
    {
        id: 89,
        question: "Saya merasa nyaman ketika tugas-tugas saya jelas, terstruktur, dan memiliki deadline yang pasti.",
        category: "Conventional"
    },
    {
        id: 90,
        question: "Saya senang bekerja dengan spreadsheet, database, atau sistem manajemen informasi.",
        category: "Conventional"
    },
    {
        id: 91,
        question: "Saya tertarik untuk bekerja di bidang perbankan, keuangan, atau perpajakan.",
        category: "Conventional"
    },
    {
        id: 92,
        question: "Saya lebih suka mengikuti prosedur standar daripada mencari cara baru yang belum teruji.",
        category: "Conventional"
    },
    {
        id: 93,
        question: "Saya senang melakukan pekerjaan administratif seperti filing, data entry, atau record keeping.",
        category: "Conventional"
    },
    {
        id: 94,
        question: "Saya tertarik untuk mempelajari sistem akuntansi, audit, atau manajemen keuangan.",
        category: "Conventional"
    },
    {
        id: 95,
        question: "Saya lebih suka pekerjaan yang memiliki rutinitas dan jadwal yang teratur.",
        category: "Conventional"
    },
    {
        id: 96,
        question: "Saya senang memastikan semua detail sudah benar dan tidak ada yang terlewat.",
        category: "Conventional"
    },
    {
        id: 97,
        question: "Saya tertarik untuk bekerja sebagai sekretaris, administrator, atau office manager.",
        category: "Conventional"
    },
    {
        id: 98,
        question: "Saya merasa puas ketika bisa menyelesaikan tugas dengan akurat dan tepat waktu.",
        category: "Conventional"
    },
    {
        id: 99,
        question: "Saya lebih suka lingkungan kerja yang stabil dengan aturan dan prosedur yang jelas.",
        category: "Conventional"
    },
    {
        id: 100,
        question: "Saya senang bekerja dengan angka, statistik, dan menganalisis data keuangan.",
        category: "Conventional"
    }
];

// Deskripsi Kategori RIASEC
const riasecCategories = {
    Realistic: {
        name: "Realistic (Realistis)",
        shortName: "R",
        description: "Orang yang praktis, mekanis, dan suka bekerja dengan tangan. Cocok untuk karir di bidang teknik, konstruksi, atau pertanian.",
        careers: ["Teknik Mesin", "Arsitektur", "Pertanian", "Teknisi", "Pilot", "Insinyur Sipil", "Montir", "Tukang Kayu"]
    },
    Investigative: {
        name: "Investigative (Investigatif)",
        shortName: "I",
        description: "Orang yang analitis, intelektual, dan suka meneliti. Cocok untuk karir di bidang sains, penelitian, atau teknologi.",
        careers: ["Peneliti", "Dokter", "Ilmuwan", "Programmer", "Analis Data", "Fisikawan", "Kimiawan", "Ahli Statistik"]
    },
    Artistic: {
        name: "Artistic (Artistik)",
        shortName: "A",
        description: "Orang yang kreatif, ekspresif, dan suka menciptakan. Cocok untuk karir di bidang seni, desain, atau media.",
        careers: ["Desainer", "Musisi", "Penulis", "Fotografer", "Art Director", "Animator", "Content Creator", "Arsitek Interior"]
    },
    Social: {
        name: "Social (Sosial)",
        shortName: "S",
        description: "Orang yang suka membantu, mengajar, dan bekerja dengan orang lain. Cocok untuk karir di bidang pendidikan, kesehatan, atau pelayanan.",
        careers: ["Guru", "Konselor", "Perawat", "Psikolog", "Pekerja Sosial", "Dokter", "Terapis", "HRD"]
    },
    Enterprising: {
        name: "Enterprising (Wirausaha)",
        shortName: "E",
        description: "Orang yang ambisius, persuasif, dan suka memimpin. Cocok untuk karir di bidang bisnis, penjualan, atau manajemen.",
        careers: ["Pengusaha", "Manajer", "Sales", "Marketing", "Konsultan", "Public Relations", "Event Organizer", "Business Development"]
    },
    Conventional: {
        name: "Conventional (Konvensional)",
        shortName: "C",
        description: "Orang yang terorganisir, detail-oriented, dan suka bekerja dengan data. Cocok untuk karir di bidang administrasi, akuntansi, atau keuangan.",
        careers: ["Akuntan", "Sekretaris", "Bankir", "Administrator", "Analis Keuangan", "Auditor", "Data Entry", "Administrasi Perkantoran"]
    }
};
