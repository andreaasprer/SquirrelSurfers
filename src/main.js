import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Squirrel from './objects/Squirrel.js';
import Terrain from './objects/Terrain.js';
import SnackCounter from './objects/SnackCounter.js'
import LivesCounter from './objects/LivesCounter.js';
import DistanceCounter from './objects/DistanceCounter.js';
import { spawnBench, spawnCookie, spawnScooter, spawnTrashcan } from './utils/spawner.js';
import CollisionManager from './managers/CollisionManager.js';
import LevelParser from './utils/LevelParser.js';
import { LEVELS } from './WorldConfig.js';
import { GameState } from './utils/GameState.js';
import Camera from './objects/Camera.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Create loading manager
export const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');

const loadingText = document.getElementById('loading-text');

//const progressBar = document.getElementById('progress-bar');

const progressFill = document.getElementById('progress-fill');

document.body.appendChild(loadingScreen);

// Loading manager event handlers
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressFill.style.width = progress + '%';
    loadingText.textContent = `Loading... ${Math.round(progress)}%`;
};

loadingManager.onLoad = function () {
    loadingScreen.style.display = 'none';
    state = GameState.START;
    animate();
};

loadingManager.onError = function (url) {
    console.error('Error loading:', url);
    loadingText.textContent = 'Error loading game assets';
    loadingText.style.color = '#ff0000';
};

const scene = new THREE.Scene();

let textMesh = null;

// Create camera with squirrel perspective
const camera = new Camera(scene);
camera.position.set(0, 5, 30); // Set initial position
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: false });
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

const fontLoader = new FontLoader();
fontLoader.load(
    '../fonts/BagelFatOne.json',
    (font) => {
        const textGeometry = new TextGeometry('Press P to Play', {
            size: 5,
            depth: 1,
            height: 10,
            font: font,
            curveSegments: 12,
        });
        textGeometry.center();
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f0ef });
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 8, -40);
        scene.add(textMesh);
    }
)


let state = GameState.START;
const levelParser = new LevelParser(LEVELS);
const currentLevel = levelParser.getCurrentLevel();

// load terrain
const terrain = new Terrain(scene);

// day and night environment
scene.fog = new THREE.FogExp2();

function setDay() {
    scene.fog.color.set(0xadd8e6);
    scene.fog.density = 0.01;
}

function setNight() {
    scene.fog.color.set(0x055478);
    scene.fog.density = 0.02;
}

// load game assets
const squirrel = new Squirrel(scene);
const cookies = [];
const benches = [];
let scooter = null;
let trashcan = null;

for (let i = 0; i < currentLevel.numCookies; i++) {
    spawnCookie(scene, cookies, renderer, camera, currentLevel.obstacleRange);
}
for (let i = 0; i < currentLevel.numBenches; i++) {
    spawnBench(scene, benches, renderer, camera, currentLevel.obstacleRange);
}

scooter = spawnScooter(scene, renderer, camera, currentLevel.obstacleRange);
trashcan = spawnTrashcan(scene, renderer, camera, currentLevel.distance);

// Score, Lives, and Distance Counter
let score = new SnackCounter();
let lives = new LivesCounter(squirrel);
let distanceCounter = new DistanceCounter(terrain);


// Initialize collision manager
const collisionManager = new CollisionManager(scene, squirrel, score, lives);
collisionManager.setCookies(cookies);
collisionManager.setBenches(benches);
collisionManager.setScooter(scooter);
collisionManager.setTerrain(terrain);
collisionManager.setTrashcan(trashcan);

const clock = new THREE.Clock();

// Set initial environment
if (currentLevel.environment == 'day') {
    setDay();
} else if (currentLevel.environment == 'night') {
    setNight();
}

function animate() {
    requestAnimationFrame(animate);
    if (state === GameState.START) {
        camera.changeView(state, squirrel);
    }

    const delta = clock.getDelta();

    // Only update game objects when not in START or LEVEL_COMPLETE state
    if (state !== GameState.START && state !== GameState.LEVEL_COMPLETE) {
        camera.changeView(state, squirrel);
        terrain.update(delta);
        squirrel.update(delta);
        scooter.update(delta);
        trashcan.update(delta);
        distanceCounter.updateDistance();
        collisionManager.update(delta, terrain.isCurrentlyRewinding());

        // check if level is complete
        const goal = levelParser.getGoalDistance();
        console.log(distanceCounter.getDistance(), goal);
        if (state === GameState.PLAYING && distanceCounter.getDistance() >= goal) {
            state = GameState.LEVEL_COMPLETE;
            prepareNextLevel();
        }
    }

    // Check for Game-Over
    if (squirrel.getLivesCnt() <= 0) {
        if (state !== GameState.GAME_OVER) {
            state = GameState.GAME_OVER;
            showGameOver();
        }
    }

    renderer.render(scene, camera);
}

function showGameOver() {
    // display game over screen
    const gameOverScreen = document.getElementById('game-over-screen');
    gameOverScreen.style.display = 'flex';

    // display final score
    const finalScore = document.createElement('p');
    finalScore.textContent = `Final Score: ${score.count}`;
    gameOverScreen.insertBefore(finalScore, document.getElementById('restart-btn'));

    // clear scene
    while (scene.children.length > 0) {
        const object = scene.children[0];
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        scene.remove(object);
    }

    // add restart functionality
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.onclick = () => {
        location.reload();
    };
}

// Keyboard Controls
window.addEventListener('keydown', onKeyPress);

function onKeyPress(event) {

    switch (event.key) {
        case 'p':
            // Start game on any key press if in START state
            if (state === GameState.START) {
                state = GameState.PLAYING;
                scene.remove(textMesh);
            }
            break;
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

function prepareNextLevel() {
    // short pause so the player sees the "Level Complete!" text
    setTimeout(() => {
        const next = levelParser.nextLevel();

        if (!next) {                 // no more levels
            state = GameState.FINISHED;
            // you can display a "You won!" screen here
            return;
        }

        // reset world-specific stuff
        terrain.totalDistanceCovered = 0;
        distanceCounter.updateDistance();   // HUD back to zero

        // change fog / lighting for new environment
        if (next.environment === 'day') setDay();
        else if (next.environment === 'night') setNight();

        // clear leftovers from previous level
        cookies.forEach(c => c.remove());
        benches.forEach(b => b.remove());
        scooter.remove();
        trashcan.remove();
        cookies.length = benches.length = 0;

        // spawn new obstacles for the new level
        for (let i = 0; i < next.numCookies; i++) {
            spawnCookie(scene, cookies, renderer, camera, next.obstacleRange);
        }
        for (let i = 0; i < next.numBenches; i++) {
            spawnBench(scene, benches, renderer, camera, next.obstacleRange);
        }
        scooter = spawnScooter(scene, renderer, camera, next.obstacleRange);
        trashcan = spawnTrashcan(scene, renderer, camera, next.distance);
        collisionManager.setScooter(scooter);
        collisionManager.setTrashcan(trashcan);

        state = GameState.PLAYING;
    }, 5000);  // 2-second delay; tweak as you like
}