const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const nextCanvas =
    document.getElementById("nextCanvas");

const nextCtx =
    nextCanvas.getContext("2d");

const holdCanvas =
    document.getElementById("holdCanvas");

const holdCtx =
    holdCanvas.getContext("2d");


/* =========================
   UI
========================= */

const scoreElement =
    document.getElementById("score");

const bestElement =
    document.getElementById("best");

const linesElement =
    document.getElementById("lines");

const levelElement =
    document.getElementById("level");

const pauseOverlay =
    document.getElementById("pauseOverlay");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const finalScore =
    document.getElementById("finalScore");

const finalBest =
    document.getElementById("finalBest");


/* =========================
   BOARD
========================= */

const COLS = 10;
const ROWS = 20;

let board;


/* =========================
   COLORS
========================= */

const COLORS = {
    I: "#62c6c9",
    J: "#6085d2",
    L: "#d79559",
    O: "#d2c65c",
    S: "#70b87a",
    T: "#a77ac4",
    Z: "#c96c72"
};


/* =========================
   PIECES
========================= */

const PIECES = {

    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

const TYPES =
    Object.keys(PIECES);


/* =========================
   STATE
========================= */

let current = null;

let nextType = null;

let holdType = null;

let canHold = true;

let bag = [];

let score = 0;

let lines = 0;

let level = 1;

let best =
    Number(
        localStorage.getItem(
            "asianBoyTetrisBest"
        ) || 0
    );

let state = "playing";

let dropTimer = 0;

let lastTime = 0;

let cellSize = 20;


/* =========================
   BAG RANDOMIZER
========================= */

function shuffleBag() {

    bag =
        [...TYPES];

    for (
        let i = bag.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            bag[i],
            bag[j]
        ] =
        [
            bag[j],
            bag[i]
        ];
    }
}


function randomType() {

    if (
        bag.length === 0
    ) {
        shuffleBag();
    }

    return bag.pop();
}


/* =========================
   BOARD
========================= */

function createBoard() {

    return Array.from(
        {
            length: ROWS
        },
        () =>
            Array(
                COLS
            ).fill(null)
    );
}


/* =========================
   PIECE
========================= */

function createPiece(type) {

    const matrix =
        PIECES[type].map(
            row => [...row]
        );

    return {

        type,

        matrix,

        x:
            Math.floor(
                (
                    COLS -
                    matrix[0].length
                ) / 2
            ),

        y: -1
    };
}


/* =========================
   RESET
========================= */

function resetGame() {

    board =
        createBoard();

    score = 0;

    lines = 0;

    level = 1;

    holdType = null;

    canHold = true;

    bag = [];

    nextType =
        randomType();

    current =
        createPiece(
            nextType
        );

    nextType =
        randomType();

    state = "playing";

    dropTimer = 0;

    pauseOverlay.classList.add(
        "hidden"
    );

    gameOverOverlay.classList.add(
        "hidden"
    );

    updateUI();

    drawPreviews();
}


/* =========================
   COLLISION
========================= */

function collision(
    matrix,
    offsetX,
    offsetY
) {

    for (
        let y = 0;
        y < matrix.length;
        y++
    ) {

        for (
            let x = 0;
            x < matrix[y].length;
            x++
        ) {

            if (
                !matrix[y][x]
            ) {
                continue;
            }

            const bx =
                offsetX + x;

            const by =
                offsetY + y;

            if (
                bx < 0 ||
                bx >= COLS ||
                by >= ROWS
            ) {
                return true;
            }

            if (
                by >= 0 &&
                board[by][bx]
            ) {
                return true;
            }
        }
    }

    return false;
}


/* =========================
   SPAWN
========================= */

function spawnPiece() {

    current =
        createPiece(
            nextType
        );

    nextType =
        randomType();

    canHold = true;

    if (
        collision(
            current.matrix,
            current.x,
            current.y
        )
    ) {

        endGame();
    }

    drawPreviews();
}


/* =========================
   MOVE
========================= */

function moveLeft() {

    if (
        state !== "playing"
    ) return;

    if (
        !collision(
            current.matrix,
            current.x - 1,
            current.y
        )
    ) {

        current.x--;

        vibrate(5);
    }
}


function moveRight() {

    if (
        state !== "playing"
    ) return;

    if (
        !collision(
            current.matrix,
            current.x + 1,
            current.y
        )
    ) {

        current.x++;

        vibrate(5);
    }
}


/* =========================
   SOFT DROP
========================= */

function softDrop() {

    if (
        state !== "playing"
    ) return;

    if (
        !collision(
            current.matrix,
            current.x,
            current.y + 1
        )
    ) {

        current.y++;

        score++;

    } else {

        lockPiece();
    }

    updateUI();
}


/* =========================
   HARD DROP
========================= */

function hardDrop() {

    if (
        state !== "playing"
    ) return;

    let distance = 0;

    while (
        !collision(
            current.matrix,
            current.x,
            current.y + 1
        )
    ) {

        current.y++;

        distance++;
    }

    score +=
        distance * 2;

    vibrate(20);

    lockPiece();
}


/* =========================
   ROTATION
========================= */

function rotateMatrix(matrix) {

    return matrix[0].map(
        (_, index) =>
            matrix
                .map(
                    row =>
                        row[index]
                )
                .reverse()
    );
}


function rotatePiece() {

    if (
        state !== "playing"
    ) return;

    const rotated =
        rotateMatrix(
            current.matrix
        );

    const kicks = [
        0,
        -1,
        1,
        -2,
        2
    ];

    for (
        const kick of kicks
    ) {

        if (
            !collision(
                rotated,
                current.x + kick,
                current.y
            )
        ) {

            current.matrix =
                rotated;

            current.x += kick;

            vibrate(10);

            return;
        }
    }
}


/* =========================
   HOLD
========================= */

function holdPiece() {

    if (
        state !== "playing" ||
        !canHold
    ) {
        return;
    }

    const oldType =
        current.type;

    if (
        holdType === null
    ) {

        holdType =
            oldType;

        spawnPiece();

    } else {

        const swap =
            holdType;

        holdType =
            oldType;

        current =
            createPiece(
                swap
            );
    }

    canHold = false;

    drawPreviews();

    vibrate(15);
}


/* =========================
   MERGE
========================= */

function mergePiece() {

    current.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (!value) {
                        return;
                    }

                    const bx =
                        current.x + x;

                    const by =
                        current.y + y;

                    if (
                        by >= 0
                    ) {

                        board[by][bx] =
                            current.type;
                    }
                }
            );
        }
    );
}


/* =========================
   LOCK
========================= */

function lockPiece() {

    mergePiece();

    const cleared =
        clearLines();

    if (
        cleared > 0
    ) {

        const points = [
            0,
            100,
            300,
            500,
            800
        ];

        score +=
            points[cleared] *
            level;

        lines +=
            cleared;

        level =
            Math.floor(
                lines / 10
            ) + 1;

        vibrate(
            cleared === 4
                ? [20, 40, 90]
                : 30
        );
    }

    spawnPiece();

    dropTimer = 0;

    updateUI();
}


/* =========================
   CLEAR LINES
========================= */

function clearLines() {

    let count = 0;

    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        if (
            board[y].every(
                cell =>
                    cell !== null
            )
        ) {

            board.splice(
                y,
                1
            );

            board.unshift(
                Array(
                    COLS
                ).fill(null)
            );

            count++;

            y++;
        }
    }

    return count;
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    state =
        "gameover";

    if (
        score > best
    ) {

        best =
            score;

        localStorage.setItem(
            "asianBoyTetrisBest",
            best
        );
    }

    finalScore.textContent =
        score;

    finalBest.textContent =
        best;

    gameOverOverlay.classList.remove(
        "hidden"
    );

    vibrate([
        40,
        50,
        100
    ]);

    updateUI();
}


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (
        state === "playing"
    ) {

        state =
            "paused";

        pauseOverlay.classList.remove(
            "hidden"
        );

    } else if (
        state === "paused"
    ) {

        state =
            "playing";

        pauseOverlay.classList.add(
            "hidden"
        );

        lastTime =
            performance.now();
    }
}


/* =========================
   SPEED
========================= */

function getDropInterval() {

    return Math.max(
        80,
        850 -
        (
            level - 1
        ) * 70
    );
}


/* =========================
   UPDATE
========================= */

function update(timestamp) {

    if (
        state !== "playing"
    ) {

        lastTime =
            timestamp;

        return;
    }

    const delta =
        timestamp -
        lastTime;

    lastTime =
        timestamp;

    dropTimer +=
        delta;

    if (
        dropTimer >=
        getDropInterval()
    ) {

        dropTimer = 0;

        if (
            !collision(
                current.matrix,
                current.x,
                current.y + 1
            )
        ) {

            current.y++;

        } else {

            lockPiece();
        }
    }
}


/* =========================
   CANVAS
========================= */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    cellSize =
        rect.width /
        COLS;

    draw();
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================
   DRAW CELL
========================= */

function drawCell(
    context,
    x,
    y,
    size,
    color,
    alpha = 1
) {

    context.globalAlpha =
        alpha;

    context.fillStyle =
        color;

    context.fillRect(
        x + 1,
        y + 1,
        size - 2,
        size - 2
    );

    context.fillStyle =
        "rgba(255,255,255,0.13)";

    context.fillRect(
        x + 2,
        y + 2,
        size - 5,
        Math.max(
            2,
            size * 0.12
        )
    );

    context.globalAlpha =
        1;
}


/* =========================
   GHOST
========================= */

function ghostY() {

    let y =
        current.y;

    while (
        !collision(
            current.matrix,
            current.x,
            y + 1
        )
    ) {

        y++;
    }

    return y;
}


/* =========================
   DRAW GAME
========================= */

function draw() {

    if (
        canvas.clientWidth <= 0
    ) {
        return;
    }

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#06100b";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* Grid */

    ctx.strokeStyle =
        "rgba(160,210,170,0.05)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= COLS;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x * cellSize,
            0
        );

        ctx.lineTo(
            x * cellSize,
            height
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= ROWS;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * cellSize
        );

        ctx.lineTo(
            width,
            y * cellSize
        );

        ctx.stroke();
    }


    /* Locked blocks */

    for (
        let y = 0;
        y < ROWS;
        y++
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (
                board[y][x]
            ) {

                drawCell(
                    ctx,

                    x * cellSize,
                    y * cellSize,

                    cellSize,

                    COLORS[
                        board[y][x]
                    ]
                );
            }
        }
    }


    if (
        !current ||
        state === "gameover"
    ) {
        return;
    }


    /* Ghost */

    const gy =
        ghostY();

    current.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (!value) {
                        return;
                    }

                    if (
                        gy + y < 0
                    ) {
                        return;
                    }

                    drawCell(
                        ctx,

                        (
                            current.x +
                            x
                        ) * cellSize,

                        (
                            gy +
                            y
                        ) * cellSize,

                        cellSize,

                        COLORS[
                            current.type
                        ],

                        0.16
                    );
                }
            );
        }
    );


    /* Current piece */

    current.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (!value) {
                        return;
                    }

                    if (
                        current.y + y < 0
                    ) {
                        return;
                    }

                    drawCell(
                        ctx,

                        (
                            current.x +
                            x
                        ) * cellSize,

                        (
                            current.y +
                            y
                        ) * cellSize,

                        cellSize,

                        COLORS[
                            current.type
                        ]
                    );
                }
            );
        }
    );
}


/* =========================
   PREVIEWS
========================= */

function drawPreview(
    context,
    element,
    type
) {

    const rect =
        element.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    element.width =
        rect.width * dpr;

    element.height =
        rect.height * dpr;

    context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );

    if (!type) {
        return;
    }

    const matrix =
        PIECES[type];

    const size =
        Math.min(
            rect.width,
            rect.height
        ) / 4.5;

    const width =
        matrix[0].length *
        size;

    const height =
        matrix.length *
        size;

    const offsetX =
        (
            rect.width -
            width
        ) / 2;

    const offsetY =
        (
            rect.height -
            height
        ) / 2;

    matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (!value) {
                        return;
                    }

                    drawCell(
                        context,

                        offsetX +
                        x * size,

                        offsetY +
                        y * size,

                        size,

                        COLORS[type]
                    );
                }
            );
        }
    );
}


function drawPreviews() {

    drawPreview(
        nextCtx,
        nextCanvas,
        nextType
    );

    drawPreview(
        holdCtx,
        holdCanvas,
        holdType
    );
}


/* =========================
   UI
========================= */

function updateUI() {

    scoreElement.textContent =
        score;

    bestElement.textContent =
        best;

    linesElement.textContent =
        lines;

    levelElement.textContent =
        level;
}


/* =========================
   VIBRATION
========================= */

function vibrate(pattern) {

    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            pattern
        );
    }
}


/* =========================
   BUTTONS
========================= */

document
    .getElementById("leftBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            moveLeft();
        }
    );


document
    .getElementById("rightBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            moveRight();
        }
    );


document
    .getElementById("rotateBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            rotatePiece();
        }
    );


document
    .getElementById("downBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            softDrop();
        }
    );


document
    .getElementById("dropBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            hardDrop();
        }
    );


document
    .getElementById("holdBtn")
    .addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            holdPiece();
        }
    );


document
    .getElementById("pauseBtn")
    .addEventListener(
        "click",
        togglePause
    );


document
    .getElementById("resumeBtn")
    .addEventListener(
        "click",
        togglePause
    );


document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        () => {

            resetGame();

            lastTime =
                performance.now();
        }
    );


document
    .getElementById("homeBtn")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "../../";
        }
    );


/* =========================
   TOUCH / SWIPE
========================= */

let startX = 0;
let startY = 0;
let startTime = 0;

canvas.addEventListener(
    "pointerdown",
    event => {

        startX =
            event.clientX;

        startY =
            event.clientY;

        startTime =
            performance.now();

        canvas.setPointerCapture(
            event.pointerId
        );
    }
);


canvas.addEventListener(
    "pointerup",
    event => {

        const dx =
            event.clientX -
            startX;

        const dy =
            event.clientY -
            startY;

        const duration =
            performance.now() -
            startTime;

        const absX =
            Math.abs(dx);

        const absY =
            Math.abs(dy);


        /* Tap = rotate */

        if (
            absX < 15 &&
            absY < 15 &&
            duration < 250
        ) {

            rotatePiece();

            return;
        }


        /* Swipe down = hard drop */

        if (
            absY > absX &&
            dy > 45
        ) {

            hardDrop();

            return;
        }


        /* Horizontal swipe */

        if (
            absX > absY &&
            absX > 30
        ) {

            if (
                dx < 0
            ) {

                moveLeft();

            } else {

                moveRight();
            }

            return;
        }


        /* Small downward movement */

        if (
            dy > 15
        ) {

            softDrop();
        }
    }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        switch (
            event.code
        ) {

            case "ArrowLeft":

                event.preventDefault();

                moveLeft();

                break;


            case "ArrowRight":

                event.preventDefault();

                moveRight();

                break;


            case "ArrowDown":

                event.preventDefault();

                softDrop();

                break;


            case "ArrowUp":
            case "KeyX":

                event.preventDefault();

                rotatePiece();

                break;


            case "Space":

                event.preventDefault();

                hardDrop();

                break;


            case "KeyC":

                event.preventDefault();

                holdPiece();

                break;


            case "Escape":

                togglePause();

                break;
        }
    }
);


/* =========================
   LOOP
========================= */

function loop(timestamp) {

    update(timestamp);

    draw();

    requestAnimationFrame(
        loop
    );
}


/* =========================
   START
========================= */

resetGame();

resizeCanvas();

updateUI();

lastTime =
    performance.now();

requestAnimationFrame(
    loop
);