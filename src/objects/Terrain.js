import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.terrainPieces = [];
        this.loader = new GLTFLoader();

        // Create three terrain pieces at different positions
        this.createTerrainPiece(0);
        this.createTerrainPiece(-110);
        this.createTerrainPiece(-220);

        // rewind animation
        this.isRewinding = false;
        this.rewindDistance = rewindDistance;
        this.rewindSpeed = rewindSpeed;
        this.rewindRemaining = 0;

        // terrain counter
        this.terrainCounter = 1;
        this.totalDistanceCovered = 0;
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
        // handle rewind animation
        if (this.isRewinding) {
            const rewindStep = this.rewindSpeed * delta;
            const stepToTake = Math.min(rewindStep, this.rewindRemaining);

            // Move all terrain pieces
            for (let i = 0; i < this.terrainPieces.length; i++) {
                const piece = this.terrainPieces[i];
                piece.position.z -= stepToTake;
            }

            this.rewindRemaining -= stepToTake;
            if (this.rewindRemaining <= 0) {
                this.isRewinding = false;
            }

            this.totalDistanceCovered -= stepToTake;
            return;
        }


        // Move all terrain pieces
        for (let i = 0; i < this.terrainPieces.length; i++) {
            const piece = this.terrainPieces[i];
            piece.position.z += velocity * delta;

            // Reset position when piece moves too far
            if (piece.position.z > 80) {
                piece.position.z = -220;
                this.terrainCounter++;
            }
        }

        // Only increase distance during normal forward movement
        this.totalDistanceCovered += velocity * delta;
    }

    startRewind() {
        this.isRewinding = true;
        this.rewindRemaining = this.rewindDistance;
    }

    isCurrentlyRewinding() {
        return this.isRewinding;
    }

    distanceCovered() {
        return Math.trunc(this.totalDistanceCovered/10);
    }
} 