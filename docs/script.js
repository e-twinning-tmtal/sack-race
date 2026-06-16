const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementler
const scoreVal = document.getElementById('score-val');
const timerVal = document.getElementById('timer-val');
const leaderboardList = document.getElementById('leaderboard-list');
const screenOverlay = document.getElementById('screen-overlay');
const screenTitle = document.getElementById('screen-title');

// Sprite Ölçüleri (Oluşturduğumuz 4x6'lık grid şeması)
const SPRITE_SIZE = 64; 

const spriteSheet = new Image();
spriteSheet.src = '../assets/sprite.png'; // sack-race/assets/sprite.png

// Sprite Sheet Koordinat Eşlemesi (Hatası düzeltilen yeni görsele tam uyumlu)
// Yeni 64x64 Grid Sistemine Göre Koordinatlar (0-3 arası indexler)
const SPRITE_MAP = {
    sky:         { x: 0, y: 0 },
    cloud:       { x: 1, y: 0 },
    tree_top:    { x: 2, y: 0 },
    tree_trunk:  { x: 3, y: 0 },
    dirt:        { x: 0, y: 1 },
    grass:       { x: 1, y: 1 },
    fence:       { x: 2, y: 1 },
    sign:        { x: 3, y: 1 },
    crowd_1:     { x: 0, y: 2 },
    crowd_2:     { x: 1, y: 2 },
    flag:        { x: 3, y: 2 },
    
    caner_idle:  { x: 0, y: 3 },
    caner_jump:  { x: 1, y: 3 },
    ayse_idle:   { x: 2, y: 3 },
    ayse_jump:   { x: 3, y: 3 },
    ali_idle:    { x: 0, y: 4 },
    ali_jump:    { x: 1, y: 4 },
    can_idle:    { x: 2, y: 4 },
    can_jump:    { x: 3, y: 4 },
    
    arrow:       { x: 0, y: 5 },
    finish:      { x: 1, y: 5 }
};

// Oyun Değişkenleri
let gameActive = false;
let raceFinished = false;
let timeLeft = 9.0;
let score = 0;
let globalFrame = 0;
const finishLineX = 760; 

// Koşucu Sınıfı
class Runner {
    constructor(name, yPos, sprites, isPlayer = false) {
        this.name = name;
        this.startX = 80;
        this.x = this.startX;
        this.y = yPos;
        this.baseY = yPos;
        this.sprites = sprites;
        this.isPlayer = isPlayer;
        
        this.isJumping = false;
        this.jumpTime = 0;
        this.jumpDuration = 20; // frame cinsinden zıplama süresi
        this.jumpHeight = 45;
        this.hopBar = 0; // P1 için ritim barı
        this.rank = 1;
        this.finished = false;
    }

    reset() {
        this.x = this.startX;
        this.y = this.baseY;
        this.isJumping = false;
        this.jumpTime = 0;
        this.hopBar = 0;
        this.finished = false;
    }

    update() {
        if (!gameActive) return;

        // P1 Bar Ritim Kontrolü
        if (this.isPlayer && !this.finished) {
            this.hopBar += 0.04;
            if (this.hopBar > 1) this.hopBar = 0;
        }

        // Zıplama Fizik Eğrisi (Sinüs Dalgası ile kusursuz zıplama)
        if (this.isJumping) {
            this.jumpTime++;
            let progress = this.jumpTime / this.jumpDuration;
            this.y = this.baseY - Math.sin(progress * Math.PI) * this.jumpHeight;

            // İlerleme miktarı
            if (!this.finished) {
                if (this.isPlayer) {
                    this.x += 3.2; // Oyuncu hızı
                } else {
                    this.x += Math.random() * 1.2 + 2.2; // Yapay zeka hız aralığı
                }
            }

            if (this.jumpTime >= this.jumpDuration) {
                this.isJumping = false;
                this.jumpTime = 0;
                this.y = this.baseY;
                if (this.isPlayer && !this.finished) score += 50; // Başarılı iniş puanı
            }
        } else if (!this.isPlayer && !this.finished && Math.random() < 0.03) {
            // Yapay zeka rastgele zıplama tetiklemesi
            this.isJumping = true;
        }

        // Bitiş Kontrolü
        if (this.x >= finishLineX) {
            this.x = finishLineX;
            this.finished = true;
        }
    }

    draw() {
        let isMoving = this.isJumping;
        let spriteKey = isMoving ? this.sprites.jump : this.sprites.idle;
        let s = SPRITE_MAP[spriteKey];

        // Ölçekleme faktörü: 32x32 -> 72x72 px ekrana basım
        let drawSize = 72;

        // P1 Sarı Ok ve Parlama Efekti
        if (this.isPlayer) {
            ctx.save();
            ctx.shadowColor = "rgba(255, 235, 59, 0.9)";
            ctx.shadowBlur = 12;
            
            // Başındaki Sarı Ok Animasyonu (Hafif yukarı aşağı yüzer)
            let arrowY = this.y - 45 + Math.sin(globalFrame * 0.1) * 4;
            let arrow = SPRITE_MAP.arrow;
            ctx.drawImage(spriteSheet, arrow.x * SPRITE_SIZE, arrow.y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, this.x + 20, arrowY, 32, 32);
        }

        // Ana Karakter Çizimi
        ctx.drawImage(
            spriteSheet,
            s.x * SPRITE_SIZE, s.y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE,
            this.x, this.y, drawSize, drawSize
        );

        if (this.isPlayer) ctx.restore();

        // Karakter İsim Etiketleri
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.fillText(this.name, this.x + 36, this.y - 12);
        ctx.shadowBlur = 0;

        // Oyuncu Ritim Barı (Caner'in hemen altında çizilir)
        if (this.isPlayer && gameActive && !this.finished) {
            ctx.fillStyle = "#000";
            ctx.fillRect(this.x + 11, this.y + drawSize + 2, 50, 8);
            let barW = this.hopBar * 46;
            ctx.fillStyle = this.hopBar > 0.75 ? "#4caf50" : "#ff9800"; // Yeşil-Turuncu geçiş
            ctx.fillRect(this.x + 13, this.y + drawSize + 4, barW, 4);
        }
    }
}

// Koşucu Kadrosu
const runners = [
    new Runner("CANER [P1]", 210, { idle: 'caner_idle', jump: 'caner_jump' }, true),
    new Runner("RACE 2", 275, { idle: 'ayse_idle', jump: 'ayse_jump' }),
    new Runner("AYŞE", 340, { idle: 'ali_idle', jump: 'ali_jump' }),
    new Runner("RACE 4", 405, { idle: 'can_idle', jump: 'can_jump' })
];

// Statik Sahneleri Arka Plandan Çizme
function drawEnvironment() {
    // 1. Gökyüzü ve Bulutlar
    let sky = SPRITE_MAP.sky;
    for(let x=0; x<canvas.width; x+=64) {
        ctx.drawImage(spriteSheet, sky.x*SPRITE_SIZE, sky.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, x, 0, 64, 64);
        ctx.drawImage(spriteSheet, sky.x*SPRITE_SIZE, sky.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, x, 64, 64, 64);
    }
    
    let cloud = SPRITE_MAP.cloud;
    ctx.drawImage(spriteSheet, cloud.x*SPRITE_SIZE, cloud.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 120, 20, 64, 64);
    ctx.drawImage(spriteSheet, cloud.x*SPRITE_SIZE, cloud.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 600, 15, 64, 64);

    // 2. Ağaçlar ve Seyirciler (Çit Arkası)
    let treeTop = SPRITE_MAP.tree_top;
    let treeTrunk = SPRITE_MAP.tree_trunk;
    let fence = SPRITE_MAP.fence;
    let crowd = (globalFrame % 30 < 15) ? SPRITE_MAP.crowd_1 : SPRITE_MAP.crowd_2;

    // Sol ve Sağ kısımlara ağaçlar
    ctx.drawImage(spriteSheet, treeTop.x*SPRITE_SIZE, treeTop.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 40, 30, 96, 96);
    ctx.drawImage(spriteSheet, treeTrunk.x*SPRITE_SIZE, treeTrunk.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 72, 120, 32, 64);
    
    ctx.drawImage(spriteSheet, treeTop.x*SPRITE_SIZE, treeTop.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 740, 20, 110, 110);

    // Seyirci Grupları
    ctx.drawImage(spriteSheet, crowd.x*SPRITE_SIZE, crowd.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 10, 115, 80, 64);
    ctx.drawImage(spriteSheet, crowd.x*SPRITE_SIZE, crowd.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 180, 115, 80, 64);
    ctx.drawImage(spriteSheet, crowd.x*SPRITE_SIZE, crowd.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 660, 115, 80, 64);

    // Çit dizilimi
    for(let x=0; x<canvas.width; x+=64) {
        ctx.drawImage(spriteSheet, fence.x*SPRITE_SIZE, fence.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, x, 140, 64, 40);
    }

    // 3. Yarış Pisti (Toprak/Çimen Kaplama)
    let grass = SPRITE_MAP.grass;
    let dirt = SPRITE_MAP.dirt;
    for(let x=0; x<canvas.width; x+=64) {
        for(let y=180; y<canvas.height; y+=64) {
            let tile = (y === 180) ? grass : dirt;
            ctx.drawImage(spriteSheet, tile.x*SPRITE_SIZE, tile.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, x, y, 64, 64);
        }
    }

    // Metre Çizgileri ve Dokular
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px 'Press Start 2P'";

    let checkpoints = [
        { x: 80, label: "0m" },
        { x: 320, label: "10m" },
        { x: 560, label: "20m" }
    ];

    checkpoints.forEach(cp => {
        ctx.beginPath();
        ctx.moveTo(cp.x, 190);
        ctx.lineTo(cp.x, 470);
        ctx.stroke();
        ctx.fillText(cp.label, cp.x - 15, 490);
    });

    // Bitiş Çizgisi Dokusu (Görseldeki "FINISH" Yapısı)
    let fin = SPRITE_MAP.finish;
    let flag = SPRITE_MAP.flag;
    ctx.drawImage(spriteSheet, fin.x*SPRITE_SIZE, fin.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, finishLineX + 20, 190, 48, 280);
    ctx.drawImage(spriteSheet, flag.x*SPRITE_SIZE, flag.y*SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, finishLineX + 24, 145, 40, 40);
}

// Canlı Sıralama Hesaplayıcı (Leaderboard)
function updateLeaderboard() {
    // X pozisyonlarına göre sırala (Büyük olan öndedir)
    let sorted = [...runners].sort((a, b) => b.x - a.x);
    
    leaderboardList.innerHTML = "";
    sorted.forEach((runner, index) => {
        let suffix = ["1st", "2nd", "3rd", "4th"][index];
        runner.rank = index + 1;
        
        let li = document.createElement('li');
        li.innerText = `${runner.name.padEnd(12, ' ')} (${suffix})`;
        if(runner.isPlayer) li.style.color = "#ffeb3b"; // Oyuncuyu tabloda sarı yap
        leaderboardList.appendChild(li);
    });
}

// Ana Oyun Döngüsü
function loop() {
    globalFrame++;
    
    // Zaman Mekaniği
    if (gameActive && !raceFinished) {
        timeLeft -= 1 / 60;
        if (timeLeft <= 0) {
            timeLeft = 0;
            endRace(false); // Süre bitti, kaybettin
        }
    }

    // Skor ve Zaman Tablosunu Ekrana Yazma
    scoreVal.innerText = String(score).padStart(4, '0');
    let secs = Math.floor(timeLeft);
    let ms = Math.floor((timeLeft % 1) * 100);
    timerVal.innerText = `0:${secs < 10 ? '0' : ''}${secs}`;

    // Sahneleri Çiz
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnvironment();

    // Koşucuları Yönet
    runners.forEach(runner => {
        runner.update();
        runner.draw();
    });

    updateLeaderboard();

    // Herkes bitirdi mi kontrolü
    if (gameActive && runners.every(r => r.finished)) {
        endRace(true);
    }

    requestAnimationFrame(loop);
}

// Oyunu Başlat/Sıfırla
function startRace() {
    timeLeft = 9.0;
    score = 0;
    raceFinished = false;
    gameActive = true;
    screenOverlay.classList.add('hidden');
    runners.forEach(r => r.reset());
}

// Yarışı Bitir
function endRace(success) {
    raceFinished = true;
    gameActive = false;
    screenOverlay.classList.remove('hidden');

    let playerRank = runners[0].rank;
    if (success && playerRank === 1) {
        screenTitle.innerText = "YOU WIN! 1st PLACE";
        screenTitle.style.color = "#4caf50";
    } else {
        screenTitle.innerText = `FINISHED! RANK: ${playerRank}`;
        screenTitle.style.color = "#ff9800";
    }
}

// Kontroller (SPACE Tuşu)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameActive && (timeLeft === 9.0 || raceFinished)) {
            startRace();
        } else if (gameActive && !runners[0].isJumping && !runners[0].finished) {
            runners[0].isJumping = true;
        }
    }
});

// Sprite Sheet yüklendiğinde motoru tetikle
spriteSheet.onload = () => {
    // İlk açılışta oyun beklesin ekranı aç
    screenTitle.innerText = "8-BIT SACK RACE";
    screenOverlay.classList.remove('hidden');
    loop();
};
