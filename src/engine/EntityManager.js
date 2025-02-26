/**
 * Manages all entities in the game
 * Handles creation, updates, and removal of entities
 */
import Enemy from '../entities/Enemy.js';
import Player from '../entities/Player.js';
import { ENTITY_TYPES } from '../utils/Constants.js';
import { MAP } from '../utils/Constants.js';

class EntityManager {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.nextEntityId = 1;
    }
    
    /**
     * Initialize entities for a new level
     * @param {Object} levelData - Level data
     * @param {Object} playerData - Existing player data
     */
    initLevel(levelData, playerData) {
        this.clear();
        
        // Create player if needed or reuse existing
        if (!this.player && playerData) {
            this.player = new Player(playerData.x, playerData.y);
            this.player.fromJSON(playerData);
        } else if (!this.player) {
            this.player = new Player(levelData.startPos.x, levelData.startPos.y);
        } else {
            // Move existing player to start position
            this.player.x = levelData.startPos.x;
            this.player.y = levelData.startPos.y;
        }
        
        // Set player floor
        this.player.currentFloor = levelData.floor;
        
        // Create enemies based on floor difficulty
        this.generateEnemies(levelData);
        
        // Add items from level data
        this.items = levelData.items || [];
    }
    
    /**
     * Generate enemies for the level
     * @param {Object} levelData - Level data
     */
    generateEnemies(levelData) {
        const { map, floor, rooms } = levelData;
        
        // Calculate enemy count based on floor
        const enemyCount = Math.floor(3 + (floor * 0.7));
        
        // Try to place enemies in rooms
        for (let i = 0; i < enemyCount; i++) {
            // Select random room (not the starting room)
            const roomIndex = Math.floor(Math.random() * (rooms.length - 1)) + 1;
            const room = rooms[roomIndex % rooms.length];
            
            // Find position in room
            const x = Math.floor(Math.random() * (room.width - 2)) + room.x + 1;
            const y = Math.floor(Math.random() * (room.height - 2)) + room.y + 1;
            
            // Ensure position is valid
            if (map[y][x].char === '.' && !this.getEntityAt(x, y)) {
                // Create enemy with appropriate strength for floor
                const enemy = this.createEnemy(x, y, floor);
                this.enemies.push(enemy);
            }
        }
    }
    
    /**
     * Create a new enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} floor - Current floor
     * @returns {Enemy} - Created enemy
     */
    createEnemy(x, y, floor) {
        // Create enemy with stats scaled to floor
        const enemy = new Enemy(x, y);
        
        // Scale enemy stats based on floor
        enemy.hp = Math.floor(5 + (floor * 1.5));
        enemy.maxHp = enemy.hp;
        enemy.damage = Math.floor(1 + (floor * 0.5));
        enemy.defense = Math.floor(floor * 0.3);
        enemy.xpValue = Math.floor(5 + (floor * 2));
        
        // Random chance for special enemy on deeper floors
        if (floor > 3 && Math.random() < 0.2) {
            enemy.name = "Elite " + enemy.name;
            enemy.hp *= 1.5;
            enemy.maxHp = enemy.hp;
            enemy.damage += 2;
            enemy.defense += 1;
            enemy.xpValue *= 2;
        }
        
        return enemy;
    }
    
    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.game.mapLayout, this.player);
        });
    }
    
    /**
     * Update enemies after player move
     */
    updateEnemies() {
        // Only update enemies in FOV
        this.enemies.forEach(enemy => {
            if (this.game.isVisible(enemy.x, enemy.y)) {
                enemy.takeTurn(this.game.mapLayout, this.player);
            }
        });
        
        // Remove dead enemies
        this.removeDeadEnemies();
    }
    
    /**
     * Remove dead enemies and possibly drop loot
     */
    removeDeadEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDead()) {
                // Drop loot
                if (Math.random() < 0.3) {
                    this.dropLoot(enemy.x, enemy.y);
                }
                
                // Give XP to player
                this.player.gainXp(enemy.xpValue);
                
                return false;
            }
            return true;
        });
    }
    
    /**
     * Drop loot at position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    dropLoot(x, y) {
        // Get available item from loot pool
        const lootPool = this.game.lootPool;
        if (!lootPool || lootPool.length === 0) return;
        
        const item = JSON.parse(JSON.stringify(
            lootPool[Math.floor(Math.random() * lootPool.length)]
        ));
        
        item.x = x;
        item.y = y;
        item.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
        
        this.items.push(item);
        this.game.mapLayout[y][x].item = true;
    }
    
    /**
     * Get entity at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object|null} - Entity at position or null
     */
    getEntityAt(x, y) {
        // Check player
        if (this.player && this.player.x === x && this.player.y === y) {
            return this.player;
        }
        
        // Check enemies
        for (const enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) {
                return enemy;
            }
        }
        
        // Check items
        for (const item of this.items) {
            if (item.x === x && item.y === y) {
                return item;
            }
        }
        
        return null;
    }
    
    /**
     * Get enemy at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy|null} - Enemy at position or null
     */
    getEnemyAt(x, y) {
        return this.enemies.find(enemy => enemy.x === x && enemy.y === y) || null;
    }
    
    /**
     * Get item at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object|null} - Item at position or null
     */
    getItemAt(x, y) {
        return this.items.find(item => item.x === x && item.y === y) || null;
    }
    
    /**
     * Remove item at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object|null} - Removed item or null
     */
    removeItemAt(x, y) {
        const index = this.items.findIndex(item => item.x === x && item.y === y);
        if (index !== -1) {
            const item = this.items[index];
            this.items.splice(index, 1);
            this.game.mapLayout[y][x].item = false;
            return item;
        }
        return null;
    }
    
    /**
     * Clear all entities
     */
    clear() {
        // Keep player
        this.enemies = [];
        this.items = [];
    }
}

export default EntityManager;