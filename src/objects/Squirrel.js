import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LANES, roadWidth } from '../WorldConfig'

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

        this.boundingBox = null;
        this.helper = null;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.position.set(0, 0, 10);
            this.targetPosition.copy(this.model.position);
            this.model.scale.set(0.03, 0.03, 0.03);
            this.model.rotateY(Math.PI);
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);
            this.helper = new THREE.BoxHelper(this.model, 0x00ff00);
            this.scene.add(this.helper);

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
            this.helper.update();
        }

        // Smooth horizontal movement
        this.model.position.lerp(new THREE.Vector3(this.targetPosition.x, this.model.position.y, this.targetPosition.z), this.smoothness);

        // Handle jump
        if (this.isJumping) {
            this.model.position.y += this.verticalVelocity * delta;
            this.verticalVelocity -= this.gravity * delta;

            // Check for landing
            if (this.model.position.y <= 0) {
                this.model.position.y = 0;
                this.isJumping = false;
                this.verticalVelocity = 0;
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
        if (!this.isJumping && this.model?.position.y === 0) {
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
}
