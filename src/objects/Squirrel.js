import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LANES, roadWidth } from '../WorldConfig'
import { loadingManager } from '../main.js';

export default class Squirrel {
    constructor(scene, modelPath = '../../models/squirrel.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.model = null;

        this.lives = 3;

        // movement and animation settings
        this.lanes = LANES;
        this.currentLane = 1;
        this.targetPosition = new THREE.Vector3(this.lanes[this.currentLane], 0, 0);
        this.moveDistance = roadWidth / 3;
        this.smoothness = 0.1;

        // jump physics
        this.isJumping = false;
        this.verticalVelocity = 0;
        this.jumpHeight = 5;
        this.apexDuration = 0.4; // time to reach jump apex
        this.jumpVel = (2 * this.jumpHeight) / this.apexDuration;
        this.gravity = this.jumpVel / this.apexDuration;

        // platform mechanics
        this.isOnPlatform = false;
        this.currentPlatform = null;

        this.boundingBox = null;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader(loadingManager);

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.position.set(0, 0, 10);
            this.targetPosition.copy(this.model.position);
            this.model.scale.set(0.03, 0.03, 0.03);
            this.model.rotateY(Math.PI);
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);

            this.mixer = new THREE.AnimationMixer(this.model);
            const action = this.mixer.clipAction(gltf.animations[0]);
            action.play();
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    update(delta) {
        if (!this.model) return;

        // Update animation
        if (this.mixer) this.mixer.update(delta);

        if (this.boundingBox) {
            this.boundingBox.setFromObject(this.model);
        }

        // Smooth horizontal movement
        this.model.position.lerp(new THREE.Vector3(this.targetPosition.x, this.model.position.y, this.targetPosition.z), this.smoothness);

        // Handle jump and falling
        if (this.isJumping || !this.isOnPlatform) {
            this.model.position.y += this.verticalVelocity * delta;
            this.verticalVelocity -= this.gravity * delta;

            // Check for landing on ground
            if (this.model.position.y <= 0) {
                this.model.position.y = 0;
                this.isJumping = false;
                this.verticalVelocity = 0;
                this.isOnPlatform = false;
                this.currentPlatform = null;
            }
        }
    }

    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.targetPosition.x = this.lanes[this.currentLane];
        }
    }

    moveRight() {
        if (this.currentLane < this.lanes.length - 1) {
            this.currentLane++;
            this.targetPosition.x = this.lanes[this.currentLane];
        }
    }

    jump() {
        if ((!this.isJumping && this.model?.position.y === 0) || this.isOnPlatform) {
            this.isJumping = true;
            this.verticalVelocity = this.jumpVel;
        }
    }

    loseLife() {
        this.lives--;
    }

    getLivesCnt() {
        return this.lives;
    }

    landOn(platform) {
        this.isOnPlatform = true;
        this.currentPlatform = platform;

        // place squirrel on top of platform
        const yTop = platform.boundingBox.max.y;
        this.model.position.y = yTop;

        // stop falling from jump
        this.isJumping = false;
        this.verticalVelocity = 0;

        if (this.boundingBox) {
            this.boundingBox.setFromObject(this.model);
        }
    }

    fallOffPlatform() {
        this.isOnPlatform = false;
        this.currentPlatform = null;
        this.isJumping = true;
        this.verticalVelocity = 0; // Start falling with no initial velocity
    }
}
