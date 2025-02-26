/**
 * Main map generator orchestrates the dungeon generation process
 * Delegates specialized generation to focused submodules
 */
import { MAP, TILE_TYPES } from '../utils/Constants.js';
import RoomGenerator from './generation/RoomGenerator.js';
import CorridorGenerator from './generation/CorridorGenerator.js';
import FeatureGenerator from './features/FeatureGenerator.js';
import ItemPlacer from './features/ItemPlacer.js';
import Tile from './Tile.js';

class MapGenerator {
    constructor() {
        this.width = MAP.WIDTH;
        this.height = MAP.HEIGHT;
        
        // Initialize specialized generators
        this.roomGenerator = new RoomGenerator(this.width, this.height);
        this.corridorGenerator = new CorridorGenerator(this.width, this.height);
        this.featureGenerator = new FeatureGenerator(this.width, this.height);
        this.itemPlacer = new ItemPlacer(this.width, this.height);
    }
    
    /**
     * Generate a complete dungeon level
     * @param {number} floor - Current floor number
     * @param {number} difficulty - Difficulty setting (0-100)
     * @param {Array} lootPool - Available items to place
     * @returns {Object} - Generated level data
     */
    generateLevel(floor, difficulty, lootPool) {
        // Initialize map with walls
        const map = this.initializeMap();
        
        // Generate rooms
        const rooms = this.roomGenerator.generateRooms(map, floor);
        
        // Connect rooms with corridors
        this.corridorGenerator.connectRooms(map, rooms);
        
        // Place stairs
        const stairsPos = this.featureGenerator.placeStairs(map, rooms);
        
        // Place doors
        const doors = this.featureGenerator.placeDoors(map, floor);
        
        // Place traps (more on higher difficulty)
        const traps = this.featureGenerator.placeTraps(map, floor, difficulty);
        
        // Initialize items array
        const items = [];
        
        // Place items
        const itemPositions = this.itemPlacer.placeItems(map, items, floor, difficulty, lootPool);
        
        // Find starting position (opposite from stairs if possible)
        const startPos = this.findStartPosition(map, stairsPos);
        
        // Return complete level data
        return {
            map,
            rooms,
            stairsPos,
            startPos,
            doors,
            traps,
            items,
            floor
        };
    }
    
    /**
     * Initialize map with walls
     * @returns {Array} - 2D array of tiles
     */
    initializeMap() {
        const map = [];
        
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                // Create a wall tile
                row.push(new Tile(TILE_TYPES.WALL));
            }
            map.push(row);
        }
        
        return map;
    }
    
    /**
     * Find a suitable starting position for the player
     * @param {Array} map - Generated map
     * @param {Object} stairsPos - Stairs position
     * @returns {Object} - Starting position {x, y}
     */
    findStartPosition(map, stairsPos) {
        // Try to start far away from stairs
        const farthestTile = { x: 0, y: 0, distance: 0 };
        
        // Find open floor tile farthest from stairs
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (map[y][x].char === TILE_TYPES.FLOOR) {
                    // Calculate Manhattan distance to stairs
                    const distance = Math.abs(x - stairsPos.x) + Math.abs(y - stairsPos.y);
                    
                    // Keep track of farthest point
                    if (distance > farthestTile.distance) {
                        farthestTile.x = x;
                        farthestTile.y = y;
                        farthestTile.distance = distance;
                    }
                }
            }
        }
        
        // If we found a valid start position
        if (farthestTile.distance > 0) {
            return { x: farthestTile.x, y: farthestTile.y };
        }
        
        // Fallback: find any floor tile
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (map[y][x].char === TILE_TYPES.FLOOR) {
                    return { x, y };
                }
            }
        }
        
        // Emergency fallback (shouldn't happen)
        return { x: 1, y: 1 };
    }
    
    /**
     * Generate all floors for the game
     * @param {number} floorCount - Total number of floors
     * @param {number} difficulty - Difficulty setting
     * @param {Array} lootPool - Available items to place
     * @returns {Array} - Array of generated floors
     */
    generateDungeon(floorCount, difficulty, lootPool) {
        const floors = [];
        
        // Generate each floor
        for (let i = 0; i < floorCount; i++) {
            // Each floor gets progressively harder
            const floorDifficulty = difficulty + (i * 5);
            const floor = this.generateLevel(i + 1, floorDifficulty, lootPool);
            floors.push(floor);
        }
        
        return floors;
    }
    
    /**
     * Debug function to print ASCII map
     * @param {Array} map - Map to print
     */
    debugPrintMap(map) {
        let output = '';
        for (let y = 0; y < map.length; y++) {
            let row = '';
            for (let x = 0; x < map[0].length; x++) {
                row += map[y][x].char;
            }
            output += row + '\n';
        }
        console.log(output);
    }
}

export default MapGenerator;