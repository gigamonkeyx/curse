/**
 * Places stairs in the dungeon to connect levels
 */
import { TILE_TYPES } from '../../utils/Constants.js';

class StairsGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Place stairs in the dungeon
     * @param {Array} map - Map to modify
     * @param {Array} rooms - Available rooms
     * @returns {Object} - Stairs position
     */
    placeStairs(map, rooms) {
        // Prefer to place stairs in a room far from the map center
        const mapCenter = { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
        
        // If we have rooms, place stairs in the furthest room from center
        if (rooms.length > 0) {
            // Sort rooms by distance from center
            const sortedRooms = [...rooms].sort((a, b) => {
                const distA = this.calculateDistance(a.center, mapCenter);
                const distB = this.calculateDistance(b.center, mapCenter);
                return distB - distA; // Furthest first
            });
            
            // Place stairs in the furthest room
            const stairsRoom = sortedRooms[0];
            
            // Find a spot away from room center
            const stairsX = Math.floor(Math.random() * (stairsRoom.width - 2)) + stairsRoom.x + 1;
            const stairsY = Math.floor(Math.random() * (stairsRoom.height - 2)) + stairsRoom.y + 1;
            
            map[stairsY][stairsX].char = TILE_TYPES.STAIRS;
            return { x: stairsX, y: stairsY };
        } 
        
        // Fallback: find any suitable floor tile
        const candidates = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (map[y][x].char === TILE_TYPES.FLOOR) {
                    candidates.push({x, y});
                }
            }
        }
        
        if (candidates.length > 0) {
            const pos = candidates[Math.floor(Math.random() * candidates.length)];
            map[pos.y][pos.x].char = TILE_TYPES.STAIRS;
            return pos;
        }
        
        // Last resort (shouldn't happen)
        const fallbackPos = { x: this.width - 2, y: this.height - 2 };
        map[fallbackPos.y][fallbackPos.x].char = TILE_TYPES.STAIRS;
        return fallbackPos;
    }
    
    /**
     * Calculate distance between points
     * @param {Object} pointA - First point {x, y}
     * @param {Object} pointB - Second point {x, y} 
     * @returns {number} - Manhattan distance
     */
    calculateDistance(pointA, pointB) {
        return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
    }
}

export default StairsGenerator;