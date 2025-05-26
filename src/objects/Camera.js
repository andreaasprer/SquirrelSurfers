import * as THREE from 'three';
import { GameState } from '../utils/GameState.js';

export default class Camera extends THREE.PerspectiveCamera {
    constructor(scene) {
        super(75, window.innerWidth / window.innerHeight, 0.1, 200);
        this.scene = scene;

        // for smooth transitions
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.transitionSpeed = 0.05;
        this.isTransitioning = false;
        this.previousGameState = null;

        // FOV settings
        this.firstPersonFOV = 75;
        this.thirdPersonFOV = 40;
        this.targetFOV = this.firstPersonFOV;
    }

    firstPersonView(squirrel) {
        if (!squirrel.model) return;

        this.targetPosition.set(
            squirrel.model.position.x,
            squirrel.model.position.y,
            squirrel.model.position.z - 3
        );

        this.targetLookAt.set(
            squirrel.model.position.x,
            squirrel.model.position.y,
            squirrel.model.position.z - 10
        );

        this.targetFOV = this.firstPersonFOV;
    }

    thirdPersonView(squirrel) {
        if (!squirrel.model) return;

        this.targetPosition.set(0, 5, 30);
        this.targetLookAt.set(0, 0, 0);
        this.targetFOV = this.thirdPersonFOV;
    }

    updatePosition() {
        this.position.lerp(this.targetPosition, this.transitionSpeed);
        this.currentLookAt.lerp(this.targetLookAt, this.transitionSpeed);
        this.lookAt(this.currentLookAt);

        // Smoothly interpolate FOV
        this.fov += (this.targetFOV - this.fov) * this.transitionSpeed;
        this.updateProjectionMatrix();

        // Check if we're still transitioning
        this.isTransitioning =
            this.position.distanceTo(this.targetPosition) > 0.01 ||
            this.currentLookAt.distanceTo(this.targetLookAt) > 0.01 ||
            Math.abs(this.fov - this.targetFOV) > 0.1;
    }

    changeView(gameState, squirrel) {
        // Start transition if game state changed
        if (this.previousGameState !== gameState) {
            this.isTransitioning = true;
            this.previousGameState = gameState;

            // Store current lookAt target if not already set
            if (!this.currentLookAt.equals(this.targetLookAt)) {
                this.currentLookAt.copy(this.targetLookAt);
            }
        }

        if (gameState === GameState.START) {
            this.firstPersonView(squirrel);
        } else {
            this.thirdPersonView(squirrel);
        }

        // Update position and rotation with interpolation
        this.updatePosition();
    }
}