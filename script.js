
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Ajuste de dimensões para tela do dispositivo
canvas.width = window.innerWidth * 0.9; // Ajuste a largura para 90% da tela
canvas.height = window.innerHeight * 0.7; // Ajuste a altura para 70% da tela

// Dimensões da plataforma e da bola
const paddleWidth = 100;
const paddleHeight = 10;
const ballRadius = 10;

// Posição inicial da plataforma
let paddleX = (canvas.width - paddleWidth) / 2;

// Posição inicial da bola
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let speedMultiplier = 1; // Fator de multiplicação da velocidade

// Ajuste da velocidade da bola para dispositivos móveis
if (/Mobi|Android/i.test(navigator.userAgent)) {
    dx *= 100.90;
    dy *= 100.90;
}

// Variáveis de pontuação
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Cria elementos de pontuação dinamicamente
const scoreElement = document.createElement('div');
scoreElement.id = 'score';
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = '#0095DD';
scoreElement.style.fontSize = '20px';
scoreElement.textContent = 'Score: ' + score;
document.body.appendChild(scoreElement);

const highScoreElement = document.createElement('div');
highScoreElement.id = 'highScore';
highScoreElement.style.position = 'absolute';
highScoreElement.style.top = '40px';
highScoreElement.style.left = '10px';
highScoreElement.style.color = '#0095DD';
highScoreElement.style.fontSize = '20px';
highScoreElement.textContent = 'High Score: ' + highScore;
document.body.appendChild(highScoreElement);

const gameOverScreen = document.createElement('div');
gameOverScreen.id = 'gameOverScreen';
gameOverScreen.style.position = 'absolute';
gameOverScreen.style.top = '50%';
gameOverScreen.style.left = '50%';
gameOverScreen.style.transform = 'translate(-50%, -50%)';
gameOverScreen.style.color = '#0095DD';
gameOverScreen.style.fontSize = '30px';
gameOverScreen.style.display = 'none';
gameOverScreen.textContent = 'Game Over!';
document.body.appendChild(gameOverScreen);

// Variável para controle do jogo
let gameStarted = false;
let gameRunning = false;

// Configuração das teclas
let rightPressed = false;
let leftPressed = false;

// Configuração dos blocos
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = (canvas.width - (brickColumnCount + 1) * 10) / brickColumnCount; // Centralizar blocos
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2; // Ajuste centralizado
let bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Listeners para as teclas
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', restartGame);

// Event listeners de toque
canvas.addEventListener('touchstart', touchStartHandler, false);
canvas.addEventListener('touchmove', touchMoveHandler, false);
canvas.addEventListener('touchend', touchEndHandler, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') { // Espaço para aumentar a velocidade
        if (gameStarted) {
            startGame();
        } else {
            speedMultiplier = 1.5;
        }
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        speedMultiplier = 1;
    }
}

function touchStartHandler(e) {
    e.preventDefault();
    var touch = e.touches[0];
    if (touch.pageX > canvas.width / 2) {
        rightPressed = true;
    } else {
        leftPressed = true;
    }
}

function touchMoveHandler(e) {
    e.preventDefault();
    var touch = e.touches[0];
    if (touch.pageX > canvas.width / 2) {
        rightPressed = true;
        leftPressed = false;
    } else {
        leftPressed = true;
        rightPressed = false;
    }
}

function touchEndHandler(e) {
    e.preventDefault();
    rightPressed = false;
    leftPressed = false;
}

function startGame() {
    gameStarted = true;
    gameRunning = true;
    document.getElementById('startButton').style.display = 'none';
    draw();
}

function gameOver() {
    gameRunning = false;
    document.getElementById('gameOverScreen').style.display = 'block';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    highScoreElement.textContent = 'High Score: ' + highScore;
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    resetGame();

      x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    dx = 2;
    dy = -2;
    speedMultiplier = 1;
    gameStarted = false;
    score = 0; // Zera a pontuação
    scoreElement.textContent = 'Score: ' + score; // Atualiza a pontuação exibida
}



function update() {
    if (!gameRunning) {
        return; // Parar a atualização do jogo se não estiver em execução
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    detectCollision();
    movePaddle();

    x += dx;
    y += dy;

    requestAnimationFrame(update);
}

function resetGame() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    dx = 2;
    dy = -2;
    speedMultiplier = 1;
    gameStarted = false;
    gameRunning = false;

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    document.getElementById('startButton').style.display = 'block';
}

function drawBall() {
    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = '#0095DD';
                context.fill();
                context.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                }
            }
        }
    }
}




function draw() {
    if (!gameRunning) return; // Pare o desenho se o jogo não estiver em execução

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            gameOver();
        }
    }

    x += dx * speedMultiplier;
    y += dy * speedMultiplier;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7 * speedMultiplier;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7 * speedMultiplier;
    }

    
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++; // Incrementa a pontuação
                    scoreElement.textContent = 'Score: ' + score; // Atualiza a pontuação exibida
                }
            }
        }
    }
}

    requestAnimationFrame(draw);
}


