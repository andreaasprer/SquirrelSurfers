import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Squirrel from './objects/Squirrel.js';
import Cookie from './objects/Cookie.js';
import Terrain from './objects/Terrain.js';
import { roadWidth, roadLength, LANES } from './WorldConfig.js'


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 10, 20);
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
const squirrel = new Squirrel(scene); 
const cookie =  new Cookie(scene);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    terrain.update(delta);
    squirrel.update(delta);
    cookie.update(delta);


    // Collision Check
    if (squirrel.boundingBox && cookie.boundingBox) {
        if (squirrel.boundingBox.intersectsBox(cookie.boundingBox)) {
            console.log("Collision Detected");
            cookie.remove();
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

