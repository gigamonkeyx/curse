/**
 * Base entity class for all game objects
 * Provides common functionality for positioning and rendering
 */
import { ENTITY_TYPES } from '../utils/Constants.js';

class Entity {
    /**
     * Create a new entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} type - Entity type
     */
    constructor(x, y, type = ENTITY_TYPES.PLAYER) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.id = Entity.nextId++;
        this.visible = true;
    }
    
    /**
     * Update entity state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Base implementation does nothing, override in subclass
    }
    
    /**
     * Render entity on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} tileSize - Size of each tile in pixels
     * @param {AssetManager} assets - Asset manager for images
     */
    render(ctx, tileSize, assets) {
        if (!this.visible) return;
        
        const image = assets.getImage(this.type);
        if (image) {
            ctx.drawImage(
                image, 
                this.x * tileSize, 
                this.y * tileSize, 
                tileSize, 
                tileSize
            );
        } else {
            // Fallback rendering if image not found
            ctx.fillStyle = this.getFallbackColor();
            ctx.fillRect(
                this.x * tileSize, 
                this.y * tileSize, 
                tileSize, 
                tileSize
            );
        }
    }
    
    /**
     * Get fallback color for entity type
     * @returns {string} - CSS color string
     */
    getFallbackColor() {
        switch(this.type) {
            case ENTITY_TYPES.PLAYER:
                return 'blue';
            case ENTITY_TYPES.ENEMY:
                return 'red';
            case ENTITY_TYPES.ITEM:
                return 'yellow';
            default:
                return 'purple';
        }
    }
    
    /**
     * Calculate distance to another entity
     * @param {Entity} entity - Other entity
     * @returns {number} - Manhattan distance
     */
    distanceTo(entity) {
        return Math.abs(this.x - entity.x) + Math.abs(this.y - entity.y);
    }
    
    /**
     * Check if entity is at specific coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether entity is at position
     */
    isAt(x, y) {
        return this.x === x && this.y === y;
    }
}

// Static ID counter for unique entity identification
Entity.nextId = 0;

export default Entity;