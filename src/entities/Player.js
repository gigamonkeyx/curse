/**
 * Player entity with movement, combat, and inventory management
 * Handles player stats, equipment, and progression
 */
import Entity from './Entity.js';
import { ITEM_TYPES } from '../utils/Constants.js';

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 'player');
        
        // Basic stats
        this.hp = 20;
        this.maxHp = 20;
        this.strength = 2;
        this.defense = 0;
        this.speed = 1;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 20;
        
        // Current state
        this.currentFloor = 0;
        this.gold = 0;
        
        // Equipment slots
        this.equipment = {
            weapon: null,
            body_armor: null,
            helmet: null,
            boots: null,
            gloves: null,
            amulet: null,
            ring: null,
            shield: null
        };
        
        // Inventory
        this.inventory = [];
        this.maxInventorySize = 20;
    }
    
    /**
     * Move player in specified direction with collision detection
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     * @param {Array} map - Game map
     * @returns {boolean} - Whether movement was successful
     */
    move(dx, dy, map) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;
        
        // Check bounds
        if (newX < 0 || newX >= map[0].length || newY < 0 || newY >= map.length) {
            return false;
        }
        
        // Check for walls
        if (map[newY][newX].char === '#') {
            return false;
        }
        
        // Handle doors
        if (map[newY][newX].char === '+') {
            // Open door
            map[newY][newX].char = '.';
            return false; // Don't move, just open door
        }
        
        // Locked door
        if (map[newY][newX].char === 'L') {
            if (this.hasKey()) {
                // Unlock door
                map[newY][newX].char = '.';
                this.useKey();
                return false; // Don't move, just unlock
            }
            return false; // Can't unlock without key
        }
        
        // Secret door - reveal but don't open
        if (map[newY][newX].char === 'S') {
            map[newY][newX].char = '+';
            return false;
        }
        
        // Move to the new position
        this.x = newX;
        this.y = newY;
        return true;
    }
    
    /**
     * Check if player has a key
     * @returns {boolean} - Whether player has a key
     */
    hasKey() {
        return this.inventory.some(item => item.type === 'key');
    }
    
    /**
     * Use a key from inventory
     */
    useKey() {
        const keyIndex = this.inventory.findIndex(item => item.type === 'key');
        if (keyIndex !== -1) {
            this.inventory.splice(keyIndex, 1);
        }
    }
    
    /**
     * Take damage with defense calculation
     * @param {number} amount - Raw damage amount
     * @returns {number} - Actual damage taken
     */
    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    /**
     * Heal the player
     * @param {number} amount - Amount to heal
     * @returns {number} - Actual amount healed
     */
    heal(amount) {
        const startHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - startHp;
    }
    
    /**
     * Add an item to inventory
     * @param {Object} item - Item to add
     * @returns {boolean} - Whether item was added successfully
     */
    addToInventory(item) {
        if (this.inventory.length < this.maxInventorySize) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }
    
    /**
     * Remove item from inventory
     * @param {number} index - Inventory index
     * @returns {Object|null} - Removed item or null
     */
    removeFromInventory(index) {
        if (index >= 0 && index < this.inventory.length) {
            return this.inventory.splice(index, 1)[0];
        }
        return null;
    }
    
    /**
     * Equip an item
     * @param {Object} item - Item to equip
     * @returns {Object|null} - Previously equipped item or null
     */
    equip(item) {
        if (!item.type || !this.equipment.hasOwnProperty(item.type)) {
            return null;
        }
        
        const oldItem = this.equipment[item.type];
        this.equipment[item.type] = item;
        
        // Update stats based on equipment
        this.recalculateStats();
        
        return oldItem;
    }
    
    /**
     * Unequip an item
     * @param {string} slot - Equipment slot
     * @returns {Object|null} - Unequipped item or null
     */
    unequip(slot) {
        if (!this.equipment.hasOwnProperty(slot)) {
            return null;
        }
        
        const item = this.equipment[slot];
        if (item) {
            this.equipment[slot] = null;
            this.recalculateStats();
        }
        
        return item;
    }
    
    /**
     * Calculate actual stats based on base stats and equipment
     */
    recalculateStats() {
        // Reset to base stats
        this.defense = 0;
        this.strength = 2;
        this.speed = 1;
        
        // Add equipment bonuses
        Object.values(this.equipment).forEach(item => {
            if (!item) return;
            
            // Add base stat for item type
            if (item.type === ITEM_TYPES.WEAPON) {
                this.strength += item.damage || 0;
            } else if (item.type === ITEM_TYPES.BODY_ARMOR || 
                      item.type === ITEM_TYPES.HELMET ||
                      item.type === ITEM_TYPES.SHIELD) {
                this.defense += item.defense || 0;
            } else if (item.type === ITEM_TYPES.BOOTS) {
                this.speed += item.speed || 0;
            }
            
            // Add any additional bonuses
            if (item.bonuses) {
                this.strength += item.bonuses.strength || 0;
                this.defense += item.bonuses.defense || 0;
                this.speed += item.bonuses.speed || 0;
                this.maxHp += item.bonuses.maxHp || 0;
            }
        });
    }
    
    /**
     * Gain experience points
     * @param {number} amount - XP amount
     * @returns {boolean} - Whether player leveled up
     */
    gainXp(amount) {
        this.xp += amount;
        
        // Check for level up
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
            return true;
        }
        
        return false;
    }
    
    /**
     * Process player level up
     */
    levelUp() {
        this.level++;
        this.maxHp += 5;
        this.hp = this.maxHp; // Heal on level up
        this.strength++;
        
        // Every other level, gain defense
        if (this.level % 2 === 0) {
            this.defense++;
        }
        
        // Every third level, gain speed
        if (this.level % 3 === 0) {
            this.speed++;
        }
        
        // Calculate XP needed for next level (increases each level)
        this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
    }
    
    /**
     * Get calculated damage output
     * @returns {number} - Player damage
     */
    getDamage() {
        // Base damage from strength
        let damage = this.strength;
        
        // Add weapon damage
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.damage || 0;
        }
        
        return Math.max(1, damage);
    }
    
    /**
     * Check if player is dead
     * @returns {boolean} - Whether player is dead
     */
    isDead() {
        return this.hp <= 0;
    }
    
    /**
     * Convert player to data object for saving
     * @returns {Object} - Serialized player data
     */
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            hp: this.hp,
            maxHp: this.maxHp,
            strength: this.strength,
            defense: this.defense,
            speed: this.speed,
            level: this.level,
            xp: this.xp,
            nextLevelXp: this.nextLevelXp,
            currentFloor: this.currentFloor,
            gold: this.gold,
            equipment: this.equipment,
            inventory: this.inventory
        };
    }
    
    /**
     * Load player from saved data
     * @param {Object} data - Saved player data
     */
    fromJSON(data) {
        Object.assign(this, data);
        // Recalculate stats to ensure consistency
        this.recalculateStats();
    }
}

export default Player;