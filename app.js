const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const arrowButtons = document.querySelectorAll(".arrow-btn");

const width = canvas.width;
const height = canvas.height;
const playerSize = 10;
const enemySize = 20;
const maxEnemies = 10;
const keys = new Set();

let player;
let enemies;
let score;
let speed;
let gameOver;
let lastFrameTime;

function resetGame() {
    player = {
        x: width / 2 - playerSize / 2,
        y: height - 2 * playerSize
    };
    enemies = [createEnemy()];
    score = 0;
    speed = 5;
    gameOver = false;
    lastFrameTime = 0;
    scoreEl.textContent = "Score: 0";
}

function createEnemy() {
    return {
        x: Math.floor(Math.random() * (width - enemySize)),
        y: 0
    };
}

function rectanglesCollide(a, b) {
    return (
        a.x < b.x + enemySize &&
        a.x + playerSize > b.x &&
        a.y < b.y + enemySize &&
        a.y + playerSize > b.y
    );
}

function update() {
    if (keys.has("ArrowLeft") || keys.has("a")) {
        player.x = Math.max(5, player.x - 10);
    }

    if (keys.has("ArrowRight") || keys.has("d")) {
        player.x = Math.min(width - playerSize - 5, player.x + 10);
    }

    while (enemies.length < maxEnemies) {
        enemies.push(createEnemy());
    }

    for (let index = enemies.length - 1; index >= 0; index -= 1) {
        const enemy = enemies[index];
        enemy.y += speed;

        if (enemy.y >= height) {
            enemies.splice(index, 1);
            score += 1;
            scoreEl.textContent = `Score: ${score}`;
        }
    }

    speed = 5 + Math.floor(score / 5);
    gameOver = enemies.some((enemy) => rectanglesCollide(player, enemy));
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgb(200, 0, 0)";
    enemies.forEach((enemy) => {
        ctx.fillRect(enemy.x, enemy.y, enemySize, enemySize);
    });

    ctx.fillStyle = "rgb(0, 100, 255)";
    ctx.fillRect(player.x, player.y, playerSize, playerSize);

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", width / 2, height / 2 - 12);
        ctx.font = "24px Arial";
        ctx.fillText("Press Restart to play again", width / 2, height / 2 + 32);
    }
}

function gameLoop(timestamp) {
    if (!lastFrameTime || timestamp - lastFrameTime >= 1000 / 30) {
        if (!gameOver) {
            update();
        }

        draw();
        lastFrameTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
        keys.add(event.key);
        event.preventDefault();
    }
});

window.addEventListener("keyup", (event) => {
    keys.delete(event.key);
});

restartBtn.addEventListener("click", resetGame);

arrowButtons.forEach((button) => {
    const key = button.dataset.key;

    button.addEventListener("pointerdown", (event) => {
        keys.add(key);
        button.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    button.addEventListener("pointerup", () => {
        keys.delete(key);
    });

    button.addEventListener("pointercancel", () => {
        keys.delete(key);
    });

    button.addEventListener("pointerleave", () => {
        keys.delete(key);
    });
});

resetGame();
requestAnimationFrame(gameLoop);
