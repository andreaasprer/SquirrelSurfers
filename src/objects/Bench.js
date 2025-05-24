import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';
export default class Bench {
    constructor(scene) {
        this.scene = scene;
        this.benches = [];
        this.loader = new GLTFLoader();

        // Create benches for each side
        this.createBench(0, -5); // Left side
        this.createBench(0, 5);  // Right side
        this.createBench(-110, -5);
        this.createBench(-110, 5);
        this.createBench(-220, -5);
        this.createBench(-220, 5);

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed; // units per second
        this.rewindRemaining = 0;
    }

    createBench(zPosition, xOffset) {
        this.loader.load(
            '../models/wooden_park_bench.glb',
            (gltf) => {
                const model = gltf.scene;
                // Scale the bench appropriately
                model.scale.set(10, 10, 10);
                // Position the bench on the side of the terrain
                model.position.set(xOffset, -1.7, zPosition);
                // Rotate the bench to face the center
                model.rotation.y = xOffset > 0 ? -Math.PI / 2 : Math.PI / 2;
                this.scene.add(model);
                this.benches.push(model);
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
        // handle rewind animation
        if (this.isRewinding) {
            const rewindStep = this.rewindSpeed * delta;
            const stepToTake = Math.min(rewindStep, this.rewindRemaining);

            // Move all benches
            for (let i = 0; i < this.benches.length; i++) {
                const bench = this.benches[i];
                bench.position.z -= stepToTake;
            }

            this.rewindRemaining -= stepToTake;
            if (this.rewindRemaining <= 0) {
                this.isRewinding = false;
            }
            return;
        }

        // Move all benches
        for (let i = 0; i < this.benches.length; i++) {
            const bench = this.benches[i];
            bench.position.z += velocity * delta;

            // Reset position when bench moves too far
            if (bench.position.z > 80) {
                bench.position.z = -220;
            }
        }
    }

    startRewind() {
        this.isRewinding = true;
        this.rewindRemaining = this.rewindDistance;
    }

    isCurrentlyRewinding() {
        return this.isRewinding;
    }
}