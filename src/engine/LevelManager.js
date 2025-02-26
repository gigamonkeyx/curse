
class LevelManager {
    constructor(levels) {
        this.levels = levels;
        this.currentLevelIndex = 0;
    }

    loadLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            return this.levels[index];
        } else {
            throw new Error('Invalid level index');
        }
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return this.getCurrentLevel();
        } else {
            throw new Error('No more levels');
        }
    }

    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            return this.getCurrentLevel();
        } else {
            throw new Error('No previous levels');
        }
    }
}

export default LevelManager;
