/**
 * Main game class that coordinates all game systems
 * Manages game loop, state, and component interactions
 */
import MapGenerator from '../map/MapGenerator.js';
import EntityManager from '../engine/EntityManager.js';
import UI from '../ui/UI.js';
import InputHandler from './InputHandler.js';
import FOV from '../map/FOV.js';
import { MAP, GAME_STATES } from '../utils/Constants.js';
import EventBus from '../utils/EventBus.js';

class Game {
    /**
     * Create a new game instance
     * @param {HTMLCanvasElement} canvas - Game canvas element
     * @param {Object} options - Configuration options
     */
    constructor(canvas, options = {}) {
        // Setup canvas and context
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        this.canvas.width = MAP.CANVAS_WIDTH;
        this.canvas.height = MAP.CANVAS_HEIGHT;
        
        // Game state
        this.state = {
            current: GAME_STATES.LOADING,
            turnCount: 0,
            difficulty: 50, // 0-100 scale
            score: 0
        };
        
        // Game configuration
        this.config = {
            maxFloors: 20,
            visibilityRadius: 8,
            pixelScale: 1
        };
        
        // Performance tracking
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Options from constructor
        this.options = {
            onLoadProgress: options.onLoadProgress || (() => {}),
            onLoadComplete: options.onLoadComplete || (() => {})
        };
        
        // Game loop variables
        this.running = false;
        this.animationFrameId = null;
        
        // Event system
        this.events = new EventBus();
        
        // Bind methods to instance
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    /**
     * Initialize game systems
     */
    async initialize() {
        // Systems
        this.mapGenerator = new MapGenerator();
        this.entityManager = new EntityManager(this);
        this.ui = new UI(this);
        this.input = new InputHandler(this, this.canvas);
        this.fov = new FOV();
        
        // Map data
        this.mapLayout = null;
        this.currentLevel = null;
        this.levels = [];
        
        // Assets and data
        this.lootPool = []; // Will be populated from data files
        
        // Register event handlers
        this.registerEventHandlers();
        
        // Load game assets
        await this.loadAssets();
        
        // Show main menu
        this.ui.openStartMenu();
        
        // Done loading
        this.state.current = GAME_STATES.MENU;
        this.options.onLoadComplete();
    }
    
    /**
     * Start game loop
     */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastFrameTime = performance.now();
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    /**
     * Stop game loop
     */
    stop() {
        if (this.running) {
            this.running = false;
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current time in milliseconds
     */
    gameLoop(timestamp) {
        // Calculate delta time
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Limit delta time to prevent big jumps
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Update and render
        this.update(this.deltaTime);
        this.render();
        
        // Continue loop if running
        if (this.running) {
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update UI
        this.ui.update(deltaTime);
        
        // Skip other updates if game is not in active state
        if (this.state.current !== GAME_STATES.PLAYING) {
            return;
        }
        
        // Update entities
        this.entityManager.update(deltaTime);
    }
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Skip map rendering if not playing
        if (this.state.current === GAME_STATES.PLAYING) {
            // Render map
            this.renderMap();
            
            // Render entities
            this.renderEntities();
        }
        
        // Render UI elements
        this.ui.render(this.ctx);
    }
    
    /**
     * Render map
     */
    renderMap() {
        if (!this.mapLayout || !this.player) return;
        
        // Get visible tiles
        this.fov.resetVisibility(this.mapLayout);
        const visibleTiles = this.fov.calculate(
            this.mapLayout, 
            this.player.x, 
            this.player.y, 
            this.config.visibilityRadius
        );
        
        // Draw map tiles
        for (let y = 0; y < MAP.HEIGHT; y++) {
            for (let x = 0; x < MAP.WIDTH; x++) {
                const tile = this.mapLayout[y][x];
                
                if (tile.visible) {
                    // Visible tiles
                    this.renderTile(x, y, tile, true);
                } else if (tile.discovered) {
                    // Discovered but not visible
                    this.renderTile(x, y, tile, false);
                }
            }
        }
    }
    
    /**
     * Render individual tile
     * @param {number} x - Tile X position
     * @param {number} y - Tile Y position
     * @param {Object} tile - Tile data
     * @param {boolean} visible - Whether tile is visible
     */
    renderTile(x, y, tile, visible) {
        // Calculate screen position
        const screenX = x * MAP.TILE_SIZE;
        const screenY = y * MAP.TILE_SIZE;
        
        // Draw tile background
        this.ctx.fillStyle = visible ? this.getTileColor(tile) : this.getTileColorDark(tile);
        this.ctx.fillRect(screenX, screenY, MAP.TILE_SIZE, MAP.TILE_SIZE);
        
        // Draw tile character
        this.ctx.fillStyle = visible ? '#fff' : '#666';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw tile symbol based on type
        const symbol = this.getTileSymbol(tile);
        this.ctx.fillText(
            symbol,
            screenX + MAP.TILE_SIZE / 2,
            screenY + MAP.TILE_SIZE / 2
        );
    }
    
    /**
     * Get tile color
     * @param {Object} tile - Tile data
     * @returns {string} - CSS color
     */
    getTileColor(tile) {
        switch (tile.char) {
            case '#': return '#444'; // Wall
            case '.': return '#222'; // Floor
            case '+': return '#852'; // Door
            case '>': return '#448'; // Stairs
            default: return '#000';
        }
    }
    
    /**
     * Get darkened tile color for discovered tiles
     * @param {Object} tile - Tile data
     * @returns {string} - CSS color
     */
    getTileColorDark(tile) {
        switch (tile.char) {
            case '#': return '#333'; // Wall
            case '.': return '#111'; // Floor
            case '+': return '#531'; // Door
            case '>': return '#224'; // Stairs
            default: return '#000';
        }
    }
    
    /**
     * Get tile symbol
     * @param {Object} tile - Tile data
     * @returns {string} - Display symbol
     */
    getTileSymbol(tile) {
        return tile.char;
    }
    
    /**
     * Render entities
     */
    renderEntities() {
        if (!this.mapLayout || !this.player) return;
        
        // Render items
        this.entityManager.items.forEach(item => {
            if (this.isVisible(item.x, item.y)) {
                this.renderItem(item);
            }
        });
        
        // Render enemies
        this.entityManager.enemies.forEach(enemy => {
            if (this.isVisible(enemy.x, enemy.y)) {
                this.renderEnemy(enemy);
            }
        });
        
        // Render player
        this.renderPlayer();
    }
    
    /**
     * Render player
     */
    renderPlayer() {
        const x = this.player.x * MAP.TILE_SIZE;
        const y = this.player.y * MAP.TILE_SIZE;
        
        // Draw player
        this.ctx.fillStyle = '#ff0';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            '@',
            x + MAP.TILE_SIZE / 2,
            y + MAP.TILE_SIZE / 2
        );
    }
    
    /**
     * Render enemy
     * @param {Object} enemy - Enemy entity
     */
    renderEnemy(enemy) {
        const x = enemy.x * MAP.TILE_SIZE;
        const y = enemy.y * MAP.TILE_SIZE;
        
        // Draw enemy
        this.ctx.fillStyle = '#f66';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            enemy.char || 'e',
            x + MAP.TILE_SIZE / 2,
            y + MAP.TILE_SIZE / 2
        );
    }
    
    /**
     * Render item
     * @param {Object} item - Item entity
     */
    renderItem(item) {
        const x = item.x * MAP.TILE_SIZE;
        const y = item.y * MAP.TILE_SIZE;
        
        // Draw item
        this.ctx.fillStyle = '#6af';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Symbol based on item type
        let symbol = '?';
        switch (item.type) {
            case 'weapon': symbol = '/'; break;
            case 'body_armor': symbol = '['; break;
            case 'helmet': symbol = '^'; break;
            case 'potion': symbol = '!'; break;
            case 'scroll': symbol = '?'; break;
            case 'gold': symbol = '$'; break;
        }
        
        this.ctx.fillText(
            symbol,
            x + MAP.TILE_SIZE / 2,
            y + MAP.TILE_SIZE / 2
        );
    }
    
    /**
     * Check if position is visible
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether position is visible
     */
    isVisible(x, y) {
        return this.fov.isVisible(x, y);
    }
    
    /**
     * Handle player movement
     * @param {number} dx - X direction
     * @param {number} dy - Y direction
     */
    movePlayer(dx, dy) {
        if (this.state.current !== GAME_STATES.PLAYING || !this.player) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check boundaries
        if (newX < 0 || newY < 0 || newX >= MAP.WIDTH || newY >= MAP.HEIGHT) {
            return;
        }
        
        // Check for wall collision
        if (this.mapLayout[newY][newX].isBlocking()) {
            return;
        }
        
        // Check for enemy
        const enemy = this.entityManager.getEnemyAt(newX, newY);
        if (enemy) {
            this.player.attack(enemy);
            
            // Log attack message
            const damage = Math.max(1, this.player.strength - enemy.defense);
            this.ui.logMessage(
                `You hit the ${enemy.name} for ${damage} damage.`,
                'info'
            );
            
            // Check if enemy died
            if (enemy.isDead()) {
                this.ui.logMessage(
                    `You killed the ${enemy.name}!`,
                    'success'
                );
                
                // Add score
                this.state.score += enemy.xpValue;
            }
            
            // Complete the turn
            this.completeTurn();
            return;
        }
        
        // Check for item
        const item = this.entityManager.getItemAt(newX, newY);
        if (item) {
            this.ui.logMessage(`You see ${item.name} here.`, 'info');
        }
        
        // Check for special tiles
        const tile = this.mapLayout[newY][newX];
        if (tile.char === '>') {
            this.ui.logMessage('You found stairs leading down!', 'info');
        }
        
        // Move player
        this.player.x = newX;
        this.player.y = newY;
        
        // Pick up gold automatically
        if (item && item.type === 'gold') {
            this.player.gold += item.value;
            this.entityManager.removeItemAt(newX, newY);
            this.ui.logMessage(`You picked up ${item.value} gold.`, 'info');
        }
        
        // Complete the turn
        this.completeTurn();
    }
    
    /**
     * Complete player turn and update game state
     */
    completeTurn() {
        // Increment turn counter
        this.state.turnCount++;
        
        // Update entities after player's turn
        this.entityManager.updateEnemies();
        
        // Check if player died
        if (this.player.isDead()) {
            this.gameOver(false);
            return;
        }
    }
    
    /**
     * Try to use stairs
     */
    useStairs() {
        if (this.state.current !== GAME_STATES.PLAYING || !this.player) return;
        
        const tile = this.mapLayout[this.player.y][this.player.x];
        
        if (tile.char === '>') {
            // Go to next floor
            const nextFloor = this.player.currentFloor + 1;
            
            if (nextFloor >= this.config.maxFloors) {
                // Win the game
                this.gameOver(true);
                return;
            }
            
            // Load or generate next floor
            this.goToFloor(nextFloor);
            this.ui.logMessage(`You descend to floor ${nextFloor + 1}.`, 'info');
        } else {
            this.ui.logMessage('There are no stairs here.', 'info');
        }
    }
    
    /**
     * Go to specific floor
     * @param {number} floorNum - Floor number
     */
    goToFloor(floorNum) {
        // Ensure player exists
        if (!this.player) return;
        
        // Check if we need to generate this floor
        if (!this.levels[floorNum]) {
            // Generate new floor
            this.levels[floorNum] = this.mapGenerator.generateLevel(
                floorNum,
                this.state.difficulty + floorNum * 5,
                this.lootPool
            );
        }
        
        // Set current level
        this.currentLevel = this.levels[floorNum];
        this.mapLayout = this.currentLevel.map;
        
        // Update player floor
        this.player.currentFloor = floorNum;
        
        // Initialize entities for level
        this.entityManager.initLevel(this.currentLevel, null);
        
        // Update player reference
        this.player = this.entityManager.player;
    }
    
    /**
     * Start a new game
     */
    newGame() {
        // Reset game state
        this.state.current = GAME_STATES.PLAYING;
        this.state.turnCount = 0;
        this.state.score = 0;
        
        // Clear existing levels
        this.levels = [];
        
        // Generate first level
        this.goToFloor(0);
        
        // Welcome message
        this.ui.logMessage('Welcome to the dungeon!', 'system');
        this.ui.logMessage('Find the amulet and escape.', 'system');
    }
    
    /**
     * End the game
     * @param {boolean} victory - Whether player won
     */
    gameOver(victory) {
        this.state.current = GAME_STATES.GAME_OVER;
        
        if (victory) {
            this.ui.logMessage('You escaped the dungeon!', 'success');
            // Add bonus score for winning
            this.state.score += 1000;
        } else {
            this.ui.logMessage('You died in the dungeon!', 'danger');
        }
        
        // Show game over screen
        this.ui.showGameOver(victory, this.state.score);
    }
    
    /**
     * Pause game
     */
    pause() {
        if (this.state.current === GAME_STATES.PLAYING) {
            this.state.previous = this.state.current;
            this.state.current = GAME_STATES.PAUSED;
        }
    }
    
    /**
     * Resume game from pause
     */
    resume() {
        if (this.state.current === GAME_STATES.PAUSED && this.state.previous) {
            this.state.current = this.state.previous;
            this.state.previous = null;
        }
    }
    
    /**
     * Register event handlers
     */
    registerEventHandlers() {
        // Handle keyboard movement
        this.events.on('keypress', ({ key }) => {
            // Movement keys
            if (this.state.current === GAME_STATES.PLAYING) {
                switch (key) {
                    // Arrow keys / vi keys
                    case 'ArrowUp':
                    case 'k': this.movePlayer(0, -1); break;
                    case 'ArrowRight':
                    case 'l': this.movePlayer(1, 0); break;
                    case 'ArrowDown':
                    case 'j': this.movePlayer(0, 1); break;
                    case 'ArrowLeft':
                    case 'h': this.movePlayer(-1, 0); break;
                    
                    // Diagonals (vi keys + numpad)
                    case 'y': this.movePlayer(-1, -1); break;
                    case 'u': this.movePlayer(1, -1); break;
                    case 'b': this.movePlayer(-1, 1); break;
                    case 'n': this.movePlayer(1, 1); break;
                    
                    // Other actions
                    case '>': this.useStairs(); break;
                    case 'g': this.pickupItem(); break;
                    case 'i': this.ui.openInventory(); break;
                    case 'Escape': this.ui.openConfig(); break;
                }
            }
        });
    }
    
    /**
     * Pick up item at player's position
     */
    pickupItem() {
        if (!this.player) return;
        
        const item = this.entityManager.getItemAt(this.player.x, this.player.y);
        
        if (item && item.type !== 'gold') {
            const removed = this.entityManager.removeItemAt(this.player.x, this.player.y);
            
            if (removed) {
                this.player.inventory.push(removed);
                this.ui.logMessage(`You picked up ${removed.name}.`, 'info');
                this.completeTurn();
            }
        } else {
            this.ui.logMessage('There is nothing here to pick up.', 'info');
        }
    }
    
    /**
     * Load game assets
     */
    async loadAssets() {
        try {
            // Simulate loading with progress updates
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.options.onLoadProgress((i + 1) / 10);
            }
            
            // Populate loot pool (this would normally load from a data file)
            this.lootPool = this.generateSampleLootPool();
            
            return true;
        } catch (error) {
            console.error('Error loading assets:', error);
            return false;
        }
    }
    
    /**
     * Generate sample loot pool (for development)
     * @returns {Array} - Sample items
     */
    generateSampleLootPool() {
        return [
            // Weapons
            { name: 'Dagger', type: 'weapon', damage: 3 },
            { name: 'Shortsword', type: 'weapon', damage: 5 },
            { name: 'Longsword', type: 'weapon', damage: 7 },
            { name: 'Battle Axe', type: 'weapon', damage: 10 },
            
            // Armor
            { name: 'Leather Armor', type: 'body_armor', defense: 2 },
            { name: 'Chain Mail', type: 'body_armor', defense: 4 },
            { name: 'Plate Mail', type: 'body_armor', defense: 6 },
            
            // Helmets
            { name: 'Leather Cap', type: 'helmet', defense: 1 },
            { name: 'Iron Helmet', type: 'helmet', defense: 2 },
            { name: 'Steel Helmet', type: 'helmet', defense: 3 },
            
            // Consumables
            { name: 'Health Potion', type: 'potion', healing: 10 },
            { name: 'Scroll of Fire', type: 'scroll', spell: 'fire' },
            { name: 'Scroll of Teleport', type: 'scroll', spell: 'teleport' },
            
            // Gold
            { name: 'Gold Coins', type: 'gold', value: 10 }
        ];
    }
    
    /**
     * Get player entity
     */
    get player() {
        return this.entityManager ? this.entityManager.player : null;
    }
}

export default Game;