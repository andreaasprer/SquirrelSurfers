import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Cookie {
    constructor(scene, modelPath = '../../models/cookie.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.model = null;

        this.boundingBox = null;
        this.helper = null;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.position.set(10, 0, 0);
            this.model.scale.set(20, 20, 20);
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