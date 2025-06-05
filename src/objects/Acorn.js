import Snack from './Snack';

export default class Acorn extends Snack {
    constructor(scene) {
        super(scene, '../../models/acorn.glb', 1, .5, 2);
    }
}