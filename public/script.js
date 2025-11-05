// public/script.js (KODE LENGKAP FINAL DAN SINKRONISASI FOTO)

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
function buildImageUrl(imageAssetId) {
    const parts = imageAssetId.split('-');
    const id = parts[1];
    const dimensions = parts[2];
    const format = parts[3];
    
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
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
                        <h4 class="struktur-sub-title">Kepala OSIM</h4>
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


// --- FUNGSI TOGGLE MENU ---
function setupMenuToggle() {
    const toggleButton = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
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
    
    // Gunakan FormData untuk mengirim data formulir dan file secara sekaligus
    const formData = new FormData(form);

    try {
        // PANGGIL ENDPOINT SERVERLESS VERCEL
        const response = await fetch('/api/submit-alumni', { 
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


// --- GLOBAL INITIALIZATION (KONDISIONAL) ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. CEK STATUS MAINTENANCE DAHULU
    const maintenanceActive = await checkMaintenanceMode();
    if (maintenanceActive) {
        // Jika redirect terjadi, hentikan eksekusi script selanjutnya
        return; 
    }

    // 2. LANJUTKAN INISIALISASI HANYA JIKA MAINTENANCE NON-AKTIF
    setupMenuToggle(); 
    
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

    // Inisialisasi Halaman Pusat Informasi
    if (document.getElementById('info-container')) {
        fetchInformationPosts();
    }
    
    // Inisialisasi Halaman Event Mendatang
    if (document.getElementById('event-list-container')) {
        fetchUpcomingEvents();
    }
    
    // Inisialisasi Halaman Arsip Dokumen
    if (document.getElementById('arsip-list-container')) {
        fetchArchiveDocuments();
    }
    
    // Inisialisasi Halaman Struktur Organisasi
    if (document.getElementById('core-members-container')) {
        fetchOrgStructure();
    }
    
    // Inisialisasi Halaman Kebijakan Sekolah
    if (document.getElementById('policy-content')) {
        fetchSchoolPolicy();
    }
    
    // Inisialisasi Halaman Alumni Connect
    if (document.getElementById('alumni-main-content')) {
        fetchAlumniDirectory();
        
        // Hubungkan form submission
        const form = document.getElementById('alumni-application-form');
        if (form) {
            form.addEventListener('submit', handleAlumniApplication);
        }
    }
});
