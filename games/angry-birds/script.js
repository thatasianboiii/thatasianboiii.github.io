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

const canvas =
    document.getElementById("gameCanvas");

const gameArea =
    document.getElementById("gameArea");

const rotateScreen =
    document.getElementById("rotateScreen");

const scoreElement =
    document.getElementById("score");

const birdCountElement =
    document.getElementById("birdCount");

const power =
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

const homeBtn =
    document.getElementById("homeBtn");

const helpBtn =
    document.getElementById("helpBtn");


/* =========================================
   ENGINE
========================================= */

const engine =
    Engine.create();

engine.gravity.y =
    1.05;


const world =
    engine.world;


/* =========================================
   RENDERER
========================================= */

const render =
    Render.create({

        canvas,

        engine,

        options: {

            width:
                gameArea.clientWidth,

            height:
                gameArea.clientHeight,

            wireframes:
                false,

            background:
                "transparent",

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


/* =========================================
   STATE
========================================= */

let score = 0;

let birdsLeft = 3;

let bird = null;

let sling = null;

let dragging = false;

let launched = false;

let levelFinished = false;

let targetBoxes = [];

let worldObjects = [];


/* =========================================
   DIMENSIONS
========================================= */

function width() {

    return gameArea.clientWidth;
}


function height() {

    return gameArea.clientHeight;
}


/* =========================================
   SLINGSHOT
========================================= */

function slingX() {

    return Math.max(
        85,
        width() * 0.14
    );
}


function slingY() {

    return height() - 90;
}


/* =========================================
   TARGET POSITION
========================================= */

function targetX() {

    return width() * 0.73;
}


/* =========================================
   GROUND
========================================= */

function createGround() {

    const ground =
        Bodies.rectangle(

            width() / 2,

            height() + 20,

            width() * 2,

            45,

            {

                isStatic:
                    true,

                label:
                    "ground",

                render: {

                    fillStyle:
                        "#527f48"
                }

            }
        );


    Composite.add(
        world,
        ground
    );


    worldObjects.push(
        ground
    );
}


/* =========================================
   TARGET BOX
========================================= */

function createTargetBox(
    x,
    y,
    w,
    h,
    color = "#b97843"
) {

    const box =
        Bodies.rectangle(

            x,
            y,

            w,
            h,

            {

                label:
                    "target",

                density:
                    0.0025,

                friction:
                    0.7,

                frictionAir:
                    0.01,

                restitution:
                    0.12,

                render: {

                    fillStyle:
                        color,

                    strokeStyle:
                        "#5a3824",

                    lineWidth:
                        2
                }

            }
        );


    box.target =
        true;


    Composite.add(
        world,
        box
    );


    targetBoxes.push(
        box
    );

    worldObjects.push(
        box
    );


    return box;
}


/* =========================================
   BUILD TARGET STRUCTURE
========================================= */

function buildTargets() {

    const x =
        targetX();


    const ground =
        height() - 42;


    /*
       Bottom row
    */

    createTargetBox(
        x - 90,
        ground - 30,
        34,
        60,
        "#a66d3d"
    );


    createTargetBox(
        x,
        ground - 30,
        34,
        60,
        "#b87a45"
    );


    createTargetBox(
        x + 90,
        ground - 30,
        34,
        60,
        "#a66d3d"
    );


    /*
       First platform
    */

    createTargetBox(
        x,
        ground - 70,
        220,
        24,
        "#c1874d"
    );


    /*
       Middle supports
    */

    createTargetBox(
        x - 65,
        ground - 125,
        30,
        85,
        "#8f633e"
    );


    createTargetBox(
        x + 65,
        ground - 125,
        30,
        85,
        "#8f633e"
    );


    /*
       Middle platform
    */

    createTargetBox(
        x,
        ground - 175,
        165,
        24,
        "#c1874d"
    );


    /*
       Upper supports
    */

    createTargetBox(
        x - 45,
        ground - 220,
        28,
        70,
        "#9d6c40"
    );


    createTargetBox(
        x + 45,
        ground - 220,
        28,
        70,
        "#9d6c40"
    );


    /*
       Top box
    */

    createTargetBox(
        x,
        ground - 270,
        90,
        28,
        "#c1874d"
    );
}


/* =========================================
   CREATE BIRD
========================================= */

function createBird() {

    if (
        birdsLeft <= 0
    ) {

        return;
    }


    const x =
        slingX();

    const y =
        slingY();


    bird =
        Bodies.circle(

            x,
            y,

            18,

            {

                isStatic:
                    true,

                density:
                    0.002,

                restitution:
                    0.25,

                friction:
                    0.5,

                label:
                    "bird",

                render: {

                    fillStyle:
                        "#d94335",

                    strokeStyle:
                        "#641e19",

                    lineWidth:
                        2
                }

            }
        );


    Composite.add(
        world,
        bird
    );


    sling =
        Constraint.create({

            pointA: {

                x,
                y
            },

            bodyB:
                bird,

            stiffness:
                0.08,

            damping:
                0.02,

            length:
                0
        });


    Composite.add(
        world,
        sling
    );
}


/* =========================================
   BUILD LEVEL
========================================= */

function buildLevel() {

    Composite.clear(
        world,
        false
    );


    targetBoxes = [];

    worldObjects = [];

    bird = null;

    sling = null;

    dragging = false;

    launched = false;

    levelFinished = false;


    createGround();

    buildTargets();

    createBird();

    updateBirdCount();
}


/* =========================================
   BIRD COUNTER
========================================= */

function updateBirdCount() {

    let result = "";


    for (
        let i = 0;
        i < birdsLeft;
        i++
    ) {

        result +=
            "●";
    }


    birdCountElement.textContent =
        result || "—";
}


/* =========================================
   POINTER POSITION
========================================= */

function pointerPosition(
    event
) {

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
   POINTER DOWN
========================================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        if (
            !bird ||
            launched ||
            levelFinished
        ) {

            return;
        }


        const point =
            pointerPosition(event);


        const distance =
            Vector.magnitude(

                Vector.sub(
                    point,
                    bird.position
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


        power.classList.add(
            "visible"
        );
    }
);


/* =========================================
   POINTER MOVE
========================================= */

canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !dragging ||
            !bird
        ) {

            return;
        }


        const point =
            pointerPosition(event);


        const sx =
            slingX();

        const sy =
            slingY();


        let dx =
            point.x - sx;

        let dy =
            point.y - sy;


        /*
           Maximum pull distance.
        */

        const maxPull =
            105;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance > maxPull
        ) {

            const ratio =
                maxPull / distance;

            dx *= ratio;
            dy *= ratio;
        }


        /*
           Don't allow the bird
           to be pulled forward.
        */

        if (
            dx > 15
        ) {

            dx = 15;
        }


        Body.setPosition(
            bird,
            {

                x:
                    sx + dx,

                y:
                    sy + dy
            }
        );


        const powerAmount =
            Math.min(
                100,

                Math.round(
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) /
                    maxPull *
                    100
                )
            );


        powerFill.style.width =
            powerAmount + "%";
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
            !bird
        ) {

            return;
        }


        dragging = false;


        power.classList.remove(
            "visible"
        );


        powerFill.style.width =
            "0%";


        const sx =
            slingX();

        const sy =
            slingY();


        const pullX =
            sx -
            bird.position.x;

        const pullY =
            sy -
            bird.position.y;


        /*
           Remove the sling BEFORE
           activating the bird.
        */

        if (
            sling
        ) {

            Composite.remove(
                world,
                sling
            );

            sling = null;
        }


        Body.setStatic(
            bird,
            false
        );


        /*
           Moderate launch speed.

           The previous version could
           launch the bird so violently
           that it immediately left the
           canvas.
        */

        const velocity = {

            x:
                pullX * 0.105,

            y:
                pullY * 0.105
        };


        Body.setVelocity(
            bird,
            velocity
        );


        launched = true;

        birdsLeft--;

        updateBirdCount();


        setTimeout(
            monitorBird,
            1800
        );
    }
);


/* =========================================
   MONITOR BIRD
========================================= */

function monitorBird() {

    if (
        levelFinished
    ) {

        return;
    }


    if (
        targetBoxes.length === 0
    ) {

        completeLevel();

        return;
    }


    if (
        !bird
    ) {

        return;
    }


    const speed =
        Vector.magnitude(
            bird.velocity
        );


    const offscreen =
        bird.position.x >
            width() + 250 ||

        bird.position.x <
            -250 ||

        bird.position.y >
            height() + 250;


    /*
       If the bird has basically
       stopped or left the arena,
       prepare the next bird.
    */

    if (
        speed < 0.75 ||
        offscreen
    ) {

        if (
            birdsLeft > 0
        ) {

            prepareNextBird();

        } else {

            endLevel();
        }


        return;
    }


    setTimeout(
        monitorBird,
        500
    );
}


/* =========================================
   NEXT BIRD
========================================= */

function prepareNextBird() {

    if (
        bird
    ) {

        Composite.remove(
            world,
            bird
        );
    }


    bird = null;

    launched = false;


    setTimeout(
        createBird,
        350
    );
}


/* =========================================
   COLLISIONS
========================================= */

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
               Target hit by bird
            */

            if (
                (
                    a.label === "target" &&
                    b.label === "bird"
                ) ||
                (
                    b.label === "target" &&
                    a.label === "bird"
                )
            ) {

                const target =
                    a.label === "target"
                        ? a
                        : b;


                const birdBody =
                    a.label === "bird"
                        ? a
                        : b;


                const impact =
                    Vector.magnitude(
                        birdBody.velocity
                    );


                /*
                   Strong enough hit
                   breaks the box.
                */

                if (
                    impact > 4
                ) {

                    destroyTarget(
                        target
                    );
                }
            }


            /*
               Target hitting target.

               This lets boxes break when
               the structure collapses.
            */

            if (
                a.label === "target" &&
                b.label === "target"
            ) {

                const impact =
                    Math.max(

                        Vector.magnitude(
                            a.velocity
                        ),

                        Vector.magnitude(
                            b.velocity
                        )
                    );


                if (
                    impact > 7
                ) {

                    /*
                       Only destroy one of
                       the two at a time.
                    */

                    destroyTarget(
                        impact > 10
                            ? a
                            : b
                    );
                }
            }
        }
    }
);


/* =========================================
   DESTROY TARGET
========================================= */

function destroyTarget(
    target
) {

    if (
        !target ||
        !target.target
    ) {

        return;
    }


    target.target =
        false;


    Composite.remove(
        world,
        target
    );


    targetBoxes =
        targetBoxes.filter(
            box =>
                box !== target
        );


    worldObjects =
        worldObjects.filter(
            object =>
                object !== target
        );


    score += 100;

    scoreElement.textContent =
        score;


    if (
        targetBoxes.length === 0
    ) {

        completeLevel();
    }
}


/* =========================================
   COMPLETE
========================================= */

function completeLevel() {

    if (
        levelFinished
    ) {

        return;
    }


    levelFinished = true;


    messageTitle.textContent =
        "LEVEL COMPLETE";


    messageText.textContent =
        "You destroyed every box.";


    nextBtn.textContent =
        "PLAY AGAIN";


    message.classList.remove(
        "hidden"
    );
}


/* =========================================
   OUT OF BIRDS
========================================= */

function endLevel() {

    if (
        levelFinished
    ) {

        return;
    }


    levelFinished = true;


    messageTitle.textContent =
        "OUT OF BIRDS";


    messageText.textContent =
        "Some boxes are still standing.";


    nextBtn.textContent =
        "TRY AGAIN";


    message.classList.remove(
        "hidden"
    );
}


/* =========================================
   NEXT / TRY AGAIN
========================================= */

nextBtn.addEventListener(
    "click",
    () => {

        message.classList.add(
            "hidden"
        );


        score = 0;

        scoreElement.textContent =
            "0";


        birdsLeft = 3;


        buildLevel();
    }
);


/* =========================================
   RESTART
========================================= */

restartBtn.addEventListener(
    "click",
    () => {

        score = 0;

        scoreElement.textContent =
            "0";


        birdsLeft = 3;


        message.classList.add(
            "hidden"
        );


        buildLevel();
    }
);


/* =========================================
   HOME
========================================= */

homeBtn.addEventListener(
    "click",
    () => {

        /*
           Current:
           /games/angry-birds/index.html

           Homepage:
           /index.html

           Therefore:
           ../../index.html
        */

        window.location.href =
            "../../index.html";
    }
);


/* =========================================
   HELP
========================================= */

helpBtn.addEventListener(
    "click",
    () => {

        alert(
            "Drag the bird backwards, aim at the boxes, then release."
        );
    }
);


/* =========================================
   DRAWING
========================================= */

Events.on(
    render,
    "afterRender",
    () => {

        const ctx =
            render.context;


        ctx.save();


        /*
           Slingshot
        */

        const sx =
            slingX();

        const sy =
            slingY();


        ctx.lineCap =
            "round";


        ctx.strokeStyle =
            "#573a27";

        ctx.lineWidth =
            8;


        ctx.beginPath();

        ctx.moveTo(
            sx - 11,
            sy + 42
        );

        ctx.lineTo(
            sx - 8,
            sy
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            sx + 11,
            sy + 42
        );

        ctx.lineTo(
            sx + 8,
            sy
        );

        ctx.stroke();


        /*
           Sling bands
        */

        if (
            bird &&
            !launched
        ) {

            ctx.strokeStyle =
                "#36251b";

            ctx.lineWidth =
                4;


            ctx.beginPath();

            ctx.moveTo(
                sx - 8,
                sy
            );

            ctx.lineTo(
                bird.position.x,
                bird.position.y
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                sx + 8,
                sy
            );

            ctx.lineTo(
                bird.position.x,
                bird.position.y
            );

            ctx.stroke();
        }


        /*
           Bird face
        */

        if (
            bird
        ) {

            drawBird(
                ctx,
                bird.position.x,
                bird.position.y
            );
        }


        ctx.restore();
    }
);


/* =========================================
   BIRD FACE
========================================= */

function drawBird(
    ctx,
    x,
    y
) {

    /*
       Eyes
    */

    ctx.fillStyle =
        "#ffffff";


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


    /*
       Pupils
    */

    ctx.fillStyle =
        "#111111";


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
       Beak
    */

    ctx.fillStyle =
        "#e3a32b";


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


/* =========================================
   RESIZE
========================================= */

function resizeGame() {

    const w =
        gameArea.clientWidth;

    const h =
        gameArea.clientHeight;


    render.options.width =
        w;

    render.options.height =
        h;


    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    render.canvas.width =
        w * ratio;

    render.canvas.height =
        h * ratio;


    render.canvas.style.width =
        w + "px";

    render.canvas.style.height =
        h + "px";


    render.context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}


/* =========================================
   ORIENTATION
========================================= */

function checkOrientation() {

    /*
       Don't rely only on CSS
       orientation queries.

       This directly checks the
       actual viewport dimensions.
    */

    const portrait =
        window.innerHeight >
        window.innerWidth;


    if (
        portrait
    ) {

        rotateScreen.style.display =
            "flex";

        document.body.classList.add(
            "portrait"
        );

    } else {

        rotateScreen.style.display =
            "none";

        document.body.classList.remove(
            "portrait"
        );
    }
}


window.addEventListener(
    "resize",
    () => {

        checkOrientation();

        resizeGame();
    }
);


window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            () => {

                checkOrientation();

                resizeGame();

            },
            150
        );
    }
);


/* =========================================
   START
========================================= */

checkOrientation();

resizeGame();

buildLevel();