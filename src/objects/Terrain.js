import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.loader = new GLTFLoader();
        
        this.loadModel();
    }

    loadModel() {
        this.loader.load(
            '../models/ThreeLane.glb',
            (gltf) => {
                this.model = gltf.scene;
                
                // Scale and position the terrain
                this.model.scale.set(1.1, 1, 5); // Adjust scale as needed
                this.model.position.set(3, -1.7, -40); // Position slightly below ground level
                
                // Add the model to the scene
                this.scene.add(this.model);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the terrain:', error);
            }
        );
    }

    update(delta) {
        const velocity = 10; // Units per second
        if (this.model) {
            this.model.position.z += velocity * delta;
            
            // Reset position when terrain has moved too far
            if (this.model.position.z > 50) {
                this.model.position.z = -40;
            }
        }
    }
} 