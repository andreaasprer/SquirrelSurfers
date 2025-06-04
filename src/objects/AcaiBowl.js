import Snack from './Snack';

export default class AcaiBowl extends Snack {
    constructor(scene) {
        super(scene, '../../models/acai_bowl.glb', .6, .5);
    }

    onModelLoaded(model) {
        model.rotation.z = -Math.PI / 8; // tilt a bit
        model.rotation.y = Math.PI / 2;
    }
}