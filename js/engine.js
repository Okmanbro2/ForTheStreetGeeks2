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
   RENDERER
   ========================================================== */

const Renderer = {

    colors: {

        background: "#ece8df",

        gridMinor: "#d9d3c8",

        gridMajor: "#c8c1b6",

        axis: "#9aa3b2"

    }

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
   LOADING
   ========================================================== */

function hideLoadingScreen()
{
    const loading = document.getElementById("loadingScreen");

    loading.classList.add("hidden");

    setTimeout(() => {

        loading.remove();

    }, 350);
}

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
    Renderer.clear();

    Renderer.drawGrid();

    Renderer.drawOrigin();
}

Renderer.clear = function()
{
    ctx.fillStyle = this.colors.background;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
};

Renderer.drawGrid = function()
{

    const spacing = Grid.minorSize;

    const left =
        Camera.x - canvas.width / 2 / Camera.zoom;

    const right =
        Camera.x + canvas.width / 2 / Camera.zoom;

    const top =
        Camera.y - canvas.height / 2 / Camera.zoom;

    const bottom =
        Camera.y + canvas.height / 2 / Camera.zoom;

    const startX =
        Math.floor(left / spacing) * spacing;

    const startY =
        Math.floor(top / spacing) * spacing;

    ctx.lineWidth = 1;

    for(let x = startX; x <= right; x += spacing)
    {

        const sx =
            worldToScreen(x,0).x;

        ctx.beginPath();

        ctx.strokeStyle =
            Renderer.colors.gridMinor;

        ctx.moveTo(sx,0);

        ctx.lineTo(sx,canvas.height);

        ctx.stroke();

    }

    for(let y = startY; y <= bottom; y += spacing)
    {

        const sy =
            worldToScreen(0,y).y;

        ctx.beginPath();

        ctx.strokeStyle =
            Renderer.colors.gridMinor;

        ctx.moveTo(0,sy);

        ctx.lineTo(canvas.width,sy);

        ctx.stroke();

    }

};

Renderer.drawOrigin = function()
{

    const center =
        worldToScreen(0,0);

    ctx.strokeStyle =
        Renderer.colors.axis;

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        center.x,
        0
    );

    ctx.lineTo(
        center.x,
        canvas.height
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        0,
        center.y
    );

    ctx.lineTo(
        canvas.width,
        center.y
    );

    ctx.stroke();

};

function loop(now)
{

    Engine.deltaTime =
        (now - Engine.lastFrame) / 1000;

    Engine.lastFrame = now;

    update(Engine.deltaTime);

    render();

    requestAnimationFrame(loop);

}

/* ==========================================================
   START ENGINE
   ========================================================== */

function startEngine()
{
    hideLoadingScreen();

    requestAnimationFrame(loop);
}

startEngine();
