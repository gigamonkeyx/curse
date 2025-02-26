/**
 * Represents a single tile in the dungeon map
 * Stores tile properties and state
 */
import { TILE_TYPES } from '../utils/Constants.js';

class Tile {
    /**
     * Create a new tile
     * @param {string} char - Tile character type
     */
    constructor(char = TILE_TYPES.WALL) {
        this.char = char;           // Character representing tile type (# = wall, . = floor, etc)
        this.discovered = false;    // Whether player has seen this tile
        this.visible = false;       // Whether tile is currently visible
        this.floorType = 'default'; // Visual style of floor
        this.item = null;           // Item on this tile (if any)
        this.entity = null;         // Entity on this tile (if any)
        this.hidden = false;        // For hidden traps/doors
        this.trapData = null;       // Data for traps
        this.bloodStain = 0;        // Blood splatter (0 = none, 1-3 = intensity)
    }
    
    /**
     * Check if tile blocks movement
     * @returns {boolean} - Whether tile blocks movement
     */
    isBlocking() {
        return this.char === TILE_TYPES.WALL;
    }
    
    /**
     * Check if tile blocks vision
     * @returns {boolean} - Whether tile blocks vision
     */
    blocksVision() {
        return this.char === TILE_TYPES.WALL;
    }
    
    /**
     * Check if tile is walkable
     * @returns {boolean} - Whether tile is walkable
     */
    isWalkable() {
        return !this.isBlocking() && this.char !== TILE_TYPES.TRAP;
    }
    
    /**
     * Check if tile is interactive
     * @returns {boolean} - Whether tile can be interacted with
     */
    isInteractive() {
        return this.char === TILE_TYPES.DOOR ||
               this.char === TILE_TYPES.LOCKED_DOOR ||
               this.char === TILE_TYPES.SECRET_DOOR ||
               this.char === TILE_TYPES.STAIRS;
    }
    
    /**
     * Set floor type
     * @param {string} type - Floor type
     */
    setFloorType(type) {
        this.floorType = type;
    }
    
    /**
     * Convert to serializable object
     * @returns {Object} - Serialized tile data
     */
    toJSON() {
        return {
            char: this.char,
            discovered: this.discovered,
            visible: this.visible,
            floorType: this.floorType,
            hidden: this.hidden,
            trapData: this.trapData,
            bloodStain: this.bloodStain
        };
    }
    
    /**
     * Load from serialized data
     * @param {Object} data - Serialized tile data
     */
    fromJSON(data) {
        Object.assign(this, data);
    }
}

export default Tile;