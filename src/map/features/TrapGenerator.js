/**
 * Trap Generator
 * Provides functions to place traps throughout the dungeon
 */

import { TILE_TYPES } from '../../utils/Constants.js';

class TrapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Place traps throughout the dungeon
     * @param {Array} map - Map to modify
     * @param {number} floor - Current floor
     * @param {number} difficulty - Difficulty level (0-100)
     * @returns {Array} - Trap positions
     */
    placeTraps(map, floor, difficulty) {
        const trapPositions = [];

        // Calculate trap count based on floor and difficulty
        const baseCount = Math.floor(3 + (floor * 0.7));
        const difficultyMod = difficulty / 100;
        const trapCount = Math.floor(baseCount * (1 + difficultyMod));

        // Calculate how many traps should be hidden vs. visible
        const hiddenTrapChance = 0.6 + (floor * 0.02) + (difficulty * 0.002);

        // Find valid positions for traps
        const validPositions = this.findValidTrapPositions(map);

        // Place traps
        for (let i = 0; i < trapCount && validPositions.length > 0; i++) {
            // Get random position
            const index = Math.floor(Math.random() * validPositions.length);
            const pos = validPositions[index];
            validPositions.splice(index, 1);

            // Determine if trap is hidden
            const isHidden = Math.random() < hiddenTrapChance;

            // Calculate trap damage based on floor
            const minDamage = 1 + Math.floor(floor / 2);
            const maxDamage = 3 + Math.floor(floor / 1.5);
            const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

            // Place trap
            map[pos.y][pos.x].char = TILE_TYPES.TRAP;
            map[pos.y][pos.x].hidden = isHidden;
            map[pos.y][pos.x].trapData = {
                damage,
                type: this.getTrapType(floor),
                triggered: false
            };

            trapPositions.push({
                x: pos.x,
                y: pos.y,
                hidden: isHidden,
                damage,
                type: map[pos.y][pos.x].trapData.type
            });
        }

        return trapPositions;
    }

    /**
     * Find valid positions for placing traps
     * @param {Array} map - The dungeon map
     * @returns {Array} - List of valid positions
     */
    findValidTrapPositions(map) {
        const validPositions = [];

        // Check all tiles (excluding borders)
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                // Only place traps on floor tiles
                if (map[y][x].char === TILE_TYPES.FLOOR) {
                    // Don't place traps next to doors or stairs
                    const hasSpecialNeighbor = this.hasSpecialNeighbor(map, x, y);
                    if (!hasSpecialNeighbor) {
                        validPositions.push({ x, y });
                    }
                }
            }
        }

        return validPositions;
    }

    /**
     * Check if position has special neighbors (doors, stairs)
     * @param {Array} map - The dungeon map
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether position has special neighbors
     */
    hasSpecialNeighbor(map, x, y) {
        const neighbors = [
            { x: x + 1, y },
            { x: x - 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 }
        ];

        for (const pos of neighbors) {
            if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
                continue;
            }

            const tile = map[pos.y][pos.x];
            if (tile.char === TILE_TYPES.DOOR ||
                tile.char === TILE_TYPES.LOCKED_DOOR ||
                tile.char === TILE_TYPES.SECRET_DOOR ||
                tile.char === TILE_TYPES.STAIRS) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get trap type based on floor number
     * @param {number} floor - Current floor
     * @returns {string} - Trap type
     */
    getTrapType(floor) {
        const trapTypes = [
            'spike',      // Basic damage trap
            'poison',     // Poison effect
            'alarm',      // Alerts nearby enemies
            'teleport',   // Teleports player to random location
            'confusion'   // Confuses player (random movement)
        ];

        // Deeper floors have more advanced trap types
        if (floor <= 2) {
            return trapTypes[0]; // Only spike traps on early floors
        } else if (floor <= 5) {
            return trapTypes[Math.floor(Math.random() * 2)]; // Spike and poison
        } else if (floor <= 8) {
            return trapTypes[Math.floor(Math.random() * 3)]; // Add alarm traps
        } else {
            return trapTypes[Math.floor(Math.random() * trapTypes.length)]; // All types
        }
    }

    /**
     * Apply theme to traps
     * @param {Array} traps - List of traps
     * @param {string} theme - Theme to apply
     */
    applyTheme(traps, theme) {
        traps.forEach(trap => {
            switch (theme) {
                case 'fire':
                    trap.type = 'fire';
                    trap.damage += 2;
                    break;
                case 'ice':
                    trap.type = 'ice';
                    trap.damage -= 1;
                    break;
                case 'electric':
                    trap.type = 'electric';
                    trap.damage += 1;
                    break;
                default:
                    break;
            }
        });
    }
}

export default TrapGenerator;