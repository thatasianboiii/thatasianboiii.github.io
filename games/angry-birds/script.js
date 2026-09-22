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


/* =====================================
   ELEMENTS
===================================== */

const canvas =
    document.getElementById("gameCanvas");

const container =
    document.getElementById("game-container");

const scoreElement =
    document.getElementById("score");

const birdCountElement =
    document.getElementById("birdCount");

const powerElement =
    document.getElementById("power");

const powerFill =
    document.getElementById("powerFill");

const message =
    document.getElementById("message");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");

const nextBtn =
    document.getElementById("nextBtn");

const restartBtn =
    document.getElementById("restartBtn");

const help =
    document.getElementById("help");

const helpBtn =
    document.getElementById("helpBtn");

const closeHelp =
    document.getElementById("closeHelp");

const homeBtn =
    document.getElementById("homeBtn");


/* =====================================
   MATTER ENGINE
===================================== */

const engine =
    Engine.create();

engine.gravity.y = 1.05;

const world =
    engine.world;


/* =====================================
   RENDERER
===================================== */

const render =
    Render.create({

        canvas,

        engine,

        options: {

            width:
                container.clientWidth,

            height:
                container.clientHeight,

            wireframes: false,

            background: "transparent",

            pixelRatio:
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                )
        }
    });


Render.run(render);


const runner =
    Runner.create();

Runner.run(
    runner,
    engine
);


/* =====================================
   STATE
===================================== */

let score = 0;

let level = 1;

let birdsLeft = 3;

let currentBird = null;

let sling = null;

let dragging = false;

let launched = false;

let levelComplete = false;

let levelObjects = [];

let targetObjects = [];

let cameraX = 0;


/* =====================================
   WORLD DIMENSIONS
===================================== */

function W() {

    return container.clientWidth;
}

function H() {

    return container.clientHeight;
}


/* =====================================
   LEVEL POSITIONS
===================================== */

function getSlingX() {

    return Math.max(
        90,
        W() * 0.15
    );
}

function getSlingY() {

    return H() - 95;
}

function getTargetX() {

    return W() * 0.72;
}


/* =====================================
   GROUND
===================================== */

function createGround() {

    const ground =
        Bodies.rectangle(

            W() / 2,

            H() + 25,

            W() * 2,

            50,

            {
                isStatic: true,

                label: "ground",

                render: {

                    fillStyle:
                        "#4b8048"
                }
            }
        );

    Composite.add(
        world,
        ground
    );

    levelObjects.push(
        ground
    );
}


/* =====================================
   BLOCK
===================================== */

function createBlock(
    x,
    y,
    width,
    height,
    type = "wood"
) {

    const colors = {

        wood: "#a87543",

        stone: "#858f89",

        glass: "#8bcbd0"
    };


    const block =
        Bodies.rectangle(

            x,
            y,

            width,
            height,

            {
                restitution: 0.15,

                friction: 0.7,

                density: 0.003,

                label: "block",

                render: {

                    fillStyle:
                        colors[type]
                }
            }
        );


    block.blockType =
        type;


    Composite.add(
        world,
        block
    );

    levelObjects.push(
        block
    );

    return block;
}


/* =====================================
   PIG
===================================== */

function createPig(
    x,
    y,
    radius = 20
) {

    const pig =
        Bodies.circle(

            x,
            y,

            radius,

            {
                restitution: 0.2,

                friction: 0.5,

                density: 0.0015,

                label: "pig",

                render: {

                    fillStyle:
                        "#82c96b",

                    strokeStyle:
                        "#385d31",

                    lineWidth: 2
                }
            }
        );


    Composite.add(
        world,
        pig
    );

    targetObjects.push(
        pig
    );

    return pig;
}


/* =====================================
   BUILD LEVEL
===================================== */

function buildLevel() {

    clearLevel();


    const sx =
        getSlingX();

    const sy =
        getSlingY();


    /*
       Ground
    */

    createGround();


    /*
       Target tower

       Everything is deliberately
       placed well inside the visible
       landscape screen.
    */

    const tx =
        getTargetX();

    const groundY =
        H() - 50;


    /*
       Bottom foundation
    */

    createBlock(
        tx - 80,
        groundY - 30,
        38,
        60,
        "wood"
    );

    createBlock(
        tx + 80,
        groundY - 30,
        38,
        60,
        "wood"
    );


    /*
       Bottom platform
    */

    createBlock(
        tx,
        groundY - 70,
        205,
        28,
        "wood"
    );


    /*
       Vertical supports
    */

    createBlock(
        tx - 70,
        groundY - 125,
        30,
        90,
        "stone"
    );

    createBlock(
        tx + 70,
        groundY - 125,
        30,
        90,
        "stone"
    );


    /*
       Upper platform
    */

    createBlock(
        tx,
        groundY - 175,
        170,
        26,
        "wood"
    );


    /*
       PIGS

       Two targets so there is
       something obvious to shoot.
    */

    createPig(
        tx,
        groundY - 105,
        21
    );

    createPig(
        tx,
        groundY - 205,
        19
    );


    /*
       Little roof
    */

    createBlock(
        tx,
        groundY - 235,
        115,
        24,
        "wood"
    );


    /*
       Bird
    */

    createBird();


    updateBirdDisplay();
}


/* =====================================
   CLEAR
===================================== */

function clearLevel() {

    Composite.clear(
        world,
        false
    );

    currentBird = null;

    sling = null;

    levelObjects = [];

    targetObjects = [];

    dragging = false;

    launched = false;
}


/* =====================================
   CREATE BIRD
===================================== */

function createBird() {

    if (
        birdsLeft <= 0
    ) {
        return;
    }


    const bird =
        Bodies.circle(

            getSlingX(),

            getSlingY(),

            18,

            {
                isStatic: true,

                restitution: 0.35,

                friction: 0.5,

                density: 0.002,

                label: "bird",

                render: {

                    fillStyle:
                        "#d94335",

                    strokeStyle:
                        "#68251f",

                    lineWidth: 2
                }
            }
        );


    currentBird =
        bird;


    Composite.add(
        world,
        bird
    );


    sling =
        Constraint.create({

            pointA: {

                x:
                    getSlingX(),

                y:
                    getSlingY()
            },

            bodyB:
                bird,

            stiffness:
                0.08,

            damping:
                0.02,

            length:
                0,

            render: {

                visible:
                    false
            }
        });


    Composite.add(
        world,
        sling
    );
}


/* =====================================
   BIRD DISPLAY
===================================== */

function updateBirdDisplay() {

    let text = "";

    for (
        let i = 0;
        i < birdsLeft;
        i++
    ) {

        text +=
            "● ";
    }


    birdCountElement.textContent =
        text || "—";
}


/* =====================================
   SCORE
===================================== */

function addScore(points) {

    score += points;

    scoreElement.textContent =
        score;
}


/* =====================================
   POINTER
===================================== */

function getPointer(event) {

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


/* =====================================
   DRAG START
===================================== */

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
            getPointer(event);


        const distance =
            Vector.magnitude(

                Vector.sub(
                    point,
                    currentBird.position
                )
            );


        if (
            distance > 55
        ) {
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


/* =====================================
   DRAG
===================================== */

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
            getPointer(event);


        const sx =
            getSlingX();

        const sy =
            getSlingY();


        let dx =
            point.x - sx;

        let dy =
            point.y - sy;


        const max =
            105;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance > max
        ) {

            const ratio =
                max / distance;

            dx *= ratio;
            dy *= ratio;
        }


        /*
           Bird cannot be pulled
           in front of the sling.
        */

        if (
            dx > 15
        ) {

            dx = 15;
        }


        Body.setPosition(
            currentBird,
            {

                x:
                    sx + dx,

                y:
                    sy + dy
            }
        );


        const power =
            Math.min(
                100,

                Math.round(
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) /
                    max *
                    100
                )
            );


        powerFill.style.width =
            power + "%";
    }
);


/* =====================================
   RELEASE
===================================== */

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


        const sx =
            getSlingX();

        const sy =
            getSlingY();


        const dx =
            sx -
            currentBird.position.x;

        const dy =
            sy -
            currentBird.position.y;


        Body.setStatic(
            currentBird,
            false
        );


        Body.setVelocity(
            currentBird,
            {

                x:
                    dx * 0.13,

                y:
                    dy * 0.13
            }
        );


        launched = true;


        birdsLeft--;

        updateBirdDisplay();


        if (sling) {

            Composite.remove(
                world,
                sling
            );

            sling = null;
        }


        setTimeout(
            checkBird,
            2200
        );
    }
);


/* =====================================
   CHECK BIRD
===================================== */

function checkBird() {

    if (
        !currentBird
    ) {
        return;
    }


    const speed =
        Vector.magnitude(
            currentBird.velocity
        );


    const offscreen =
        currentBird.position.y >
            H() + 250;


    if (
        speed < 1.1 ||
        offscreen
    ) {

        if (
            targetObjects.length === 0
        ) {

            finishLevel(
                true
            );

            return;
        }


        if (
            birdsLeft > 0
        ) {

            currentBird = null;

            launched = false;


            setTimeout(
                createBird,
                500
            );

        } else {

            finishLevel(
                false
            );
        }

    } else {

        setTimeout(
            checkBird,
            800
        );
    }
}


/* =====================================
   COLLISIONS
===================================== */

Events.on(
    engine,
    "collisionStart",
    event => {

        for (
            const pair of event.pairs
        ) {

            const a =
                pair.bodyA;

            const b =
                pair.bodyB;


            /*
               PIG
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


                if (
                    impact > 3.5
                ) {

                    Composite.remove(
                        world,
                        pig
                    );


                    targetObjects =
                        targetObjects.filter(
                            item =>
                                item !== pig
                        );


                    addScore(
                        500
                    );
                }
            }


            /*
               BLOCK
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


                if (
                    impact > 6
                ) {

                    Composite.remove(
                        world,
                        block
                    );


                    levelObjects =
                        levelObjects.filter(
                            item =>
                                item !== block
                        );


                    addScore(
                        100
                    );
                }
            }
        }
    }
);


/* =====================================
   COMPLETE
===================================== */

function finishLevel(
    success
) {

    if (
        levelComplete
    ) {
        return;
    }


    levelComplete = true;


    if (
        success
    ) {

        messageTitle.textContent =
            "LEVEL COMPLETE";

        messageText.textContent =
            "All targets destroyed.";

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


/* =====================================
   NEXT
===================================== */

nextBtn.addEventListener(
    "click",
    () => {

        if (
            targetObjects.length === 0
        ) {

            level++;

            birdsLeft =
                Math.min(
                    3 + level,
                    5
                );

            levelComplete = false;

            message.classList.add(
                "hidden"
            );

            buildLevel();

        } else {

            restart();
        }
    }
);


/* =====================================
   RESTART
===================================== */

function restart() {

    score = 0;

    scoreElement.textContent =
        "0";

    birdsLeft = 3;

    levelComplete = false;

    message.classList.add(
        "hidden"
    );

    buildLevel();
}


restartBtn.addEventListener(
    "click",
    restart
);


/* =====================================
   HELP
===================================== */

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


/* =====================================
   HOME
===================================== */

homeBtn.addEventListener(
    "click",
    () => {

        /*
           angry-birds is:
           /games/angry-birds/

           Homepage is:
           /
        */

        window.location.href =
            "../../index.html";
    }
);


/* =====================================
   CUSTOM DRAWING
===================================== */

Events.on(
    render,
    "afterRender",
    () => {

        const ctx =
            render.context;


        ctx.save();


        const sx =
            getSlingX();

        const sy =
            getSlingY();


        /*
           Slingshot
        */

        ctx.strokeStyle =
            "#563924";

        ctx.lineWidth = 9;

        ctx.lineCap =
            "round";


        ctx.beginPath();

        ctx.moveTo(
            sx - 12,
            sy + 45
        );

        ctx.lineTo(
            sx - 9,
            sy
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            sx + 12,
            sy + 45
        );

        ctx.lineTo(
            sx + 9,
            sy
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
                "#39261d";

            ctx.lineWidth = 4;


            ctx.beginPath();

            ctx.moveTo(
                sx - 9,
                sy
            );

            ctx.lineTo(
                bx,
                by
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                sx + 9,
                sy
            );

            ctx.lineTo(
                bx,
                by
            );

            ctx.stroke();
        }


        /*
           Bird face
        */

        if (
            currentBird
        ) {

            drawBird(
                ctx,
                currentBird.position.x,
                currentBird.position.y
            );
        }


        /*
           Pig faces
        */

        for (
            const pig of targetObjects
        ) {

            drawPig(
                ctx,
                pig.position.x,
                pig.position.y
            );
        }


        ctx.restore();
    }
);


/* =====================================
   BIRD GRAPHICS
===================================== */

function drawBird(
    ctx,
    x,
    y
) {

    ctx.fillStyle =
        "white";


    ctx.beginPath();

    ctx.arc(
        x - 6,
        y - 4,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 6,
        y - 4,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#111";


    ctx.beginPath();

    ctx.arc(
        x - 5,
        y - 4,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 7,
        y - 4,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Eyebrows
    */

    ctx.strokeStyle =
        "#3b1715";

    ctx.lineWidth = 3;


    ctx.beginPath();

    ctx.moveTo(
        x - 12,
        y - 11
    );

    ctx.lineTo(
        x - 3,
        y - 8
    );

    ctx.moveTo(
        x + 3,
        y - 8
    );

    ctx.lineTo(
        x + 12,
        y - 11
    );

    ctx.stroke();


    /*
       Beak
    */

    ctx.fillStyle =
        "#e3a329";


    ctx.beginPath();

    ctx.moveTo(
        x,
        y + 1
    );

    ctx.lineTo(
        x + 15,
        y + 5
    );

    ctx.lineTo(
        x,
        y + 10
    );

    ctx.closePath();

    ctx.fill();
}


/* =====================================
   PIG GRAPHICS
===================================== */

function drawPig(
    ctx,
    x,
    y
) {

    ctx.fillStyle =
        "white";


    ctx.beginPath();

    ctx.arc(
        x - 6,
        y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 6,
        y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#172b16";


    ctx.beginPath();

    ctx.arc(
        x - 6,
        y - 4,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 6,
        y - 4,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Nose
    */

    ctx.fillStyle =
        "#69a957";


    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 6,
        8,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =====================================
   RESIZE
===================================== */

window.addEventListener(
    "resize",
    () => {

        render.options.width =
            container.clientWidth;

        render.options.height =
            container.clientHeight;

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
    }
);


/* =====================================
   START
===================================== */

buildLevel();