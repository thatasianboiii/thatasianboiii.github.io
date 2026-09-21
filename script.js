/* =========================================================
   THE ASIAN BOY
   Lightweight interactive background
   No external libraries
========================================================= */


const canvas =
    document.getElementById("backgroundCanvas");

const ctx =
    canvas.getContext("2d", {
        alpha: true
    });


/* =========================================================
   DEVICE / PERFORMANCE
========================================================= */

const isMobile =
    window.matchMedia("(max-width: 600px)").matches;


const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


const dpr =
    Math.min(
        window.devicePixelRatio || 1,
        1.5
    );


/* =========================================================
   CANVAS SIZE
========================================================= */

let width = 0;
let height = 0;


function resizeCanvas() {

    width =
        window.innerWidth;

    height =
        window.innerHeight;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}


resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas,
    {
        passive: true
    }
);


/* =========================================================
   FLOATING PARTICLES
========================================================= */

const particles = [];


const particleCount =
    reducedMotion
        ? 18
        : isMobile
            ? 30
            : 45;


for (
    let i = 0;
    i < particleCount;
    i++
) {

    particles.push({

        x:
            Math.random() * window.innerWidth,

        y:
            Math.random() * window.innerHeight,

        radius:
            Math.random() * 1.7 + 0.5,

        vx:
            (Math.random() - 0.5) * 0.18,

        vy:
            (Math.random() - 0.5) * 0.18,

        opacity:
            Math.random() * 0.35 + 0.08,

        phase:
            Math.random() * Math.PI * 2

    });

}


/* =========================================================
   TOUCH / RIPPLE EFFECT
========================================================= */

const ripples = [];


const pointer =
    {

        x: 0,

        y: 0,

        active: false

    };


/* =========================================================
   CREATE RIPPLE
========================================================= */

function createRipple(
    x,
    y
) {

    ripples.push({

        x: x,

        y: y,

        radius: 0,

        life: 1,

        strength: 1

    });

}


/* =========================================================
   POINTER DOWN
========================================================= */

document.addEventListener(
    "pointerdown",

    function (event) {

        /*
            If the user touched an app,
            don't create a background ripple.
        */

        if (
            event.target.closest(".app")
        ) {

            return;

        }


        pointer.x =
            event.clientX;

        pointer.y =
            event.clientY;

        pointer.active =
            true;


        createRipple(
            pointer.x,
            pointer.y
        );

    },

    {
        passive: true
    }

);


/* =========================================================
   POINTER MOVE
========================================================= */

document.addEventListener(
    "pointermove",

    function (event) {

        pointer.x =
            event.clientX;

        pointer.y =
            event.clientY;

    },

    {
        passive: true
    }

);


/* =========================================================
   POINTER UP
========================================================= */

document.addEventListener(
    "pointerup",

    function () {

        pointer.active =
            false;

    },

    {
        passive: true
    }

);


/* =========================================================
   POINTER CANCEL
========================================================= */

document.addEventListener(
    "pointercancel",

    function () {

        pointer.active =
            false;

    },

    {
        passive: true
    }

);


/* =========================================================
   APP RIPPLE
========================================================= */

document.addEventListener(
    "pointerdown",

    function (event) {

        const button =
            event.target.closest(".app");


        if (!button) {

            return;

        }


        const rect =
            button.getBoundingClientRect();


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "button-ripple";


        ripple.style.left =
            (
                event.clientX -
                rect.left
            ) + "px";


        ripple.style.top =
            (
                event.clientY -
                rect.top
            ) + "px";


        button.appendChild(
            ripple
        );


        ripple.addEventListener(
            "animationend",

            function () {

                ripple.remove();

            }

        );

    },

    {
        passive: true
    }

);


/* =========================================================
   DRAW BACKGROUND GLOW
========================================================= */

function drawGlow(
    time
) {

    /*
        Large slowly moving green glows.
    */

    const t =
        time * 0.00015;


    const x1 =
        width *
        (
            0.25 +
            Math.sin(t) * 0.15
        );


    const y1 =
        height *
        (
            0.30 +
            Math.cos(t * 1.2) * 0.12
        );


    const gradient1 =
        ctx.createRadialGradient(
            x1,
            y1,
            0,
            x1,
            y1,
            width * 0.7
        );


    gradient1.addColorStop(
        0,
        "rgba(54, 105, 68, 0.16)"
    );


    gradient1.addColorStop(
        0.45,
        "rgba(31, 76, 48, 0.07)"
    );


    gradient1.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient1;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const x2 =
        width *
        (
            0.75 +
            Math.cos(t * 0.8) * 0.16
        );


    const y2 =
        height *
        (
            0.72 +
            Math.sin(t) * 0.15
        );


    const gradient2 =
        ctx.createRadialGradient(
            x2,
            y2,
            0,
            x2,
            y2,
            width * 0.55
        );


    gradient2.addColorStop(
        0,
        "rgba(91, 120, 62, 0.10)"
    );


    gradient2.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient2;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles(
    time
) {

    for (
        const particle of particles
    ) {

        /*
            Gentle floating motion.
        */

        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;


        particle.phase +=
            0.008;


        particle.x +=
            Math.sin(
                particle.phase
            ) * 0.03;


        particle.y +=
            Math.cos(
                particle.phase
            ) * 0.03;


        /*
            Wrap around screen.
        */

        if (
            particle.x < -10
        ) {

            particle.x =
                width + 10;

        }


        if (
            particle.x > width + 10
        ) {

            particle.x =
                -10;

        }


        if (
            particle.y < -10
        ) {

            particle.y =
                height + 10;

        }


        if (
            particle.y > height + 10
        ) {

            particle.y =
                -10;

        }


        /*
            Touch repulsion.
        */

        const dx =
            particle.x -
            pointer.x;


        const dy =
            particle.y -
            pointer.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            pointer.active &&
            distance < 150 &&
            distance > 0
        ) {

            const force =
                (
                    150 -
                    distance
                ) / 150;


            particle.x +=
                (
                    dx /
                    distance
                ) *
                force *
                2.2;


            particle.y +=
                (
                    dy /
                    distance
                ) *
                force *
                2.2;

        }


        /*
            Draw.
        */

        const pulse =
            Math.sin(
                time * 0.001 +
                particle.phase
            ) * 0.15;


        ctx.beginPath();


        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(174, 199, 159, ${
                particle.opacity + pulse
            })`;


        ctx.fill();

    }

}


/* =========================================================
   DRAW RIPPLE
========================================================= */

function drawRipples() {

    for (
        let i = ripples.length - 1;
        i >= 0;
        i--
    ) {

        const ripple =
            ripples[i];


        ripple.radius +=
            3.2;


        ripple.life -=
            0.025;


        /*
            Outer soft glow.
        */

        const gradient =
            ctx.createRadialGradient(
                ripple.x,
                ripple.y,
                Math.max(
                    0,
                    ripple.radius - 25
                ),
                ripple.x,
                ripple.y,
                ripple.radius + 30
            );


        gradient.addColorStop(
            0,
            "rgba(160, 205, 157, 0)"
        );


        gradient.addColorStop(
            0.65,
            `rgba(150, 198, 145, ${
                ripple.life * 0.09
            })`
        );


        gradient.addColorStop(
            1,
            "rgba(150, 198, 145, 0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.beginPath();


        ctx.arc(
            ripple.x,
            ripple.y,
            ripple.radius + 30,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /*
            Thin wave ring.
        */

        ctx.beginPath();


        ctx.arc(
            ripple.x,
            ripple.y,
            ripple.radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            `rgba(180, 220, 170, ${
                ripple.life * 0.30
            })`;


        ctx.lineWidth =
            1.2;


        ctx.stroke();


        /*
            Remove when finished.
        */

        if (
            ripple.life <= 0
        ) {

            ripples.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate(
    time
) {

    /*
        Clear previous frame.
    */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
        Moving green light.
    */

    drawGlow(
        time
    );


    /*
        Floating particles.
    */

    drawParticles(
        time
    );


    /*
        Touch waves.
    */

    drawRipples();


    requestAnimationFrame(
        animate
    );

}


/* =========================================================
   START
========================================================= */

requestAnimationFrame(
    animate
);