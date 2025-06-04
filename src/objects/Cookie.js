import Snack from './Snack';

export default class Cookie extends Snack {
    constructor(scene) {
        super(scene, '../../models/cookie.glb', 12, 0);
    }
}