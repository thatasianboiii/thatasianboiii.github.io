/* =========================================================
   BREAKOUT
   Mobile-first canvas game
========================================================= */


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   UI
========================================================= */

const scoreElement =
    document.getElementById("score");

const levelElement =
    document.getElementById("level");

const livesElement =
    document.getElementById("lives");


const startOverlay =
    document.getElementById("startOverlay");

const pauseOverlay =
    document.getElementById("pauseOverlay");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const levelOverlay =
    document.getElementById("levelOverlay");


const finalScoreElement =
    document.getElementById("finalScore");


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        restartGame
    );


document
    .getElementById("nextLevelButton")
    .addEventListener(
        "click",
        nextLevel
    );


document
    .getElementById("pauseButton")
    .addEventListener(
        "click",
        togglePause
    );


document
    .getElementById("resumeButton")
    .addEventListener(
        "click",
        togglePause
    );


document
    .getElementById("backButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../../index.html";

        }
    );


/* =========================================================
   GAME STATE
========================================================= */

let score = 0;

let level = 1;

let lives = 3;

let running = false;

let paused = false;

let gameOver = false;

let levelComplete = false;


/* =========================================================
   CANVAS
========================================================= */

let width = 0;

let height = 0;

let dpr = 1;


function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    width =
        rect.width;

    height =
        rect.height;


    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
        Keep paddle inside new canvas.
    */

    paddle.x =
        Math.min(
            paddle.x,
            width - paddle.width
        );


    if (!running) {

        resetBall();

    }

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   PADDLE
========================================================= */

const paddle = {

    width: 88,

    height: 10,

    x: 0,

    y: 0,

    speed: 0.75

};


function positionPaddle() {

    paddle.y =
        height - 35;

}


function resetPaddle() {

    paddle.x =
        (
            width -
            paddle.width
        ) / 2;

    positionPaddle();

}


/* =========================================================
   BALL
========================================================= */

const ball = {

    x: 0,

    y: 0,

    radius: 6,

    vx: 0,

    vy: 0,

    speed: 4

};


function resetBall() {

    ball.x =
        width / 2;

    ball.y =
        height - 55;


    /*
        Start with a slight horizontal angle.
    */

    const angle =
        (
            Math.random() * 0.8
        ) - 0.4;


    ball.speed =
        4 +
        (
            level - 1
        ) * 0.45;


    ball.vx =
        Math.sin(angle) *
        ball.speed;

    ball.vy =
        -Math.cos(angle) *
        ball.speed;

}


/* =========================================================
   BRICKS
========================================================= */

let bricks = [];


function createBricks() {

    bricks = [];


    const rows =
        Math.min(
            4 + level,
            8
        );


    const columns =
        7;


    const gap =
        5;


    const sidePadding =
        10;


    const brickWidth =
        (
            width -
            sidePadding * 2 -
            gap * (columns - 1)
        ) / columns;


    const brickHeight =
        17;


    const top =
        25;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            bricks.push({

                x:
                    sidePadding +
                    column *
                    (
                        brickWidth +
                        gap
                    ),

                y:
                    top +
                    row *
                    (
                        brickHeight +
                        gap
                    ),

                width:
                    brickWidth,

                height:
                    brickHeight,

                alive:
                    true

            });

        }

    }

}


/* =========================================================
   START
========================================================= */

function startGame() {

    score =
        0;

    level =
        1;

    lives =
        3;

    gameOver =
        false;

    levelComplete =
        false;

    running =
        true;

    paused =
        false;


    updateUI();


    hideOverlay(
        startOverlay
    );

    hideOverlay(
        gameOverOverlay
    );

    hideOverlay(
        levelOverlay
    );

    hideOverlay(
        pauseOverlay
    );


    resetPaddle();

    createBricks();

    resetBall();


    if (
        navigator.vibrate
    ) {

        navigator.vibrate(20);

    }

}


function restartGame() {

    startGame();

}


/* =========================================================
   NEXT LEVEL
========================================================= */

function nextLevel() {

    level++;

    levelComplete =
        false;

    running =
        true;

    paused =
        false;


    hideOverlay(
        levelOverlay
    );


    resetPaddle();

    createBricks();

    resetBall();

    updateUI();

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        !running ||
        gameOver ||
        levelComplete
    ) {

        return;

    }


    paused =
        !paused;


    if (paused) {

        showOverlay(
            pauseOverlay
        );

    } else {

        hideOverlay(
            pauseOverlay
        );

    }

}


/* =========================================================
   OVERLAYS
========================================================= */

function showOverlay(
    element
) {

    element.classList.add(
        "visible"
    );

}


function hideOverlay(
    element
) {

    element.classList.remove(
        "visible"
    );

}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    scoreElement.textContent =
        score;

    levelElement.textContent =
        level;

    livesElement.textContent =
        lives;

}


/* =========================================================
   TOUCH CONTROL
========================================================= */

let dragging =
    false;


function movePaddle(
    clientX
) {

    const rect =
        canvas.getBoundingClientRect();


    const x =
        clientX -
        rect.left;


    paddle.x =
        x -
        paddle.width / 2;


    if (
        paddle.x < 0
    ) {

        paddle.x =
            0;

    }


    if (
        paddle.x >
        width - paddle.width
    ) {

        paddle.x =
            width -
            paddle.width;

    }

}


/* =========================================================
   POINTER DOWN
========================================================= */

canvas.addEventListener(
    "pointerdown",

    event => {

        dragging =
            true;


        canvas.setPointerCapture(
            event.pointerId
        );


        movePaddle(
            event.clientX
        );

    }
);


/* =========================================================
   POINTER MOVE
========================================================= */

canvas.addEventListener(
    "pointermove",

    event => {

        if (!dragging) {

            return;

        }


        movePaddle(
            event.clientX
        );

    }
);


/* =========================================================
   POINTER UP
========================================================= */

canvas.addEventListener(
    "pointerup",

    event => {

        dragging =
            false;


        try {

            canvas.releasePointerCapture(
                event.pointerId
            );

        } catch {}

    }
);


canvas.addEventListener(
    "pointercancel",

    () => {

        dragging =
            false;

    }
);


/* =========================================================
   COLLISION: BALL + PADDLE
========================================================= */

function paddleCollision() {

    if (
        ball.y +
        ball.radius <
        paddle.y
    ) {

        return false;

    }


    if (
        ball.y -
        ball.radius >
        paddle.y +
        paddle.height
    ) {

        return false;

    }


    if (
        ball.x <
        paddle.x
    ) {

        return false;

    }


    if (
        ball.x >
        paddle.x +
        paddle.width
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   UPDATE BALL
========================================================= */

function updateBall() {

    /*
        Move.
    */

    ball.x +=
        ball.vx;

    ball.y +=
        ball.vy;


    /*
        Left wall.
    */

    if (
        ball.x -
        ball.radius <= 0
    ) {

        ball.x =
            ball.radius;

        ball.vx =
            Math.abs(
                ball.vx
            );

    }


    /*
        Right wall.
    */

    if (
        ball.x +
        ball.radius >= width
    ) {

        ball.x =
            width -
            ball.radius;

        ball.vx =
            -Math.abs(
                ball.vx
            );

    }


    /*
        Ceiling.
    */

    if (
        ball.y -
        ball.radius <= 0
    ) {

        ball.y =
            ball.radius;

        ball.vy =
            Math.abs(
                ball.vy
            );

    }


    /*
        Paddle.
    */

    if (
        ball.vy > 0 &&
        paddleCollision()
    ) {

        /*
            Determine where on the paddle
            the ball hit.

            -1 = far left
             0 = centre
            +1 = far right
        */

        const hitPosition =
            (
                ball.x -
                (
                    paddle.x +
                    paddle.width / 2
                )
            ) /
            (
                paddle.width / 2
            );


        const maxAngle =
            Math.PI * 0.42;


        const angle =
            hitPosition *
            maxAngle;


        const speed =
            Math.sqrt(
                ball.vx *
                ball.vx +
                ball.vy *
                ball.vy
            );


        ball.vx =
            Math.sin(
                angle
            ) *
            speed;


        ball.vy =
            -Math.cos(
                angle
            ) *
            speed;


        ball.y =
            paddle.y -
            ball.radius;

    }


    /*
        Ball fell below paddle.
    */

    if (
        ball.y -
        ball.radius >
        height
    ) {

        loseLife();

    }


    /*
        Bricks.
    */

    checkBrickCollisions();

}


/* =========================================================
   BRICK COLLISIONS
========================================================= */

function checkBrickCollisions() {

    for (
        const brick of bricks
    ) {

        if (!brick.alive) {

            continue;

        }


        if (
            ball.x +
            ball.radius <
            brick.x
        ) {

            continue;

        }


        if (
            ball.x -
            ball.radius >
            brick.x +
            brick.width
        ) {

            continue;

        }


        if (
            ball.y +
            ball.radius <
            brick.y
        ) {

            continue;

        }


        if (
            ball.y -
            ball.radius >
            brick.y +
            brick.height
        ) {

            continue;

        }


        /*
            Brick destroyed.
        */

        brick.alive =
            false;


        score +=
            10 *
            level;


        /*
            Determine which side
            was hit.
        */

        const overlapLeft =
            ball.x +
            ball.radius -
            brick.x;


        const overlapRight =
            brick.x +
            brick.width -
            (
                ball.x -
                ball.radius
            );


        const overlapTop =
            ball.y +
            ball.radius -
            brick.y;


        const overlapBottom =
            brick.y +
            brick.height -
            (
                ball.y -
                ball.radius
            );


        const minHorizontal =
            Math.min(
                overlapLeft,
                overlapRight
            );


        const minVertical =
            Math.min(
                overlapTop,
                overlapBottom
            );


        if (
            minHorizontal <
            minVertical
        ) {

            ball.vx =
                -ball.vx;

        } else {

            ball.vy =
                -ball.vy;

        }


        /*
            Small haptic feedback.
        */

        if (
            navigator.vibrate
        ) {

            navigator.vibrate(
                8
            );

        }


        break;

    }


    /*
        Check if every brick
        has been destroyed.
    */

    const remaining =
        bricks.some(
            brick =>
                brick.alive
        );


    if (!remaining) {

        completeLevel();

    }


    updateUI();

}


/* =========================================================
   LOSE LIFE
========================================================= */

function loseLife() {

    lives--;

    updateUI();


    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            [30, 40, 30]
        );

    }


    if (
        lives <= 0
    ) {

        endGame();

        return;

    }


    resetPaddle();

    resetBall();

}


/* =========================================================
   LEVEL COMPLETE
========================================================= */

function completeLevel() {

    running =
        false;

    levelComplete =
        true;


    showOverlay(
        levelOverlay
    );


    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            [15, 40, 15]
        );

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    running =
        false;

    gameOver =
        true;


    finalScoreElement.textContent =
        score;


    showOverlay(
        gameOverOverlay
    );

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    /*
        Subtle dark green background.
    */

    ctx.fillStyle =
        "#07120d";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
        Soft centre glow.
    */

    const gradient =
        ctx.createRadialGradient(
            width / 2,
            height * 0.35,
            0,
            width / 2,
            height * 0.35,
            width * 0.75
        );


    gradient.addColorStop(
        0,
        "rgba(45, 91, 56, 0.18)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
        Very subtle grid.
    */

    ctx.strokeStyle =
        "rgba(170,210,165,0.025)";

    ctx.lineWidth =
        1;


    const grid =
        32;


    for (
        let x = 0;
        x < width;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < height;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }

}


/* =========================================================
   DRAW BRICKS
========================================================= */

function drawBricks() {

    for (
        const brick of bricks
    ) {

        if (!brick.alive) {

            continue;

        }


        /*
            Green shades based on row.
        */

        const row =
            Math.floor(
                (
                    brick.y -
                    25
                ) /
                22
            );


        const brightness =
            Math.max(
                70 -
                row * 5,
                38
            );


        ctx.fillStyle =
            `rgb(
                ${brightness},
                ${brightness + 35},
                ${brightness + 12}
            )`;


        /*
            Rounded brick.
        */

        roundRect(
            ctx,
            brick.x,
            brick.y,
            brick.width,
            brick.height,
            4
        );


        ctx.fill();


        /*
            Highlight.
        */

        ctx.fillStyle =
            "rgba(255,255,255,0.08)";


        roundRect(
            ctx,
            brick.x + 2,
            brick.y + 2,
            brick.width - 4,
            2,
            2
        );


        ctx.fill();

    }

}


/* =========================================================
   DRAW PADDLE
========================================================= */

function drawPaddle() {

    /*
        Glow.
    */

    ctx.shadowColor =
        "rgba(150,210,145,0.30)";

    ctx.shadowBlur =
        12;


    ctx.fillStyle =
        "#b5cda9";


    roundRect(
        ctx,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        5
    );


    ctx.fill();


    ctx.shadowBlur =
        0;

}


/* =========================================================
   DRAW BALL
========================================================= */

function drawBall() {

    /*
        Glow.
    */

    ctx.shadowColor =
        "rgba(210,240,190,0.65)";

    ctx.shadowBlur =
        15;


    ctx.beginPath();


    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#e4f0d9";


    ctx.fill();


    ctx.shadowBlur =
        0;

}


/* =========================================================
   ROUND RECTANGLE
========================================================= */

function roundRect(
    context,
    x,
    y,
    w,
    h,
    radius
) {

    const r =
        Math.min(
            radius,
            w / 2,
            h / 2
        );


    context.beginPath();


    context.moveTo(
        x + r,
        y
    );


    context.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        r
    );


    context.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        r
    );


    context.arcTo(
        x,
        y + h,
        x,
        y,
        r
    );


    context.arcTo(
        x,
        y,
        x + w,
        y,
        r
    );


    context.closePath();

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    drawBackground();

    drawBricks();

    drawPaddle();

    drawBall();

}


/* =========================================================
   GAME LOOP
========================================================= */

let previousTime =
    performance.now();


function gameLoop(
    currentTime
) {

    const delta =
        Math.min(
            currentTime -
            previousTime,
            32
        );


    previousTime =
        currentTime;


    if (
        running &&
        !paused &&
        !gameOver &&
        !levelComplete
    ) {

        /*
            Normalize physics around
            a 60fps frame.
        */

        const multiplier =
            delta / 16.67;


        ball.x +=
            ball.vx *
            (multiplier - 1);


        ball.y +=
            ball.vy *
            (multiplier - 1);


        /*
            The actual movement is handled
            below using the normal frame
            update.

            This keeps gameplay stable
            on mobile.
        */

        updateBall();

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

resizeCanvas();

resetPaddle();

createBricks();

resetBall();

updateUI();

requestAnimationFrame(
    gameLoop
);