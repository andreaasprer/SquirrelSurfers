import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export default class Squirrel {
    
    constructor(scene, modelPath = '../../models/squirrel.glb') {
        this.scene = scene;
        this.modelPath = modelPath;
        this.mixer = null;
        this.model = null;
        
        // variables for squirrel movement and transformations
        this.moveDistance = 2;
        this.smoothness = 0.1;
        this.targetPosition = new THREE.Vector3(0, 0, 0);


        this.boundingBox = null;
        this.helper = null;
        
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
            
            this.boundingBox = new THREE.Box3().setFromObject(this.model);
            this.helper = new THREE.BoxHelper(this.model, 0xffff00);
            this.scene.add(this.helper);
            
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

        if (this.helper) {
            this.helper.update(delta);
        }

        if (this.model) {
            this.model.position.lerp(this.targetPosition, this.smoothness);
        }
    
    }
    // TODO: Smooth animation of side movements and jump
    moveLeft() {
        this.targetPosition.x -= this.moveDistance;
    }
    moveRight() {
        this.targetPosition.x += this.moveDistance;
    }
    jump() {
        this.model.posi wwtion.y += this.moveDistance;
    }
}