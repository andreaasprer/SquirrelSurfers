import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export default class DynamicSky {
    constructor(scene) {
        this.sky = new Sky();
        this.sky.scale.setScalar(2000);
        scene.add(this.sky);

        this.sun = new THREE.Vector3();
        this.uniforms = this.sky.material.uniforms;

        // Default sky hidden 
        this.sky.visible = false;
    }

    setDay() {
        this.sky.visible = true;
        this.uniforms.turbidity.value = 0.38;
        this.uniforms.rayleigh.value = 0.55;
        this.uniforms.mieCoefficient.value = 0.001;
        this.uniforms.mieDirectionalG.value = 0.7;

        this.setSunPosition(0.503, 0.25);
    }

    setSunPosition(inclination, azimuth) {
        const theta = Math.PI * (inclination - 0.5);
        const phi = 2 * Math.PI * (azimuth - 0.5);

        this.sun.x = Math.cos(phi) * Math.cos(theta);
        this.sun.y = Math.sin(theta);
        this.sun.z = Math.sin(phi) * Math.cos(theta);

        this.uniforms.sunPosition.value.copy(this.sun);
    }

    hide() {
        this.sky.visible = false;
    }
}
