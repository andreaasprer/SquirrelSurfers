import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';

export default class Trashcan {
    constructor(scene, zPos, modelPath = '../models/trashcan.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.model = null;

        this.boundingBox = null;

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed;
        this.rewindRemaining = 0;

        this.loadModel(zPos);
    }

    loadModel(zPos) {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(5, 5, 5);
            this.model.position.set(0, -1.6, zPos);
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);

        }, (xhr) => {
            console.log('Trashcan: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('Error loading trashcan model:', error);
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