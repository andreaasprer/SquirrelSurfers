export default class LevelParser {
    constructor(levelData) {
        this.levels = levelData;
        this.currentLevel = 0;
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel];
    }

    nextLevel() {
        if (this.currentLevel + 1 < this.levels.length) {
            this.currentLevel++;
            return this.levels[this.currentLevel];
        }
        return null;
    }

    reset() {
        this.currentLevel = 0;
        return this.levels[0];
    }

    getGoalDistance() {
        return Math.abs(this.getCurrentLevel().distance);
    }
}