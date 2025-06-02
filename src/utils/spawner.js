import { LANES } from "../WorldConfig";
import Cookie from "../objects/Cookie";
import Scooter from "../objects/Scooter";
import Bench from "../objects/Bench";
import Trashcan from '../objects/Trashcan.js';

export function spawnCookie(scene, cookies, renderer, camera, obstacleRange) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (obstacleRange.max - obstacleRange.min) + obstacleRange.min;

    const cookie = new Cookie(scene);

    const waitUntilLoaded = setInterval(() => {
        if (cookie.model) {
            cookie.model.position.set(laneX, 0, zPos);
            // Precompile the object
            renderer.compile(scene, camera);
            cookies.push(cookie);
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
