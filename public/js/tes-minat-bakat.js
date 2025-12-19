// State Management untuk Tes Minat Bakat RIASEC
let testState = {
    studentName: '',
    currentQuestionIndex: 0,
    userAnswers: [],
    scores: {
        Realistic: 0,
        Investigative: 0,
        Artistic: 0,
        Social: 0,
        Enterprising: 0,
        Conventional: 0
    },
    isTestStarted: false,
    isTestCompleted: false
};

// Variabel global untuk chart instance
let radarChartInstance = null;

// Fungsi untuk memulai tes
function startTest() {
    const nameInput = document.getElementById('student-name-input');
    const studentName = nameInput.value.trim();
    
    if (!studentName) {
        alert('Mohon masukkan nama Anda terlebih dahulu!');
        nameInput.focus();
        return;
    }
    
    // Update state
    testState.studentName = studentName;
    testState.isTestStarted = true;
    testState.currentQuestionIndex = 0;
    testState.userAnswers = [];
    testState.scores = {
        Realistic: 0,
        Investigative: 0,
        Artistic: 0,
        Social: 0,
        Enterprising: 0,
        Conventional: 0
    };
    
    const container = document.getElementById('test-container');
    
    // Fade out start screen
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    // Render pertanyaan pertama setelah fade out
    setTimeout(() => {
        renderQuestion();
    }, 300);
}

// Fungsi untuk merender pertanyaan dengan animasi
function renderQuestion() {
    const container = document.getElementById('test-container');
    const question = riasecQuestions[testState.currentQuestionIndex];
    
    if (!question) {
        completeTest();
        return;
    }
    
    const progress = ((testState.currentQuestionIndex + 1) / riasecQuestions.length) * 100;
    
    // Fade out effect
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.innerHTML = `
            <div class="question-card">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="question-number">Pertanyaan ${testState.currentQuestionIndex + 1} dari ${riasecQuestions.length}</div>
                <h2 class="question-text">${question.question}</h2>
                <div class="answer-options">
                    <button class="answer-btn" onclick="selectAnswer(1)">
                        <span class="answer-icon">👍</span>
                        <span>Sangat Setuju</span>
                    </button>
                    <button class="answer-btn" onclick="selectAnswer(2)">
                        <span class="answer-icon">👍</span>
                        <span>Setuju</span>
                    </button>
                    <button class="answer-btn" onclick="selectAnswer(3)">
                        <span class="answer-icon">👌</span>
                        <span>Netral</span>
                    </button>
                    <button class="answer-btn" onclick="selectAnswer(4)">
                        <span class="answer-icon">👎</span>
                        <span>Tidak Setuju</span>
                    </button>
                    <button class="answer-btn" onclick="selectAnswer(5)">
                        <span class="answer-icon">👎</span>
                        <span>Sangat Tidak Setuju</span>
                    </button>
                </div>
            </div>
        `;
        
        // Fade in effect
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    }, 200);
}

// Fungsi untuk memilih jawaban
function selectAnswer(score) {
    const question = riasecQuestions[testState.currentQuestionIndex];
    
    // Simpan jawaban
    testState.userAnswers.push({
        questionId: question.id,
        category: question.category,
        score: score
    });
    
    // Update skor kategori
    // Score mapping: 1 = Sangat Setuju (5 poin), 2 = Setuju (4 poin), 3 = Netral (3 poin), 4 = Tidak Setuju (2 poin), 5 = Sangat Tidak Setuju (1 poin)
    const points = 6 - score; // Reverse mapping: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
    testState.scores[question.category] += points;
    
    // Pindah ke pertanyaan berikutnya
    testState.currentQuestionIndex++;
    
    // Render pertanyaan berikutnya atau selesaikan tes
    if (testState.currentQuestionIndex < riasecQuestions.length) {
        renderQuestion();
    } else {
        completeTest();
    }
}

// Fungsi untuk menyelesaikan tes dengan loading animation
function completeTest() {
    testState.isTestCompleted = true;
    
    const container = document.getElementById('test-container');
    
    // Fade out question
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
        // Show loading animation
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Menganalisis hasil...</p>
            </div>
        `;
        
        // Fade in loading
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        
        // Wait 1.5 seconds then show results
        setTimeout(() => {
            renderResults();
        }, 1500);
    }, 300);
}

// Fungsi untuk merender hasil dengan animasi
function renderResults() {
    const container = document.getElementById('test-container');
    
    // Urutkan kategori berdasarkan skor
    const sortedCategories = Object.entries(testState.scores)
        .map(([category, score]) => ({
            category,
            score,
            ...riasecCategories[category]
        }))
        .sort((a, b) => b.score - a.score);
    
    const topCategory = sortedCategories[0];
    
    // Fade out loading, fade in results
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
    
    container.innerHTML = `
        <div class="results-card">
            <div class="results-header">
                <h2>Hasil Tes Minat Bakat</h2>
                <p class="student-name-result">Nama: <strong>${testState.studentName}</strong></p>
            </div>
            
            <div class="results-content-wrapper">
                <div class="results-text-section">
                    <div class="top-category">
                        <h3>Kategori Teratas Anda</h3>
                        <div class="category-badge top">
                            <h4>${topCategory.name}</h4>
                            <p>${topCategory.description}</p>
                            <div class="score-display">Skor: ${topCategory.score} poin</div>
                        </div>
                    </div>
                    
                    <div class="all-scores">
                        <h3>Skor Semua Kategori</h3>
                        <div class="scores-grid">
                            ${sortedCategories.map((cat, index) => `
                                <div class="score-item ${index === 0 ? 'highlight' : ''}">
                                    <div class="score-label">${cat.name}</div>
                                    <div class="score-bar-container">
                                        <div class="score-bar" style="width: ${(cat.score / topCategory.score) * 100}%"></div>
                                    </div>
                                    <div class="score-value">${cat.score} poin</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="career-suggestions">
                        <h3>Rekomendasi Karir</h3>
                        <div class="careers-list">
                            ${topCategory.careers.map(career => `
                                <span class="career-tag">${career}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="results-chart-section">
                    <h3>Visualisasi Profil Minat Bakat</h3>
                    <div class="chart-container">
                        <canvas id="riasec-radar-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="btn-primary" onclick="resetTest()">🔄 Ulangi Tes</button>
                <button class="btn-secondary" onclick="downloadPDF()">📥 Download Laporan PDF</button>
            </div>
        </div>
    `;
    
    // Fade in results
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    // Render chart setelah DOM siap
    setTimeout(() => {
        renderRadarChart();
    }, 100);
    }, 200);
}

// Fungsi untuk merender Radar Chart
function renderRadarChart() {
    const canvas = document.getElementById('riasec-radar-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    
    // Hancurkan chart sebelumnya jika ada
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }
    
    // Siapkan data untuk chart
    const labels = Object.keys(testState.scores).map(cat => riasecCategories[cat].shortName);
    const scores = Object.values(testState.scores);
    const maxScore = Math.max(...scores, 1);
    
    // Normalisasi skor ke skala 0-100
    const normalizedScores = scores.map(score => (score / maxScore) * 100);
    
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Skor Minat Bakat',
                data: normalizedScores,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 3,
                pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                pointBorderColor: 'rgba(102, 126, 234, 1)',
                pointHoverBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const category = Object.keys(testState.scores)[context.dataIndex];
                            const categoryName = riasecCategories[category].name;
                            const actualScore = testState.scores[category];
                            return `${categoryName}: ${actualScore} poin (${context.parsed.r.toFixed(0)}%)`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        display: true,
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        backdropColor: 'rgba(0, 0, 0, 0)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.15)',
                        lineWidth: 1
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.15)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Fungsi untuk download PDF
function downloadPDF() {
    if (!testState.isTestCompleted || !radarChartInstance) {
        alert('Mohon tunggu hingga hasil tes selesai dimuat.');
        return;
    }

    // Ambil data hasil tes
    const sortedCategories = Object.entries(testState.scores)
        .map(([category, score]) => ({
            category,
            score,
            ...riasecCategories[category]
        }))
        .sort((a, b) => b.score - a.score);
    
    const topCategory = sortedCategories[0];
    
    // Format tanggal
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Isi data ke template PDF
    document.getElementById('pdf-student-name').textContent = testState.studentName;
    document.getElementById('pdf-test-date').textContent = dateStr;
    document.getElementById('pdf-category-name').textContent = topCategory.name;
    document.getElementById('pdf-category-description').textContent = topCategory.description;
    document.getElementById('pdf-category-score').textContent = topCategory.score;

    // Isi skor semua kategori
    const allScoresContainer = document.getElementById('pdf-all-scores');
    allScoresContainer.innerHTML = sortedCategories.map(cat => `
        <div class="pdf-score-item">
            <span class="pdf-score-label">${cat.name}</span>
            <span class="pdf-score-value">${cat.score} poin</span>
        </div>
    `).join('');

    // Isi rekomendasi karir
    const careersContainer = document.getElementById('pdf-careers-list');
    careersContainer.innerHTML = topCategory.careers.map(career => `
        <span class="pdf-career-tag">${career}</span>
    `).join('');

    // Konversi Chart.js Canvas ke Image
    const chartCanvas = document.getElementById('riasec-radar-chart');
    if (chartCanvas && radarChartInstance) {
        try {
            const chartImageData = radarChartInstance.toBase64Image('image/png', 1.0);
            const pdfChartImage = document.getElementById('pdf-chart-image');
            if (pdfChartImage) {
                pdfChartImage.src = chartImageData;
                pdfChartImage.onload = function() {
                    generatePDF();
                };
                pdfChartImage.onerror = function() {
                    console.error('Error loading chart image');
                    generatePDF();
                };
            } else {
                generatePDF();
            }
        } catch (error) {
            console.error('Error converting chart to image:', error);
            generatePDF();
        }
    } else {
        generatePDF();
    }
}

// Fungsi untuk generate PDF menggunakan html2pdf
function generatePDF() {
    if (typeof html2pdf === 'undefined') {
        alert('Library PDF belum dimuat. Silakan refresh halaman.');
        return;
    }

    const element = document.getElementById('pdf-template');
    const studentName = testState.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Hasil-Tes-${studentName}.pdf`;

    const opt = {
        margin: 1,
        filename: filename,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'cm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };

    // Show loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'pdf-loading';
    loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:8px;z-index:10000;';
    loadingMsg.textContent = 'Mengunduh PDF...';
    document.body.appendChild(loadingMsg);

    html2pdf().set(opt).from(element).save().then(() => {
        const loading = document.getElementById('pdf-loading');
        if (loading) loading.remove();
    }).catch((error) => {
        console.error('Error generating PDF:', error);
        alert('Terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.');
        const loading = document.getElementById('pdf-loading');
        if (loading) loading.remove();
    });
}

// Fungsi untuk reset tes dengan cleanup yang bersih
function resetTest() {
    const container = document.getElementById('test-container');
    
    // Fade out current content
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
        // Hancurkan chart jika ada
        if (radarChartInstance) {
            radarChartInstance.destroy();
            radarChartInstance = null;
        }
        
        // Reset state
        testState = {
            studentName: '',
            currentQuestionIndex: 0,
            userAnswers: [],
            scores: {
                Realistic: 0,
                Investigative: 0,
                Artistic: 0,
                Social: 0,
                Enterprising: 0,
                Conventional: 0
            },
            isTestStarted: false,
            isTestCompleted: false
        };
        
        // Render halaman awal
        renderStartScreen();
        
        // Reset input
        const nameInput = document.getElementById('student-name-input');
        if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
        }
        
        // Fade in start screen
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
}

// Fungsi untuk merender halaman awal
function renderStartScreen() {
    const container = document.getElementById('test-container');
    container.innerHTML = `
        <div class="start-card">
            <div class="start-icon">🎯</div>
            <h2>Tes Minat Bakat RIASEC</h2>
            <p class="start-description">
                Temukan minat dan bakat Anda dengan mengikuti tes ini. 
                Tes ini akan membantu Anda memahami kepribadian dan rekomendasi karir yang sesuai.
            </p>
            <div class="start-form">
                <input 
                    type="text" 
                    id="student-name-input" 
                    class="name-input" 
                    placeholder="Masukkan nama Anda"
                    autocomplete="off"
                >
                <button class="btn-primary btn-start" onclick="startTest()">Mulai Tes</button>
            </div>
            <div class="test-info">
                <p><strong>Durasi:</strong> Sekitar 5-10 menit</p>
                <p><strong>Jumlah Pertanyaan:</strong> ${riasecQuestions.length} pertanyaan</p>
            </div>
        </div>
    `;
    
    // Focus pada input dan handle Enter key
    const nameInput = document.getElementById('student-name-input');
    if (nameInput) {
        nameInput.focus();
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startTest();
            }
        });
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    renderStartScreen();
});
