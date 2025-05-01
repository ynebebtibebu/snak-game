const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const highScoresList = document.getElementById('highScoresList');

// Game variables
let snake = [{x: 200, y: 200}];
let food = {x: 0, y: 0};
let dx = 20;
let dy = 0;
let score = 0;
let gameSpeed = 150;
let gameLoop;

function initGame() {
    snake = [{x: 200, y: 200}];
    dx = 20;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(main, gameSpeed);
}

function generateFood() {
    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;
}

function main() {
    if (isGameOver()) {
        clearInterval(gameLoop);
        saveScore();
        return;
    }
    
    moveSnake();
    drawGame();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function drawGame() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    snake.forEach(segment => {
        ctx.fillStyle = 'lime';
        ctx.fillRect(segment.x, segment.y, 18, 18);
    });
    
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 18, 18);
}

function isGameOver() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function saveScore() {
    const player = prompt('Game Over! Enter your name:', 'Player');
    if (player) {
        fetch('/save_score', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({player: player, score: score}),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadHighScores();
            }
        });
    }
}

function loadHighScores() {
    fetch('/get_scores')
        .then(response => response.json())
        .then(scores => {
            highScoresList.innerHTML = '';
            scores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.player}: ${score.score}`;
                highScoresList.appendChild(li);
            });
        });
}

document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp': if (dy !== 20) { dx = 0; dy = -20; } break;
        case 'ArrowDown': if (dy !== -20) { dx = 0; dy = 20; } break;
        case 'ArrowLeft': if (dx !== 20) { dx = -20; dy = 0; } break;
        case 'ArrowRight': if (dx !== -20) { dx = 20; dy = 0; } break;
    }
});

restartBtn.addEventListener('click', initGame);

initGame();
loadHighScores();
