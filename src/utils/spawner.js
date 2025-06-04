import { LANES } from "../WorldConfig";
import Cookie from "../objects/Cookie";
import Scooter from "../objects/Scooter";
import Bench from "../objects/Bench";
import Trashcan from '../objects/Trashcan.js';
import Acorn from "../objects/Acorn";
import Pizza from "../objects/Pizza";
import AcaiBowl from "../objects/AcaiBowl";

// spawn different types of snacks
const SNACK_TYPES = [Cookie, Acorn, Pizza, AcaiBowl];

export function spawnSnack(scene, snacks, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (obstacleRange.max - obstacleRange.min) + obstacleRange.min;

    // randomly select a snack type
    const SnackType = SNACK_TYPES[Math.floor(Math.random() * SNACK_TYPES.length)];
    const snack = new SnackType(scene);

    const waitUntilLoaded = setInterval(() => {
        if (snack.model) {
            snack.model.position.set(laneX, 0, zPos);
            // Precompile the object
            renderer.compile(scene, camera);
            snacks.push(snack);
            clearInterval(waitUntilLoaded);
        }
    }, 50);
}

export function spawnBench(scene, benches, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (obstacleRange.max - obstacleRange.min) + obstacleRange.min;

    const bench = new Bench(scene, laneX, zPos);

    const waitUntilLoaded = setInterval(() => {
        if (bench.model) {
            // Precompile the object
            renderer.compile(scene, camera);
            benches.push(bench);
            clearInterval(waitUntilLoaded);
        }
    }, 50);
}

export function spawnScooter(scene, scooters, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (obstacleRange.max - obstacleRange.min) + obstacleRange.min;
    const scooter = new Scooter(scene, laneX, zPos);

    const waitUntilLoaded = setInterval(() => {
        if (scooter.model) {
            // Precompile the object
            renderer.compile(scene, camera);
            scooters.push(scooter);
            clearInterval(waitUntilLoaded);
        }
    }, 50);
}

export function spawnTrashcan(scene, renderer, camera, zPos) {
    const globalZPos = zPos * -10;
    const newTrashcan = new Trashcan(scene, globalZPos);

    renderer.compile(scene, camera);
    return newTrashcan;
}
