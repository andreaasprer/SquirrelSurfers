import Snack from './Snack';

export default class Pizza extends Snack {
    constructor(scene) {
        super(scene, '../../models/pizza.glb', .4, -.3, 3);
    }

    // override the parent class's model loaded callback
    onModelLoaded(model) {
        model.rotation.z = -Math.PI / 4; // tilt a bit
    }
}