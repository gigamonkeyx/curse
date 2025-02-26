/**
 * Game constants and configuration values
 * Centralizes all magic numbers and settings
 */

// Map dimensions
export const MAP = {
    WIDTH: 80,            // Map width in tiles
    HEIGHT: 50,           // Map height in tiles
    TILE_SIZE: 32,        // Tile size in pixels
    get CANVAS_WIDTH() {  // Calculated canvas width
        return this.WIDTH * this.TILE_SIZE;
    },
    get CANVAS_HEIGHT() { // Calculated canvas height
        return this.HEIGHT * this.TILE_SIZE;
    }
};

// Game settings
export const GAME = {
    DEFAULT_FLOORS: 10,
    DEFAULT_DIFFICULTY: 50,
    DEFAULT_VISION_RADIUS: 3,
    DEFAULT_DEBUG_MODE: true,
    MAX_FLOORS: 20,
    MIN_FLOORS: 1
};

// Entity types
export const ENTITY_TYPES = {
    PLAYER: 'player',
    ENEMY: 'enemy',
    ITEM: 'item'
};

// Item categories
export const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    POTION: 'potion',
    SCROLL: 'scroll',
    GOLD: 'gold',
    KEY: 'key',
    AMULET: 'amulet'
};

// Item tiers
export const ITEM_TIERS = {
    COMMON: 0,
    UNCOMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 4
};

// Tile types
export const TILE_TYPES = {
    WALL: '#',
    FLOOR: '.',
    STAIRS: '>',
    DOOR: '+',
    LOCKED_DOOR: 'L',
    SECRET_DOOR: 'S',
    TRAP: '^'
};

// Floor types
export const FLOOR_TYPES = {
    DEFAULT: 'floor',
    DIRT: 'floor_dirt',
    WATER: 'floor_water'
};

// Keyboard controls
export const KEYS = {
    UP: ['ArrowUp', 'w', 'k'],
    DOWN: ['ArrowDown', 's', 'j'],
    LEFT: ['ArrowLeft', 'a', 'h'],
    RIGHT: ['ArrowRight', 'd', 'l'],
    INVENTORY: ['i'],
    CONFIG: ['c'],
    INTERACT: [' ', 'Enter'],
    ESCAPE: ['Escape']
};

// Base loot types - structured definition of item categories
export const LOOT_TYPES = {
    weapon: { 
        bases: ['Rusty Dagger', 'Steel Sword', 'Dragonblade'], 
        stat: 'damage', 
        images: ['dagger_01.png', 'sword_01.png', 'sword_05.png'] 
    },
    body_armor: { 
        bases: ['Cloth Armor', 'Chainmail', 'Plate Armor'], 
        stat: 'defense', 
        images: ['body_01.png', 'body_02.png', 'body_03.png'] 
    },
    helmet: {
        bases: ['Cap', 'Helm', 'Crown'],
        stat: 'defense',
        images: ['helm_01.png', 'helm_02.png', 'helm_03.png']
    },
    boots: {
        bases: ['Shoes', 'Boots', 'Greaves'],
        stat: 'speed',
        images: ['boot_01.png', 'boot_02.png', 'boot_03.png']
    },
    gloves: {
        bases: ['Gloves', 'Gauntlets', 'Claws'],
        stat: 'damage',
        images: ['glove_01.png', 'glove_02.png', 'glove_03.png']
    }
};

// Export individual constants for convenience
export const { WIDTH, HEIGHT, TILE_SIZE } = MAP;