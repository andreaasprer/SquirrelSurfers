import * as THREE from 'three';
import { GameState } from '../utils/GameState.js';

export default class Camera extends THREE.PerspectiveCamera {
    constructor(scene) {
        super(75, window.innerWidth / window.innerHeight, 0.1, 200);
        this.scene = scene;
    }

    firstPersonView(squirrel) {
        if (!squirrel.model) return;

        this.position.x = squirrel.model.position.x;
        this.position.y = squirrel.model.position.y + 2;
        this.position.z = squirrel.model.position.z;

        // Look ahead of the squirrel
        this.lookAt(
            squirrel.model.position.x,
            squirrel.model.position.y + 1,
            squirrel.model.position.z - 10
        );
    }

    thirdPersonView(squirrel) {
        if (!squirrel.model) return;
        this.position.set(0, 5, 30);
        this.lookAt(0, 0, 0);
    }

    changeView(gameState, squirrel) {
        if (gameState === GameState.START) {
            this.firstPersonView(squirrel);
        } else {
            this.thirdPersonView(squirrel);
        }
    }
}