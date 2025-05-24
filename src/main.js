import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Squirrel from './objects/Squirrel.js';
import Cookie from './objects/Cookie.js';
import Terrain from './objects/Terrain.js';
import SnackCounter from './objects/SnackCounter.js'
import {LANES, COOKIE_Z_RANGE } from './WorldConfig.js'
import Scooter from './objects/Scooter.js';
import LivesCounter from './objects/LivesCounter.js';

import Bench from './objects/Bench.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 10;
controls.maxDistance = 50;


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// load terrain
const terrain = new Terrain(scene);

// load objects
// load background elements
const bench = new Bench(scene);

// load squirrel
const squirrel = new Squirrel(scene);
const cookies = [];
let scooter = null;

function spawnCookie() {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (COOKIE_Z_RANGE.max - COOKIE_Z_RANGE.min) + COOKIE_Z_RANGE.min;

    const cookie = new Cookie(scene);

    const waitUntilLoaded = setInterval(() => {
        if (cookie.model) {
            cookie.model.position.set(laneX, 0, zPos);
            cookies.push(cookie);
            clearInterval(waitUntilLoaded);
        }
    }, 50);
}

function spawnScooter() {
    const zPos = Math.random() * (COOKIE_Z_RANGE.max - COOKIE_Z_RANGE.min) + COOKIE_Z_RANGE.min;
    scooter = new Scooter(scene);

    scooter.model.position.z = zPos;
}

for (let i = 0; i < 10; i++) {
    spawnCookie();
}

spawnScooter();


// Score and Lives Counter
let score = new SnackCounter();
let lives = new LivesCounter(squirrel);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    terrain.update(delta);
    bench.update(delta);
    squirrel.update(delta);
    scooter.update(delta);

    // Check if any object is currently rewinding
    const isRewinding = scooter.isCurrentlyRewinding() || terrain.isCurrentlyRewinding();

    for (let i = cookies.length - 1; i >= 0; i--) {
        const cookie = cookies[i];
        cookie.update(delta);

        // Skip collision checks during rewind animation
        if (isRewinding) continue;

        // Collision detection
        if (squirrel.boundingBox && cookie.boundingBox && cookie.model) {
            if (squirrel.boundingBox.intersectsBox(cookie.boundingBox)) {
                score.increment();
                cookie.remove();
                cookies.splice(i, 1);
                continue;
            }
        }

        // despawn cookie when squirrel misses
        if (cookie.model && cookie.model.position.z > 20) {
            cookie.remove();
            cookies.splice(i, 1);
        }
    }

    // Collision detection with obstacles (only if not currently rewinding)
    if (!isRewinding && squirrel.boundingBox && scooter.boundingBox && scooter.model) {
        if (squirrel.boundingBox.intersectsBox(scooter.boundingBox)) {
            lives.decrement();

            // Start rewind animation for all objects
            scooter.startRewind();
            terrain.startRewind();
            cookies.forEach(cookie => cookie.startRewind());
            bench.startRewind();
        }
    }

    renderer.render(scene, camera);
    controls.update();
}

animate();

// Keyboard Controls
window.addEventListener('keydown', onKeyPress);

function onKeyPress(event) {
    switch (event.key) {
        case 'a':
        case 'ArrowLeft':
            squirrel.moveLeft();
            break;
        case 'd':
        case 'ArrowRight':
            squirrel.moveRight();
            break;
        case 'w':
        case ' ':
        case 'ArrowUp':
            squirrel.jump();
            break;
    }
}

