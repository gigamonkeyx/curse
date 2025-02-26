/**
 * Generates rooms for the dungeon
 * Creates rectangular and special rooms with varied sizes
 */
import { TILE_TYPES } from '../../utils/Constants.js';

class RoomGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Room generation parameters
        this.minRoomSize = 3;
        this.maxRoomSize = 8;
        this.maxRooms = 15;
    }
    
    /**
     * Generate rooms on the map
     * @param {Array} map - The map to modify
     * @param {number} floor - Current dungeon floor
     * @returns {Array} - List of generated rooms
     */
    generateRooms(map, floor) {
        const rooms = [];
        const attempts = this.calculateRoomAttempts(floor);
        
        // Adjust room parameters based on floor
        this.adjustRoomParams(floor);
        
        for (let i = 0; i < attempts; i++) {
            if (rooms.length >= this.maxRooms) break;
            
            // Generate a potential room
            const room = this.generateRoom(floor);
            
            // Check if room fits without overlapping
            if (this.canPlaceRoom(map, room)) {
                this.carveRoom(map, room);
                rooms.push(room);
            }
        }
        
        return rooms;
    }
    
    /**
     * Generate a single room definition
     * @param {number} floor - Current dungeon floor
     * @returns {Object} - Room definition
     */
    generateRoom(floor) {
        // Randomize room dimensions
        const width = Math.floor(Math.random() * 
            (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
        const height = Math.floor(Math.random() * 
            (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
        
        // Randomize room position
        const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
        const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;
        
        // Small chance for special room based on floor
        const isSpecial = Math.random() < (0.05 + (floor * 0.01));
        
        return {
            x,
            y,
            width,
            height,
            isSpecial,
            center: {
                x: Math.floor(x + width / 2),
                y: Math.floor(y + height / 2)
            }
        };
    }
    
    /**
     * Check if a room can be placed without overlapping
     * @param {Array} map - The current map
     * @param {Object} room - The room to check
     * @returns {boolean} - Whether room can be placed
     */
    canPlaceRoom(map, room) {
        // Check room bounds
        if (room.x < 1 || room.y < 1 || 
            room.x + room.width >= this.width - 1 || 
            room.y + room.height >= this.height - 1) {
            return false;
        }
        
        // Check for overlaps with 1-tile margin
        for (let y = room.y - 1; y < room.y + room.height + 1; y++) {
            for (let x = room.x - 1; x < room.x + room.width + 1; x++) {
                if (map[y][x].char !== TILE_TYPES.WALL) {
                    return false; // Overlap found
                }
            }
        }
        
        return true;
    }
    
    /**
     * Carve a room into the map
     * @param {Array} map - The map to modify
     * @param {Object} room - The room to carve
     */
    carveRoom(map, room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                map[y][x].char = TILE_TYPES.FLOOR;
                
                // Special rooms might have different floor type
                if (room.isSpecial) {
                    map[y][x].floorType = this.getSpecialFloorType();
                }
            }
        }
    }
    
    /**
     * Calculate number of room placement attempts based on floor
     * @param {number} floor - Current dungeon floor
     * @returns {number} - Number of attempts
     */
    calculateRoomAttempts(floor) {
        // Higher floors = more room attempts
        return 20 + Math.min(floor * 2, 30);
    }
    
    /**
     * Adjust room parameters based on floor number
     * @param {number} floor - Current dungeon floor
     */
    adjustRoomParams(floor) {
        // Higher floors get larger and more varied rooms
        if (floor > 5) {
            this.maxRoomSize = 9;
            this.maxRooms = 18;
        } else if (floor > 10) {
            this.maxRoomSize = 10;
            this.maxRooms = 20;
        }
    }
    
    /**
     * Get floor type for special rooms
     * @returns {string} - Floor type
     */
    getSpecialFloorType() {
        const types = ['water', 'dirt', 'default'];
        return types[Math.floor(Math.random() * types.length)];
    }
}

export default RoomGenerator;