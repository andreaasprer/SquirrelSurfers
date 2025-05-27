import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Squirrel from './objects/Squirrel.js';
import Terrain from './objects/Terrain.js';
import SnackCounter from './objects/SnackCounter.js'
import LivesCounter from './objects/LivesCounter.js';
import { spawnBench, spawnCookie, spawnScooter } from './utils/spawner.js';
import CollisionManager from './managers/CollisionManager.js';
import LevelParser from './utils/LevelParser.js';
import { LEVELS } from './WorldConfig.js';
import { GameState } from './utils/GameState.js';
import Camera from './objects/Camera.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();

let textMesh = null;

// Create camera with squirrel perspective
const camera = new Camera(scene);
camera.position.set(0, 5, 30); // Set initial position
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

for (let i = 0; i < 20; i++) {
    spawnCookie(scene, cookies);
}
for (let i = 0; i < 10; i++) {
    spawnBench(scene, benches);
}

scooter = spawnScooter(scene);

// Score and Lives Counter
let score = new SnackCounter();
let lives = new LivesCounter(squirrel);

// Initialize collision manager
const collisionManager = new CollisionManager(scene, squirrel, score, lives);
collisionManager.setCookies(cookies);
collisionManager.setBenches(benches);
collisionManager.setScooter(scooter);
collisionManager.setTerrain(terrain);

const levelParser = new LevelParser(LEVELS);
const clock = new THREE.Clock();

// Set initial environment
const currentLevel = levelParser.getCurrentLevel();
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

    // Only update game objects when not in START state
    if (state !== GameState.START) {
        camera.changeView(state, squirrel);
        terrain.update(delta);
        squirrel.update(delta);
        scooter.update(delta);
        collisionManager.update(delta, terrain.isCurrentlyRewinding());
    }

    renderer.render(scene, camera);
}

animate();

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



