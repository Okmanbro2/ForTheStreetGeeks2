"use strict";
const SGE = {

    NAME: "StreetGeek",

    VERSION: "2.0.0-alpha.1",

    AUTHORS: [
        "two birds",
    ]

};

/* ==========================================================
   CANVAS
   ========================================================== */

const canvas = document.getElementById("viewport");
const ctx = canvas.getContext("2d");

/* ==========================================================
   WORLD
   ========================================================== */

const World = {

    nodes: [],

    edges: [],

    intersections: [],

    vehicles: [],

    terrain: [],

    zones: []

};

/* ==========================================================
   CAMERA
   ========================================================== */

const Camera = {

    x: 0,

    y: 0,

    zoom: 1,

    minZoom: 0.25,

    maxZoom: 8,

    moveSpeed: 900

};

/* ==========================================================
   INPUT
   ========================================================== */

const Input = {

    mouseX: 0,
    mouseY: 0,

    worldX: 0,
    worldY: 0,

    middleDown: false,
    rightDown: false,

    dragging: false,

    dragStartX: 0,
    dragStartY: 0,

    cameraStartX: 0,
    cameraStartY: 0,

    keys: {}

};

/* ==========================================================
   ENGINE
   ========================================================== */

const Engine = {

    deltaTime: 0,

    lastFrame: performance.now(),

    fps: 0,

    frameCounter: 0,

    frameTimer: 0

};

/* ==========================================================
   GRID
   ========================================================== */

const Grid = {

    minorSize: 64,

    majorEvery: 5

};

/* ==========================================================
   UTILITIES
   ========================================================== */

function clamp(value, min, max)
{
    return Math.max(min, Math.min(max, value));
}

/* ==========================================================
   SCREEN -> WORLD
   ========================================================== */

function screenToWorld(x, y)
{
    return {

        x:
            (x - canvas.width / 2) / Camera.zoom
            + Camera.x,

        y:
            (y - canvas.height / 2) / Camera.zoom
            + Camera.y

    };
}

/* ==========================================================
   WORLD -> SCREEN
   ========================================================== */

function worldToScreen(x, y)
{
    return {

        x:
            (x - Camera.x)
            * Camera.zoom
            + canvas.width / 2,

        y:
            (y - Camera.y)
            * Camera.zoom
            + canvas.height / 2

    };
}

/* ==========================================================
   RESIZE
   ========================================================== */

function resizeCanvas()
{
    const dpr = window.devicePixelRatio || 1;

    canvas.width =
        Math.floor(window.innerWidth * dpr);

    canvas.height =
        Math.floor(window.innerHeight * dpr);

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(1,0,0,1,0,0);

    ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* ==========================================================
   INPUT EVENTS
   ========================================================== */

window.addEventListener("contextmenu", e => {
    e.preventDefault();
});

window.addEventListener("keydown", e => {
    Input.keys[e.code] = true;
});

window.addEventListener("keyup", e => {
    Input.keys[e.code] = false;
});

canvas.addEventListener("mousemove", e => {

    Input.mouseX = e.clientX;
    Input.mouseY = e.clientY;

    const world = screenToWorld(
        Input.mouseX,
        Input.mouseY
    );

    Input.worldX = world.x;
    Input.worldY = world.y;

    if (Input.dragging)
    {
        Camera.x =
            Input.cameraStartX -
            (e.clientX - Input.dragStartX) / Camera.zoom;

        Camera.y =
            Input.cameraStartY -
            (e.clientY - Input.dragStartY) / Camera.zoom;
    }

});

canvas.addEventListener("mousedown", e => {

    if (e.button === 1 || e.button === 2)
    {
        Input.dragging = true;

        Input.dragStartX = e.clientX;
        Input.dragStartY = e.clientY;

        Input.cameraStartX = Camera.x;
        Input.cameraStartY = Camera.y;
    }

});

window.addEventListener("mouseup", () => {

    Input.dragging = false;

});

canvas.addEventListener("wheel", e => {

    e.preventDefault();

    const before =
        screenToWorld(
            e.clientX,
            e.clientY
        );

    const zoomAmount =
        e.deltaY < 0
            ? 1.1
            : 0.9;

    Camera.zoom *= zoomAmount;

    Camera.zoom = clamp(
        Camera.zoom,
        Camera.minZoom,
        Camera.maxZoom
    );

    const after =
        screenToWorld(
            e.clientX,
            e.clientY
        );

    Camera.x += before.x - after.x;
    Camera.y += before.y - after.y;

},
{
    passive:false
});

function updateCamera(dt)
{

    const speed =
        Camera.moveSpeed / Camera.zoom;

    if (Input.keys["KeyW"])
        Camera.y -= speed * dt;

    if (Input.keys["KeyS"])
        Camera.y += speed * dt;

    if (Input.keys["KeyA"])
        Camera.x -= speed * dt;

    if (Input.keys["KeyD"])
        Camera.x += speed * dt;

}

function update(dt)
{

    updateCamera(dt);

}

function render()
{

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

function loop(now)
{

    Engine.deltaTime =
        (now - Engine.lastFrame) / 1000;

    Engine.lastFrame = now;

    update(Engine.deltaTime);

    render();

    requestAnimationFrame(loop);

}

requestAnimationFrame(loop);
