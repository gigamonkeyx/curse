/**
 * Orchestrates placement of special features in the dungeon
 * Delegates to specialized feature generators
 */
import StairsGenerator from './StairsGenerator.js';
import DoorGenerator from './DoorGenerator.js';
import TrapGenerator from './TrapGenerator.js';

class FeatureGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Initialize specialized generators
        this.stairsGen = new StairsGenerator(width, height);
        this.doorGen = new DoorGenerator(width, height);
        this.trapGen = new TrapGenerator(width, height);
    }
    
    /**
     * Place stairs in the dungeon
     * @param {Array} map - Map to modify
     * @param {Array} rooms - Available rooms
     * @returns {Object} - Stairs position
     */
    placeStairs(map, rooms) {
        return this.stairsGen.placeStairs(map, rooms);
    }
    
    /**
     * Place doors throughout the dungeon
     * @param {Array} map - Map to modify
     * @param {number} floor - Current floor
     * @returns {Array} - Door positions
     */
    placeDoors(map, floor) {
        return this.doorGen.placeDoors(map, floor);
    }
    
    /**
     * Place traps throughout the dungeon
     * @param {Array} map - Map to modify
     * @param {number} floor - Current floor
     * @param {number} difficulty - Difficulty level
     * @returns {Array} - Trap positions
     */
    placeTraps(map, floor, difficulty) {
        return this.trapGen.placeTraps(map, floor, difficulty);
    }
}

export default FeatureGenerator;