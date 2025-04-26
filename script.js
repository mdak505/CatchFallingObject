const gameArea = document.getElementById('gameArea');
const catcher = document.getElementById('catcher');
const scoreDisplay = document.getElementById('scoreDisplay');
const missesDisplay = document.getElementById('missesDisplay');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const gameOverMessage = document.getElementById('gameOverMessage');

const catchSound = document.getElementById('catchSound');
const missSound = document.getElementById('missSound');

let score = 0;
let misses = 0;
let objects = [];
let gameRunning = false;
let spawnInterval;
let speedIncreaseInterval;
let objectSpeed = 2;
let spawnRate = 1500; // milliseconds

function startGame() {
    resetGame();
    gameRunning = true;
    gameOverMessage.classList.add('hidden');
    spawnObjects();
    requestAnimationFrame(gameLoop);

    // Increase speed every 15 seconds
    speedIncreaseInterval = setInterval(() => {
        objectSpeed += 0.5;
        if (spawnRate > 400) {
            spawnRate -= 100;
        }
        clearInterval(spawnInterval);
        spawnObjects();
    }, 15000);
}

function stopGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    clearInterval(speedIncreaseInterval);
    objects.forEach(obj => obj.remove());
    objects = [];
}

function resetGame() {
    score = 0;
    misses = 0;
    objectSpeed = 2;
    spawnRate = 1500;
    updateScore();
    updateMisses();
    objects.forEach(obj => obj.remove());
    objects = [];
}

function spawnObjects() {
    spawnInterval = setInterval(() => {
        if (gameRunning) {
            createObject();
        }
    }, spawnRate);
}

function createObject() {
    const object = document.createElement('div');
    object.classList.add('object');
    object.style.left = Math.random() * (gameArea.clientWidth - 30) + 'px';
    gameArea.appendChild(object);
    objects.push(object);
}

function gameLoop() {
    if (!gameRunning) return;

    objects.forEach((object, index) => {
        let top = parseFloat(object.style.top) || 0;
        object.style.top = top + objectSpeed + 'px';

        // Check for catch
        if (checkCollision(object, catcher)) {
            catchSound.play();
            gameArea.removeChild(object);
            objects.splice(index, 1);
            updateScore(10);
        }

        // Check for miss
        else if (top > gameArea.clientHeight) {
            missSound.play();
            gameArea.removeChild(object);
            objects.splice(index, 1);
            updateMisses();
        }
    });

    requestAnimationFrame(gameLoop);
}

function moveCatcher(direction) {
    const moveAmount = 20;
    let left = parseInt(window.getComputedStyle(catcher).left);

    if (direction === 'left' && left > 0) {
        catcher.style.left = (left - moveAmount) + 'px';
    }
    else if (direction === 'right' && left + catcher.clientWidth < gameArea.clientWidth) {
        catcher.style.left = (left + moveAmount) + 'px';
    }
}

function checkCollision(object, catcher) {
    const objRect = object.getBoundingClientRect();
    const catchRect = catcher.getBoundingClientRect();

    return !(
        objRect.top > catchRect.bottom ||
        objRect.bottom < catchRect.top ||
        objRect.left > catchRect.right ||
        objRect.right < catchRect.left
    );
}

function updateScore(points = 0) {
    score += points;
    scoreDisplay.textContent = 'Score: ' + score;
}

function updateMisses() {
    misses += 1;
    missesDisplay.textContent = 'Misses: ' + misses;

    if (misses >= 5) { // You can change this
        gameOver();
    }
}

function gameOver() {
    stopGame();
    gameOverMessage.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        moveCatcher('left');
    } else if (e.key === 'ArrowRight') {
        moveCatcher('right');
    }
});

startButton.addEventListener('click', startGame);
stopButton.addEventListener('click', stopGame);
