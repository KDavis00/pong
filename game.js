const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game objects
const paddleWidth = 12, paddleHeight = 80;
const ballSize = 14;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#F7CA18",
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#F7CA18",
    score: 0
};

const ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    size: ballSize,
    speed: 6,
    velocityX: 6 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 4 * (Math.random() > 0.5 ? 1 : -1),
    color: "#2ECC71"
};

// Utility draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff7";
    ctx.lineWidth = 4;
    for (let i = 10; i < canvas.height; i += 32) {
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, i);
        ctx.lineTo(canvas.width/2, i+16);
        ctx.stroke();
    }
}

function drawScore(x, y, score) {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(score, x, y);
}

// Control player paddle with mouse
canvas.addEventListener("mousemove", function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp paddle within canvas
    player.y = Math.max(Math.min(player.y, canvas.height - player.height), 0);
});

// Collision detection
function collision(b, p) {
    return (
        b.x < p.x + p.width &&
        b.x + b.size > p.x &&
        b.y < p.y + p.height &&
        b.y + b.size > p.y
    );
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2 - ball.size / 2;
    ball.y = canvas.height / 2 - ball.size / 2;
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Update game logic
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top/bottom wall collision
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Left paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width; // reposition ball
        ball.velocityX = -ball.velocityX;
        // Add some "spin" depending on where ball hits paddle
        let collidePoint = (ball.y + ball.size/2) - (player.y + player.height/2);
        collidePoint = collidePoint / (player.height/2);
        let angleRad = (Math.PI/4) * collidePoint;
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Right paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.size; // reposition ball
        ball.velocityX = -ball.velocityX;
        // Add some "spin"
        let collidePoint = (ball.y + ball.size/2) - (ai.y + ai.height/2);
        collidePoint = collidePoint / (ai.height/2);
        let angleRad = (Math.PI/4) * collidePoint;
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Left and right wall scoring
    if (ball.x <= 0) {
    ai.score++;
    if (ai.score >= 5) {
        endGame("AI");
        return;  // stop further update this frame
    }
    resetBall();
}
if (ball.x + ball.size >= canvas.width) {
    player.score++;
    if (player.score >= 5) {
        endGame("Player");
        return;  // stop further update this frame
    }
    resetBall();
}

function endGame(winner) {
    running = false;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    alert(winner + " wins the game!");  // Simple alert for now

    // Optionally reset scores or reload the game
    // player.score = 0;
    // ai.score = 0;
    // resetBall();
    // render();
}

    // --- AI paddle movement with error margin ---
let aiCenter = ai.y + ai.height / 2;
let ballCenter = ball.y + ball.size / 2;

// Add AI reaction delay and inaccuracy
let difficulty = 0.15; // lower = dumber
let error = (Math.random() - 0.5) * 60; // random offset: -30 to +30
// Only move AI when ball is coming toward it
if (ball.velocityX > 0) {
    if (aiCenter < ballCenter + error - 10) {
        ai.y += 4 * (1 - difficulty); // slower speed
    } else if (aiCenter > ballCenter + error + 10) {
        ai.y -= 4 * (1 - difficulty);
    }
} else {
    // Ball is going away – return to center slowly
    if (aiCenter < canvas.height/2 - 10) {
        ai.y += 2;
    } else if (aiCenter > canvas.height/2 + 10) {
        ai.y -= 2;
    }
}

// Clamp within canvas
ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));

}


// Render everything
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    drawNet();

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawBall(ball.x, ball.y, ball.size, ball.color);

    // Draw scores
    drawScore(canvas.width/4, 40, player.score);
    drawScore(3*canvas.width/4, 40, ai.score);
}

// Main game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// --- Start/Pause Toggle ---

let running = false;
let animationFrameId = null;

function gameLoop() {
    if (!running) return; // stop loop if paused

    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
}

document.getElementById("startBtn").addEventListener("click", function () {
    running = !running;

    // Set button text based on new running state
    if (running) {
        this.textContent = "Pause Game";
        if (!animationFrameId) {
            gameLoop();  // start loop
        }
    } else {
        this.textContent = "Resume Game";
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});



// --- Change Paddle Color ---
document.getElementById("colorBtn").addEventListener("click", function () {
    function randomColor() {
        return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    }
    player.color = randomColor();
    canvas.style.borderColor = player.color;
    render(); // draw change immediately
});

// ✅ --- Change Ball Color ---
document.getElementById("ballColorBtn").addEventListener("click", function () {
    function randomColor() {
        return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    }
    ball.color = randomColor();
    render(); // draw change immediately
});

// ✅ Show paddles/ball even before starting
resetBall();
render();
