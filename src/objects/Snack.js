import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';
import { loadingManager } from '../main.js';

export default class Snack {
    constructor(scene, modelPath, scale, yOffset) {
        this.scene = scene;
        this.modelPath = modelPath;
        this.model = null;
        this.scale = scale;
        this.yOffset = yOffset;

        this.boundingBox = null;

        // for animation
        this.elapsedTime = 0;
        this.baseY = yOffset;
        this.floatAmp = 0.5;
        this.spinSpeed = 1.5;

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed;
        this.rewindRemaining = 0;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader(loadingManager);

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(this.scale, this.scale, this.scale);
            this.model.position.y = this.yOffset;
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);

            // if snack overrides some of the snack properties
            if (this.onModelLoaded) {
                this.onModelLoaded(this.model);
            }

        }, undefined, (error) => {
            console.error('Error loading snack model:', error);
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
            return;
        }

        // move with floor
        this.model.position.z += velocity * delta

        // spin
        this.model.rotation.y += this.spinSpeed * delta;

        // float up and down
        const floatY = this.baseY + Math.sin((this.elapsedTime * 2) * this.floatAmp);
        this.model.position.y = floatY;

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