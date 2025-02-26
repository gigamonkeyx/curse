/**
 * Handles placement of items throughout the dungeon
 * Distributes loot based on floor and difficulty
 */
import { TILE_TYPES } from '../../utils/Constants.js';

class ItemPlacer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Place items throughout the dungeon
     * @param {Array} map - Map to modify
     * @param {Array} items - Array to add items to
     * @param {number} floor - Current floor
     * @param {number} difficulty - Difficulty setting
     * @param {Array} lootPool - Available items to place
     * @returns {Array} - Item positions
     */
    placeItems(map, items, floor, difficulty, lootPool) {
        if (!lootPool || lootPool.length === 0) {
            console.warn('No loot pool provided for item placement');
            return [];
        }
        
        const positions = [];
        
        // Calculate item count - more items with higher difficulty
        const lootFactor = difficulty / 50; // 0.5 - 1.5
        const baseItemCount = 3 + Math.floor(floor * 1.2);
        const itemCount = Math.floor(baseItemCount * lootFactor);
        
        // Select valid positions for items
        const validPositions = this.findValidItemPositions(map);
        
        if (validPositions.length === 0) {
            return positions;
        }
        
        // Place weapon
        if (Math.random() < 0.7) {
            this.placeItemOfType(map, items, validPositions, lootPool, 'weapon', floor, positions);
        }
        
        // Place armor
        if (Math.random() < 0.6) {
            this.placeItemOfType(map, items, validPositions, lootPool, 'body_armor', floor, positions);
        }
        
        // Place helmet
        if (Math.random() < 0.5) {
            this.placeItemOfType(map, items, validPositions, lootPool, 'helmet', floor, positions);
        }
        
        // Place remaining random items
        for (let i = 0; i < itemCount && validPositions.length > 0; i++) {
            // Get random position
            const index = Math.floor(Math.random() * validPositions.length);
            const pos = validPositions[index];
            validPositions.splice(index, 1);
            
            // Get random item from loot pool with floor-appropriate quality
            const item = this.getRandomItem(lootPool, floor);
            if (!item) continue;
            
            // Add unique ID to item
            item.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
            
            // Set position
            item.x = pos.x;
            item.y = pos.y;
            
            // Mark tile as having item
            map[pos.y][pos.x].item = true;
            
            // Add to items array
            items.push(item);
            positions.push({ x: pos.x, y: pos.y, item });
        }
        
        return positions;
    }
    
    /**
     * Find valid positions for placing items
     * @param {Array} map - The dungeon map
     * @returns {Array} - List of valid positions
     */
    findValidItemPositions(map) {
        const validPositions = [];
        
        // Check all tiles (excluding borders)
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                // Only place items on floor tiles
                if (map[y][x].char === TILE_TYPES.FLOOR && !map[y][x].item) {
                    // Don't place items on special tiles
                    if (!map[y][x].trapData) {
                        validPositions.push({x, y});
                    }
                }
            }
        }
        
        return validPositions;
    }
    
    /**
     * Place an item of specific type
     * @param {Array} map - Map to modify
     * @param {Array} items - Array to add items to
     * @param {Array} validPositions - Valid positions
     * @param {Array} lootPool - Available items
     * @param {string} type - Item type to place
     * @param {number} floor - Current floor
     * @param {Array} positions - Array to add positions to
     */
    placeItemOfType(map, items, validPositions, lootPool, type, floor, positions) {
        if (validPositions.length === 0) return;
        
        // Filter loot pool for specified type
        const typeItems = lootPool.filter(item => item.type === type);
        if (typeItems.length === 0) return;
        
        // Get random position
        const index = Math.floor(Math.random() * validPositions.length);
        const pos = validPositions[index];
        validPositions.splice(index, 1);
        
        // Get random item of specified type with floor-appropriate quality
        const item = this.getRandomItemOfType(typeItems, floor);
        if (!item) return;
        
        // Add unique ID to item
        item.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
        
        // Set position
        item.x = pos.x;
        item.y = pos.y;
        
        // Mark tile as having item
        map[pos.y][pos.x].item = true;
        
        // Add to items array
        items.push(item);
        positions.push({ x: pos.x, y: pos.y, item });
    }
    
    /**
     * Get random item from loot pool
     * @param {Array} lootPool - Available items
     * @param {number} floor - Current floor
     * @returns {Object} - Selected item
     */
    getRandomItem(lootPool, floor) {
        if (!lootPool || lootPool.length === 0) return null;
        
        // Deep copy an item to avoid modifying the original
        const item = JSON.parse(JSON.stringify(
            lootPool[Math.floor(Math.random() * lootPool.length)]
        ));
        
        // Adjust item quality based on floor
        this.adjustItemQuality(item, floor);
        
        return item;
    }
    
    /**
     * Get random item of specific type
     * @param {Array} items - Available items of type
     * @param {number} floor - Current floor
     * @returns {Object} - Selected item
     */
    getRandomItemOfType(items, floor) {
        if (!items || items.length === 0) return null;
        
        // Deep copy an item to avoid modifying the original
        const item = JSON.parse(JSON.stringify(
            items[Math.floor(Math.random() * items.length)]
        ));
        
        // Adjust item quality based on floor
        this.adjustItemQuality(item, floor);
        
        return item;
    }
    
    /**
     * Adjust item quality based on floor
     * @param {Object} item - Item to adjust
     * @param {number} floor - Current floor
     */
    adjustItemQuality(item, floor) {
        // Base quality multiplier
        let qualityMultiplier = 1.0;
        
        // Deeper floors have better items
        qualityMultiplier += floor * 0.1;
        
        // Small random variation
        qualityMultiplier += (Math.random() * 0.4) - 0.2;
        
        // Apply multiplier to item stats
        if (item.damage) {
            item.damage = Math.max(1, Math.floor(item.damage * qualityMultiplier));
        }
        if (item.defense) {
            item.defense = Math.max(1, Math.floor(item.defense * qualityMultiplier));
        }
        
        // Higher chance of special properties on deeper floors
        const specialPropChance = 0.1 + (floor * 0.03);
        if (Math.random() < specialPropChance) {
            if (!item.bonuses) item.bonuses = {};
            
            // Add a random bonus property
            const bonusTypes = ['strength', 'defense', 'speed', 'maxHp'];
            const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
            const bonusAmount = Math.max(1, Math.floor(floor / 3));
            
            item.bonuses[bonusType] = bonusAmount;
            
            // Add quality prefix to name
            const prefixes = ['Fine', 'Superior', 'Exceptional', 'Masterwork', 'Legendary'];
            const prefix = prefixes[Math.min(Math.floor(floor / 3), prefixes.length - 1)];
            item.name = `${prefix} ${item.name}`;
        }
    }
}

export default ItemPlacer;