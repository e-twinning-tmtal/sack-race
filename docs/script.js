const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sprite Sheet Tanımlamaları (32x32 Grid Sistemi)
const SPRITE_SIZE = 32;
const spriteSheet = new Image();
spriteSheet.src = '../assets/sprite.png'; // sack-race/assets/sprite.png

// Sprite Sheet üzerindeki (X, Y) koordinat haritası (Eşit Pozisyonlama)
const SPRITE_MAP = {
    // Çevre Elemanları
    sky:         { x: 0, y: 0 },
    cloud:       { x: 1, y: 0 },
    tree_top:    { x: 2, y: 0 },
    tree_trunk:  { x: 3, y: 0 },
    dirt_ground: { x: 0, y: 1 },
    grass:       { x: 1, y: 1 },
    fence:       { x: 2, y: 1 },
    sign_board:  { x: 3, y: 1 },
    
    // Seyirciler (Animasyonlu)
    crowd_1:     { x: 0, y: 2 },
    crowd_2:     { x: 1, y: 2 },
    
    // Oyuncular (Her biri: 0=Durma, 1=Havadaki Zıplama karesi)
    caner_idle:  { x: 0, y: 3 },
    caner_jump:  { x: 1, y: 3 },
    ayse_idle:   { x: 2, y: 3 },
    ayse_jump:   { x: 3, y: 3 },
    ali_idle:    { x: 0, y: 4 },
    ali_jump:    { x: 1, y: 4 },
    can_idle:    { x: 2, y: 4 },
    can_jump:    { x: 3, y: 4 },
    
    // Arayüz Elemanları
    yellow_arrow:{ x: 0, y: 5 },
    finish_line: { x: 1, y: 5 }
};

// Oyun Durumu
let gameState = {
    timer: 9.0,
    isRaceFinished: false,
    animationFrame: 0
};

// Yarışmacı Sınıfı
class Runner {
    constructor(name, id, yPos, sprites, isPlayer = false) {
        this.name = name;
        this.id = id;
        this.x = 100; // Başlangıç çizgisi önü
        this.y = yPos;
        this.targetY = yPos;
        this.sprites = sprites;
        this.isPlayer = isPlayer;
        this.speed = 0;
        this.jumpProgress = 0;
        this.isJumping = false;
        this.hopBar = 0; // Oyuncu için zıplama barı zamanlaması
        this.rank = 4;
    }

    update() {
        if (gameState.isRaceFinished) return;

        if (this.isPlayer) {
            // Oyuncu Zıplama Mekaniği (Bar kontrolü)
            this.hopBar += 0.05;
            if (this.hopBar > 1) this.hopBar = 0;

            if (this.isJumping) {
                this.jumpProgress += 0.1;
                this.y = this.targetY - Math.sin(this.jumpProgress * Math.PI) * 40;
                this.x += 2.5; // Zıplama hızı
                if (this.jumpProgress >= 1) {
                    this.isJumping = false;
                    this.jumpProgress = 0;
                    this.y = this.targetY;
                }
            }
        } else {
            // Yapay Zeka (AI) Mantığı - Rastgele Zıplamalar
            if (!this.isJumping && Math.random() < 0.02) {
                this.isJumping = true;
            }
            if (this.isJumping) {
                this.jumpProgress += 0.08;
                this.y = this.targetY - Math.sin(this.jumpProgress * Math.PI) * 35;
                this.x += Math.random() * 2 + 1;
                if (this.jumpProgress >= 1) {
                    this.isJumping = false;
                    this.jumpProgress = 0;
                    this.y = this.targetY;
                }
            }
        }

        // Bitiş çizgisi kontrolü (Örn: 750px)
        if (this.x >= 750) {
            this.x = 750;
        }
    }

    draw() {
        // Sprite Seçimi (Havadaysa jump, yerdeyse idle)
        let spriteKey = this.isJumping ? this.sprites.jump : this.sprites.idle;
        let s = SPRITE_MAP[spriteKey];

        // Oyuncu etrafındaki sarı parlamayı çiz (Caner [P1])
        if (this.isPlayer) {
            ctx.shadowColor = 'rgba(255, 235, 59, 0.8)';
            ctx.shadowBlur = 15;
            // Tepesindeki Sarı Ok İşareti
            let arrow = SPRITE_MAP.yellow_arrow;
            ctx.drawImage(spriteSheet, arrow.x * SPRITE_SIZE, arrow.y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, this.x + 16, this.y - 50, 32, 32);
        }

        // Karakteri Çiz (Ölçekleme: 32x32 -> 64x64 piksel büyüklüğe)
        ctx.drawImage(
            spriteSheet,
            s.x * SPRITE_SIZE, s.y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE,
            this.x, this.y, 64, 64
        );
        
        // Gölgeleri sıfırla
        ctx.shadowBlur = 0;

        // Karakter İsmi Yazısı
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + 32, this.y - 10);
    }
}

// Yarışmacıları Oluştur
const runners = [
    new Runner("CANER [P1]", 1, 220, { idle: 'caner_idle', jump: 'caner_jump' }, true),
    new Runner("RACE 2", 2, 280, { idle: 'ayse_idle', jump: 'ayse_jump' }), // Görseldeki isim etiketlerine sadık kalındı
    new Runner("AYŞE", 3, 340, { idle: 'ali_idle', jump: 'ali_jump' }),
    new Runner("RACE 4", 4, 400, { idle: 'can_idle', jump: 'can_jump' })
];

// Girdileri Dinle (SPACE tuşu ile zıplama)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        let player = runners[0];
        if (!player.isJumping) {
            player.isJumping = true;
        }
    }
});

// Arka Planı ve Çevreyi Çiz
function drawBackground() {
    // Gökyüzü maviye boya
    ctx.fillStyle = "#5c94fc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Çimen ve Toprak Ayrımı (Metre çizgileriyle birlikte)
    ctx.fillStyle = "#b8b8f8"; // Pist arka plan rengi tonu
    ctx.fillRect(0, 180, canvas.width, 320);

    // Pist Çizgileri ve Metreler (0m, 10m, 20m, FINISH)
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px 'Press Start 2P'";

    let lines = [
        { x: 80, text: "0m" },
        { x: 320, text: "10m" },
        { x: 560, text: "20m" },
        { x: 800, text: "FINISH" }
    ];

    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x, 200);
        ctx.lineTo(line.x, 480);
        ctx.stroke();
        ctx.fillText(line.text, line.x - 20, 490);
    });
}

// HUD (Arayüz / Skor / Zaman) Çizimi
function drawHUD() {
    // Üst Sol Score Kutusu
    ctx.fillStyle = "#000000";
    ctx.fillRect(10, 10, 160, 40);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("SCORE", 20, 35);

    // Üst Sağ Zaman Sayacı (0:09)
    ctx.fillRect(canvas.width - 120, 10, 110, 40);
    ctx.fillStyle = "#ff0000";
    let seconds = Math.floor(gameState.timer);
    let ms = Math.floor((gameState.timer % 1) * 100);
    ctx.fillText(`0:${seconds < 10 ? '0' : ''}${seconds}`, canvas.width - 110, 35);

    // Oyuncu Enerji/Zıplama Barı (CANER [P1] altındaki yeşil bar)
    ctx.fillStyle = "#000000";
    ctx.fillRect(190, 45, 150, 15);
    let barWidth = runners[0].hopBar * 146;
    ctx.fillStyle = runners[0].hopBar > 0.7 ? "#4caf50" : "#ff9800";
    ctx.fillRect(192, 47, barWidth, 11);

    // Sağ Üst Sıralama Tablosu (Leaderboard)
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(680, 60, 210, 120);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillText("PLAYER: CANER (1st)", 690, 85);
    ctx.fillText("        AYŞE  (2nd)", 690, 105);
    ctx.fillText("        ALİ   (3rd)", 690, 125);
    ctx.fillText("        CAN   (4th)", 690, 145);
}

// Ana Oyun Döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.animationFrame++;

    // Zamanı Azalt
    if (gameState.timer > 0 && !gameState.isRaceFinished) {
        gameState.timer -= 1/60;
    } else if (gameState.timer <= 0) {
        gameState.timer = 0;
        gameState.isRaceFinished = true;
    }

    drawBackground();

    // Yarışmacıları güncelle ve çiz
    runners.forEach(runner => {
        runner.update();
        runner.draw();
    });

    drawHUD();

    requestAnimationFrame(gameLoop);
}

// Sprite yüklendiğinde oyunu başlat
spriteSheet.onload = () => {
    gameLoop();
};
