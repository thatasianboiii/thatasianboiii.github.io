const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameArea = document.getElementById("gameArea");

const scoreDisplay =
    document.getElementById("scoreDisplay");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const homeBtn =
    document.getElementById("homeBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resumeBtn =
    document.getElementById("resumeBtn");

const restartPauseBtn =
    document.getElementById("restartPauseBtn");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");

const startBest =
    document.getElementById("startBest");

const hint =
    document.getElementById("hint");

const backBtn =
    document.getElementById("backBtn");


/* =========================
   CANVAS
========================= */

let width = 0;
let height = 0;
let dpr = 1;


/* =========================
   GAME STATE
========================= */

let gameState = "menu";

let score = 0;

let bestScore =
    Number(
        localStorage.getItem("flappyBest") || 0
    );

let lastTime = 0;

let spawnTimer = 0;

let pipes = [];

let particles = [];


/* =========================
   BIRD
========================= */

const bird = {

    x: 0,

    y: 0,

    radius: 15,

    velocity: 0,

    rotation: 0

};


/* =========================
   SETTINGS
========================= */

const settings = {

    gravity: 1500,

    flapPower: -460,

    pipeSpeed: 185,

    pipeWidth: 62,

    pipeGap: 170,

    spawnInterval: 1.55,

    groundHeight: 55

};


/* =========================
   RESIZE
========================= */

function resizeCanvas() {

    const rect =
        gameArea.getBoundingClientRect();

    width = rect.width;

    height = rect.height;

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.floor(width * dpr);

    canvas.height =
        Math.floor(height * dpr);

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    if (gameState === "menu") {

        bird.x =
            width * 0.28;

        bird.y =
            height * 0.45;
    }
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

startBest.textContent =
    bestScore;


/* =========================
   UTILITY
========================= */

function random(min, max) {

    return (
        Math.random() *
        (max - min) +
        min
    );
}


function vibrate(pattern) {

    if ("vibrate" in navigator) {

        navigator.vibrate(pattern);
    }
}


function goHome() {

    window.location.href =
        "../../";
}


/* =========================
   RESET
========================= */

function resetGame() {

    score = 0;

    spawnTimer = 0;

    pipes = [];

    particles = [];

    bird.x =
        width * 0.28;

    bird.y =
        height * 0.45;

    bird.velocity = 0;

    bird.rotation = 0;

    scoreDisplay.textContent =
        "0";
}


/* =========================
   START
========================= */

function startGame() {

    resetGame();

    gameState =
        "playing";

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    hint.classList.remove(
        "hide"
    );

    lastTime =
        performance.now();

    flap();

    vibrate(20);
}


/* =========================
   RESTART
========================= */

function restartGame() {

    startGame();
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    if (
        gameState === "gameover"
    ) {
        return;
    }

    gameState =
        "gameover";

    if (score > bestScore) {

        bestScore =
            score;

        localStorage.setItem(
            "flappyBest",
            bestScore
        );
    }

    finalScore.textContent =
        score;

    finalBest.textContent =
        bestScore;

    startBest.textContent =
        bestScore;

    gameOverScreen.classList.remove(
        "hidden"
    );

    vibrate([
        40,
        50,
        80
    ]);
}


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (
        gameState === "playing"
    ) {

        gameState =
            "paused";

        pauseScreen.classList.remove(
            "hidden"
        );

    } else if (
        gameState === "paused"
    ) {

        gameState =
            "playing";

        pauseScreen.classList.add(
            "hidden"
        );

        lastTime =
            performance.now();
    }
}


/* =========================
   FLAP
========================= */

function flap() {

    if (
        gameState !== "playing"
    ) {
        return;
    }

    bird.velocity =
        settings.flapPower;

    hint.classList.add(
        "hide"
    );

    createFlapParticles();

    vibrate(12);
}


/* =========================
   PIPE SETTINGS
========================= */

function getCurrentPipeGap() {

    return Math.max(
        128,
        settings.pipeGap -
        Math.min(
            score * 1.5,
            42
        )
    );
}


function getCurrentPipeSpeed() {

    return (
        settings.pipeSpeed +
        Math.min(
            score * 2.2,
            85
        )
    );
}


/* =========================
   SPAWN PIPE
========================= */

function spawnDynamicPipe() {

    const gap =
        getCurrentPipeGap();

    const minTop =
        75;

    const maxTop =
        height -
        settings.groundHeight -
        gap -
        75;

    const top =
        random(
            minTop,
            Math.max(
                minTop + 1,
                maxTop
            )
        );

    pipes.push({

        x: width + 20,

        top: top,

        bottom:
            top + gap,

        scored: false

    });
}


/* =========================
   UPDATE
========================= */

function update(dt) {

    if (
        gameState !== "playing"
    ) {
        return;
    }

    dt =
        Math.min(
            dt,
            0.035
        );


    /* Bird physics */

    bird.velocity +=
        settings.gravity * dt;

    bird.y +=
        bird.velocity * dt;


    const targetRotation =
        Math.min(
            Math.max(
                bird.velocity / 650,
                -0.5
            ),
            1.25
        );

    bird.rotation +=
        (
            targetRotation -
            bird.rotation
        ) *
        Math.min(
            dt * 8,
            1
        );


    /* Pipe spawning */

    spawnTimer += dt;

    if (
        spawnTimer >=
        settings.spawnInterval
    ) {

        spawnTimer = 0;

        spawnDynamicPipe();
    }


    /* Move pipes */

    const pipeSpeed =
        getCurrentPipeSpeed();

    for (
        let i = pipes.length - 1;
        i >= 0;
        i--
    ) {

        const pipe =
            pipes[i];

        pipe.x -=
            pipeSpeed * dt;


        /* Score */

        if (
            !pipe.scored &&
            pipe.x +
                settings.pipeWidth <
                bird.x
        ) {

            pipe.scored =
                true;

            score++;

            scoreDisplay.textContent =
                score;

            createScoreParticles();

            vibrate(25);
        }


        /* Remove old pipes */

        if (
            pipe.x +
                settings.pipeWidth <
                -20
        ) {

            pipes.splice(
                i,
                1
            );
        }
    }


    checkCollisions();

    updateParticles(dt);
}


/* =========================
   COLLISION
========================= */

function circleRectCollision(
    cx,
    cy,
    radius,
    rx,
    ry,
    rw,
    rh
) {

    const closestX =
        Math.max(
            rx,
            Math.min(
                cx,
                rx + rw
            )
        );

    const closestY =
        Math.max(
            ry,
            Math.min(
                cy,
                ry + rh
            )
        );

    const dx =
        cx - closestX;

    const dy =
        cy - closestY;

    return (
        dx * dx +
        dy * dy <
        radius * radius
    );
}


function checkCollisions() {

    const groundY =
        height -
        settings.groundHeight;


    /* Ceiling */

    if (
        bird.y -
            bird.radius <=
        0
    ) {

        bird.y =
            bird.radius;

        endGame();

        return;
    }


    /* Ground */

    if (
        bird.y +
            bird.radius >=
        groundY
    ) {

        bird.y =
            groundY -
            bird.radius;

        endGame();

        return;
    }


    /* Pipes */

    for (
        const pipe of pipes
    ) {

        const hitTop =
            circleRectCollision(
                bird.x,
                bird.y,
                bird.radius,

                pipe.x,
                0,

                settings.pipeWidth,
                pipe.top
            );


        const hitBottom =
            circleRectCollision(
                bird.x,
                bird.y,
                bird.radius,

                pipe.x,
                pipe.bottom,

                settings.pipeWidth,

                groundY -
                pipe.bottom
            );


        if (
            hitTop ||
            hitBottom
        ) {

            endGame();

            return;
        }
    }
}


/* =========================
   PARTICLES
========================= */

function createFlapParticles() {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        particles.push({

            x:
                bird.x - 9,

            y:
                bird.y +
                random(-5, 7),

            vx:
                random(
                    -70,
                    -20
                ),

            vy:
                random(
                    -20,
                    20
                ),

            life:
                0.35,

            maxLife:
                0.35,

            size:
                random(
                    2,
                    4
                )
        });
    }
}


function createScoreParticles() {

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        particles.push({

            x:
                bird.x,

            y:
                bird.y,

            vx:
                random(
                    -60,
                    60
                ),

            vy:
                random(
                    -100,
                    40
                ),

            life:
                0.45,

            maxLife:
                0.45,

            size:
                random(
                    2,
                    4
                )
        });
    }
}


function updateParticles(dt) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.life -= dt;

        p.x +=
            p.vx * dt;

        p.y +=
            p.vy * dt;

        p.vy +=
            250 * dt;

        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


/* =========================
   DRAW BACKGROUND
========================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#13291d"
    );

    gradient.addColorStop(
        0.6,
        "#0b1c13"
    );

    gradient.addColorStop(
        1,
        "#08130d"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* Glow */

    const glow =
        ctx.createRadialGradient(
            width * 0.5,
            height * 0.25,
            0,
            width * 0.5,
            height * 0.25,
            width * 0.7
        );

    glow.addColorStop(
        0,
        "rgba(104, 161, 113, 0.13)"
    );

    glow.addColorStop(
        1,
        "rgba(104, 161, 113, 0)"
    );

    ctx.fillStyle =
        glow;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* Clouds */

    ctx.fillStyle =
        "rgba(183, 215, 190, 0.035)";

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const x =
            (
                i * 230 +
                performance.now() *
                0.008
            ) %
            (
                width + 300
            ) -
            150;

        const y =
            80 +
            i * 85;

        ctx.beginPath();

        ctx.ellipse(
            x,
            y,
            70,
            18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


/* =========================
   DRAW PIPES
========================= */

function drawPipes() {

    for (
        const pipe of pipes
    ) {

        drawPipe(
            pipe.x,
            0,
            pipe.top,
            false
        );

        drawPipe(
            pipe.x,
            pipe.bottom,
            height -
                settings.groundHeight -
                pipe.bottom,
            true
        );
    }
}


function drawPipe(
    x,
    y,
    h,
    upsideDown
) {

    const pipeWidth =
        settings.pipeWidth;

    const capHeight =
        20;

    const capExtra =
        7;


    const bodyGradient =
        ctx.createLinearGradient(
            x,
            0,
            x + pipeWidth,
            0
        );

    bodyGradient.addColorStop(
        0,
        "#4d8c5a"
    );

    bodyGradient.addColorStop(
        0.35,
        "#7ebc83"
    );

    bodyGradient.addColorStop(
        0.65,
        "#5d9e68"
    );

    bodyGradient.addColorStop(
        1,
        "#376c45"
    );


    ctx.fillStyle =
        bodyGradient;


    if (!upsideDown) {

        ctx.fillRect(
            x,
            y,
            pipeWidth,
            Math.max(
                0,
                h - capHeight
            )
        );

        ctx.fillStyle =
            "#74ad79";

        ctx.fillRect(
            x - capExtra,
            y + h - capHeight,
            pipeWidth +
                capExtra * 2,
            capHeight
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.08)";

        ctx.fillRect(
            x + 8,
            y,
            8,
            Math.max(
                0,
                h - capHeight
            )
        );

    } else {

        ctx.fillRect(
            x,
            y + capHeight,
            pipeWidth,
            Math.max(
                0,
                h - capHeight
            )
        );

        ctx.fillStyle =
            "#74ad79";

        ctx.fillRect(
            x - capExtra,
            y,
            pipeWidth +
                capExtra * 2,
            capHeight
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.08)";

        ctx.fillRect(
            x + 8,
            y + capHeight,
            8,
            Math.max(
                0,
                h - capHeight
            )
        );
    }
}


/* =========================
   GROUND
========================= */

function drawGround() {

    const groundY =
        height -
        settings.groundHeight;


    ctx.fillStyle =
        "#14291b";

    ctx.fillRect(
        0,
        groundY,
        width,
        settings.groundHeight
    );


    ctx.fillStyle =
        "#477b4f";

    ctx.fillRect(
        0,
        groundY,
        width,
        7
    );


    ctx.fillStyle =
        "rgba(180, 211, 173, 0.08)";


    const offset =
        (
            performance.now() *
            0.08
        ) % 35;


    for (
        let x =
            -35 + offset;
        x < width + 35;
        x += 35
    ) {

        ctx.fillRect(
            x,
            groundY + 10,
            17,
            5
        );
    }
}


/* =========================
   DRAW BIRD
========================= */

function drawBird() {

    ctx.save();

    ctx.translate(
        bird.x,
        bird.y
    );

    ctx.rotate(
        bird.rotation
    );


    /* Shadow */

    ctx.fillStyle =
        "rgba(0,0,0,0.2)";

    ctx.beginPath();

    ctx.ellipse(
        2,
        bird.radius + 7,
        bird.radius * 0.9,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Body */

    const birdGradient =
        ctx.createLinearGradient(
            -bird.radius,
            -bird.radius,
            bird.radius,
            bird.radius
        );

    birdGradient.addColorStop(
        0,
        "#f1dd75"
    );

    birdGradient.addColorStop(
        1,
        "#c4a942"
    );

    ctx.fillStyle =
        birdGradient;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        bird.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Wing */

    ctx.fillStyle =
        "#d0b94f";

    ctx.beginPath();

    ctx.ellipse(
        -5,
        5,
        9,
        5,
        -0.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Eye */

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        6,
        -6,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#182016";

    ctx.beginPath();

    ctx.arc(
        7.5,
        -6,
        2.3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Beak */

    ctx.fillStyle =
        "#d6814a";

    ctx.beginPath();

    ctx.moveTo(
        13,
        -1
    );

    ctx.lineTo(
        24,
        3
    );

    ctx.lineTo(
        13,
        7
    );

    ctx.closePath();

    ctx.fill();


    ctx.restore();
}


/* =========================
   DRAW PARTICLES
========================= */

function drawParticles() {

    for (
        const p of particles
    ) {

        const alpha =
            Math.max(
                0,
                p.life /
                p.maxLife
            );

        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            "#b4d6ba";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha =
        1;
}


/* =========================
   DRAW
========================= */

function draw() {

    drawBackground();

    drawPipes();

    drawGround();

    drawParticles();

    drawBird();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(timestamp) {

    const dt =
        (
            timestamp -
            lastTime
        ) / 1000;

    lastTime =
        timestamp;

    update(dt);

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   INPUT
========================= */

function handleInput(event) {

    event.preventDefault();

    if (
        gameState === "playing"
    ) {

        flap();
    }
}


gameArea.addEventListener(
    "pointerdown",
    handleInput
);


startBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        startGame();
    }
);


restartBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        restartGame();
    }
);


homeBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        goHome();
    }
);


backBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        goHome();
    }
);


pauseBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        togglePause();
    }
);


resumeBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        togglePause();
    }
);


restartPauseBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        restartGame();
    }
);


/* Keyboard */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            if (
                gameState === "playing"
            ) {

                flap();

            } else if (
                gameState === "menu"
            ) {

                startGame();
            }
        }


        if (
            event.code === "Escape"
        ) {

            togglePause();
        }
    }
);


/* =========================
   INITIALIZE
========================= */

resetGame();

draw();

requestAnimationFrame(
    timestamp => {

        lastTime =
            timestamp;

        requestAnimationFrame(
            gameLoop
        );
    }
);