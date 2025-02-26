/**
 * Field of View (FOV) calculation system
 * Uses recursive shadow casting for efficient visibility determination
 */
import { MAP } from '../utils/Constants.js';

class FOV {
    constructor() {
        // Cache for performance
        this.visibleTiles = [];
        this.lastPlayerPos = { x: -1, y: -1 };
        this.lastRadius = -1;
    }
    
    /**
     * Calculate visible tiles from origin point
     * @param {Array} map - Map data
     * @param {number} originX - Origin X position
     * @param {number} originY - Origin Y position
     * @param {number} radius - Vision radius
     * @returns {Array} - Array of visible positions {x, y}
     */
    calculate(map, originX, originY, radius) {
        // Check if we can use cached result
        if (this.lastPlayerPos.x === originX && 
            this.lastPlayerPos.y === originY && 
            this.lastRadius === radius) {
            return this.visibleTiles;
        }
        
        // Update cache info
        this.lastPlayerPos = { x: originX, y: originY };
        this.lastRadius = radius;
        
        // Reset visible tiles
        this.visibleTiles = [];
        
        // Origin is always visible
        this.visibleTiles.push({ x: originX, y: originY });
        map[originY][originX].visible = true;
        map[originY][originX].discovered = true;
        
        // Cast shadows in all directions
        for (let octant = 0; octant < 8; octant++) {
            this.castShadows(map, originX, originY, radius, 1, 1.0, 0.0, octant);
        }
        
        return this.visibleTiles;
    }
    
    /**
     * Cast shadows in a specific octant
     * @param {Array} map - Map data
     * @param {number} originX - Origin X position
     * @param {number} originY - Origin Y position
     * @param {number} radius - Vision radius
     * @param {number} row - Current row
     * @param {number} startSlope - Start slope
     * @param {number} endSlope - End slope
     * @param {number} octant - Current octant (0-7)
     */
    castShadows(map, originX, originY, radius, row, startSlope, endSlope, octant) {
        // If start slope >= end slope, we're done
        if (startSlope < endSlope) {
            return;
        }
        
        // Get slope range
        const slopeRange = startSlope - endSlope;
        
        // Calculate rows within radius
        const radiusSquared = radius * radius;
        
        // Process current row
        for (let i = row; i <= radius; i++) {
            let blocked = false;
            let newStart = startSlope;
            
            // Process cells in the row
            for (let j = Math.floor(i * endSlope); j <= Math.ceil(i * startSlope); j++) {
                // Map octant to x, y coordinates
                const [mapX, mapY] = this.mapOctantToCoordinates(originX, originY, i, j, octant);
                
                // Check bounds
                if (mapX < 0 || mapX >= MAP.WIDTH || mapY < 0 || mapY >= MAP.HEIGHT) {
                    continue;
                }
                
                // Calculate distance squared
                const dx = mapX - originX;
                const dy = mapY - originY;
                const distanceSquared = dx * dx + dy * dy;
                
                // Skip if outside radius
                if (distanceSquared > radiusSquared) {
                    continue;
                }
                
                // Mark visible and discovered
                map[mapY][mapX].visible = true;
                map[mapY][mapX].discovered = true;
                this.visibleTiles.push({ x: mapX, y: mapY });
                
                // Wall blocking
                if (!blocked && map[mapY][mapX].blocksVision()) {
                    blocked = true;
                    newStart = this.getSlope(i, j - 0.5, originX, originY);
                    this.castShadows(map, originX, originY, radius, i + 1, startSlope, newStart, octant);
                } else if (blocked && !map[mapY][mapX].blocksVision()) {
                    // We found a clear cell after a wall
                    blocked = false;
                    newStart = this.getSlope(i, j - 0.5, originX, originY);
                }
            }
            
            // If row is blocked, we're done
            if (blocked) {
                break;
            }
        }
    }
    
    /**
     * Map octant coordinates to actual map coordinates
     * @param {number} originX - Origin X position
     * @param {number} originY - Origin Y position
     * @param {number} row - Row in octant
     * @param {number} col - Column in octant
     * @param {number} octant - Octant number (0-7)
     * @returns {Array} - [x, y] coordinates
     */
    mapOctantToCoordinates(originX, originY, row, col, octant) {
        switch (octant) {
            case 0: return [originX + col, originY - row]; // Top-right
            case 1: return [originX + row, originY - col]; // Right-top
            case 2: return [originX + row, originY + col]; // Right-bottom
            case 3: return [originX + col, originY + row]; // Bottom-right
            case 4: return [originX - col, originY + row]; // Bottom-left
            case 5: return [originX - row, originY + col]; // Left-bottom
            case 6: return [originX - row, originY - col]; // Left-top
            case 7: return [originX - col, originY - row]; // Top-left
            default: return [originX, originY]; // Should never happen
        }
    }
    
    /**
     * Calculate slope between two points
     * @param {number} row - Row in octant
     * @param {number} col - Column in octant
     * @param {number} originX - Origin X position
     * @param {number} originY - Origin Y position
     * @returns {number} - Slope value
     */
    getSlope(row, col, originX, originY) {
        return col / row;
    }
    
    /**
     * Reset visible tiles on map
     * @param {Array} map - Map data to reset
     */
    resetVisibility(map) {
        for (let y = 0; y < MAP.HEIGHT; y++) {
            for (let x = 0; x < MAP.WIDTH; x++) {
                map[y][x].visible = false;
            }
        }
    }
    
    /**
     * Check if position is visible
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether position is visible
     */
    isVisible(x, y) {
        return this.visibleTiles.some(tile => tile.x === x && tile.y === y);
    }
}

export default FOV;