/**
 * Places doors throughout the dungeon
 * Handles regular, locked, and secret doors
 */
import { TILE_TYPES } from '../../utils/Constants.js';

class DoorGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Place doors throughout the dungeon
     * @param {Array} map - Map to modify
     * @param {number} floor - Current floor
     * @returns {Array} - Door positions
     */
    placeDoors(map, floor) {
        const doorPositions = [];
        
        // Find potential door locations (corridor tiles with walls on both sides)
        const potentialDoors = this.findPotentialDoorLocations(map);
        
        // Adjust door count based on floor number
        const doorCount = Math.floor(5 + (floor * 0.5));
        
        // Place regular doors
        const regularDoorCount = Math.floor(doorCount * 0.7);
        this.placeRegularDoors(map, potentialDoors, regularDoorCount, doorPositions);
        
        // Place locked doors (more on deeper floors)
        const lockedDoorCount = Math.floor(doorCount * 0.2) + Math.floor(floor / 3);
        this.placeLockedDoors(map, potentialDoors, lockedDoorCount, doorPositions);
        
        // Place secret doors (rare, increase with depth)
        const secretDoorCount = Math.floor(doorCount * 0.1) + Math.floor(floor / 4);
        this.placeSecretDoors(map, potentialDoors, secretDoorCount, doorPositions);
        
        return doorPositions;
    }
    
    /**
     * Find suitable locations for doors
     * @param {Array} map - The dungeon map
     * @returns {Array} - List of potential door positions
     */
    findPotentialDoorLocations(map) {
        const potentialDoors = [];
        
        // Check all tiles (excluding borders)
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                // Only consider floor tiles
                if (map[y][x].char === TILE_TYPES.FLOOR) {
                    
                    // Check for horizontal corridor (walls above and below)
                    if (map[y-1][x].char === TILE_TYPES.WALL && 
                        map[y+1][x].char === TILE_TYPES.WALL) {
                        
                        // Ensure we have open space on both sides (corridor)
                        if (map[y][x-1].char === TILE_TYPES.FLOOR && 
                            map[y][x+1].char === TILE_TYPES.FLOOR) {
                            potentialDoors.push({x, y, orientation: 'horizontal'});
                        }
                    }
                    
                    // Check for vertical corridor (walls on left and right)
                    if (map[y][x-1].char === TILE_TYPES.WALL && 
                        map[y][x+1].char === TILE_TYPES.WALL) {
                        
                        // Ensure we have open space on both sides (corridor)
                        if (map[y-1][x].char === TILE_TYPES.FLOOR && 
                            map[y+1][x].char === TILE_TYPES.FLOOR) {
                            potentialDoors.push({x, y, orientation: 'vertical'});
                        }
                    }
                }
            }
        }
        
        return potentialDoors;
    }
    
    /**
     * Place regular doors
     * @param {Array} map - Map to modify
     * @param {Array} potentialDoors - List of potential door locations
     * @param {number} count - Number of doors to place
     * @param {Array} doorPositions - List to add door positions to
     */
    placeRegularDoors(map, potentialDoors, count, doorPositions) {
        this.shuffleArray(potentialDoors);
        
        let placedCount = 0;
        for (let i = 0; i < potentialDoors.length && placedCount < count; i++) {
            const pos = potentialDoors[i];
            
            // Check if position is still valid (not already used)
            if (map[pos.y][pos.x].char === TILE_TYPES.FLOOR) {
                map[pos.y][pos.x].char = TILE_TYPES.DOOR;
                doorPositions.push({
                    x: pos.x, 
                    y: pos.y, 
                    type: 'regular',
                    orientation: pos.orientation
                });
                placedCount++;
            }
        }
    }
    
    /**
     * Place locked doors
     * @param {Array} map - Map to modify
     * @param {Array} potentialDoors - List of potential door locations
     * @param {number} count - Number of doors to place
     * @param {Array} doorPositions - List to add door positions to
     */
    placeLockedDoors(map, potentialDoors, count, doorPositions) {
        this.shuffleArray(potentialDoors);
        
        let placedCount = 0;
        for (let i = 0; i < potentialDoors.length && placedCount < count; i++) {
            const pos = potentialDoors[i];
            
            // Check if position is still valid (not already used)
            if (map[pos.y][pos.x].char === TILE_TYPES.FLOOR) {
                map[pos.y][pos.x].char = TILE_TYPES.LOCKED_DOOR;
                doorPositions.push({
                    x: pos.x, 
                    y: pos.y, 
                    type: 'locked',
                    orientation: pos.orientation
                });
                placedCount++;
            }
        }
    }
    
    /**
     * Place secret doors
     * @param {Array} map - Map to modify
     * @param {Array} potentialDoors - List of potential door locations
     * @param {number} count - Number of doors to place
     * @param {Array} doorPositions - List to add door positions to
     */
    placeSecretDoors(map, potentialDoors, count, doorPositions) {
        this.shuffleArray(potentialDoors);
        
        let placedCount = 0;
        for (let i = 0; i < potentialDoors.length && placedCount < count; i++) {
            const pos = potentialDoors[i];
            
            // Check if position is still valid (not already used)
            if (map[pos.y][pos.x].char === TILE_TYPES.FLOOR) {
                map[pos.y][pos.x].char = TILE_TYPES.SECRET_DOOR;
                doorPositions.push({
                    x: pos.x, 
                    y: pos.y, 
                    type: 'secret',
                    orientation: pos.orientation
                });
                placedCount++;
            }
        }
    }
    
    /**
     * Shuffle array in-place
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export default DoorGenerator;