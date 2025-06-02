import * as THREE from 'three';
import { LANES } from '../WorldConfig'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';
import { loadingManager } from '../main.js';

export default class Scooter {
    constructor(scene, laneX, zPos) {
        this.scene = scene;
        this.modelPath = '../../models/scooter.glb';
        this.model = null;

        this.boundingBox = null;

        // lane switching variables
        this.lanes = LANES;
        this.elapsedTime = 0;
        this.moveSpeed = 1;
        // random phase offset for each scooter
        this.phaseOffset = Math.random() * Math.PI * 2;

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed;
        this.rewindRemaining = 0;

        this.loadModel(laneX, zPos);
    }

    loadModel(laneX, zPos) {
        const loader = new GLTFLoader(loadingManager);

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.position.set(laneX, -1, zPos);
            this.model.scale.set(3, 3.5, 3);
            this.model.rotation.y = Math.PI / 2;
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);

        }, undefined, (error) => {
            console.error('Error loading scooter model:', error);
        });
    }

    update(delta) {
        if (!this.model) return;

        if (this.boundingBox) {
            this.boundingBox.setFromObject(this.model);
        }

        this.elapsedTime += delta;

        // handle rewind animation
        if (this.isRewinding) {
            const rewindStep = this.rewindSpeed * delta;
            const stepToTake = Math.min(rewindStep, this.rewindRemaining);
            this.model.position.z -= stepToTake;
            this.rewindRemaining -= stepToTake;

            if (this.rewindRemaining <= 0) {
                this.isRewinding = false;
            }
        }

        // normal movement
        this.model.position.z += velocity * delta;

        // oscillate across the lanes with phase offset
        const left = this.lanes[0];
        const right = this.lanes[this.lanes.length - 1];

        const t = (Math.sin(this.elapsedTime * this.moveSpeed + this.phaseOffset) + 1) / 2;
        this.model.position.x = THREE.MathUtils.lerp(left, right, t);

        if (this.boundingBox) {
            this.boundingBox.setFromObject(this.model);
        }
    }

    startRewind() {
        this.isRewinding = true;
        this.rewindRemaining = this.rewindDistance;
    }

    isCurrentlyRewinding() {
        return this.isRewinding;
    }

    remove() {
        if (this.model) {
            this.scene.remove(this.model);
        }
        this.model = null;
        this.boundingBox = null;
    }
}