const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const winnerText = document.getElementById('winner-text');
const indicator = document.getElementById('indicator');
const feedbackText = document.getElementById('feedback-text');
const timerElement = document.getElementById('timer');
const scoreVal = document.getElementById('score-val');

const player = document.getElementById('player');
const playerArrow = document.querySelector('.player-arrow');
const bot1 = document.getElementById('bot1');
const bot2 = document.getElementById('bot2');
const bot3 = document.getElementById('bot3');

let isGameRunning = false;
let playerPosition = 30;
const startLine = 30;
let score = 0;

// Zamanlayıcı Değişkenleri
let startTime;
let timerInterval;

// İbre Ayarları
let indicatorPos = 0;
let indicatorDirection = 1;
let indicatorSpeed = 3.5; // Hızı görseldeki tempoya yaklaştırmak için biraz artırdık
let animationFrameId;

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    feedbackText.innerText = "GO GO GO!";
    feedbackText.style.color = "#2ecc71";

    // Süreyi Başlat
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    moveIndicator();

    // Botların Hız Dengesi (Görseldeki gibi adil ama dişli rakipler)
    startBot(bot1, 180, 240); // Ali
    startBot(bot2, 160, 220); // Ayşe (Bir tık seridir)
    startBot(bot3, 200, 250); // Can

    window.addEventListener('keydown', handlePlayerInput);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function moveIndicator() {
    if (!isGameRunning) return;

    indicatorPos += indicatorSpeed * indicatorDirection;

    if (indicatorPos >= 100) { indicatorPos = 100; indicatorDirection = -1; }
    else if (indicatorPos <= 0) { indicatorPos = 0; indicatorDirection = 1; }

    indicator.style.left = indicatorPos + '%';
    animationFrameId = requestAnimationFrame(moveIndicator);
}

function handlePlayerInput(e) {
    if (e.code === 'Space' && isGameRunning) {
        e.preventDefault();

        // Mükemmel alan kontrolü (%42 - %58)
        if (indicatorPos >= 42 && indicatorPos <= 58) {
            playerPosition += 40; // İyi sıçrayış
            score += 150;
            triggerJump(player, 'jump');
            feedbackText.innerText = "PERFECT! 🔥";
            feedbackText.style.color = "#2ecc71";
        } else {
            playerPosition += 12; // Kötü zamanlama sendelemesi
            score = Math.max(0, score - 50);
            triggerJump(player, 'small-jump');
            feedbackText.innerText = "MISS! 😰";
            feedbackText.style.color = "#e74c3c";
        }

        // Skoru ekrana 4 haneli retro formatta bas
        scoreVal.innerText = String(score).padStart(4, '0');
        
        // Karakteri ve üzerindeki Sarı Oku hareket ettir
        player.style.left = playerPosition + 'px';
        playerArrow.style.left = (playerPosition + 22) + 'px'; // Oku ortaladık

        checkWinner('CANER (SEN)', playerPosition);
    }
}

function triggerJump(element, className) {
    element.classList.remove('jump', 'small-jump');
    void element.offsetWidth;
    element.classList.add(className);
}

function startBot(botElement, minDelay, maxDelay) {
    function botMove() {
        if (!isGameRunning) return;

        let botPos = parseInt(botElement.style.left) || startLine;
        let chance = Math.random();

        if (chance > 0.35) {
            botPos += 25;
            triggerJump(botElement, 'jump');
        } else {
            botPos += 12;
            triggerJump(botElement, 'small-jump');
        }

        botElement.style.left = botPos + 'px';
        
        // Bot ismini temiz alalım
        const botName = botElement.previousElementSibling.innerText;
        checkWinner(botName, botPos);

        if (isGameRunning) {
            setTimeout(botMove, Math.random() * (maxDelay - minDelay) + minDelay);
        }
    }
    setTimeout(botMove, Math.random() * 500);
}

function checkWinner(name, position) {
    const trackWidth = document.querySelector('.track-lanes').offsetWidth;
    const goal = trackWidth - 140; // Bitiş çizgisi hizası

    if (position >= goal && isGameRunning) {
        isGameRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);
        
        winnerText.innerText = `${name} WINS THE RACE!`;
        resultModal.classList.remove('hidden');
    }
}

function resetGame() {
    playerPosition = startLine;
    score = 0;
    scoreVal.innerText = "0000";
    timerElement.innerText = "0:00";

    player.style.left = startLine + 'px';
    playerArrow.style.left = (startLine + 22) + 'px';
    bot1.style.left = startLine + 'px';
    bot2.style.left = startLine + 'px';
    bot3.style.left = startLine + 'px';

    indicatorPos = 0;
    indicatorDirection = 1;
    indicator.style.left = '0%';
    
    feedbackText.innerText = "HAZIRLAN!";
    feedbackText.style.color = "#fff";
    
    resultModal.classList.add('hidden');
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
    window.removeEventListener('keydown', handlePlayerInput);
}
