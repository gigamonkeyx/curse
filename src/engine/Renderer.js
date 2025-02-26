/**
 * Multi-layer rendering system for efficient canvas drawing
 * Manages separate layers for different game elements
 */
class Renderer {
    constructor(mainCanvas) {
        this.mainCanvas = mainCanvas;
        this.mainCtx = mainCanvas.getContext('2d');
        this.width = mainCanvas.width;
        this.height = mainCanvas.height;
        
        // Create separate layers for performance optimization
        this.layers = {
            background: this.createLayer('background', 0), // Terrain/floors
            items: this.createLayer('items', 1),          // Items on ground
            entities: this.createLayer('entities', 2),    // Player and enemies
            effects: this.createLayer('effects', 3),      // Visual effects
            fog: this.createLayer('fog', 4),              // Fog of war
            ui: this.createLayer('ui', 5)                 // UI elements
        };
        
        // Configure all contexts for pixel art
        this.setPixelated(this.mainCtx);
        Object.values(this.layers).forEach(layer => {
            this.setPixelated(layer.ctx);
        });
    }
    
    /**
     * Disable image smoothing for pixel art
     * @param {CanvasRenderingContext2D} ctx - Canvas context to configure
     */
    setPixelated(ctx) {
        ctx.imageSmoothingEnabled = false;
    }
    
    /**
     * Create a new rendering layer
     * @param {string} name - Layer name
     * @param {number} zIndex - Layer z-index for draw order
     * @returns {Object} - Layer object
     */
    createLayer(name, zIndex) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        
        return {
            canvas,
            ctx: canvas.getContext('2d', { alpha: true }),
            zIndex,
            dirty: true, // Track if layer needs redrawing
            name
        };
    }
    
    /**
     * Clear specific layer
     * @param {string} name - Layer name
     * @returns {Renderer} - For method chaining
     */
    clearLayer(name) {
        const layer = this.layers[name];
        if (layer) {
            layer.ctx.clearRect(0, 0, this.width, this.height);
            layer.dirty = true;
        }
        return this;
    }
    
    /**
     * Clear all layers
     * @returns {Renderer} - For method chaining
     */
    clearAll() {
        Object.values(this.layers).forEach(layer => {
            layer.ctx.clearRect(0, 0, this.width, this.height);
            layer.dirty = true;
        });
        return this;
    }
    
    /**
     * Draw to a specific layer
     * @param {string} layerName - Target layer name
     * @param {Function} callback - Drawing function that receives context
     * @returns {Renderer} - For method chaining
     */
    drawToLayer(layerName, callback) {
        const layer = this.layers[layerName];
        if (layer) {
            callback(layer.ctx);
            layer.dirty = true;
        }
        return this;
    }
    
    /**
     * Composite all layers to main canvas
     * Only redraws layers marked as dirty
     * @returns {Renderer} - For method chaining
     */
    render() {
        this.mainCtx.clearRect(0, 0, this.width, this.height);
        
        // Composite in z-index order
        Object.values(this.layers)
            .sort((a, b) => a.zIndex - b.zIndex)
            .forEach(layer => {
                if (layer.dirty) {
                    this.mainCtx.drawImage(layer.canvas, 0, 0);
                }
            });
            
        return this;
    }
    
    /**
     * Draw map with visibility system
     * @param {Array} map - 2D array of map tiles
     * @param {Array} visibleTiles - List of currently visible tile coordinates
     * @param {AssetManager} assets - Asset manager for images
     * @param {number} tileSize - Size of each tile in pixels
     * @returns {Renderer} - For method chaining
     */
    drawMap(map, visibleTiles, assets, tileSize) {
        this.clearLayer('background');
        
        // Draw discovered tiles with lower opacity
        this.drawToLayer('background', ctx => {
            // First pass: Draw all discovered tiles with reduced opacity
            ctx.globalAlpha = 0.5;
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[0].length; x++) {
                    const tile = map[y][x];
                    if (tile.discovered) {
                        const tileType = this.getTileImageKey(tile);
                        const image = assets.getImage(tileType);
                        if (image) {
                            ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
                        }
                    }
                }
            }
            
            // Second pass: Draw visible tiles with full opacity
            ctx.globalAlpha = 1.0;
            visibleTiles.forEach(({x, y}) => {
                const tile = map[y][x];
                const tileType = this.getTileImageKey(tile);
                const image = assets.getImage(tileType);
                if (image) {
                    ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
                }
            });
        });
        
        return this;
    }
    
    /**
     * Determine appropriate image key for tile
     * @param {Object} tile - Tile data
     * @returns {string} - Image key
     */
    getTileImageKey(tile) {
        if (tile.char === '#') return 'wall';
        if (tile.char === '>') return 'stairs';
        if (tile.char === '+') return 'door';
        if (tile.char === 'L') return 'locked_door';
        if (tile.char === 'S') return 'secret_door';
        if (tile.char === '^') return tile.hidden ? 'hidden_trap' : 'trap';
        
        // Handle different floor types
        if (tile.floorType === 'dirt') return 'floor_dirt';
        if (tile.floorType === 'water') return 'floor_water';
        if (tile.floorType === 'bonus') return 'floor_dirt';
        
        return 'floor';
    }
}

// Export for module system
export default Renderer;