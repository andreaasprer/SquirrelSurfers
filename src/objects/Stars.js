import * as THREE from 'three';

export default class Stars {
    constructor(scene, numStars = 800, radius = 50) {
        this.scene = scene;
        this.geometry = new THREE.BufferGeometry();
        const positions = [];
        for (let i = 0; i < numStars; i++) {
            const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
            const phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
            positions.push(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.cos(theta),
                radius * Math.sin(theta) * Math.sin(phi)
            );
        }
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        this.material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 3,             
            sizeAttenuation: false, 
            transparent: true,
            opacity: 0.99
        });

        this.stars = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.stars);
    }
}
