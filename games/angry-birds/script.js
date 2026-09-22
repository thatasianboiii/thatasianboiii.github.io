/* =========================================
   ANGRY BIRDS
   Mobile physics game
========================================= */

const {
    Engine,
    Render,
    Runner,
    Bodies,
    Body,
    Composite,
    Constraint,
    Events,
    Vector
} = Matter;


/* =========================================
   ELEMENTS
========================================= */

const canvas = document.getElementById("gameCanvas");
const container = document.getElementById("game-container");

const scoreElement = document.getElementById("score");
const birdCountElement = document.getElementById("birdCount");

const powerElement = document.getElementById("power");
const powerFill = document.getElementById("powerFill");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const nextBtn = document.getElementById("nextBtn");

const restartBtn = document.getElementById("restartBtn");

const help = document.getElementById("help");
const helpBtn = document.getElementById("helpBtn");
const closeHelp = document.getElementById("closeHelp");

const homeBtn = document.getElementById("homeBtn");


/* =========================================
   ENGINE
========================================= */

const engine = Engine.create();

engine.gravity.y = 1;

const world = engine.world;


/* =========================================
   RENDERER
========================================= */

const render = Render.create({

    canvas: canvas,

    engine: engine,

    options: {

        width: container.clientWidth,

        height: container.clientHeight,

        wireframes: false,

        background: "transparent",

        pixelRatio: Math.min(
            window.devicePixelRatio || 1,
            2
        )
    }
});


Render.run(render);

const runner = Runner.create();

Runner.run(runner, engine);


/* =========================================
   GAME STATE
========================================= */

let score = 0;

let level = 1;

let birdsLeft = 3;

let currentBird = null;

let sling = null;

let dragging = false;

let launched = false;

let levelObjects = [];

let targetObjects = [];

let birdBodies = [];

let cameraX = 0;

let levelComplete = false;


/* =========================================
   WORLD SIZE
========================================= */

function worldWidth() {

    return Math.max(
        1000,
        container.clientWidth * 2.5
    );
}


/* =========================================
   CREATE GROUND
========================================= */

function createGround() {

    const width = worldWidth();

    const ground = Bodies.rectangle(

        width / 2,

        container.clientHeight + 30,

        width,

        60,

        {
            isStatic: true,

            render: {
                fillStyle: "#3e713d"
            }
        }
    );

    Composite.add(world, ground);

    levelObjects.push(ground);
}


/* =========================================
   CREATE SLINGSHOT
========================================= */

let slingX = 130;
let slingY = 0;

function updateSlingshotPosition() {

    slingX =
        Math.max(
            105,
            container.clientWidth * 0.22
        );

    slingY =
        container.clientHeight - 105;
}


/* =========================================
   CREATE BLOCK
========================================= */

function createBlock(
    x,
    y,
    width,
    height,
    type = "wood"
) {

    const colors = {

        wood: "#a87543",

        stone: "#8e9890",

        glass: "#8fcbd1"
    };

    const block = Bodies.rectangle(

        x,
        y,

        width,
        height,

        {
            restitution: 0.15,

            friction: 0.65,

            density: 0.003,

            label: "block",

            render: {
                fillStyle:
                    colors[type] || colors.wood,

                strokeStyle:
                    "rgba(30,50,30,0.7)",

                lineWidth: 1
            }
        }
    );

    block.blockType = type;

    Composite.add(world, block);

    levelObjects.push(block);

    return block;
}


/* =========================================
   CREATE PIG
========================================= */

function createPig(x, y) {

    const pig = Bodies.circle(

        x,
        y,

        19,

        {
            restitution: 0.25,

            friction: 0.6,

            density: 0.0015,

            label: "pig",

            render: {
                fillStyle: "#83c86b",

                strokeStyle: "#335a31",

                lineWidth: 2
            }
        }
    );

    targetObjects.push(pig);

    Composite.add(world, pig);

    return pig;
}


/* =========================================
   CREATE BIRD
========================================= */

function createBird() {

    if (birdsLeft <= 0) {
        return;
    }

    const bird = Bodies.circle(

        slingX,

        slingY,

        17,

        {
            isStatic: true,

            restitution: 0.35,

            friction: 0.5,

            density: 0.002,

            label: "bird",

            render: {
                fillStyle: "#d94235",

                strokeStyle: "#68251f",

                lineWidth: 2
            }
        }
    );

    currentBird = bird;

    birdBodies.push(bird);

    Composite.add(world, bird);


    sling = Constraint.create({

        pointA: {
            x: slingX,
            y: slingY
        },

        bodyB: bird,

        stiffness: 0.08,

        damping: 0.02,

        length: 0,

        render: {
            visible: false
        }
    });

    Composite.add(world, sling);
}


/* =========================================
   LEVEL
========================================= */

function createLevel() {

    clearLevel();

    updateSlingshotPosition();

    createGround();


    /*
       Structure
    */

    const baseX =
        Math.max(
            600,
            container.clientWidth * 1.35
        );


    // bottom blocks

    createBlock(
        baseX - 80,
        container.clientHeight - 90,
        40,
        100,
        "wood"
    );

    createBlock(
        baseX + 80,
        container.clientHeight - 90,
        40,
        100,
        "wood"
    );


    // upper platform

    createBlock(
        baseX,
        container.clientHeight - 145,
        220,
        30,
        "wood"
    );


    // pig

    createPig(
        baseX,
        container.clientHeight - 190
    );


    // extra blocks

    createBlock(
        baseX - 80,
        container.clientHeight - 210,
        35,
        100,
        "stone"
    );

    createBlock(
        baseX + 80,
        container.clientHeight - 210,
        35,
        100,
        "stone"
    );


    createBird();

    updateBirdDisplay();
}


/* =========================================
   CLEAR LEVEL
========================================= */

function clearLevel() {

    Composite.clear(
        world,
        false
    );

    currentBird = null;

    sling = null;

    levelObjects = [];

    targetObjects = [];

    birdBodies = [];

    dragging = false;

    launched = false;
}


/* =========================================
   BIRD COUNT
========================================= */

function updateBirdDisplay() {

    let result = "";

    for (
        let i = 0;
        i < birdsLeft;
        i++
    ) {

        result += "● ";

    }

    birdCountElement.textContent =
        result || "—";
}


/* =========================================
   SCORE
========================================= */

function addScore(points) {

    score += points;

    scoreElement.textContent =
        score;
}


/* =========================================
   POINTER POSITION
========================================= */

function pointerPosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    return {

        x:
            event.clientX -
            rect.left,

        y:
            event.clientY -
            rect.top
    };
}


/* =========================================
   DRAG START
========================================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        if (
            !currentBird ||
            launched ||
            levelComplete
        ) {
            return;
        }

        const point =
            pointerPosition(event);

        const distance =
            Vector.magnitude(
                Vector.sub(
                    point,
                    currentBird.position
                )
            );

        if (distance > 55) {
            return;
        }

        dragging = true;

        canvas.setPointerCapture(
            event.pointerId
        );

        powerElement.classList.add(
            "visible"
        );
    }
);


/* =========================================
   DRAG MOVE
========================================= */

canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !dragging ||
            !currentBird
        ) {
            return;
        }

        const point =
            pointerPosition(event);


        /*
           Keep bird close to sling.
        */

        let dx =
            point.x - slingX;

        let dy =
            point.y - slingY;


        const maxDistance = 95;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > maxDistance) {

            const ratio =
                maxDistance /
                distance;

            dx *= ratio;
            dy *= ratio;
        }


        /*
           Don't allow bird to be pulled
           too far forward.
        */

        if (dx > 20) {
            dx = 20;
        }


        Body.setPosition(
            currentBird,
            {
                x: slingX + dx,
                y: slingY + dy
            }
        );


        /*
           Power indicator
        */

        const power =
            Math.min(
                100,
                Math.round(
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) /
                    maxDistance *
                    100
                )
            );

        powerFill.style.width =
            power + "%";
    }
);


/* =========================================
   RELEASE
========================================= */

canvas.addEventListener(
    "pointerup",
    event => {

        if (
            !dragging ||
            !currentBird
        ) {
            return;
        }

        dragging = false;

        powerElement.classList.remove(
            "visible"
        );

        powerFill.style.width =
            "0%";


        const birdPosition =
            currentBird.position;


        /*
           Launch vector is opposite
           to the pulling direction.
        */

        const dx =
            slingX -
            birdPosition.x;

        const dy =
            slingY -
            birdPosition.y;


        const multiplier = 0.13;


        Body.setStatic(
            currentBird,
            false
        );


        Body.setVelocity(
            currentBird,
            {
                x: dx * multiplier,
                y: dy * multiplier
            }
        );


        launched = true;

        birdsLeft--;

        updateBirdDisplay();


        /*
           Release sling.
        */

        if (sling) {

            Composite.remove(
                world,
                sling
            );

            sling = null;
        }


        /*
           Wait before creating next bird.
        */

        setTimeout(
            checkBirdFinished,
            2500
        );
    }
);


/* =========================================
   CHECK BIRD
========================================= */

function checkBirdFinished() {

    if (!currentBird) {
        return;
    }

    const speed =
        Vector.magnitude(
            currentBird.velocity
        );


    /*
       If bird is almost stationary,
       prepare next one.
    */

    if (
        speed < 1.2 ||
        currentBird.position.y >
            container.clientHeight + 200
    ) {

        if (
            targetObjects.length === 0
        ) {
            finishLevel(true);

            return;
        }


        if (birdsLeft > 0) {

            currentBird = null;

            launched = false;

            setTimeout(
                createBird,
                500
            );

        } else {

            finishLevel(false);
        }

    } else {

        setTimeout(
            checkBirdFinished,
            1000
        );
    }
}


/* =========================================
   COLLISIONS
========================================= */

Events.on(
    engine,
    "collisionStart",
    event => {

        event.pairs.forEach(pair => {

            const a = pair.bodyA;
            const b = pair.bodyB;


            /*
               Pig collision
            */

            if (
                a.label === "pig" ||
                b.label === "pig"
            ) {

                const pig =
                    a.label === "pig"
                        ? a
                        : b;

                const other =
                    pig === a
                        ? b
                        : a;


                const impact =
                    Vector.magnitude(
                        other.velocity
                    );


                if (impact > 4) {

                    Composite.remove(
                        world,
                        pig
                    );

                    targetObjects =
                        targetObjects.filter(
                            item =>
                                item !== pig
                        );

                    addScore(500);
                }
            }


            /*
               Block impact
            */

            if (
                a.label === "block" ||
                b.label === "block"
            ) {

                const block =
                    a.label === "block"
                        ? a
                        : b;

                const other =
                    block === a
                        ? b
                        : a;


                const impact =
                    Vector.magnitude(
                        other.velocity
                    );


                if (impact > 7) {

                    Composite.remove(
                        world,
                        block
                    );

                    levelObjects =
                        levelObjects.filter(
                            item =>
                                item !== block
                        );

                    addScore(100);
                }
            }

        });
    }
);


/* =========================================
   LEVEL COMPLETE
========================================= */

function finishLevel(success) {

    if (levelComplete) {
        return;
    }

    levelComplete = true;


    if (success) {

        messageTitle.textContent =
            "LEVEL COMPLETE";

        messageText.textContent =
            "You cleared the structure.";

        nextBtn.textContent =
            "NEXT LEVEL";

    } else {

        messageTitle.textContent =
            "OUT OF BIRDS";

        messageText.textContent =
            "Try the level again.";

        nextBtn.textContent =
            "TRY AGAIN";
    }


    message.classList.remove(
        "hidden"
    );
}


/* =========================================
   NEXT LEVEL
========================================= */

nextBtn.addEventListener(
    "click",
    () => {

        if (
            targetObjects.length === 0
        ) {

            level++;

            birdsLeft =
                Math.min(
                    3 + level - 1,
                    5
                );

            levelComplete = false;

            message.classList.add(
                "hidden"
            );

            createLevel();

        } else {

            restartLevel();
        }
    }
);


/* =========================================
   RESTART
========================================= */

function restartLevel() {

    score = 0;

    scoreElement.textContent =
        "0";

    birdsLeft = 3;

    levelComplete = false;

    message.classList.add(
        "hidden"
    );

    createLevel();
}

restartBtn.addEventListener(
    "click",
    restartLevel
);


/* =========================================
   HELP
========================================= */

helpBtn.addEventListener(
    "click",
    () => {

        help.style.display =
            "flex";
    }
);

closeHelp.addEventListener(
    "click",
    () => {

        help.style.display =
            "none";
    }
);


/* =========================================
   HOME
========================================= */

homeBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "../index.html";
    }
);


/* =========================================
   CAMERA
========================================= */

Events.on(
    render,
    "beforeRender",
    () => {

        if (
            !currentBird ||
            !launched
        ) {
            return;
        }


        const targetX =
            Math.max(
                0,
                currentBird.position.x -
                container.clientWidth * 0.35
            );


        cameraX +=
            (targetX - cameraX) *
            0.05;
    }
);


/* =========================================
   DRAW CUSTOM GRAPHICS
========================================= */

Events.on(
    render,
    "afterRender",
    () => {

        const ctx =
            render.context;

        ctx.save();


        /*
           Draw slingshot
        */

        const x = slingX;
        const y = slingY;


        ctx.strokeStyle =
            "#593b25";

        ctx.lineWidth = 9;

        ctx.lineCap = "round";


        ctx.beginPath();

        ctx.moveTo(
            x - 12,
            y + 45
        );

        ctx.lineTo(
            x - 9,
            y
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            x + 12,
            y + 45
        );

        ctx.lineTo(
            x + 9,
            y
        );

        ctx.stroke();


        /*
           Sling bands
        */

        if (
            currentBird &&
            !launched
        ) {

            const bx =
                currentBird.position.x;

            const by =
                currentBird.position.y;


            ctx.strokeStyle =
                "#3b2920";

            ctx.lineWidth = 4;


            ctx.beginPath();

            ctx.moveTo(
                x - 9,
                y
            );

            ctx.lineTo(
                bx,
                by
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                x + 9,
                y
            );

            ctx.lineTo(
                bx,
                by
            );

            ctx.stroke();
        }


        /*
           Bird eyes
        */

        if (currentBird) {

            const bx =
                currentBird.position.x;

            const by =
                currentBird.position.y;

            ctx.fillStyle =
                "white";

            ctx.beginPath();

            ctx.arc(
                bx - 6,
                by - 4,
                5,
                0,
                Math.PI * 2
            );

            ctx.arc(
                bx + 6,
                by - 4,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#111";

            ctx.beginPath();

            ctx.arc(
                bx - 5,
                by - 4,
                2,
                0,
                Math.PI * 2
            );

            ctx.arc(
                bx + 7,
                by - 4,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();


            /*
               Angry eyebrows
            */

            ctx.strokeStyle =
                "#3b1715";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(
                bx - 12,
                by - 11
            );

            ctx.lineTo(
                bx - 3,
                by - 8
            );

            ctx.moveTo(
                bx + 3,
                by - 8
            );

            ctx.lineTo(
                bx + 12,
                by - 11
            );

            ctx.stroke();


            /*
               Beak
            */

            ctx.fillStyle =
                "#e3a329";

            ctx.beginPath();

            ctx.moveTo(
                bx,
                by + 1
            );

            ctx.lineTo(
                bx + 15,
                by + 5
            );

            ctx.lineTo(
                bx,
                by + 10
            );

            ctx.closePath();

            ctx.fill();
        }


        /*
           Pig faces
        */

        targetObjects.forEach(
            pig => {

                const px =
                    pig.position.x;

                const py =
                    pig.position.y;


                ctx.fillStyle =
                    "white";


                ctx.beginPath();

                ctx.arc(
                    px - 6,
                    py - 4,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.arc(
                    px + 6,
                    py - 4,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.fillStyle =
                    "#172b16";


                ctx.beginPath();

                ctx.arc(
                    px - 6,
                    py - 4,
                    1.5,
                    0,
                    Math.PI * 2
                );

                ctx.arc(
                    px + 6,
                    py - 4,
                    1.5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                /*
                   Pig nose
                */

                ctx.fillStyle =
                    "#6eae5d";

                ctx.beginPath();

                ctx.ellipse(
                    px,
                    py + 6,
                    8,
                    5,
                    0,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.fillStyle =
                    "#3f7138";

                ctx.beginPath();

                ctx.arc(
                    px - 3,
                    py + 6,
                    1.5,
                    0,
                    Math.PI * 2
                );

                ctx.arc(
                    px + 3,
                    py + 6,
                    1.5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        );


        ctx.restore();
    }
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        render.canvas.width =
            container.clientWidth *
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        render.canvas.height =
            container.clientHeight *
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        render.options.width =
            container.clientWidth;

        render.options.height =
            container.clientHeight;

        updateSlingshotPosition();
    }
);


/* =========================================
   START
========================================= */

createLevel();