import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';

export default class Bench {
    constructor(scene, xOffset, zPosition) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.model = null;

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed; // units per second
        this.rewindRemaining = 0;

        this.createBench(xOffset, zPosition);
    }

    createBench(xOffset, zPosition) {
        this.loader.load(
            '../models/wooden_park_bench.glb',
            (gltf) => {
                this.model = gltf.scene;

                // Ensure all materials are properly initialized
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        // Force material initialization
                        child.material.needsUpdate = true;
                        // Ensure proper rendering order
                        child.renderOrder = 0;
                        // Optional: optimize materials
                        child.material.side = THREE.FrontSide;
                    }
                });

                // Scale the bench appropriately
                this.model.scale.set(5, 5, 5);
                // Position the bench on the side of the terrain
                this.model.position.set(xOffset, -1.7, zPosition);
                // Rotate the bench to face the center
                this.model.rotation.y = xOffset > 0 ? -Math.PI / 2 : Math.PI / 2;

                // create custom bounding box (half-height)
                const originalBox = new THREE.Box3().setFromObject(this.model);
                const originalHeight = originalBox.max.y - originalBox.min.y;
                this.boundingBox = new THREE.Box3(
                    originalBox.min.clone(),
                    new THREE.Vector3(
                        originalBox.max.x,
                        originalBox.min.y + (originalHeight / 2),
                        originalBox.max.z
                    )
                );

                this.scene.add(this.model);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the bench:', error);
            }
        );
    }

    update(delta) {
        if (!this.model) return;

        // update custom bounding box
        const originalBox = new THREE.Box3().setFromObject(this.model);
        const originalHeight = originalBox.max.y - originalBox.min.y;
        this.boundingBox.min.copy(originalBox.min);
        this.boundingBox.max.set(
            originalBox.max.x,
            originalBox.min.y + (originalHeight / 2),
            originalBox.max.z
        );

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
        this.model.position.z += velocity * delta;
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
            this.model = null;
        }
        this.boundingBox = null;
    }
}
