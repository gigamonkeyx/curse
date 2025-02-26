/**
 * Enemy entity with AI and combat behavior
 */
import Entity from './Entity.js';
import { ENTITY_TYPES, TILE_TYPES } from '../utils/Constants.js';

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, ENTITY_TYPES.ENEMY);
        
        // Basic stats
        this.name = 'Dungeon Creature';
        this.hp = 10;
        this.maxHp = 10;
        this.damage = 2;
        this.defense = 0;
        this.xpValue = 10;
        this.sightRadius = 6;
        
        // AI state
        this.state = 'idle'; // idle, alert, hunting
        this.targetX = null;
        this.targetY = null;
        this.lastKnownPlayerPos = null;
        this.alertTimer = 0;
    }
    
    /**
     * Take turn in game loop
     * @param {Array} map - Map data
     * @param {Player} player - Player entity
     */
    takeTurn(map, player) {
        if (!player || this.isDead()) return;
        
        // Check if player is visible
        const canSeePlayer = this.canSee(player, map);
        
        if (canSeePlayer) {
            // Update last known position
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            this.state = 'hunting';
            this.alertTimer = 5; // Remember player for 5 turns
        } else if (this.alertTimer > 0) {
            // Still alert but lost sight
            this.alertTimer--;
            this.state = 'alert';
        } else {
            // Lost track of player
            this.state = 'idle';
            this.lastKnownPlayerPos = null;
        }
        
        // Act based on state
        switch (this.state) {
            case 'hunting':
                this.huntPlayer(player, map);
                break;
            case 'alert':
                this.searchForPlayer(map);
                break;
            case 'idle':
                this.wander(map);
                break;
        }
    }
    
    /**
     * Check if enemy can see player
     * @param {Player} player - Player entity
     * @param {Array} map - Map data
     * @returns {boolean} - Whether player is visible
     */
    canSee(player, map) {
        // Check distance first
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.sightRadius) {
            return false;
        }
        
        // Use Bresenham's line algorithm to check for walls
        return this.hasLineOfSight(this.x, this.y, player.x, player.y, map);
    }
    
    /**
     * Check line of sight between points
     * @param {number} x0 - Start X
     * @param {number} y0 - Start Y
     * @param {number} x1 - End X
     * @param {number} y1 - End Y
     * @param {Array} map - Map data
     * @returns {boolean} - Whether line of sight exists
     */
    hasLineOfSight(x0, y0, x1, y1, map) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        let x = x0;
        let y = y0;
        
        while (x !== x1 || y !== y1) {
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
            
            // Check for walls
            if (x !== x1 || y !== y1) {
                if (map[y][x].blocksVision()) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Hunt player directly
     * @param {Player} player - Player entity
     * @param {Array} map - Map data
     */
    huntPlayer(player, map) {
        // Attack if adjacent
        if (this.isAdjacent(player.x, player.y)) {
            this.attack(player);
            return;
        }
        
        // Move toward player
        const dx = Math.sign(player.x - this.x);
        const dy = Math.sign(player.y - this.y);
        
        // Try direct movement first
        if (this.canMoveTo(this.x + dx, this.y + dy, map)) {
            this.move(dx, dy, map);
            return;
        }
        
        // Try horizontal then vertical
        if (dx !== 0 && this.canMoveTo(this.x + dx, this.y, map)) {
            this.move(dx, 0, map);
            return;
        }
        
        if (dy !== 0 && this.canMoveTo(this.x, this.y + dy, map)) {
            this.move(0, dy, map);
            return;
        }
        
        // Try diagonal
        if (dx !== 0 && dy !== 0) {
            if (this.canMoveTo(this.x + dx, this.y - dy, map)) {
                this.move(dx, -dy, map);
                return;
            }
            
            if (this.canMoveTo(this.x - dx, this.y + dy, map)) {
                this.move(-dx, dy, map);
                return;
            }
        }
    }
    
    /**
     * Search for player at last known position
     * @param {Array} map - Map data
     */
    searchForPlayer(map) {
        if (!this.lastKnownPlayerPos) {
            this.wander(map);
            return;
        }
        
        // Move toward last known position
        const dx = Math.sign(this.lastKnownPlayerPos.x - this.x);
        const dy = Math.sign(this.lastKnownPlayerPos.y - this.y);
        
        // If at last known position, wander
        if (this.x === this.lastKnownPlayerPos.x && this.y === this.lastKnownPlayerPos.y) {
            this.wander(map);
            return;
        }
        
        // Try direct movement
        if (this.canMoveTo(this.x + dx, this.y + dy, map)) {
            this.move(dx, dy, map);
            return;
        }
        
        // Try horizontal then vertical
        if (dx !== 0 && this.canMoveTo(this.x + dx, this.y, map)) {
            this.move(dx, 0, map);
            return;
        }
        
        if (dy !== 0 && this.canMoveTo(this.x, this.y + dy, map)) {
            this.move(0, dy, map);
            return;
        }
        
        // Fall back to wandering
        this.wander(map);
    }
    
    /**
     * Wander randomly
     * @param {Array} map - Map data
     */
    wander(map) {
        // 20% chance to stand still
        if (Math.random() < 0.2) {
            return;
        }
        
        // Try random direction
        const dirs = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];
        
        // Shuffle directions
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        
        // Try each direction
        for (const dir of dirs) {
            if (this.canMoveTo(this.x + dir.dx, this.y + dir.dy, map)) {
                this.move(dir.dx, dir.dy, map);
                return;
            }
        }
    }
    
    /**
     * Check if position is valid for movement
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Array} map - Map data
     * @returns {boolean} - Whether position is valid
     */
    canMoveTo(x, y, map) {
        // Check bounds
        if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) {
            return false;
        }
        
        // Check for walls
        if (map[y][x].isBlocking()) {
            return false;
        }
        
        // Check for doors
        if (map[y][x].char === TILE_TYPES.DOOR || 
            map[y][x].char === TILE_TYPES.LOCKED_DOOR || 
            map[y][x].char === TILE_TYPES.SECRET_DOOR) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Move the enemy
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     * @param {Array} map - Map data
     */
    move(dx, dy, map) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        if (this.canMoveTo(newX, newY, map)) {
            this.x = newX;
            this.y = newY;
        }
    }
    
    /**
     * Attack player
     * @param {Player} player - Player entity
     */
    attack(player) {
        const damage = Math.max(1, this.damage - player.defense);
        const damageDealt = player.takeDamage(damage);
        
        // Trigger attack event
        if (typeof this.game !== 'undefined' && this.game.events) {
            this.game.events.emit('enemyAttack', {
                enemy: this,
                target: player,
                damage: damageDealt
            });
        }
    }
    
    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @returns {number} - Actual damage taken
     */
    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    /**
     * Check if enemy is adjacent to coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether enemy is adjacent
     */
    isAdjacent(x, y) {
        const dx = Math.abs(x - this.x);
        const dy = Math.abs(y - this.y);
        return (dx <= 1 && dy <= 1) && (dx + dy > 0);
    }
    
    /**
     * Check if enemy is dead
     * @returns {boolean} - Whether enemy is dead
     */
    isDead() {
        return this.hp <= 0;
    }
}

export default Enemy;