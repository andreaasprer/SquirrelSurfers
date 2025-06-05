import { LANES, MIN_OBSTACLE_SPACING } from "../WorldConfig";
import Cookie from "../objects/Cookie";
import Scooter from "../objects/Scooter";
import Bench from "../objects/Bench";
import Trashcan from '../objects/Trashcan.js';
import Acorn from "../objects/Acorn";
import Pizza from "../objects/Pizza";
import AcaiBowl from "../objects/AcaiBowl";

// spawn different types of snacks
const SNACK_TYPES = [Cookie, Acorn, Pizza, AcaiBowl];

// helper functions to prevent overlap between obstacles
function isZPositionAvailable(zPos, obstacles, range) {
    if (zPos < range.min || zPos > range.max) return false;

    // check distance from all existing obstacles
    for (const obstacle of obstacles) {
        if (!obstacle.model) continue;
        const obstacleZ = obstacle.model.position.z;
        if (Math.abs(obstacleZ - zPos) < MIN_OBSTACLE_SPACING) {
            return false;
        }
    }
    return true;
}

function getValidZPosition(obstacles, range, maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
        const zPos = Math.random() * (range.max - range.min) + range.min;
        if (isZPositionAvailable(zPos, obstacles, range)) {
            return zPos;
        }
    }
    return null;
}

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

export function spawnBench(scene, benches, scooters, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = getValidZPosition([...benches, ...scooters], obstacleRange);

    // If no valid position found, don't spawn the bench
    if (zPos === null) return;

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

export function spawnScooter(scene, scooters, benches, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = getValidZPosition([...benches, ...scooters], obstacleRange);

    // If no valid position found, don't spawn the scooter
    if (zPos === null) return;

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
