const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const spriteSheet = new Image();
spriteSheet.src = '../assets/sprite.png'; // Yolun doğruluğundan eminsen kalsın

let isLoaded = false;
spriteSheet.onload = () => { isLoaded = true; };

// Sabitler
const S = 64; // Sprite boyutu

// Basitleştirilmiş Sprite Map
const MAP = {
    sky: {x: 0, y: 0}, grass: {x: 1, y: 1}, fence: {x: 2, y: 1},
    caner: {x: 0, y: 3}, ayse: {x: 2, y: 3}, ali: {x: 0, y: 4}, can: {x: 2, y: 4}
};

function draw() {
    // 1. Görsel yüklenmeden çizme
    if (!isLoaded) {
        requestAnimationFrame(draw);
        return;
    }

    // 2. Arka planı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Gökyüzü ve Yer (Basit Örnek)
    ctx.drawImage(spriteSheet, MAP.sky.x * S, MAP.sky.y * S, S, S, 0, 0, 900, 500);
    
    // 4. Karakterleri Çiz (Test için ilk karakteri çiziyoruz)
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(spriteSheet, MAP.caner.x * S, MAP.caner.y * S, S, S, 100, 200, 64, 64);

    requestAnimationFrame(draw);
}

// Oyunu Başlat
draw();
