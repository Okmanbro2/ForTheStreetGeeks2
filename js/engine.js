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
