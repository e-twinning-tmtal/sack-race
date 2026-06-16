// DOM Elementleri
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const winnerText = document.getElementById('winner-text');

const player = document.getElementById('player');
const bot1 = document.getElementById('bot1');
const bot2 = document.getElementById('bot2');
const bot3 = document.getElementById('bot3');

// Oyun Durumu Değişkenleri
let isGameRunning = false;
let playerPosition = 70;
let bot1Position = 70;
let bot2Position = 70;
let bot3Position = 70;

const startLine = 70;
const finishLinePosition = window.innerWidth * 0.9 - 130; // Dinamik bitiş çizgisi hesabı
let botIntervals = [];

// Yarışı Başlatma
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";

    // Botları harekete geçir
    startBot(bot1, (pos) => bot1Position = pos, 180, 240); // Hız aralıkları (ms)
    startBot(bot2, (pos) => bot2Position = pos, 200, 260);
    startBot(bot3, (pos) => bot3Position = pos, 160, 280);

    // Oyuncu kontrollerini aktif et
    window.addEventListener('keydown', handlePlayerJump);
}

// Oyuncu Zıplama Mekaniği (Space Tuşu)
function handlePlayerJump(e) {
    if (e.code === 'Space' && isGameRunning) {
        e.preventDefault(); // Sayfanın aşağı kaymasını engeller
        
        // Zıplama animasyonu ekle
        if (!player.classList.contains('jump')) {
            player.classList.add('jump');
            setTimeout(() => player.classList.remove('jump'), 300);
        }

        // İlerleme miktarı (Her zıplamada 25 piksel)
        playerPosition += 25;
        player.style.left = playerPosition + 'px';

        checkWinner('Sen', playerPosition);
    }
}

// Bot Yapay Zekası (Rastgele zaman aralıklarıyla zıplarlar)
function startBot(botElement, updatePosFn, minSpeed, maxSpeed) {
    function botMove() {
        if (!isGameRunning) return;

        // Botun zıplama animasyonu
        botElement.classList.add('jump');
        setTimeout(() => botElement.classList.remove('jump'), 300);

        // Bot ilerleme miktarı (Rastgele 15-25 arası)
        let currentPos = parseInt(botElement.style.left) || startLine;
        currentPos += Math.floor(Math.random() * 10) + 15;
        botElement.style.left = currentPos + 'px';
        updatePosFn(currentPos);

        const botName = botElement.previousElementSibling.innerText;
        checkWinner(botName, currentPos);

        // Bir sonraki zıplama zamanını rastgele belirle (Yapay zeka hissiyatı için)
        let randomDelay = Math.random() * (maxSpeed - minSpeed) + minSpeed;
        if (isGameRunning) {
            setTimeout(botMove, randomDelay);
        }
    }

    // İlk zıplamayı başlat
    setTimeout(botMove, Math.random() * 500);
}

// Kazananı Kontrol Etme
function checkWinner(name, position) {
    const trackWidth = document.querySelector('.lane').offsetWidth;
    const goal = trackWidth - 100; // Bitiş çizgisine varış noktası

    if (position >= goal && isGameRunning) {
        isGameRunning = false;
        winnerText.innerText = `🏁 Yarışı Kazanan: ${name}!`;
        resultModal.classList.remove('hidden');
        window.removeEventListener('keydown', handlePlayerJump);
    }
}

// Oyunu Sıfırlama
function resetGame() {
    playerPosition = startLine;
    bot1Position = startLine;
    bot2Position = startLine;
    bot3Position = startLine;

    player.style.left = startLine + 'px';
    bot1.style.left = startLine + 'px';
    bot2.style.left = startLine + 'px';
    bot3.style.left = startLine + 'px';

    resultModal.classList.add('hidden');
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
}
