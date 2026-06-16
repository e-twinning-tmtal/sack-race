const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const winnerText = document.getElementById('winner-text');
const indicator = document.getElementById('indicator');
const feedbackText = document.getElementById('feedback-text');

const player = document.getElementById('player');
const bot1 = document.getElementById('bot1');
const bot2 = document.getElementById('bot2'); // Ayşe
const bot3 = document.getElementById('bot3');

let isGameRunning = false;
let playerPosition = 80;
const startLine = 80;

// İbre (Indicator) Değişkenleri
let indicatorPos = 0;
let indicatorDirection = 1;
let indicatorSpeed = 3; // İbrenin hızı (Zorluğu artırmak için yükseltilebilir)
let animationFrameId;

// Yarışı Başlatma
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    feedbackText.innerText = "HAYDİ!";

    // İbreyi hareket ettirmeye başla
    moveIndicator();

    // Botları Başlat (Farklı karakter yapıları ve hızları var)
    startBot(bot1, 190, 230); // Klasik Ahmet
    startBot(bot2, 170, 220); // Hızlı Ayşe 🏃‍♀️
    startBot(bot3, 220, 280); // Yavaş ama istikrarlı Mehmet

    window.addEventListener('keydown', handlePlayerInput);
}

// Zamanlama İbresinin Mekaniği (Loop)
function moveIndicator() {
    if (!isGameRunning) return;

    indicatorPos += indicatorSpeed * indicatorDirection;

    if (indicatorPos >= 100) {
        indicatorPos = 100;
        indicatorDirection = -1;
    } else if (indicatorPos <= 0) {
        indicatorPos = 0;
        indicatorDirection = 1;
    }

    indicator.style.left = indicatorPos + '%';
    animationFrameId = requestAnimationFrame(moveIndicator);
}

// Oyuncu Tuş Kontrolü
function handlePlayerInput(e) {
    if (e.code === 'Space' && isGameRunning) {
        e.preventDefault();

        // Zamanlama kontrolü (%40 ile %60 arası yeşil bölge)
        if (indicatorPos >= 40 && indicatorPos <= 60) {
            // MÜKEMMEL ZAMANLAMA
            playerPosition += 35; // Büyük ilerleme
            triggerJump(player, 'jump');
            showFeedback('MÜKEMMEL! 🔥', 'perfect-flash');
        } else {
            // ISKA / KÖTÜ ZAMANLAMA
            playerPosition += 8; // Çok az ilerleme
            triggerJump(player, 'small-jump');
            showFeedback('KAÇIRDIN! 😰', 'miss-flash');
        }

        player.style.left = playerPosition + 'px';
        checkWinner('Sen (Oyuncu)', playerPosition);
    }
}

// Zıplama Sınıflarını Yönetme
function triggerJump(element, className) {
    element.classList.remove('jump', 'small-jump');
    void element.offsetWidth; // DOM'u tetiklemek için trick (re-flow)
    element.classList.add(className);
}

// Ekranda Mükemmel/Kaçırdın Yazısı Gösterme
function showFeedback(text, cssClass) {
    feedbackText.innerText = text;
    feedbackText.className = cssClass;
}

// Botların Yapay Zekası
function startBot(botElement, minDelay, maxDelay) {
    function botMove() {
        if (!isGameRunning) return;

        // Botlar da kendi içlerinde şans eseri iyi veya kötü zıplama yaparlar
        let botPos = parseInt(botElement.style.left) || startLine;
        let skillChance = Math.random();

        if (skillChance > 0.3) {
            // İyi zıplama
            botPos += 22;
            triggerJump(botElement, 'jump');
        } else {
            // Botun sendelemesi
            botPos += 10;
            triggerJump(botElement, 'small-jump');
        }

        botElement.style.left = botPos + 'px';
        
        const botName = botElement.previousElementSibling.innerText;
        checkWinner(botName, botPos);

        let randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        if (isGameRunning) {
            setTimeout(botMove, randomDelay);
        }
    }
    setTimeout(botMove, Math.random() * 600);
}

// Kazanan Kontrolü
function checkWinner(name, position) {
    const trackWidth = document.querySelector('.lane').offsetWidth;
    const goal = trackWidth - 110;

    if (position >= goal && isGameRunning) {
        isGameRunning = false;
        cancelAnimationFrame(animationFrameId);
        winnerText.innerText = `🏁 ${name} Yarışı Kazandı!`;
        resultModal.classList.remove('hidden');
    }
}

// Reseti Düzenleme
function resetGame() {
    playerPosition = startLine;
    player.style.left = startLine + 'px';
    bot1.style.left = startLine + 'px';
    bot2.style.left = startLine + 'px';
    bot3.style.left = startLine + 'px';

    player.classList.remove('jump', 'small-jump');
    bot1.classList.remove('jump', 'small-jump');
    bot2.classList.remove('jump', 'small-jump');
    bot3.classList.remove('jump', 'small-jump');

    indicatorPos = 0;
    indicatorDirection = 1;
    indicator.style.left = '0%';
    
    feedbackText.innerText = "HAZIRLAN!";
    feedbackText.className = "";
    
    resultModal.classList.add('hidden');
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
    window.removeEventListener('keydown', handlePlayerInput);
}
