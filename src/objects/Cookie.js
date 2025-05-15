import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Cookie {
    constructor(scene, modelPath = '../../models/cookie.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.model = null;

        this.boundingBox = null;
        this.helper = null;

        // for animation
        this.elapsedTime = 0;
        this.baseY = 0;
        this.floatAmp = 0.5;
        this.spinSpeed = 1.5;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
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

        this.elapsedTime += delta;

        // move with floor
        const velocity = 10;
        this.model.position.z += velocity * delta

        // spin
        this.model.rotation.y += this.spinSpeed * delta;

        // float up and down
        const floatY = this.baseY + Math.sin((this.elapsedTime * 2) * this.floatAmp);
        this.model.position.y = floatY;

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