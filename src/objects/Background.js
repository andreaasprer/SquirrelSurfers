import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Background {
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
        const velocity = 10; // Same velocity as terrain
        
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
} 