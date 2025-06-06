import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rewindDistance, rewindSpeed, velocity } from '../WorldConfig';
import { loadingManager } from '../main.js';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.terrainPieces = [];
        this.loader = new GLTFLoader(loadingManager);
        this.currentSection = 1;
        this.totalSections = 9; // Total number of terrain sections available

        // Create three terrain pieces at different positions
        this.createTerrainPiece(0);
        this.createTerrainPiece(-0.625);
        this.createTerrainPiece(-1.25);
        this.createTerrainPiece(-2.875);
        this.createTerrainPiece(-2.5);
        this.createTerrainPiece(-3.125);
        this.createTerrainPiece(-3.75);
        this.createTerrainPiece(-4.375);
        this.createTerrainPiece(-5);

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
        const sectionNumber = this.currentSection;
        this.currentSection = this.currentSection + 1;
        
        this.loader.load(
            `../models/Terrain/Section${sectionNumber}.glb`,
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(2.5, 2.5, 2.5);
                model.position.set(27, -2.5, zPosition);
                this.scene.add(model);
                this.terrainPieces.push(model);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error(`An error happened while loading terrain section ${sectionNumber}:`, error);
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
            // if (piece.position.z > 80) {
            //     piece.position.z = -220;
            //     this.terrainCounter++;
            // }
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
        return Math.trunc(this.totalDistanceCovered / 10);
    }

    resetRewindState() {
        this.isRewinding = false;
        this.rewindRemaining = 0;
    }
} 