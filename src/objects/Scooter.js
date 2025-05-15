import * as THREE from 'three';
import { LANES, roadWidth } from '../WorldConfig'
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Scooter {
    constructor(scene) {
        this.scene = scene;
        // this.modelPath = modelPath;
        // this.model = null;

        this.boundingBox = null;
        this.helper = null;

        // lane switching variables
        this.lanes = LANES;
        this.elapsedTime = 0;
        this.moveSpeed = 1;

        this.loadModel();
    }

    loadModel() {
        //const loader = new GLTFLoader();

        const boxGeometry = new THREE.BoxGeometry(roadWidth/3.5, 5, 3, 1, 1, 1);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x303030 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);

        this.model = box;
        this.model.position.set(0, .8, 0);
        this.scene.add(this.model);

        this.boundingBox = new THREE.Box3().setFromObject(this.model);
        this.helper = new THREE.BoxHelper(this.model, 0x00ff00);
        this.scene.add(this.helper);
        

        // loader.load(this.modelPath, (gltf) => {
        //     this.model = gltf.scene;
        //     this.model.scale.set(20, 20, 20);
        //     this.scene.add(this.model);

        //     this.boundingBox = new THREE.Box3().setFromObject(this.model);
        //     this.helper = new THREE.BoxHelper(this.model, 0x00ff00);
        //     this.scene.add(this.helper);
            
        // }, undefined, (error) => {
        //     console.error('Error loading cookie model:', error);
        // });
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

        // oscillate across the lanes
        const left = this.lanes[0];
        const right = this.lanes[this.lanes.length - 1];

        const t = (Math.sin(this.elapsedTime * this.moveSpeed) + 1) /2;
        this.model.position.x = THREE.MathUtils.lerp(left, right, t);

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