import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export default class Squirrel {
    constructor(scene, modelPath = '../../models/squirrel.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.model = null;

        this.moveDistance = 5;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.position.set(0, 0, 0);
            this.model.scale.set(.05, .05, .05);
            this.model.rotateY(Math.PI); // probably change this with rotation matrix that we learned
            this.scene.add(this.model);

            this.mixer = new THREE.AnimationMixer(this.model);
            const action = this.mixer.clipAction(gltf.animations[0]); // running animation
            action.play();
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        
        });
    }
    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
    // TODO: Smooth animation of side movements and jump
    moveLeft() {
        // rough movement
        this.model.position.x = -this.moveDistance;
    }
    moveRight() {
        this.model.position.x = this.moveDistance;
    }
    jump() {
        this.model.position.y = this.moveDistance;
    }
}