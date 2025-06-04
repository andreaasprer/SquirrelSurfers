import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Squirrel from './objects/Squirrel.js';
import Terrain from './objects/Terrain.js';
import DynamicSky from './objects/Sky.js';
import Stars from './objects/Stars.js';
import SnackCounter from './objects/SnackCounter.js'
import LivesCounter from './objects/LivesCounter.js';
import DistanceCounter from './objects/DistanceCounter.js';
import { spawnBench, spawnSnack, spawnScooter, spawnTrashcan } from './utils/spawner.js';
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
const sky = new DynamicSky(scene);
let stars = null;

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
    sky.setDay();
}

function setNight() {
    sky.hide();
    scene.background = new THREE.Color(0x0a1442);
    scene.fog.color.set(0x0a1442,);
    scene.fog.density = 0.02;

    if (!stars) {
        stars = new Stars(scene, 800, 175);
    }
}

// load game assets
const squirrel = new Squirrel(scene);
const snacks = [];
const benches = [];
const scooters = [];
let trashcan = null;

for (let i = 0; i < currentLevel.numCookies; i++) {
    spawnSnack(scene, snacks, renderer, camera, currentLevel.obstacleRange);
}
for (let i = 0; i < currentLevel.numBenches; i++) {
    spawnBench(scene, benches, renderer, camera, currentLevel.obstacleRange);
}
for (let i = 0; i < currentLevel.numScooters; i++) {
    spawnScooter(scene, scooters, renderer, camera, currentLevel.obstacleRange);
}
trashcan = spawnTrashcan(scene, renderer, camera, currentLevel.distance);

// Score, Lives, and Distance Counter
let score = new SnackCounter();
let lives = new LivesCounter(squirrel);
let distanceCounter = new DistanceCounter(terrain);


// Initialize collision manager
const collisionManager = new CollisionManager(scene, squirrel, score, lives);
collisionManager.setCookies(snacks);
collisionManager.setBenches(benches);
collisionManager.setScooters(scooters);
collisionManager.setTrashcan(trashcan);
collisionManager.setTerrain(terrain);

const clock = new THREE.Clock();

// Set initial environment
if (currentLevel.environment == 'day') {
    setDay();
} else if (currentLevel.environment == 'night') {
    setNight();
}

function updateDistanceBar(distance, goalDistance) {
    const progress = Math.max(0, Math.min(1, distance / goalDistance));
    const bar = document.getElementById('distance-bar');
    const fill = document.getElementById('distance-bar-fill');
    const icon = document.getElementById('squirrel-icon');

    const barWidth = bar.offsetWidth;
    const iconWidth = icon.offsetWidth;

    fill.style.width = `${progress * 100}%`;
    let iconLeft = progress * barWidth - iconWidth / 2;
    iconLeft = Math.max(0, Math.min(iconLeft, barWidth - iconWidth));
    icon.style.left = `${iconLeft}px`;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    renderer.render(scene, camera);

    switch (state) {
        case GameState.START:
            camera.changeView(state, squirrel);
            break;

        case GameState.PLAYING:
            // check if level is complete
            const goal = levelParser.getGoalDistance();
            if (distanceCounter.getDistance() >= goal) {
                state = GameState.LEVEL_COMPLETE;
                prepareNextLevel();
            }
            camera.changeView(state, squirrel);
            terrain.update(delta);
            squirrel.update(delta);
            trashcan.update(delta);
            distanceCounter.updateDistance();
            updateDistanceBar(distanceCounter.getDistance(), levelParser.getGoalDistance());
            collisionManager.update(delta, terrain.isCurrentlyRewinding());
            break;

        case GameState.LEVEL_COMPLETE:
            camera.changeView(state, squirrel);
            break;

        case GameState.GAME_OVER:
            if (!document.getElementById('game-over-screen').style.display) {
                showGameOver();
            }
            break;
    }

    // Check for Game-Over condition
    if (squirrel.getLivesCnt() <= 0 && state !== GameState.GAME_OVER) {
        state = GameState.GAME_OVER;
    }
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
    state = GameState.LEVEL_COMPLETE;
    loadingScreen.style.display = 'flex';
    loadingText.textContent = 'Level Complete!';

    terrain.totalDistanceCovered = 0;
    terrain.resetRewindState();
    distanceCounter.updateDistance();
    squirrel.resetPosition();

    setTimeout(() => {
        const next = levelParser.nextLevel();

        // finished all levels
        if (!next) {
            state = GameState.FINISHED;
            // TODO: game over screen/scene???
            return;
        }

        loadingText.textContent = 'Loading next level...';

        if (next.environment === 'day') setDay();
        else if (next.environment === 'night') setNight();

        // clear leftovers from previous level
        snacks.forEach(s => s.remove());
        benches.forEach(b => b.remove());
        scooters.forEach(s => s.remove());
        trashcan.remove();
        snacks.length = benches.length = scooters.length = 0;

        // spawn new obstacles for the new level
        for (let i = 0; i < next.numCookies; i++) {
            spawnSnack(scene, snacks, renderer, camera, next.obstacleRange);
        }
        for (let i = 0; i < next.numBenches; i++) {
            spawnBench(scene, benches, renderer, camera, next.obstacleRange);
        }
        for (let i = 0; i < next.numScooters; i++) {
            spawnScooter(scene, scooters, renderer, camera, next.obstacleRange);
        }
        trashcan = spawnTrashcan(scene, renderer, camera, next.distance);
        collisionManager.setCookies(snacks);
        collisionManager.setBenches(benches);
        collisionManager.setScooters(scooters);
        collisionManager.setTrashcan(trashcan);
        collisionManager.setTerrain(terrain);

        // wait 4 seconds before starting next level
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            squirrel.resetPosition();
            terrain.totalDistanceCovered = 0;
            terrain.resetRewindState();
            distanceCounter.updateDistance();
        }, 4000);

    }, 1000);
}