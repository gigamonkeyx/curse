/**
 * Generates corridors connecting rooms in the dungeon
 * Uses multiple approaches for different path styles
 */
import { TILE_TYPES } from '../../utils/Constants.js';

class CorridorGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Connect rooms with corridors
     * @param {Array} map - Map to modify
     * @param {Array} rooms - Rooms to connect
     */
    connectRooms(map, rooms) {
        if (rooms.length <= 1) return;
        
        // Sort rooms for more logical connections
        // Connect each room to its nearest neighbor not yet connected
        const connected = new Set();
        connected.add(0); // Start with first room
        
        while (connected.size < rooms.length) {
            let minDistance = Infinity;
            let roomA, roomB;
            
            // Find closest unconnected room
            for (const i of connected) {
                for (let j = 0; j < rooms.length; j++) {
                    if (connected.has(j)) continue;
                    
                    const distance = this.calculateDistance(
                        rooms[i].center,
                        rooms[j].center
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        roomA = rooms[i];
                        roomB = rooms[j];
                        connected.add(j);
                    }
                }
            }
            
            if (roomA && roomB) {
                this.createCorridor(map, roomA, roomB);
            }
        }
        
        // Add a few extra corridors for loops (prevents linear dungeons)
        const extraCorridors = Math.floor(rooms.length / 4);
        for (let i = 0; i < extraCorridors; i++) {
            const roomA = rooms[Math.floor(Math.random() * rooms.length)];
            const roomB = rooms[Math.floor(Math.random() * rooms.length)];
            
            if (roomA !== roomB) {
                this.createCorridor(map, roomA, roomB);
            }
        }
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
    
    /**
     * Create a corridor between two rooms
     * @param {Array} map - Map to modify
     * @param {Object} roomA - First room
     * @param {Object} roomB - Second room
     */
    createCorridor(map, roomA, roomB) {
        const { x: x1, y: y1 } = roomA.center;
        const { x: x2, y: y2 } = roomB.center;
        
        // Randomly choose corridor type
        const corridorType = Math.random() < 0.5 ? 'elbow' : 'zigzag';
        
        if (corridorType === 'elbow') {
            this.createElbowCorridor(map, x1, y1, x2, y2);
        } else {
            this.createZigzagCorridor(map, x1, y1, x2, y2);
        }
    }
    
    /**
     * Create an elbow corridor (horizontal then vertical)
     * @param {Array} map - Map to modify
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     */
    createElbowCorridor(map, x1, y1, x2, y2) {
        // First go horizontally, then vertically
        const horizontalFirst = Math.random() < 0.5;
        
        if (horizontalFirst) {
            this.hCorridor(map, x1, x2, y1);
            this.vCorridor(map, y1, y2, x2);
        } else {
            this.vCorridor(map, y1, y2, x1);
            this.hCorridor(map, x1, x2, y2);
        }
    }
    
    /**
     * Create a zigzag corridor (alternating h/v segments)
     * @param {Array} map - Map to modify
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     */
    createZigzagCorridor(map, x1, y1, x2, y2) {
        // Create zig-zag pattern
        const segments = Math.floor(Math.random() * 3) + 2;
        let currentX = x1;
        let currentY = y1;
        
        for (let i = 0; i < segments; i++) {
            // Calculate intermediate target positions
            const targetX = i === segments - 1 ? x2 : 
                currentX + Math.floor((x2 - currentX) * ((i + 1) / segments));
                
            const targetY = i === segments - 1 ? y2 : 
                currentY + Math.floor((y2 - currentY) * ((i + 1) / segments));
            
            // Alternating horizontal/vertical
            if (i % 2 === 0) {
                this.hCorridor(map, currentX, targetX, currentY);
                currentX = targetX;
            } else {
                this.vCorridor(map, currentY, targetY, currentX);
                currentY = targetY;
            }
        }
        
        // Ensure we reach the final point
        this.hCorridor(map, currentX, x2, currentY);
        this.vCorridor(map, currentY, y2, x2);
    }
    
    /**
     * Create horizontal corridor segment
     * @param {Array} map - Map to modify
     * @param {number} x1 - Start X
     * @param {number} x2 - End X
     * @param {number} y - Y position
     */
    hCorridor(map, x1, x2, y) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        
        for (let x = start; x <= end; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                if (map[y][x].char === TILE_TYPES.WALL) {
                    map[y][x].char = TILE_TYPES.FLOOR;
                }
            }
        }
    }
    
    /**
     * Create vertical corridor segment
     * @param {Array} map - Map to modify
     * @param {number} y1 - Start Y
     * @param {number} y2 - End Y
     * @param {number} x - X position
     */
    vCorridor(map, y1, y2, x) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        
        for (let y = start; y <= end; y++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                if (map[y][x].char === TILE_TYPES.WALL) {
                    map[y][x].char = TILE_TYPES.FLOOR;
                }
            }
        }
    }
}

export default CorridorGenerator;