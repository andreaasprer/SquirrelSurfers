import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';

export default class Cookie {
    constructor(scene, modelPath = '../../models/cookie.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.model = null;

        this.boundingBox = null;
        this.helper = null;

        // for animation
        this.elapsedTime = 0;
        this.baseY = 0;
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
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(12, 12, 12);
            this.scene.add(this.model);

            this.boundingBox = new THREE.Box3().setFromObject(this.model);
            this.helper = new THREE.BoxHelper(this.model, 0x00ff00);
            this.scene.add(this.helper);

        }, undefined, (error) => {
            console.error('Error loading cookie model:', error);
        });
    }

    update(delta) {
        if (!this.model) return;

        if (this.boundingBox) {
            this.boundingBox.setFromObject(this.model);
            this.helper.update();
        }

        this.elapsedTime += delta;

        // handle rewind animation
        if (this.isRewinding) {
            const rewindStep = this.rewindDistance * delta;
            const stepToTake = Math.min(rewindStep, this.rewindRemaining);
            this.model.position.z -= stepToTake;
            this.rewindRemaining -= stepToTake;

            if (this.rewindRemaining <= 0) {
                this.isRewinding = false;
            }
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
            this.helper.update();
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
        if (this.helper) {
            this.scene.remove(this.helper);
        }
        this.model = null;
        this.boundingBox = null;
    }
}