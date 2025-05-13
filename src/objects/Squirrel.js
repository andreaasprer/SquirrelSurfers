import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Squirrel {
    constructor(scene, modelPath = '../../models/squirrel.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.model = null;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(.05, .05, .05);
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
}