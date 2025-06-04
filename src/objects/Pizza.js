import Snack from './Snack';

export default class Pizza extends Snack {
    constructor(scene) {
        super(scene, '../../models/pizza.glb', 1.3, -.9);
    }

    // override the parent class's model loaded callback
    onModelLoaded(model) {
        model.rotation.z = -Math.PI / 8; // tilt a bit
        model.rotation.y = Math.PI / 2;
    }
}