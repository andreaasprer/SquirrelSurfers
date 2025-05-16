import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.terrainPieces = [];
        this.loader = new GLTFLoader();
        
        // Create three terrain pieces at different positions
        this.createTerrainPiece(0);
        this.createTerrainPiece(-110);
        this.createTerrainPiece(-220);
    }

    createTerrainPiece(zPosition) {
        this.loader.load(
            '../models/ThreeLane.glb',
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(1.1, 1, 5);
                model.position.set(3, -1.7, zPosition);
                this.scene.add(model);
                this.terrainPieces.push(model);
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
        
        // Move all terrain pieces
        for (let i = 0; i < this.terrainPieces.length; i++) {
            const piece = this.terrainPieces[i];
            piece.position.z += velocity * delta;

            // Reset position when piece moves too far
            if (piece.position.z > 80) {
                piece.position.z = -220;
            }
        }
    }
} 