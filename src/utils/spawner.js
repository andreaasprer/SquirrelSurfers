import { LANES, OBSTACLE_Z_RANGE } from "../WorldConfig";
import Cookie from "../objects/Cookie";
import Scooter from "../objects/Scooter";
import Bench from "../objects/Bench";


export function spawnCookie(scene, cookies, renderer, camera) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (OBSTACLE_Z_RANGE.max - OBSTACLE_Z_RANGE.min) + OBSTACLE_Z_RANGE.min;

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

export function spawnBench(scene, benches, renderer, camera) {
    const laneX = LANES[Math.floor(Math.random() * LANES.length)];
    const zPos = Math.random() * (OBSTACLE_Z_RANGE.max - OBSTACLE_Z_RANGE.min) + OBSTACLE_Z_RANGE.min;

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

export function spawnScooter(scene, renderer, camera) {
    const zPos = Math.random() * (OBSTACLE_Z_RANGE.max - OBSTACLE_Z_RANGE.min) + OBSTACLE_Z_RANGE.min;
    const newScooter = new Scooter(scene);

    newScooter.model.position.z = zPos;
    // Precompile the object
    renderer.compile(scene, camera);
    return newScooter;
}
