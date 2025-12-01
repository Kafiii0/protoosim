// public/script.js (KODE LENGKAP FINAL - TERMASUK EKSKUL & BEASISWA)

// --- SANITY CONFIGURATION ---
const projectId = 'a9t5rw7s'; // GANTI DENGAN PROJECT ID KAMU JIKA BERBEDA
const dataset = 'production'; 
const apiVersion = 'v2021-10-26'; 
const apiUrl = `https://${projectId}.api.sanity.io/${apiVersion}/data/query/${dataset}`;

// GROQ Queries
const groqHomepageQuery = encodeURIComponent(
    // PASTIKAN isMaintenanceMode di-fetch di sini
    `*[_type == "homepage"][0]{isMaintenanceMode, heroTitle, heroSubtitle, heroImage, aboutUsText, visionText, missionText}` 
);

const koorbidListQuery = encodeURIComponent(
    `*[_type == "koordinatorBidang"]{title, koorbidIcon, slug}` 
);

const welcomeSpeechQuery = encodeURIComponent(
    `*[_type == "welcomeSpeech"][0]{videoUrl, speechText, speakerName, speakerTitle}` 
);

const galleryQuery = encodeURIComponent(
    `*[_type == "galleryImage"] | order(_createdAt desc) {caption, imageFile}` 
);

const changelogQuery = encodeURIComponent(
    `*[_type == "changelogEntry"] | order(date desc) {date, featureName, description, status}`
);

const informationQuery = encodeURIComponent(
    `*[_type == "informationPost"] | order(publishedAt desc) {title, publishedAt, slug}`
);

const upcomingEventQuery = encodeURIComponent(
    `*[_type == "upcomingEvent" && eventDateTime > now()] | order(eventDateTime asc) {
        title, slug, eventDateTime, location, mainImage, description
    }`
);

const tesMinatBakatQuery = encodeURIComponent(
    `*[_type == "tesMinatBakat"][0]{
        judul,
        deskripsi,
        soal[]{
            pertanyaan,
            opsi
        }
    }`
);

const developerProfileQuery = encodeURIComponent(
    `*[_type == "developerProfile"][0]{
        name, 
        role, 
        bio, 
        skills, 
        socials,
        "photoUrl": profileImage.asset._ref
    }`
);

const archiveDocumentQuery = encodeURIComponent(
    `*[_type == "archiveDocument"] | order(masaJabatan desc) {
        title, masaJabatan, description, documentFile, "fileUrl": documentFile.asset->url
    }`
);

// public/script.js
const osimMemberQuery = encodeURIComponent(
    `*[_type == "osimMember"]{
        name, position, division, photo, "photoUrl": photo.asset._ref 
    }`
);

const schoolPolicyQuery = encodeURIComponent(
    `*[_type == "schoolPolicy"][0]{policyTitle, policyGroups}`
);

// QUERY DIPERBARUI: Mengambil photoRef (Asset Reference ID)
const alumniDirectoryQuery = encodeURIComponent(
    `*[_type == "alumni" && isFeatured == true] | order(graduationYear desc) {
        name, graduationYear, currentJob, currentLocation, major, contactEmail, socialMedia, currentEducationInstitution, profilePhoto, coordinates, "photoRef": profilePhoto.asset._ref 
    }`
);


// --- KODE EKSKUL (DENGAN PERBAIKAN) ---
const ekskulListQuery = encodeURIComponent(
    `*[_type == "ekstrakurikuler"] | order(title asc) {
        title, slug, "logoRef": logo.asset._ref
    }`
);

const ekskulDetailQuery = (slug) => encodeURIComponent(
    `*[_type == "ekstrakurikuler" && slug.current == "${slug}"][0]{
        title,
        pembimbing,
        struktur,
        tujuan,
        jadwalLatihan,
        lokasiParade,
        prestasi,
        requirement,
        linkFormulir,
        "logoRef": logo.asset._ref
    }`
);

// --- KODE BARU UNTUK BEASISWA ---
const beasiswaListQuery = encodeURIComponent(
    `*[_type == "beasiswa" && deadline > now()] | order(deadline asc) {
        title, slug, penyelenggara, deadline, "posterRef": poster.asset._ref
    }`
);

const beasiswaDetailQuery = (slug) => encodeURIComponent(
    `*[_type == "beasiswa" && slug.current == "${slug}"][0]{
        title,
        penyelenggara,
        deadline,
        cakupan,
        deskripsi,
        linkPendaftaran,
        "posterRef": poster.asset._ref
    }`
);
// --- END KODE BARU ---

// --- [START] FUNGSI KOMPETISI (BARU) ---

// 1. Query GROQ
const kompetisiListQuery = encodeURIComponent(
    `*[_type == "kompetisi" && deadline > now()] | order(deadline asc) {
        title, slug, penyelenggara, deadline, "posterRef": poster.asset._ref
    }`
);

const kompetisiDetailQuery = (slug) => encodeURIComponent(
    `*[_type == "kompetisi" && slug.current == "${slug}"][0]{
        title,
        penyelenggara,
        deadline,
        kategori,
        tingkat,
        tanggalPelaksanaan,
        deskripsi,
        linkPendaftaran,
        linkPanduan,
        narahubungInternal,
        "posterRef": poster.asset._ref
    }`
);

// 2. Fungsi Fetch List
async function fetchKompetisiList() {
    const container = document.getElementById('kompetisi-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${kompetisiListQuery}`);
        if (!response.ok) throw new Error(`Gagal fetch list kompetisi.`);
        
        const result = await response.json();
        const kompetisiList = result.result;

        container.innerHTML = '';

        if (kompetisiList.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada informasi kompetisi terbaru saat ini. Cek lagi nanti!</p>';
            return;
        }

        kompetisiList.forEach(item => {
            let imageUrl = 'https://via.placeholder.com/400x225?text=Poster+Kompetisi'; 
            if (item.posterRef) {
                imageUrl = `${buildImageUrl(item.posterRef)}?w=400&h=225&fit=crop&auto=format&q=75`;
            }
            
            const cardHtml = `
                <div class="event-card" onclick="openKompetisiDetail('${item.slug.current}')">
                    <div class="event-image-wrapper">
                        <img src="${imageUrl}" alt="Poster ${item.title}">
                    </div>
                    <div class="event-content">
                        <div>
                            <h3>${item.title}</h3>
                            <p class="event-location">${item.penyelenggara || 'N/A'}</p>
                            <p class="click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 0.5rem;">[Lihat Detail →]</p>
                        </div>
                    </div>
                    <div class="countdown-container">
                        <p style="margin:0; font-size: 0.9rem;">${formatDeadline(item.deadline)}</p>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Kompetisi List:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat daftar kompetisi. Periksa koneksi Sanity.</p>';
    }
}

// --- [TAMBAHAN DI BAGIAN QUERIES] ---

const universityListQuery = encodeURIComponent(
    `*[_type == "university"] | order(name asc) {
        name, slug, location, ranking, "logoUrl": logo.asset->url
    }`
);

const universityDetailQuery = (slug) => encodeURIComponent(
    `*[_type == "university" && slug.current == "${slug}"][0]{
        name, location, website, ranking, details, description, "logoUrl": logo.asset->url
    }`
);

const prestasiListQuery = encodeURIComponent(
    `*[_type == "siswaBerprestasi"] | order(tahun desc, _createdAt desc) {
        nama, kelas, namaPrestasi, namaLomba, tingkat, penyelenggara, tahun, 
        "fotoRef": foto.asset._ref
    }`
);

const alumniByUnivQuery = (univName) => encodeURIComponent(
    `*[_type == "alumni" && currentEducationInstitution == "${univName}"] {
        name, graduationYear, major, contactEmail, socialMedia, "photoRef": profilePhoto.asset._ref
    }`
);

const lowonganListQuery = encodeURIComponent(
    `*[_type == "lowonganKerja" && deadline > now()] | order(deadline asc) {
        judulPosisi, slug, perusahaan, tipeKerja, lokasi, isRemote, gaji, deadline, 
        tingkatPendidikan, kategori, isPrioritasAlumni,
        "logoRef": logoPerusahaan.asset._ref
    }`
);

const lowonganDetailQuery = (slug) => encodeURIComponent(
    `*[_type == "lowonganKerja" && slug.current == "${slug}"][0]{
        judulPosisi, perusahaan, tipeKerja, lokasi, isRemote, gaji, deadline,
        deskripsiPekerjaan, kualifikasi, benefitTambahan, linkApply, kontakPelamar,
        isPrioritasAlumni, tingkatPendidikan, kategori,
        "logoRef": logoPerusahaan.asset._ref
    }`
);
// --- [TAMBAHAN FUNGSI BARU] ---

// 1. Fetch List Universitas
async function fetchUniversityList() {
    const container = document.getElementById('univ-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${universityListQuery}`);
        const result = await response.json();
        const list = result.result;

        if (!list || list.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada data universitas.</p>';
            return;
        }

        container.innerHTML = list.map(univ => `
            <div class="univ-card" onclick="openUnivDetail('${univ.slug.current}')">
                <img src="${univ.logoUrl ? univ.logoUrl : 'https://via.placeholder.com/100?text=UNIV'}" alt="${univ.name}" class="univ-logo">
                <span class="univ-rank">${univ.ranking || 'Kampus Unggulan'}</span>
                <h3>${univ.name}</h3>
                <p class="univ-location">📍 ${univ.location || 'Indonesia'}</p>
                <p class="click-indicator" style="margin-top:auto; font-size:0.85rem; color:#008940;">[Lihat Detail & Alumni]</p>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error fetching universities:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat data universitas.</p>';
    }
}

// 2. Buka Detail Universitas + Load Alumni
window.openUnivDetail = async function(slug) {
    document.getElementById('univ-main-content').style.display = 'none';
    const detailContent = document.getElementById('univ-detail-content');
    const renderEl = document.getElementById('univ-detail-render');
    const alumniContainer = document.getElementById('univ-alumni-container');
    
    detailContent.style.display = 'block';
    renderEl.innerHTML = '<p>Memuat data kampus...</p>';
    alumniContainer.innerHTML = '<p>Mencari alumni di kampus ini...</p>';
    window.scrollTo(0, 0);

    try {
        // A. Ambil Detail Kampus
        const res = await fetch(`${apiUrl}?query=${universityDetailQuery(slug)}`);
        const { result: univ } = await res.json();

        if (univ) {
            renderEl.innerHTML = `
                <div class="koorbid-detail-header">
                    <img src="${univ.logoUrl ? univ.logoUrl : ''}" style="width:150px; margin-bottom:1rem;">
                    <h1 class="detail-title">${univ.name}</h1>
                    <p style="font-size:1.2rem; color:#666;">📍 ${univ.location || '-'}</p>
                </div>
                
                <div class="detail-section" style="text-align:center;">
                    ${univ.website ? `<a href="${univ.website}" target="_blank" class="cta-button">Kunjungi Website Resmi</a>` : ''}
                    <div style="margin-top: 2rem; text-align: left;">
                        ${renderPortableText(univ.details) || `<p>${univ.description || 'Belum ada informasi detail.'}</p>`}
                    </div>
                </div>
            `;

            // B. Ambil Alumni di Kampus Ini (Chain Request)
            // Kita gunakan nama universitas untuk mencari di field 'currentEducationInstitution' alumni
            fetchAlumniByUniv(univ.name, alumniContainer);
            
        } else {
            renderEl.innerHTML = '<p>Data universitas tidak ditemukan.</p>';
        }
    } catch (error) {
        console.error("Error detail univ:", error);
    }
}

async function fetchAlumniByUniv(univName, container) {
    try {
        const res = await fetch(`${apiUrl}?query=${alumniByUnivQuery(univName)}`);
        const { result: alumniList } = await res.json();

        if (!alumniList || alumniList.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">Belum ada data alumni yang terdaftar di ${univName}.</p>`;
            return;
        }

        // Render kartu alumni (Reuse style yang ada)
        container.innerHTML = alumniList.map(a => `
            <div class="alumni-card">
                <img src="${a.photoRef ? buildImageUrl(a.photoRef)+'?w=100&h=100&fit=crop' : 'https://via.placeholder.com/100'}" class="alumni-photo">
                <h4>${a.name}</h4>
                <p style="font-size:0.9rem; font-weight:bold; color:#008940">${a.major || 'Mahasiswa'}</p>
                <div style="margin-top:10px; font-size:0.85rem;">
                    ${a.contactEmail ? `📧 ${a.contactEmail}<br>` : ''}
                    ${a.socialMedia ? `<a href="${a.socialMedia}" target="_blank">🔗 Hubungi</a>` : ''}
                </div>
                <p style="font-size:0.8rem; color:#999; margin-top:5px;">Lulus MAN 1: ${a.graduationYear}</p>
            </div>
        `).join('');

    } catch (e) {
        container.innerHTML = '<p>Gagal memuat data alumni.</p>';
    }
}

window.closeUnivDetail = function() {
    document.getElementById('univ-detail-content').style.display = 'none';
    document.getElementById('univ-main-content').style.display = 'block';
    window.scrollTo(0, 0);
}

// 3. Fungsi Buka Detail
window.openKompetisiDetail = async function(slug) {
    document.getElementById('kompetisi-main-content').style.display = 'none';
    
    const detailContent = document.getElementById('kompetisi-detail-content');
    const detailRender = document.getElementById('kompetisi-detail-render');
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail kompetisi...</p>';
    window.scrollTo(0, 0); 

    try {
        const response = await fetch(`${apiUrl}?query=${kompetisiDetailQuery(slug)}`);
        if (!response.ok) throw new Error(`Gagal fetch detail kompetisi.`);
        
        const result = await response.json();
        const kompetisi = result.result;

        if (kompetisi) {
            const deskripsiHtml = renderPortableText(kompetisi.deskripsi);
            
            let posterUrl = 'https://via.placeholder.com/800x450?text=Poster+Kompetisi'; 
            if (kompetisi.posterRef) {
                posterUrl = `${buildImageUrl(kompetisi.posterRef)}?w=800&fit=scale&auto=format&q=85`;
            }

            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <h1 class="detail-title">${kompetisi.title}</h1>
                    <p style="font-size: 1.2rem; margin-top: -1rem; margin-bottom: 1rem;">Penyelenggara: <strong>${kompetisi.penyelenggara || 'N/A'}</strong></p>
                    
                    <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <span style="background: #e6ffe6; color: #008940; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${kompetisi.kategori || 'Umum'}</span>
                        <span style="background: #fff3cd; color: #856404; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${kompetisi.tingkat || 'Nasional'}</span>
                    </div>

                    <img src="${posterUrl}" alt="${kompetisi.title}" class="detail-image-full" style="max-width: 600px; width: 100%;">
                </div>
                
                <div class="detail-section" style="text-align: center; padding: 2rem; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    ${kompetisi.linkPendaftaran ? `
                        <a href="${kompetisi.linkPendaftaran}" target="_blank" class="cta-button" style="background-color: #008940; color: white;">
                            🔗 Daftar Sekarang
                        </a>
                    ` : ''}
                    ${kompetisi.linkPanduan ? `
                        <a href="${kompetisi.linkPanduan}" target="_blank" class="cta-button" style="background-color: #34495e; color: white;">
                            📖 Buku Panduan (Juknis)
                        </a>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h3>Jadwal Penting</h3>
                    <p><strong>Batas Akhir Pendaftaran:</strong> ${formatDeadline(kompetisi.deadline)}</p>
                    <p><strong>Pelaksanaan Lomba:</strong> ${kompetisi.tanggalPelaksanaan || 'Akan diinformasikan'}</p>
                </div>
                
                ${kompetisi.narahubungInternal ? `
                    <div class="detail-section" style="background-color: #f0f8ff; border-left: 5px solid #008940;">
                        <h3>Info Sekolah</h3>
                        <p>${kompetisi.narahubungInternal}</p>
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h3>Deskripsi & Ketentuan</h3>
                    <div class="functions-list">
                        ${deskripsiHtml || '<p>Deskripsi belum diisi.</p>'}
                    </div>
                </div>
            `;
            
        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail kompetisi tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail Kompetisi:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail. Periksa koneksi API Sanity Anda.</p>';
    }
}



// 4. Fungsi Tutup Detail
window.closeKompetisiDetail = function() {
    document.getElementById('kompetisi-detail-content').style.display = 'none';
    document.getElementById('kompetisi-main-content').style.display = 'block';
    window.scrollTo(0, 0); 
}
// --- [END] FUNGSI KOMPETISI ---

let globalArchiveDocuments = [];
let alumniDataCache = []; // Cache data alumni
let mapLoadAttempt = 0; // Hitungan percobaan load peta


// --- FUNGSI KRITIS: CEK MAINTENANCE MODE DAN BYPASS DEVELOPER ---
async function checkMaintenanceMode() {
    // 1. KUNCI RAHASIA: Cek apakah parameter URL '?dev09=true' ada
    const urlParams = new URLSearchParams(window.location.search);
    const isDeveloperBypass = urlParams.get('dev09') === 'true';

    // Jika dev bypass aktif, JANGAN LAKUKAN REDIRECT
    if (isDeveloperBypass) {
        console.warn("DEVELOPER BYPASS MODE ACTIVE: Maintenance Mode diabaikan.");
        return false;
    }
async function fetchLowonganList() {
    const container = document.getElementById('lowongan-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${lowonganListQuery}`);
        
        if (!response.ok) {
            throw new Error(`Gagal fetch lowongan. Status: ${response.status}`);
        }

        const result = await response.json();
        const lowonganList = result.result;
        
        globalLowonganData = lowonganList; // Simpan untuk filter
        renderLowonganList(lowonganList);

    } catch (error) {
        console.error("Kesalahan Fetch Lowongan:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat data lowongan. Periksa koneksi Sanity.</p>';
    }
}
    // Daftar halaman yang dikecualikan dari redirect
    const maintenancePageNames = ['maintenance.html', 'under_development.html', 'pemeliharaan.html'];
    const isMaintenancePage = maintenancePageNames.some(name => window.location.pathname.includes(name));

    // Query hanya untuk mengambil status maintenance
    const maintenanceQuery = encodeURIComponent(
        `*[_type == "homepage"][0]{isMaintenanceMode}`
    );
    
    try {
        const response = await fetch(`${apiUrl}?query=${maintenanceQuery}`);
        const result = await response.json();
        const status = result.result; 

        if (status && status.isMaintenanceMode) {
            // Jika mode aktif dan kita TIDAK di halaman maintenance, lakukan redirect
            if (!isMaintenancePage) {
                window.location.replace('maintenance.html');
                return true;
            }
        } else {
            // Jika mode TIDAK aktif dan kita BERADA di halaman maintenance, redirect ke home
            if (isMaintenancePage) {
                window.location.replace('index.html');
                return true;
            }
        }

    } catch (error) {
        console.error("Gagal cek maintenance mode:", error);
    }
    return false;
}
// ------------------------------------------

// --- FUNGSI HELPER: MEMBUAT URL GAMBAR DARI ASSET ID ---
// === [START] FUNGSI YANG DIPERBAIKI (FIX BUG LOGO) ===
function buildImageUrl(imageAssetId) {
    if (!imageAssetId || !imageAssetId.startsWith('image-')) {
        return ''; // Kembalikan string kosong jika ID tidak valid
    }

    // 1. Hapus 'image-' dari bagian depan
    const trimmedId = imageAssetId.substring(6); // 'image-'.length === 6

    // 2. Cari index dari tanda '-' terakhir
    const lastDashIndex = trimmedId.lastIndexOf('-');
    if (lastDashIndex === -1) {
        return ''; // Format tidak valid (misal: 'image-abc')
    }

    // 3. Pisahkan nama file dan format
    const filename = trimmedId.substring(0, lastDashIndex);
    const format = trimmedId.substring(lastDashIndex + 1);

    // 4. Gabungkan kembali dengan tanda '.'
    const properFilename = `${filename}.${format}`;
    
    // 5. Kembalikan URL CDN lengkap
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${properFilename}`;
}
// === [END] FUNGSI YANG DIPERBAIKI ===
function renderLowonganList(lowonganList) {
    const container = document.getElementById('lowongan-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (!lowonganList || lowonganList.length === 0) {
        container.innerHTML = '<p class="section-lead">Tidak ada lowongan yang sesuai dengan filter Anda saat ini.</p>';
        return;
    }

    container.innerHTML = lowonganList.map(item => {
        const logoUrl = item.logoRef 
            ? `${buildImageUrl(item.logoRef)}?w=80&h=80&fit=crop&auto=format&q=75`
            : 'https://via.placeholder.com/80?text=LOGO';

        const remoteBadge = item.isRemote 
            ? '<span class="badge-remote">🌍 Remote</span>' 
            : '';

        const priorityBadge = item.isPrioritasAlumni 
            ? '<span class="badge-priority">⭐ Prioritas Alumni</span>' 
            : '';

        const kategoriBadges = item.kategori 
            ? item.kategori.map(kat => `<span class="badge-kategori">${kat}</span>`).join('')
            : '';

        return `
            <div class="lowongan-card" onclick="openLowonganDetail('${item.slug.current}')">
                <div class="lowongan-header">
                    <img src="${logoUrl}" alt="${item.perusahaan}" class="lowongan-logo">
                    <div class="lowongan-header-text">
                        <h3>${item.judulPosisi}</h3>
                        <p class="lowongan-company">${item.perusahaan}</p>
                    </div>
                </div>
                
                <div class="lowongan-badges">
                    <span class="badge-tipe badge-${item.tipeKerja.toLowerCase().replace('-', '')}">${item.tipeKerja}</span>
                    ${remoteBadge}
                    ${priorityBadge}
                </div>

                <div class="lowongan-info">
                    <p>📍 ${item.lokasi}</p>
                    <p>💰 ${item.gaji || 'Kompetitif'}</p>
                    <p>🎓 Min. ${item.tingkatPendidikan}</p>
                </div>

                <div class="lowongan-kategori">
                    ${kategoriBadges}
                </div>

                <div class="lowongan-deadline">
                    <p style="margin:0; font-size: 0.85rem; color: #dc3545;">⏰ Batas: ${formatDeadline(item.deadline)}</p>
                </div>

                <p class="click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 1rem;">[Lihat Detail & Apply →]</p>
            </div>
        `;
    }).join('');
}

window.filterLowongan = function() {
    const tipeFilter = document.getElementById('filter-tipe').value;
    const kategoriFilter = document.getElementById('filter-kategori').value;

    let filtered = globalLowonganData;

    // Filter berdasarkan Tipe Kerja
    if (tipeFilter !== 'all') {
        filtered = filtered.filter(item => item.tipeKerja === tipeFilter);
    }

    // Filter berdasarkan Kategori
    if (kategoriFilter !== 'all') {
        filtered = filtered.filter(item => 
            item.kategori && item.kategori.includes(kategoriFilter)
        );
    }

    renderLowonganList(filtered);
}

window.resetFilter = function() {
    document.getElementById('filter-tipe').value = 'all';
    document.getElementById('filter-kategori').value = 'all';
    renderLowonganList(globalLowonganData);
}

window.openLowonganDetail = async function(slug) {
    document.getElementById('lowongan-main-content').style.display = 'none';
    
    const detailContent = document.getElementById('lowongan-detail-content');
    const detailRender = document.getElementById('lowongan-detail-render');
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail lowongan...</p>';
    window.scrollTo(0, 0);

    try {
        const response = await fetch(`${apiUrl}?query=${lowonganDetailQuery(slug)}`);
        
        if (!response.ok) {
            throw new Error(`Gagal fetch detail. Status: ${response.status}`);
        }

        const result = await response.json();
        const lowongan = result.result;

        if (lowongan) {
            const deskripsiHtml = renderPortableText(lowongan.deskripsiPekerjaan);
            const kualifikasiHtml = renderPortableText(lowongan.kualifikasi);
            const benefitHtml = lowongan.benefitTambahan 
                ? renderPortableText(lowongan.benefitTambahan) 
                : '<p>Tidak disebutkan.</p>';

            const logoUrl = lowongan.logoRef 
                ? `${buildImageUrl(lowongan.logoRef)}?w=150&h=150&fit=scale&auto=format&q=80`
                : 'https://via.placeholder.com/150?text=LOGO';

            const remoteBadge = lowongan.isRemote 
                ? '<span class="badge-remote" style="font-size: 1rem; padding: 8px 15px;">🌍 Remote Friendly</span>' 
                : '';

            const priorityBadge = lowongan.isPrioritasAlumni 
                ? '<span class="badge-priority" style="font-size: 1rem; padding: 8px 15px;">⭐ Prioritas Alumni MAN 1</span>' 
                : '';

            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <img src="${logoUrl}" alt="${lowongan.perusahaan}" style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 1rem; border-radius: 8px; background: white; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 class="detail-title">${lowongan.judulPosisi}</h1>
                    <p style="font-size: 1.3rem; margin-top: -1rem; margin-bottom: 1rem;"><strong>${lowongan.perusahaan}</strong></p>
                    
                    <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <span class="badge-tipe badge-${lowongan.tipeKerja.toLowerCase().replace('-', '')}" style="font-size: 1rem; padding: 8px 15px;">${lowongan.tipeKerja}</span>
                        ${remoteBadge}
                        ${priorityBadge}
                    </div>
                </div>

                <div class="detail-section" style="text-align: center; padding: 2rem;">
                    <a href="${lowongan.linkApply}" target="_blank" class="cta-button" style="background-color: #008940; color: white; font-size: 1.1rem; padding: 15px 40px;">
                        📝 Apply Sekarang
                    </a>
                </div>

                <div class="detail-section">
                    <h3>Informasi Penting</h3>
                    <p><strong>Lokasi:</strong> ${lowongan.lokasi}${lowongan.isRemote ? ' (Bisa Remote)' : ''}</p>
                    <p><strong>Gaji/Benefit:</strong> ${lowongan.gaji || 'Kompetitif'}</p>
                    <p><strong>Minimal Pendidikan:</strong> ${lowongan.tingkatPendidikan}</p>
                    <p><strong>Batas Pendaftaran:</strong> ${formatDeadline(lowongan.deadline)}</p>
                    ${lowongan.kontakPelamar ? `<p><strong>Kontak Pertanyaan:</strong> ${lowongan.kontakPelamar}</p>` : ''}
                </div>

                <div class="detail-section">
                    <h3>Deskripsi Pekerjaan</h3>
                    <div class="functions-list">
                        ${deskripsiHtml}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Kualifikasi & Persyaratan</h3>
                    <div class="functions-list">
                        ${kualifikasiHtml}
                    </div>
                </div>

                ${lowongan.benefitTambahan ? `
                    <div class="detail-section" style="background-color: #e6ffe6; border-left: 5px solid #008940;">
                        <h3>Benefit Tambahan</h3>
                        <div class="functions-list">
                            ${benefitHtml}
                        </div>
                    </div>
                ` : ''}

                <div class="detail-section" style="text-align: center; padding: 2rem;">
                    <a href="${lowongan.linkApply}" target="_blank" class="cta-button" style="background-color: #008940; color: white; font-size: 1.1rem; padding: 15px 40px;">
                        📝 Apply Sekarang
                    </a>
                </div>
            `;

        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail lowongan tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Fetch Detail Lowongan:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail lowongan.</p>';
    }
}

window.closeLowonganDetail = function() {
    document.getElementById('lowongan-detail-content').style.display = 'none';
    document.getElementById('lowongan-main-content').style.display = 'block';
    window.scrollTo(0, 0);
}

// --- FUNGSI HELPER: MENGUBAH URL YOUTUBE KE EMBED URL ---
function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v')) {
            const videoId = urlObj.searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.pathname.substring(1);
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (e) {
        return '';
    }
    return '';
}

// --- FUNGSI HELPER: RENDER PORTABLE TEXT SEDERHANA ---
const renderPortableText = (blocks) => {
    if (!blocks || blocks.length === 0) return '';
    
    let html = '';
    let isListOpen = false; 
    let currentListType = ''; 

    blocks.forEach(block => {
        if (block._type !== 'block' || !block.children) return;

        const text = block.children.map(span => {
            let content = span.text;
            if (span.marks && span.marks.length > 0) {
                span.marks.forEach(mark => {
                    if (mark === 'strong') content = `<strong>${content}</strong>`;
                    if (mark === 'em') content = `<em>${content}</em>`;
                });
            }
            return content;
        }).join('');
        
        const isListItem = block.listItem;
        const listItemType = block.listItem; 

        if (isListItem) {
            if (!isListOpen || listItemType !== currentListType) {
                if (isListOpen) {
                    html += currentListType === 'number' ? '</ol>' : '</ul>';
                }
                const listTag = listItemType === 'number' ? 'ol' : 'ul';
                html += `<${listTag}>`;
                isListOpen = true;
                currentListType = listItemType;
            }
            html += `<li>${text}</li>`;
        } else {
            if (isListOpen) {
                html += currentListType === 'number' ? '</ol>' : '</ul>';
                isListOpen = false;
                currentListType = '';
            }
            html += `<p>${text}</p>`;
        }
    });
    
    if (isListOpen) {
        html += currentListType === 'number' ? '</ol>' : '</ul>';
    }
    
    return html;
};

// --- FUNGSI BARU: MENAMPILKAN STATUS SISTEM ---
function displaySystemStatus() {
    const statusContainer = document.getElementById('system-status-container');
    if (!statusContainer) return;
    
    statusContainer.innerHTML = `All Systems Normal`;
    statusContainer.style.color = '#008940'; 
    statusContainer.classList.add('system-status-indicator');
}

// --- FUNGSI: UPDATE LIVE TIME ---
function updateLiveTime() {
    const timeElement = document.getElementById('live-time');
    if (!timeElement) return;

    function formatTime(date) {
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const datePart = date.toLocaleDateString('id-ID', dateOptions);
        const timePart = date.toLocaleTimeString('id-ID', timeOptions);
        
        return `${datePart} | ${timePart} WIB`;
    }

    function tick() {
        const now = new Date();
        timeElement.innerText = formatTime(now);
    }

    tick();
    setInterval(tick, 1000); 
}

async function fetchPrestasiList() {
    const container = document.getElementById('prestasi-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${prestasiListQuery}`);
        
        if (!response.ok) {
            throw new Error(`Gagal fetch prestasi. Status: ${response.status}`);
        }

        const result = await response.json();
        const list = result.result;

        container.innerHTML = '';

        if (!list || list.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada data prestasi siswa.</p>';
            return;
        }

        // Render kartu prestasi
        container.innerHTML = list.map(item => {
            const fotoUrl = item.fotoRef 
                ? `${buildImageUrl(item.fotoRef)}?w=400&h=250&fit=crop&auto=format&q=75`
                : 'https://via.placeholder.com/400x250?text=Foto+Prestasi';

            // Tentukan warna badge berdasarkan tingkat
            const badgeColors = {
                'Internasional': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
                'Nasional': 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;',
                'Provinsi': 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;',
                'Kota': 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;',
                'Lainnya': 'background: #e0e0e0; color: #333;'
            };

            const badgeStyle = badgeColors[item.tingkat] || badgeColors['Lainnya'];

            return `
                <div class="prestasi-card">
                    <span class="prestasi-badge" style="${badgeStyle}">${item.tingkat || 'Umum'}</span>
                    <div class="prestasi-img-wrapper">
                        <img src="${fotoUrl}" class="prestasi-img" alt="${item.nama}">
                    </div>
                    <div class="prestasi-content">
                        <h3 class="prestasi-title">${item.namaPrestasi}</h3>
                        <span class="prestasi-event">${item.namaLomba}</span>
                        <span class="prestasi-student">${item.nama}${item.kelas ? ' (' + item.kelas + ')' : ''}</span>
                        <span class="prestasi-year">${item.tahun}${item.penyelenggara ? ' | ' + item.penyelenggara : ''}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Kesalahan Fetch Prestasi:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat data prestasi siswa. Periksa koneksi Sanity.</p>';
    }
}
// --- FUNGSI UTAMA 1: FETCH DATA HOMEPAGE (Hero, About, Visi Misi) ---
async function fetchHomepageContent() {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const aboutText = document.getElementById('about-text');
    const visiText = document.getElementById('visi-text');
    const misiText = document.getElementById('misi-text');

    if (heroTitle) heroTitle.innerText = "Memuat Konten...";
    if (heroSubtitle) heroSubtitle.innerText = "Harap tunggu sebentar...";
    if (aboutText) aboutText.innerText = "Memuat deskripsi...";
    if (visiText) visiText.innerText = "Memuat Visi...";
    if (misiText) misiText.innerText = "Memuat Misi...";
    
    try {
        const response = await fetch(`${apiUrl}?query=${groqHomepageQuery}`);
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data Homepage. Status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.result;
        
        if (data) {
            if (heroTitle) heroTitle.innerText = data.heroTitle || "Selamat Datang";
            if (heroSubtitle) heroSubtitle.innerText = data.heroSubtitle || "Wadah Aspirasi Siswa";
            
            if (aboutText && data.aboutUsText) {
                aboutText.innerText = data.aboutUsText;
            }

            if (visiText && data.visionText) {
                visiText.innerText = data.visionText;
            }
            if (misiText && data.missionText) {
                misiText.innerText = data.missionText;
            }

            if (data.heroImage && data.heroImage.asset && data.heroImage.asset._ref) {
                const imageAssetId = data.heroImage.asset._ref;
                const optimizedImageUrl = `${buildImageUrl(imageAssetId)}?w=1500&auto=format&q=75`;
                const heroSection = document.getElementById('hero-section');

                if (heroSection) {
                    heroSection.style.background = `
                        linear-gradient(rgba(0, 137, 64, 0.75), rgba(0, 137, 64, 0.75)),
                        url('${optimizedImageUrl}') no-repeat center center/cover
                    `;
                    heroSection.style.backgroundAttachment = 'fixed';
                }
            }
        }
        
    } catch (error) {
        console.error("Kesalahan Fetch Homepage:", error);
    }
}


// --- FUNGSI UTAMA 2: FETCH KOORDINATOR LIST (Halaman Utama) ---
async function fetchKoordinatorList() {
    const koorbidContainer = document.getElementById('koorbid-container');
    const koorbidFallback = document.getElementById('koorbid-fallback');
    
    if (!koorbidContainer) return; 

    try {
        const response = await fetch(`${apiUrl}?query=${koorbidListQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch list koordinator. Status: ${response.status}`);
        }
        
        const result = await response.json();
        const koorbidList = result.result;

        if (koorbidFallback) koorbidFallback.style.display = 'none'; 
        koorbidContainer.innerHTML = ''; 

        if (koorbidList.length === 0) {
            koorbidContainer.innerHTML = '<p class="section-lead">Belum ada Koordinator Bidang yang didaftarkan.</p>';
            return;
        }

        koorbidList.forEach(koorbid => {
            let iconUrl = 'https://via.placeholder.com/60?text=ICON'; 
            const slug = koorbid.slug ? koorbid.slug.current : ''; 

            if (koorbid.koorbidIcon && koorbid.koorbidIcon.asset && koorbid.koorbidIcon.asset._ref) {
                iconUrl = `${buildImageUrl(koorbid.koorbidIcon.asset._ref)}?w=60&h=60&fit=crop&auto=format`;
            }
            
            const cardHtml = `
                <div class="koorbid-card" onclick="openKoorbidDetail('${slug}')">
                    <div class="koorbid-icon">
                        <img src="${iconUrl}" alt="${koorbid.title} Icon">
                    </div>
                    <h3>${koorbid.title}</h3>
                </div>
            `;
            koorbidContainer.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Koordinator List:", error);
        koorbidContainer.innerHTML = '<p class="section-lead">Gagal memuat daftar Koordinator Bidang. Periksa terminal Sanity Anda.</p>';
    }
}


// --- FUNGSI UTAMA 3: FETCH KATA SAMBUTAN ---
async function fetchWelcomeSpeech() {
    const videoContainer = document.getElementById('video-container');
    const speakerNameEl = document.getElementById('speaker-name');
    const speakerTitleEl = document.getElementById('speaker-title');
    const speechTextEl = document.getElementById('speech-text');

    if (!videoContainer) return; 

    // SET DEFAULT/LOADING STATE
    videoContainer.innerHTML = `<p class="section-lead">Memuat video...</p>`;
    if (speakerNameEl) speakerNameEl.innerText = "Memuat...";
    if (speakerTitleEl) speakerTitleEl.innerText = "Memuat...";
    if (speechTextEl) speechTextEl.innerText = "";
    
    try {
        const response = await fetch(`${apiUrl}?query=${welcomeSpeechQuery}`);
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data Sambutan. Status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.result;
        
        if (data && data.speakerName) {
            // Update Speaker Info
            if (speakerNameEl) speakerNameEl.innerText = data.speakerName;
            if (speakerTitleEl) speakerTitleEl.innerText = data.speakerTitle;
            if (speechTextEl) speechTextEl.innerText = data.speechText || '';

            // Update Video Player
            if (data.videoUrl) {
                const embedUrl = getYouTubeEmbedUrl(data.videoUrl);
                if (embedUrl) {
                    videoContainer.innerHTML = `
                        <iframe 
                            src="${embedUrl}" 
                            title="YouTube video player - Kata Sambutan" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    `;
                } else {
                    videoContainer.innerHTML = `<p class="section-lead">Link video YouTube tidak valid.</p>`;
                }
            } else {
                 videoContainer.innerHTML = `<p class="section-lead">Video belum diatur.</p>`;
            }
        } else {
            // Fallback jika dokumen Sanity kosong/tidak terpublikasi
            if (speakerNameEl) speakerNameEl.innerText = "Data Pembicara Belum Diatur";
            if (speakerTitleEl) speakerTitleEl.innerText = "Jabatan Tidak Tersedia";
            videoContainer.innerHTML = `<p class="section-lead">Video belum diatur.</p>`;
        }
        
    } catch (error) {
        console.error("Kesalahan Fetch Sambutan:", error);
        if (speakerNameEl) speakerNameEl.innerText = "Error Memuat Data";
        if (speakerTitleEl) speakerTitleEl.innerText = "Periksa Koneksi Sanity";
        videoContainer.innerHTML = `<p class="section-lead">Gagal memuat video.</p>`;
    }
}


// --- FUNGSI UTAMA 4: FETCH GALERI KEGIATAN ---
async function fetchGalleryImages() {
    const galleryContainer = document.getElementById('gallery-container');
    const galleryFallback = document.getElementById('gallery-fallback');
    
    if (!galleryContainer) return; 

    try {
        const response = await fetch(`${apiUrl}?query=${galleryQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch galeri. Status: ${response.status}`);
        }

        const result = await response.json();
        const imageList = result.result;

        if (galleryFallback) galleryFallback.style.display = 'none'; 
        galleryContainer.innerHTML = ''; 

        if (imageList.length === 0) {
            galleryContainer.innerHTML = '<p class="section-lead">Belum ada foto yang diunggah ke Galeri.</p>';
            return;
        }

        imageList.forEach(item => {
            let imageUrl = '';
            
            if (item.imageFile && item.imageFile.asset && item.imageFile.asset._ref) {
                imageUrl = `${buildImageUrl(item.imageFile.asset._ref)}?w=600&auto=format&q=70`;
            }
            
            const itemHtml = `
                <div class="gallery-item">
                    <div class="gallery-image-wrapper"> 
                        <img src="${imageUrl || 'https://via.placeholder.com/600x400?text=FOTO+GALERI'}" alt="${item.caption}">
                    </div>
                    <div class="gallery-caption-footer"> 
                        <p>${item.caption || 'Tanpa Keterangan'}</p>
                    </div>
                </div>
            `;
            galleryContainer.innerHTML += itemHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Galeri:", error);
        galleryContainer.innerHTML = '<p class="section-lead">Gagal memuat Galeri Kegiatan. Periksa koneksi Sanity Anda.</p>';
    }
}

// --- FUNGSI UTAMA 5: FETCH LOG PERUBAHAN ---
async function fetchChangelog() {
    const logContainer = document.getElementById('log-container');
    
    if (!logContainer) return;

    try {
        const response = await fetch(`${apiUrl}?query=${changelogQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch log perubahan. Status: ${response.status}`);
        }

        const result = await response.json();
        const logList = result.result;

        logContainer.innerHTML = ''; 

        if (logList.length === 0) {
            logContainer.innerHTML = '<p class="section-lead">Belum ada log perubahan yang dicatat.</p>';
            return;
        }

        logList.forEach(log => {
            const statusClass = `status-${log.status.toLowerCase().replace(/ /g, '_')}`;
            const statusText = log.status === 'completed' ? 'Selesai' : (log.status === 'in_progress' ? 'Dikerjakan' : 'Diperbarui');
            const statusIcon = log.status === 'completed' ? '✅' : (log.status === 'in_progress' ? '🛠️' : '🔄');
            
            // PERUBAHAN: Gunakan renderPortableText untuk deskripsi
            const descriptionHtml = renderPortableText(log.description);
            
            const logHtml = `
                <div class="log-entry">
                    <div class="log-header">
                        <span class="log-feature">${log.featureName}</span>
                        <span class="log-date">${log.date}</span>
                    </div>
                    <span class="log-status ${statusClass}">${statusIcon} ${statusText}</span>
                    <div class="log-description">
                        ${descriptionHtml} 
                    </div>
                </div>
            `;
            logContainer.innerHTML += logHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Changelog:", error);
        logContainer.innerHTML = '<p class="section-lead">Gagal memuat Log Perubahan. Periksa terminal Sanity Anda.</p>';
    }
}

// --- [START] CV MAKER LOGIC (UPDATED) ---

window.updateCV = function() {
    const getVal = (id, def) => document.getElementById(id)?.value || def;

    // Personal Info
    document.getElementById('preview-name').innerText = getVal('input-name', 'NAMA LENGKAP');
    document.getElementById('preview-headline').innerText = getVal('input-headline', '');
    document.getElementById('preview-contact').innerText = getVal('input-contact', 'Alamat | Email | No HP | Link');
    
    // Summary & Skills
    document.getElementById('preview-summary').innerText = getVal('input-summary', 'Ringkasan profil Anda...');
    document.getElementById('preview-hard-skills').innerText = getVal('input-hard-skills', '-');
    document.getElementById('preview-soft-skills').innerText = getVal('input-soft-skills', '-');

    // Helper for dynamic lists
    const updateList = (inputId, previewId, renderItem) => {
        const container = document.getElementById(inputId);
        const prevContainer = document.getElementById(previewId);
        if(container && prevContainer) {
            prevContainer.innerHTML = Array.from(container.querySelectorAll('.dynamic-item')).map(renderItem).join('');
        }
    };

    // 1. Education Render
    updateList('education-inputs', 'preview-education', (item) => {
        const school = item.querySelector('.edu-school').value;
        const degree = item.querySelector('.edu-degree').value;
        const year = item.querySelector('.edu-year').value;
        if (!school) return '';
        return `
            <div class="cv-list-item">
                <div class="cv-item-top">
                    <span class="cv-item-title">• ${school}</span>
                    <span class="cv-item-date">${year}</span>
                </div>
                ${degree ? `<div class="cv-item-sub" style="padding-left: 12px;">${degree}</div>` : ''}
            </div>
        `;
    });

    // 2. Experience Render
    updateList('experience-inputs', 'preview-experience', (item) => {
        const role = item.querySelector('.exp-role').value;
        const org = item.querySelector('.exp-org').value;
        const year = item.querySelector('.exp-year').value;
        const desc = item.querySelector('.exp-desc').value;
        if (!role) return '';
        return `
            <div class="cv-list-item">
                <div class="cv-item-top">
                    <span class="cv-item-title">• ${role}</span>
                    <span class="cv-item-date">${year}</span>
                </div>
                <div class="cv-item-sub" style="padding-left: 12px;">${org}</div>
                ${desc ? `<div class="cv-item-desc" style="padding-left: 12px;">${desc.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        `;
    });

    // 3. Portfolio Render
    updateList('portfolio-inputs', 'preview-portfolio', (item) => {
        const title = item.querySelector('.port-title').value;
        const desc = item.querySelector('.port-desc').value;
        if (!title) return '';
        return `
            <li><strong>${title}</strong> ${desc ? `: ${desc}` : ''}</li>
        `;
    });
};

// Fungsi Tambah Input (Pendidikan, Pengalaman, Portofolio)
window.addEducationField = () => {
    const div = document.createElement('div'); div.className = 'dynamic-item';
    div.innerHTML = `<input type="text" class="edu-school" placeholder="Nama Sekolah" oninput="updateCV()"><input type="text" class="edu-degree" placeholder="Jurusan" oninput="updateCV()"><input type="text" class="edu-year" placeholder="Tahun" oninput="updateCV()"><button type="button" onclick="this.parentElement.remove(); updateCV()" style="color:red;border:none;background:none;cursor:pointer;font-size:0.8rem">Hapus</button>`;
    document.getElementById('education-inputs').appendChild(div);
};

window.addExperienceField = () => {
    const div = document.createElement('div'); div.className = 'dynamic-item';
    div.innerHTML = `<input type="text" class="exp-role" placeholder="Posisi / Jabatan" oninput="updateCV()"><input type="text" class="exp-org" placeholder="Organisasi / Perusahaan" oninput="updateCV()"><input type="text" class="exp-year" placeholder="Periode" oninput="updateCV()"><textarea class="exp-desc" rows="2" placeholder="Deskripsi tugas" oninput="updateCV()"></textarea><button type="button" onclick="this.parentElement.remove(); updateCV()" style="color:red;border:none;background:none;cursor:pointer;font-size:0.8rem">Hapus</button>`;
    document.getElementById('experience-inputs').appendChild(div);
};

window.addPortfolioField = () => {
    const div = document.createElement('div'); div.className = 'dynamic-item';
    div.innerHTML = `<input type="text" class="port-title" placeholder="Nama Project / Sertifikat" oninput="updateCV()"><input type="text" class="port-desc" placeholder="Keterangan / Link" oninput="updateCV()"><button type="button" onclick="this.parentElement.remove(); updateCV()" style="color:red;border:none;background:none;cursor:pointer;font-size:0.8rem">Hapus</button>`;
    document.getElementById('portfolio-inputs').appendChild(div);
};
// --- [END] CV MAKER LOGIC ---

// --- FUNGSI UTAMA 6: FETCH PUSAT INFORMASI (LIST) ---
async function fetchInformationPosts() {
    const infoContainer = document.getElementById('info-container');
    const infoDetailRender = document.getElementById('info-detail-render');
    
    if (!infoContainer) return; 

    try {
        const informationQueryWithBody = encodeURIComponent(
            `*[_type == "informationPost"] | order(publishedAt desc) {title, publishedAt, slug, body}`
        );
        
        const response = await fetch(`${apiUrl}?query=${informationQueryWithBody}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch informasi. Status: ${response.status}`);
        }

        const result = await response.json();
        const infoList = result.result;

        infoContainer.innerHTML = ''; 

        if (infoList.length === 0) {
            infoContainer.innerHTML = '<p class="section-lead">Belum ada informasi yang dipublikasikan.</p>';
            return;
        }

        infoList.forEach(item => {
            const date = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : 'Tanggal Tidak Diketahui';
            const slug = item.slug ? item.slug.current : '';

            let snippet = 'Klik untuk detail selengkapnya...';
            if (item.body && item.body.length > 0) {
                const firstBlock = item.body[0];
                if (firstBlock.children) {
                    const text = firstBlock.children.map(span => span.text).join('');
                    const maxLength = 100; 
                    snippet = text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
                }
            }

            const cardHtml = `
                <div class="info-card" onclick="openInfoDetail('${slug}')">
                    <h3 class="info-title">${item.title}</h3>
                    <p class="info-snippet" style="font-size: 0.95rem; color: #555; margin: 0.5rem 0 0.8rem 0;">${snippet}</p>
                    <p class="info-date">Dipublikasikan pada: ${date}</p>
                    <p class="click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 0.5rem;">[Baca Selengkapnya →]</p>
                </div>
            `;
            infoContainer.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Informasi:", error);
        infoContainer.innerHTML = '<p class="section-lead">Gagal memuat Pusat Informasi. Periksa koneksi Sanity Anda.</p>';
    }
}


// --- FUNGSI KOORBID DETAIL ROUTING ---
window.openKoorbidDetail = async function(slug) {
    document.getElementById('main-content').style.display = 'none';
    
    const detailContent = document.getElementById('detail-content');
    const detailRender = document.getElementById('koorbid-detail-render');
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail koordinator...</p>';
    window.scrollTo(0, 0); 

    const detailQuery = encodeURIComponent(
        `*[_type == "koordinatorBidang" && slug.current == "${slug}"][0]{
            title,
            detailImage,
            shortExplanation,
            functions
        }`
    );

    try {
        const response = await fetch(`${apiUrl}?query=${detailQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch detail. Status: ${response.status}`);
        }
        
        const result = await response.json();
        const koorbid = result.result;

        if (koorbid) {
            let detailImageUrl = ''; 
            if (koorbid.detailImage && koorbid.detailImage.asset && koorbid.detailImage.asset._ref) {
                detailImageUrl = `${buildImageUrl(koorbid.detailImage.asset._ref)}?w=800&auto=format&q=85`;
            }
            
            const functionsHtml = renderPortableText(koorbid.functions);

            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <h1 class="detail-title">${koorbid.title}</h1>
                    <img src="${detailImageUrl || 'https://via.placeholder.com/800x400?text=FOTO+KEGIATAN'}" alt="${koorbid.title}" class="detail-image">
                </div>
                
                <div class="detail-section">
                    <h3>Penjelasan Singkat</h3>
                    <p>${koorbid.shortExplanation || 'Penjelasan bidang ini belum diisi.'}</p>
                </div>

                <div class="detail-section">
                    <h3>Fungsi / Program</h3>
                    <div class="functions-list">
                        ${functionsHtml || '<p>Fungsi/Program belum didaftarkan.</p>'}
                    </div>
                </div>
            `;
            
        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail koordinator tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail. Periksa koneksi API Sanity Anda.</p>';
    }
}

window.closeKoorbidDetail = function() {
    document.getElementById('detail-content').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    window.scrollTo(0, 0); 
}

// --- FUNGSI PUSAT INFORMASI DETAIL ROUTING ---
window.openInfoDetail = async function(slug) {
    const infoListContainer = document.getElementById('info-container');
    const infoDetailRender = document.getElementById('info-detail-render');
    
    if (infoListContainer) infoListContainer.style.display = 'none';
    
    infoDetailRender.style.display = 'block';
    infoDetailRender.innerHTML = '<p class="section-lead">Memuat detail informasi...</p>';
    window.scrollTo(0, 0);

    const detailQuery = encodeURIComponent(
        `*[_type == "informationPost" && slug.current == "${slug}"][0]{title, publishedAt, body, mainImage}`
    );

    try {
        const response = await fetch(`${apiUrl}?query=${detailQuery}`);
        const result = await response.json();
        const post = result.result;

        if (post) {
            const formattedDate = new Date(post.publishedAt).toLocaleDateString('id-ID');
            const bodyHtml = renderPortableText(post.body);
            
            let imageUrl = '';
            if (post.mainImage && post.mainImage.asset && post.mainImage.asset._ref) {
                imageUrl = `${buildImageUrl(post.mainImage.asset._ref)}?w=800&auto=format&q=85`;
            }

            const imageHtml = imageUrl 
                ? `<img src="${imageUrl}" alt="${post.title}" class="detail-image" style="max-width: 100%; height: auto; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">` 
                : '';

            infoDetailRender.innerHTML = `
                <button onclick="closeInfoDetail()" id="back-button" class="back-button">← Kembali ke Daftar Informasi</button>
                <div class="detail-section">
                    <h2 style="text-align: left; margin-bottom: 0.5rem; border-bottom: none !important;">${post.title}</h2>
                    ${imageHtml}
                    <p style="font-style: italic; color: #6c757d; margin-bottom: 2rem; font-size: 0.95rem;">Dipublikasikan: ${formattedDate}</p>
                    <div class="info-body" style="text-align: left; color: #333; line-height: 1.7;">
                        ${bodyHtml}
                    </div>
                </div>
            `;
        } else {
            detailRender.innerHTML = '<p class="section-lead">Informasi tidak ditemukan.</p>';
        }
    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail Info:", error);
        infoDetailRender.innerHTML = '<p class="section-lead">Gagal memuat detail informasi.</p>';
    }
}

window.closeInfoDetail = function() {
    const infoListContainer = document.getElementById('info-container');
    if (infoListContainer) infoListContainer.style.display = 'block';

    document.getElementById('info-detail-render').style.display = 'none';
    window.scrollTo(0, 0);
}


// --- FUNGSI BARU: COUNTDOWN LOGIC ---
function updateCountdown(targetElement, targetDate) {
    const countDownDate = new Date(targetDate).getTime();

    if (targetElement.dataset.interval) {
        clearInterval(targetElement.dataset.interval);
    }
    
    targetElement.innerHTML = `Loading...`;

    const intervalId = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(intervalId);
            targetElement.innerHTML = `<p style="margin:0;">EVENT SEDANG BERLANGSUNG!</p>`;
        } else {
            targetElement.innerHTML = `
                <div class="countdown-timer">
                    <div class="countdown-unit">${days}<span>Hari</span></div>
                    <div class="countdown-unit">${hours}<span>Jam</span></div>
                    <div class="countdown-unit">${minutes}<span>Menit</span></div>
                    <div class="countdown-unit">${seconds}<span>Detik</span></div>
                </div>
            `;
        }
    }, 1000);

    targetElement.dataset.interval = intervalId;
}


// --- FUNGSI UTAMA 7: FETCH EVENT MENDATANG ---
async function fetchUpcomingEvents() {
    const eventContainer = document.getElementById('event-list-container');
    if (!eventContainer) return;

    try {
        const response = await fetch(`${apiUrl}?query=${upcomingEventQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch event. Status: ${response.status}`);
        }

        const result = await response.json();
        const eventList = result.result;
        
        eventContainer.innerHTML = '';

        if (eventList.length === 0) {
            eventContainer.innerHTML = '<p class="section-lead">Belum ada event mendatang yang terdaftar saat ini.</p>';
            return;
        }

        eventList.forEach(event => {
            let imageUrl = 'https://via.placeholder.com/350x200?text=Poster+Event';
            if (event.mainImage && event.mainImage.asset && event.mainImage.asset._ref) {
                imageUrl = `${buildImageUrl(event.mainImage.asset._ref)}?w=400&h=225&fit=crop&auto=format&q=75`;
            }
            
            let snippet = 'Klik untuk melihat detail event...';
            if (event.description && event.description.length > 0) {
                const firstBlock = event.description[0];
                if (firstBlock.children) {
                    const text = firstBlock.children.map(span => span.text).join('');
                    const maxLength = 80;
                    snippet = text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
                }
            }

            const cardHtml = `
                <div class="event-card" onclick="openEventDetail('${event.slug.current}')">
                    <div class="event-image-wrapper">
                        <img src="${imageUrl}" alt="Poster ${event.title}">
                    </div>
                    <div class="event-content">
                        <div>
                            <h3>${event.title}</h3>
                            <p class="event-location">${event.location || 'Lokasi Belum Diatur'}</p>
                            <p style="font-size: 0.95rem; color: #555; margin: 0.5rem 0 0.8rem 0;">${snippet}</p>
                            <p class="click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 0.5rem;">[Lihat Detail →]</p>
                        </div>
                    </div>
                    <div class="countdown-container" id="countdown-${event.slug.current}">
                        </div>
                </div>
            `;
            eventContainer.innerHTML += cardHtml;
        });

        eventList.forEach(event => {
            const countdownElement = document.getElementById(`countdown-${event.slug.current}`);
            if (countdownElement) {
                updateCountdown(countdownElement, event.eventDateTime);
            }
        });

    } catch (error) {
        console.error("Kesalahan Fetch Event:", error);
        eventContainer.innerHTML = '<p class="section-lead">Gagal memuat Event Mendatang. Periksa koneksi Sanity Anda.</p>';
    }
}


// --- FUNGSI DETAIL EVENT ROUTING ---
window.openEventDetail = async function(slug) {
    document.getElementById('event-main-content').style.display = 'none';
    const detailContent = document.getElementById('event-detail-content');
    const detailRender = document.getElementById('event-detail-render');
    
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail event...</p>';
    window.scrollTo(0, 0); 

    const detailQuery = encodeURIComponent(
        `*[_type == "upcomingEvent" && slug.current == "${slug}"][0]{
            title, eventDateTime, location, mainImage, description
        }`
    );

    try {
        const response = await fetch(`${apiUrl}?query=${detailQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch detail event. Status: ${response.status}`);
        }
        
        const result = await response.json();
        const event = result.result;

        if (event) {
            const startDate = new Date(event.eventDateTime).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const descriptionHtml = renderPortableText(event.description);
            
            let imageUrl = 'https://via.placeholder.com/900x500?text=Poster+Event'; 
            if (event.mainImage && event.mainImage.asset && event.mainImage.asset._ref) {
                imageUrl = `${buildImageUrl(event.mainImage.asset._ref)}?w=900&auto=format&q=85`;
            }
            
            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <h1 class="detail-title">${event.title}</h1>
                    <p class="detail-location">${event.location || 'Lokasi Belum Diatur'}</p>
                    <img src="${imageUrl}" alt="Poster ${event.title}" class="detail-image-full">
                </div>
                
                <div class="detail-section">
                    <h2 style="margin-bottom: 0.5rem; color: #008940;">Hitung Mundur</h2>
                    <div class="countdown-container" id="detail-countdown">
                        </div>
                    
                    <h2 style="margin-top: 2rem; color: #008940;">Waktu & Tempat</h2>
                    <p><strong>Tanggal:</strong> ${startDate} WIB</p>
                    <p><strong>Lokasi:</strong> ${event.location || 'Belum Diatur'}</p>

                    <div class="detail-description-content">
                        <h3>Deskripsi Event</h3>
                        ${descriptionHtml}
                    </div>
                </div>
            `;
            
            const detailCountdownElement = document.getElementById('detail-countdown');
            if(detailCountdownElement) {
                updateCountdown(detailCountdownElement, event.eventDateTime);
            }
            
        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail event tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail Event:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail event. Periksa koneksi API Sanity Anda.</p>';
    }
}

window.closeEventDetail = function() {
    document.getElementById('event-detail-content').style.display = 'none';
    document.getElementById('event-main-content').style.display = 'block';
    window.scrollTo(0, 0); 
}

// --- FUNGSI ARSIP LOGIC ---

function renderArchiveList(documents) {
    const container = document.getElementById('arsip-list-container');
    if (!container) return;

    if (documents.length === 0) {
        container.innerHTML = '<p class="section-lead">Tidak ada dokumen arsip yang ditemukan untuk filter ini.</p>';
        return;
    }

    container.innerHTML = documents.map(doc => `
        <div class="arsip-card">
            <div>
                <h3 class="arsip-title">${doc.title}</h3>
                <p class="arsip-meta">Masa Jabatan: ${doc.masaJabatan}</p>
                <p class="arsip-description">${doc.description || 'Tidak ada keterangan singkat.'}</p>
            </div>
            <a href="${doc.fileUrl}" target="_blank" class="download-button">
                ⬇️ Unduh Dokumen (.${doc.documentFile.asset._ref.split('-').pop()})
            </a>
        </div>
    `).join('');
}

window.filterArchive = function() {
    const filterValue = document.getElementById('masa-jabatan-filter').value;
    
    if (filterValue === 'all') {
        renderArchiveList(globalArchiveDocuments);
    } else {
        const filteredDocs = globalArchiveDocuments.filter(doc => doc.masaJabatan === filterValue);
        renderArchiveList(filteredDocs);
    }
}

async function fetchArchiveDocuments() {
    const container = document.getElementById('arsip-list-container');
    const filterSelect = document.getElementById('masa-jabatan-filter');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${archiveDocumentQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch arsip. Status: ${response.status}`);
        }

        const result = await response.json();
        const documents = result.result;
        globalArchiveDocuments = documents; 

        if (documents.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada dokumen arsip yang diunggah.</p>';
            filterSelect.innerHTML = '<option value="all">Tidak Ada Data</option>';
            return;
        }

        const uniquePeriods = [...new Set(documents.map(doc => doc.masaJabatan))].sort().reverse();
        filterSelect.innerHTML = '<option value="all">Semua Masa Jabatan</option>';
        uniquePeriods.forEach(period => {
            filterSelect.innerHTML += `<option value="${period}">${period}</option>`;
        });

        renderArchiveList(documents);

    } catch (error) {
        console.error("Kesalahan Fetch Arsip:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat Dokumen Arsip. Periksa koneksi Sanity Anda.</p>';
    }
}


// --- FUNGSI STRUKTUR ORGANISASI LOGIC ---

const coreOrderMap = {
    "Ketua Umum": 1,
    "Ketua 1": 2,
    "Ketua 2": 3,
    "Sekretaris Umum": 4,
    "Sekretaris 1": 5,
    "Sekretaris 2": 6,
    "Bendahara Umum": 7,
    "Bendahara 1": 8, 
};

function sortCoreMembers(members) {
    return members.sort((a, b) => {
        return coreOrderMap[a.position] - coreOrderMap[b.position];
    });
}

function groupAndSortDivisionMembers(members) {
    const grouped = members.reduce((acc, member) => {
        const division = member.division || 'Inti OSIM';
        if (!acc[division]) {
            acc[division] = [];
        }
        acc[division].push(member);
        return acc;
    }, {});
    
    const positionOrderMap = {
        "Ketua Divisi": 1,
        "Wakil Ketua Divisi": 2,
        "Sekretaris Divisi": 3,
        "Wakil Sekretaris Divisi": 4,
        "Bendahara Divisi": 5,
    };
    
    for (const division in grouped) {
        grouped[division].sort((a, b) => {
            return positionOrderMap[a.position] - positionOrderMap[b.position];
        });
    }

    return grouped;
}

function renderMemberCard(member) {
    let imageUrl = 'https://via.placeholder.com/150?text=FOTO';
    if (member.photo) {
        imageUrl = `${buildImageUrl(member.photoUrl)}?w=120&h=120&fit=crop&auto=format&q=75`;
    }
    
    const displayPosition = member.position.replace(' Divisi', '');

    return `
        <div class="member-card">
            <div class="member-photo-wrapper">
                <img src="${imageUrl}" alt="${member.name}">
            </div>
            <h4>${member.name}</h4>
            <p>${displayPosition}</p>
        </div>
    `;
}

async function fetchOrgStructure() {
    const coreContainer = document.getElementById('core-members-container');
    const divisionContainer = document.getElementById('division-members-container');
    if (!coreContainer || !divisionContainer) return;

    try {
        const response = await fetch(`${apiUrl}?query=${osimMemberQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch struktur. Status: ${response.status}`);
        }

        const result = await response.json();
        const memberList = result.result;

        const coreMembers = memberList.filter(m => !m.division);
        const divisionMembers = memberList.filter(m => m.division);

        // 1. Render Inti OSIM (Kepemimpinan dan Administrasi Dipisah)
        const sortedCore = sortCoreMembers(coreMembers);
        
        if (sortedCore.length > 0) {
            // PEMBAGIAN SESUAI HIERARKI VISUAL YANG DIMINTA
            const leadershipMembers = sortedCore.filter(m => coreOrderMap[m.position] >= 1 && coreOrderMap[m.position] <= 3); // Ketua Umum, K1, K2
            const secretariatMembers = sortedCore.filter(m => coreOrderMap[m.position] >= 4 && coreOrderMap[m.position] <= 6); // Sekretaris Umum, S1, S2
            const treasuryMembers = sortedCore.filter(m => coreOrderMap[m.position] >= 7); // Bendahara Umum, B1
            
            const leadershipHtml = leadershipMembers.map(renderMemberCard).join('');
            const secretariatHtml = secretariatMembers.map(renderMemberCard).join('');
            const treasuryHtml = treasuryMembers.map(renderMemberCard).join('');

            // Membangun HTML Inti OSIM dengan 3 grup terpisah
            coreContainer.innerHTML = `
                ${leadershipMembers.length > 0 ? `
                    <div class="struktur-group">
                        <h4 class="struktur-sub-title">INTI OSIM</h4>
                        <div class="member-grid core-leadership-grid">
                            ${leadershipHtml}
                        </div>
                    </div>
                ` : ''}
                ${secretariatMembers.length > 0 ? `
                    <div class="struktur-group">
                        <h4 class="struktur-sub-title">Sekretariat</h4>
                        <div class="member-grid core-secretariat-grid">
                            ${secretariatHtml}
                        </div>
                    </div>
                ` : ''}
                ${treasuryMembers.length > 0 ? `
                    <div class="struktur-group">
                        <h4 class="struktur-sub-title">Bendahara</h4>
                        <div class="member-grid core-treasury-grid">
                            ${treasuryHtml}
                        </div>
                    </div>
                ` : ''}
            `;
        } else {
            coreContainer.innerHTML = '<p class="section-lead">Data anggota inti belum diisi.</p>';
        }

        // 2. Render Divisi
        const groupedDivisions = groupAndSortDivisionMembers(divisionMembers);
        let divisionHtml = '';
        
        const divisionNames = Object.keys(groupedDivisions).sort();

        if (divisionNames.length > 0) {
            divisionNames.forEach(division => {
                const members = groupedDivisions[division];
                const membersGrid = members.map(renderMemberCard).join('');
                
                divisionHtml += `
                    <div class="division-group">
                        <h3>${division}</h3>
                        <div class="member-grid">
                            ${membersGrid}
                        </div>
                    </div>
                `;
            });
            divisionContainer.innerHTML = divisionHtml;
        } else {
            divisionContainer.innerHTML = '<p class="section-lead">Data anggota divisi belum diisi.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Fetch Struktur Organisasi:", error);
        coreContainer.innerHTML = '<p class="section-lead">Gagal memuat struktur organisasi. Periksa koneksi Sanity Anda.</p>';
    }
}


// --- FUNGSI BARU: FETCH KEBIJAKAN SEKOLAH ---
async function fetchSchoolPolicy() {
    const titleEl = document.getElementById('policy-title');
    const contentEl = document.getElementById('policy-content');
    if (!contentEl) return;
    
    contentEl.innerHTML = '<p class="section-lead">Memuat data kebijakan...</p>';

    try {
        const response = await fetch(`${apiUrl}?query=${schoolPolicyQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch kebijakan. Status: ${response.status}`);
        }

        const result = await response.json();
        const policyData = result.result; // Ini adalah dokumen policy tunggal

        if (!policyData || !policyData.policyGroups || policyData.policyGroups.length === 0) {
            titleEl.innerText = 'Kebijakan Sekolah';
            contentEl.innerHTML = '<p class="section-lead">Dokumen Peraturan belum diisi atau dipublikasikan di Sanity Studio.</p>';
            return;
        }

        // Update Judul Utama
        titleEl.innerText = policyData.policyTitle;
        
        let policyHtml = '';

        // Looping melalui setiap Kategori (policyGroups)
        policyData.policyGroups.forEach(group => {
            if (group.rules && group.rules.length > 0) {
                
                // Buat baris tabel untuk setiap aturan
                const rowsHtml = group.rules.map(rule => `
                    <tr>
                        <td>${rule.ruleDescription}</td>
                        <td>-${rule.points}</td>
                    </tr>
                `).join('');

                policyHtml += `
                    <div class="policy-category-group">
                        <h3>${group.categoryTitle}</h3>
                        <table class="policy-rule-table">
                            <thead>
                                <tr>
                                    <th>Pelanggaran</th>
                                    <th>Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        });

        contentEl.innerHTML = policyHtml || '<p class="section-lead">Tidak ada peraturan yang terdaftar dalam dokumen ini.</p>';

    } catch (error) {
        console.error("Kesalahan Fetch Kebijakan:", error);
        titleEl.innerText = 'Kebijakan Sekolah';
        contentEl.innerHTML = '<p class="section-lead">Gagal memuat Peraturan Sekolah. Periksa koneksi API Sanity Anda.</p>';
    }
}


// --- FUNGSI TOGGLE MENU (LOGIKA BARU YANG LEBIH BAIK) ---
function setupMenuToggle() {
    const toggleButton = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (!toggleButton || !navLinks) return;
    
    const allDropdownContents = navLinks.querySelectorAll('.dropdown-content');

    // --- Fungsi Bantuan untuk menutup semua dropdown ---
    const closeAllDropdowns = () => {
        allDropdownContents.forEach(content => {
            content.classList.remove('active');
        });
    }

    // 1. Event untuk Tombol Hamburger
    toggleButton.addEventListener('click', () => {
        // Cek apakah menu AKAN dibuka atau ditutup
        const isOpening = !navLinks.classList.contains('active');
        navLinks.classList.toggle('active');

        // Jika menu DITUTUP (isOpening = false), tutup juga semua dropdown
        if (!isOpening) {
            closeAllDropdowns();
        }
    });

    // 2. Event untuk semua link <a> di dalam <nav>
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Hanya jalankan logika ini di tampilan mobile
            if (window.innerWidth > 768) return;

            // --- KASUS A: Jika yang diklik adalah TOMBOL DROPDOWN ---
            if (link.classList.contains('dropbtn')) {
                e.preventDefault(); // Hentikan link agar tidak pindah halaman
                const targetContent = link.nextElementSibling;
                
                if (!targetContent) return;

                // Cek apakah dropdown ini sebelumnya sudah aktif/terbuka
                const wasActive = targetContent.classList.contains('active');
                
                // Pertama, tutup SEMUA dropdown yang mungkin terbuka
                closeAllDropdowns();
                
                // Jika dropdown ini tadinya TIDAK aktif, sekarang aktifkan
                // (Jika dia tadinya aktif, 'closeAllDropdowns' sudah menutupnya)
                if (!wasActive) {
                    targetContent.classList.add('active');
                }
            } 
            // --- KASUS B: Jika yang diklik adalah LINK BIASA ---
            // (Termasuk link di dalam dropdown)
            else {
                // Tutup semua dropdown
                closeAllDropdowns();
                // Tutup menu utama
                navLinks.classList.remove('active');
                // Biarkan link pindah halaman (tidak ada preventDefault)
            }
        });
    });
}


// --- FUNGSI UTAMA 8: ALUMNI CONNECT LOGIC ---

function renderAlumniCards(alumniList) {
    const container = document.getElementById('directory-container');
    if (!container) return;
    
    if (alumniList.length === 0) {
        container.innerHTML = '<p class="section-lead">Tidak ada alumni terdaftar saat ini.</p>';
        return;
    }
    
    const cardsHtml = alumniList.map(alumni => {
        // TAMPILAN KARTU DIPERBARUI UNTUK FOKUS NETWORKING
        // KOREKSI FOTO PROFIL: Menggunakan alumni.profilePhoto.asset._ref jika perlu
        const imageUrl = alumni.photoRef ? `${buildImageUrl(alumni.photoRef)}?w=100&h=100&fit=crop` : 'https://via.placeholder.com/100/008940/ffffff?text=AL';
        
        return `
            <div class="alumni-card">
                <img src="${imageUrl}" alt="${alumni.name}" class="alumni-photo">
                <h4>${alumni.name}</h4>
                <p class="alumni-job">${alumni.currentEducationInstitution || alumni.currentJob || 'Belum Bekerja/Kuliah'}</p>
                <div class="alumni-networking-info">
                    <p><strong>Jurusan:</strong> ${alumni.major || 'N/A'}</p>
                    <p><strong>Email:</strong> ${alumni.contactEmail || 'N/A'}</p>
                    <p><strong>Lokasi:</strong> ${alumni.currentLocation || 'Indonesia'}</p>
                    ${alumni.socialMedia ? `<p><a href="${alumni.socialMedia}" target="_blank" class="cta-button" style="padding: 5px 10px; font-size: 0.85rem;">Hubungi</a></p>` : ''}
                </div>
                <p style="font-size: 0.85rem; color: #999; margin-top: 10px;">Lulus MAN 1: ${alumni.graduationYear}</p>
            </div>
        `;
    }).join('');
    
    container.innerHTML = cardsHtml;
}

// FUNGSI AKTUAL UNTUK PETA LEAFLET
function renderAlumniMap(alumniList) {
    const mapEl = document.getElementById('map-container');
    if (!mapEl) return;
    
    const geoPoints = alumniList.filter(a => a.coordinates && a.coordinates.lat && a.coordinates.lng);
    let markerCount = 0;
    
    // Perbaikan: Cek L sekali lagi sebelum inisialisasi
    if (typeof L === 'undefined') {
        return; 
    }

    let alumniMap = null;
    // Hapus map lama jika sudah ada container Leaflet
    if (mapEl.querySelector('.leaflet-container')) {
        mapEl.innerHTML = '';
    }

    // 1. INISIALISASI PETA
    alumniMap = L.map('map-container').setView([-2.5, 118.0], 5); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM Contributors</a>',
        maxZoom: 18,
    }).addTo(alumniMap);
    
    // 2. TAMBAHKAN MARKER
    geoPoints.forEach(alumni => {
        const lat = alumni.coordinates.lat;
        const lng = alumni.coordinates.lng;
        
        const popupContent = `
            <b>${alumni.name}</b><br>
            Lulus: ${alumni.graduationYear}<br>
            Institusi: ${alumni.currentEducationInstitution || 'N/A'}<br>
            Jurusan: ${alumni.major || 'N/A'}
        `;

        L.marker([lat, lng])
            .addTo(alumniMap)
            .bindPopup(popupContent);
            
        markerCount++;
    });
    
    // 3. PETA PERLU DIBERITAHU UNTUK MENGHITUNG ULANG UKURANNYA
    // Ini membantu mengatasi 'white box' jika container baru saja muncul
    setTimeout(function () {
        alumniMap.invalidateSize(); 
    }, 100); 

    // 4. Status marker di bawah peta
    const statusDiv = document.createElement('div');
    statusDiv.className = 'section-lead';
    statusDiv.style.padding = '10px 0';
    statusDiv.style.textAlign = 'center';
    statusDiv.innerHTML = `Alumni yang memiliki data Geolocation: **${markerCount} orang.**`;
    
    if (!document.getElementById('map-status-info')) {
        const mapSection = document.getElementById('alumni-map');
        if (mapSection) {
            statusDiv.id = 'map-status-info';
            mapSection.querySelector('.container').appendChild(statusDiv);
        }
    } else {
        document.getElementById('map-status-info').innerHTML = statusDiv.innerHTML;
    }
}


// FUNGSI UTAMA UNTUK MENGINISIALISASI ULANG PETA HINGGA BERHASIL
function initializeMapWithRetry() {
    const mapEl = document.getElementById('map-container');
    
    // Jika Leaflet (L) sudah didefinisikan
    if (typeof L !== 'undefined' && mapEl && alumniDataCache.length > 0) {
        renderAlumniMap(alumniDataCache);
        
        const statusPlaceholder = document.getElementById('map-status-info-temp');
        if (statusPlaceholder) statusPlaceholder.remove();
        
        return;
    }
    
    // Jika L belum terdefinisi, tampilkan pesan loading dan coba lagi
    if (mapEl && typeof L === 'undefined') {
        mapEl.innerHTML = `
            <div id="map-status-info-temp" style="background:rgba(255,255,255,0.9); padding:20px; border-radius:8px; width: 80%; margin: 0 auto;">
                <h4 style="color:red; margin-top:0;">❌ GAGAL MEMUAT PETA.</h4>
                <p>Mengunduh library Leaflet. (Attempt: ${mapLoadAttempt}).</p>
            </div>
        `;
    }
    
    // Batasi jumlah percobaan (Misal: 40 kali @ 100ms = 4 detik)
    if (mapLoadAttempt < 40) {
        mapLoadAttempt++;
        setTimeout(initializeMapWithRetry, 100);
    } else {
        // Gagal setelah 4 detik
        if (mapEl) {
             mapEl.innerHTML = `<div style="padding: 20px;">
                <p class="section-lead" style="color:red;">❌ GAGAL MEMUAT PETA. Pastikan link CDN Leaflet benar dan koneksi stabil.</p>
            </div>`;
        }
    }
}


async function fetchAlumniDirectory() {
    const directoryContainer = document.getElementById('directory-container');
    const mapContainer = document.getElementById('map-container');
    if (!directoryContainer && !mapContainer) return;
    
    try {
        const response = await fetch(`${apiUrl}?query=${alumniDirectoryQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch alumni. Status: ${response.status}`);
        }

        const result = await response.json();
        const alumniList = result.result;
        
        alumniDataCache = alumniList; // Cache data
        renderAlumniCards(alumniList);
        
        // Panggil inisialisasi yang robust (akan otomatis retry jika L belum siap)
        if (mapContainer) {
            initializeMapWithRetry();
        }

    } catch (error) {
        console.error("Kesalahan Fetch Alumni:", error);
        if (directoryContainer) directoryContainer.innerHTML = '<p class="section-lead">Gagal memuat direktori alumni.</p>';
        if (mapContainer) mapContainer.innerHTML = '<p class="section-lead">Gagal memuat peta persebaran.</p>';
    }
}

// FUNGSI FORM SUBMISSION (AKTIVASI BACKEND ENDPOINT)
async function handleAlumniApplication(event) {
    event.preventDefault();
    const form = event.target;
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-alumni-form');
    
    submitBtn.disabled = true;
    formMessage.style.display = 'block';
    formMessage.style.color = '#856404';
    formMessage.innerText = 'Memproses data dan memvalidasi file...';

    const graduationProofFile = form.graduationProof.files[0];

    if (!graduationProofFile) {
        formMessage.innerText = 'Mohon lampirkan Surat Keterangan Lulus.';
        submitBtn.disabled = false;
        return;
    }
    
// ✅ VALIDASI FILE SIZE & TYPE (PENTING UNTUK iOS)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (graduationProofFile.size > maxSize) {
        formMessage.style.color = '#dc3545';
        formMessage.innerText = '❌ Ukuran file terlalu besar. Maksimal 5MB.';
        submitBtn.disabled = false;
        return;
    }
    
    if (!allowedTypes.includes(graduationProofFile.type)) {
        formMessage.style.color = '#dc3545';
        formMessage.innerText = '❌ Format file tidak didukung. Gunakan JPG, PNG, atau PDF.';
        submitBtn.disabled = false;
        return;
    }


    // Gunakan FormData untuk mengirim data formulir dan file secara sekaligus
    const formData = new FormData(form);

    try {
        // ✅ TIMEOUT CONTROLLER (30 detik)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        // PANGGIL ENDPOINT SERVERLESS VERCEL
        const response = await fetch('https://protoosim.vercel.app/api/submit-alumni', { 
            method: 'POST',
            body: formData, // FormData akan otomatis mengatur Content-Type: multipart/form-data
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // SUCCESS
            formMessage.style.color = '#155724';
            formMessage.innerText = '✅ Pengajuan berhasil dikirim! Silakan tunggu peninjauan admin.';
            form.reset();
        } else {
            // FAILURE (Error 400/500 dari Vercel endpoint)
            formMessage.style.color = '#dc3545';
            formMessage.innerText = `❌ Gagal mengirim pengajuan. Pesan: ${result.message || 'Terjadi kesalahan pada server (Endpoint Vercel).'}`;
        }
    } catch (err) {
        // CATCH Network error
        formMessage.style.color = '#dc3545';
        formMessage.innerText = '❌ Gagal terhubung ke server. Periksa koneksi atau deployment Serverless Function.';
    } finally {
        submitBtn.disabled = false;
    }
}


// --- [START] FUNGSI EKSKUL (DENGAN PERBAIKAN) ---

async function fetchEkskulList() {
    const container = document.getElementById('ekskul-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${ekskulListQuery}`);
        if (!response.ok) throw new Error(`Gagal fetch ekskul list.`);
        
        const result = await response.json();
        const ekskulList = result.result;

        container.innerHTML = '';

        if (ekskulList.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada ekstrakurikuler yang didaftarkan.</p>';
            return;
        }

        ekskulList.forEach(ekskul => {
            let iconUrl = 'https://via.placeholder.com/60?text=LOGO'; 
            
            if (ekskul.logoRef) {
                iconUrl = `${buildImageUrl(ekskul.logoRef)}?w=60&h=60&fit=crop&auto=format`;
            }
            
            const cardHtml = `
                <div class="koorbid-card" onclick="openEkskulDetail('${ekskul.slug.current}')">
                    <div class="koorbid-icon">
                        <img src="${iconUrl}" alt="${ekskul.title} Logo">
                    </div>
                    <h3>${ekskul.title}</h3>
                    <p class.click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 0.5rem;">[Lihat Detail]</p>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Ekskul List:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat daftar ekstrakurikuler.</p>';
    }
}

window.openEkskulDetail = async function(slug) {
    document.getElementById('ekskul-main-content').style.display = 'none';
    
    const detailContent = document.getElementById('ekskul-detail-content');
    const detailRender = document.getElementById('ekskul-detail-render');
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail ekstrakurikuler...</p>';
    window.scrollTo(0, 0); 

    try {
        const response = await fetch(`${apiUrl}?query=${ekskulDetailQuery(slug)}`);
        if (!response.ok) throw new Error(`Gagal fetch detail ekskul.`);
        
        const result = await response.json();
        const ekskul = result.result;

        if (ekskul) {
            const strukturHtml = renderPortableText(ekskul.struktur);
            const tujuanHtml = renderPortableText(ekskul.tujuan);
            const prestasiHtml = renderPortableText(ekskul.prestasi);
            const requirementHtml = renderPortableText(ekskul.requirement);
            
            let logoUrl = 'https://via.placeholder.com/150?text=LOGO'; 
            
            if (ekskul.logoRef) {
                // PERBAIKAN BUG "fit=contain" SUDAH DITERAPKAN DI SINI
                logoUrl = `${buildImageUrl(ekskul.logoRef)}?w=150&h=150&fit=scale&auto=format`;
            }

            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <img src="${logoUrl}" alt="${ekskul.title}" style="width: 150px; height: 150px; object-fit: contain; margin-bottom: 1rem;">
                    <h1 class="detail-title">${ekskul.title}</h1>
                    <p style="font-size: 1.1rem; margin-top: -1rem; margin-bottom: 2rem;">Pembimbing: <strong>${ekskul.pembimbing || 'N/A'}</strong></p>
                </div>
                
                ${ekskul.linkFormulir ? `
                    <div class="detail-section" style="text-align: center;">
                        <a href="${ekskul.linkFormulir}" target="_blank" class="cta-button" style="background-color: #008940; color: white;">
                            🔗 Gabung Sekarang (Klik di Sini)
                        </a>
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h3>Jadwal & Lokasi</h3>
                    <p><strong>Jadwal Latihan:</strong> ${ekskul.jadwalLatihan || 'Belum diatur'}</p>
                    <p><strong>Lokasi Stan Parade:</strong> ${ekskul.lokasiParade || 'Belum diatur'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Tujuan Ekstrakurikuler</h3>
                    <div class="functions-list">${tujuanHtml || '<p>Tujuan belum diisi.</p>'}</div>
                </div>
                
                <div class="detail-section">
                    <h3>Struktur Organisasi</h3>
                    <div class="functions-list">${strukturHtml || '<p>Struktur belum diisi.</p>'}</div>
                </div>

                <div class="detail-section">
                    <h3>Syarat Bergabung</h3>
                    <div class="functions-list">${requirementHtml || '<p>Syarat belum diisi.</p>'}</div>
                </div>
                
                <div class="detail-section">
                    <h3>Prestasi</h3>
                    <div class="functions-list">${prestasiHtml || '<p>Belum ada prestasi yang dicatat.</p>'}</div>
                </div>
            `;
            
        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail ekstrakurikuler tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail Ekskul:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail. Periksa koneksi API Sanity Anda.</p>';
    }
}

window.closeEkskulDetail = function() {
    document.getElementById('ekskul-detail-content').style.display = 'none';
    document.getElementById('ekskul-main-content').style.display = 'block';
    window.scrollTo(0, 0); 
}
// --- [END] FUNGSI EKSKUL ---

async function fetchDeveloperProfile() {
    const container = document.getElementById('dev-profile-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${developerProfileQuery}`);
        if (!response.ok) {
            throw new Error(`Gagal fetch developer. Status: ${response.status}`);
        }
        
        const result = await response.json();
        const dev = result.result;

        if (!dev) {
            container.innerHTML = '<p class="section-lead" style="color:white;">Profil developer belum diisi di Sanity Studio.</p>';
            return;
        }

        // Render Skills
        const skillsHtml = dev.skills ? dev.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('') : '';

        // Render Socials
        const socialsHtml = dev.socials ? dev.socials.map(soc => 
            `<a href="${soc.url}" target="_blank" class="social-btn">${soc.platform}</a>`
        ).join('') : '';

        // Build Photo URL (PERBAIKAN DISINI)
        let photoUrl = 'https://via.placeholder.com/300?text=DEV';
        if (dev.photoUrl) {
            photoUrl = `${buildImageUrl(dev.photoUrl)}?w=300&h=300&fit=crop&auto=format&q=80`;
        }

        container.innerHTML = `
            <div class="dev-card">
                <div class="dev-photo-frame">
                    <img src="${photoUrl}" alt="${dev.name}" class="dev-photo">
                </div>
                <h1 class="dev-name">${dev.name}</h1>
                <p class="dev-role">${dev.role || 'Developer'}</p>
                <p class="dev-bio">${dev.bio || ''}</p>
                
                ${skillsHtml ? `<div class="dev-skills">${skillsHtml}</div>` : ''}
                
                ${socialsHtml ? `<div class="dev-socials">${socialsHtml}</div>` : ''}
            </div>
        `;

    } catch (error) {
        console.error("Kesalahan Fetch Developer:", error);
        container.innerHTML = '<p class="section-lead" style="color:white;">Gagal memuat profil developer. Periksa koneksi Sanity.</p>';
    }
}
// --- [START] FITUR KONTAK & ASPIRASI ---
async function handleFeedbackForm(event) {
    event.preventDefault();
    const form = event.target;
    const statusEl = document.getElementById('feedback-status');
    const btn = document.getElementById('btn-submit-feedback');
    
    // Ambil data
    const formData = {
        name: document.getElementById('fb-name').value,
        kelas: document.getElementById('fb-class').value,
        message: document.getElementById('fb-message').value
    };

    // UI Loading
    btn.disabled = true;
    btn.innerText = "Mengirim...";
    statusEl.style.display = 'block';
    statusEl.style.color = '#666';
    statusEl.innerText = "Sedang mengirim masukan...";

    try {
        const response = await fetch('/api/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            statusEl.style.color = '#008940';
            statusEl.innerText = "✅ " + result.message;
            form.reset();
        } else {
            throw new Error(result.message || 'Gagal mengirim.');
        }
    } catch (error) {
        console.error(error);
        statusEl.style.color = '#d32f2f';
        statusEl.innerText = "❌ Terjadi kesalahan: " + error.message;
    } finally {
        btn.disabled = false;
        btn.innerText = "Kirim Masukan";
    }
}
// --- [END] FITUR KONTAK ---
// --- [START] FUNGSI BARU BEASISWA ---

function formatDeadline(dateTimeString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateTimeString);
    return `Batas Akhir: ${date.toLocaleDateString('id-ID', options)} WIB`;
}

async function fetchBeasiswaList() {
    const container = document.getElementById('beasiswa-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${apiUrl}?query=${beasiswaListQuery}`);
        if (!response.ok) throw new Error(`Gagal fetch list beasiswa.`);
        
        const result = await response.json();
        const beasiswaList = result.result;

        container.innerHTML = '';

        if (beasiswaList.length === 0) {
            container.innerHTML = '<p class="section-lead">Belum ada informasi beasiswa yang tersedia saat ini. Cek lagi nanti!</p>';
            return;
        }

        beasiswaList.forEach(item => {
            let imageUrl = 'https://via.placeholder.com/400x225?text=Poster+Beasiswa'; 
            if (item.posterRef) {
                imageUrl = `${buildImageUrl(item.posterRef)}?w=400&h=225&fit=crop&auto=format&q=75`;
            }
            
            const cardHtml = `
                <div class="event-card" onclick="openBeasiswaDetail('${item.slug.current}')">
                    <div class="event-image-wrapper">
                        <img src="${imageUrl}" alt="Poster ${item.title}">
                    </div>
                    <div class="event-content">
                        <div>
                            <h3>${item.title}</h3>
                            <p class="event-location">${item.penyelenggara || 'N/A'}</p>
                            <p class="click-indicator" style="font-size: 0.85rem; font-weight: 600; color: #008940; margin-top: 0.5rem;">[Lihat Detail →]</p>
                        </div>
                    </div>
                    <div class="countdown-container">
                        <p style="margin:0; font-size: 0.9rem;">${formatDeadline(item.deadline)}</p>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Kesalahan Fetch Beasiswa List:", error);
        container.innerHTML = '<p class="section-lead">Gagal memuat daftar beasiswa. Periksa koneksi Sanity.</p>';
    }
}



window.openBeasiswaDetail = async function(slug) {
    document.getElementById('beasiswa-main-content').style.display = 'none';
    
    const detailContent = document.getElementById('beasiswa-detail-content');
    const detailRender = document.getElementById('beasiswa-detail-render');
    detailContent.style.display = 'block';
    detailRender.innerHTML = '<p class="section-lead">Memuat detail beasiswa...</p>';
    window.scrollTo(0, 0); 

    try {
        const response = await fetch(`${apiUrl}?query=${beasiswaDetailQuery(slug)}`);
        if (!response.ok) throw new Error(`Gagal fetch detail beasiswa.`);
        
        const result = await response.json();
        const beasiswa = result.result;

        if (beasiswa) {
            const deskripsiHtml = renderPortableText(beasiswa.deskripsi);
            
            let posterUrl = 'https://via.placeholder.com/800x450?text=Poster+Beasiswa'; 
            if (beasiswa.posterRef) {
                posterUrl = `${buildImageUrl(beasiswa.posterRef)}?w=800&fit=scale&auto=format&q=85`;
            }

            detailRender.innerHTML = `
                <div class="koorbid-detail-header">
                    <h1 class="detail-title">${beasiswa.title}</h1>
                    <p style="font-size: 1.2rem; margin-top: -1rem; margin-bottom: 2rem;">Penyelenggara: <strong>${beasiswa.penyelenggara || 'N/A'}</strong></p>
                    <img src="${posterUrl}" alt="${beasiswa.title}" class="detail-image-full" style="max-width: 800px; width: 100%;">
                </div>
                
                ${beasiswa.linkPendaftaran ? `
                    <div class="detail-section" style="text-align: center; padding: 2rem;">
                        <a href="${beasiswa.linkPendaftaran}" target="_blank" class="cta-button" style="background-color: #008940; color: white; font-size: 1.1rem; padding: 15px 35px;">
                            🔗 Daftar Sekarang (Link Resmi)
                        </a>
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h3>Informasi Penting</h3>
                    <p><strong>Batas Akhir Pendaftaran:</strong> ${formatDeadline(beasiswa.deadline)}</p>
                    <p><strong>Cakupan Beasiswa:</strong> ${beasiswa.cakupan || 'Informasi tidak tersedia'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Deskripsi & Persyaratan</h3>
                    <div class="functions-list">
                        ${deskripsiHtml || '<p>Deskripsi dan persyaratan belum diisi.</p>'}
                    </div>
                </div>
            `;
            
        } else {
            detailRender.innerHTML = '<p class="section-lead">Detail beasiswa tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Kesalahan Saat Memuat Detail Beasiswa:", error);
        detailRender.innerHTML = '<p class="section-lead">Gagal memuat detail. Periksa koneksi API Sanity Anda.</p>';
    }
}

window.closeBeasiswaDetail = function() {
    document.getElementById('beasiswa-detail-content').style.display = 'none';
    document.getElementById('beasiswa-main-content').style.display = 'block';
    window.scrollTo(0, 0); 
}
// --- [END] FUNGSI BARU BEASISWA ---


// --- GLOBAL INITIALIZATION (KONDISIONAL) ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. CEK STATUS MAINTENANCE DAHULU
    const maintenanceActive = await checkMaintenanceMode();
    if (maintenanceActive) {
        // Jika redirect terjadi, hentikan eksekusi script selanjutnya
        return; 
    }

    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackForm);
    }

     // Inisialisasi Halaman Kebijakan Sekolah
    if (document.getElementById('policy-content')) {
        fetchSchoolPolicy();
    }
    // 2. LANJUTKAN INISIALISASI HANYA JIKA MAINTENANCE NON-AKTIF
    setupMenuToggle(); // <-- FUNGSI YANG DIPERBAIKI DIPANGGIL DI SINI
    
    displaySystemStatus();
    updateLiveTime(); 

    // Inisialisasi Halaman Utama (jika elemen Hero ada)
    if (document.getElementById('hero-section')) {
        fetchHomepageContent(); 
        
        // KOREKSI: Tambahkan kembali Koordinator List untuk halaman utama
        if (document.getElementById('koorbid-container')) {
            fetchKoordinatorList(); 
        }
        
        fetchWelcomeSpeech(); 
        fetchGalleryImages(); 
    }
    

    // Inisialisasi Halaman Log Perubahan
    if (document.getElementById('log-container')) {
        fetchChangelog();
    }
if (document.getElementById('prestasi-list-container')) {
    fetchPrestasiList();
}

    // Inisialisasi Halaman Pusat Informasi
    if (document.getElementById('info-container')) {
        fetchInformationPosts();
    }
    
    // Inisialisasi Halaman Event Mendatang
    if (document.getElementById('event-list-container')) {
        fetchUpcomingEvents();
    }

    if (document.getElementById('univ-list-container')) {
        fetchUniversityList();
    }
    
    // Inisialisasi Halaman Arsip Dokumen
    if (document.getElementById('arsip-list-container')) {
        fetchArchiveDocuments();
    }
    
    // NEW: WHO MADE THIS INIT
    if (document.getElementById('dev-profile-container')) {
        fetchDeveloperProfile();
    }
    // Inisialisasi Halaman Struktur Organisasi
    if (document.getElementById('core-members-container')) {
        fetchOrgStructure();
    }
    
// Inisialisasi Halaman Kompetisi (BARU)
    if (document.getElementById('kompetisi-list-container')) {
        fetchKompetisiList();
    }
});

   


    // Inisialisasi Halaman Alumni Connect
    if (document.getElementById('alumni-main-content')) {
        fetchAlumniDirectory();
        
        // Hubungkan form submission
        const form = document.getElementById('alumni-application-form');
        if (form) {
            form.addEventListener('submit', handleAlumniApplication);
        }
    }
    
    // Inisialisasi Halaman Ekstrakurikuler
    if (document.getElementById('ekskul-list-container')) {
        fetchEkskulList();
    }

    
    // Inisialisasi Halaman Beasiswa (BARU)
    if (document.getElementById('beasiswa-list-container')) {
        fetchBeasiswaList();
    }

    if (document.getElementById('lowongan-list-container')) {
    fetchLowonganList();
}   
