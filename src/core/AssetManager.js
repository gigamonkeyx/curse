/**
 * Manages loading, caching, and verification of game assets
 * Handles image transparency and provides centralized resource access
 */
class AssetManager {
    constructor() {
        this.images = new Map(); // Store loaded images with key-value access
        this.loading = false;    // Track loading state
        this.loaded = 0;         // Counter for loaded assets
        this.total = 0;          // Total number of assets to load
        this.tileSize = 32;      // Standard tile size for the game
    }

    /**
     * Load all image assets from provided sources
     * @param {Object} sources - Key-value pairs of image identifiers and paths
     * @returns {Promise} - Resolves when all images are loaded
     */
    async loadAll(sources) {
        this.loading = true;
        this.total = Object.keys(sources).length;
        
        const promises = Object.entries(sources).map(([key, path]) => {
            return this.loadImage(key, path);
        });
        
        await Promise.all(promises);
        this.loading = false;
        console.log(`All assets loaded: ${this.loaded}/${this.total}`);
        return this.images;
    }
    
    /**
     * Load single image with error handling
     * @param {string} key - Image identifier
     * @param {string} path - Image file path
     * @returns {Promise} - Resolves with loaded image
     */
    async loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.verifyTransparency(img, key);
                this.images.set(key, img);
                this.loaded++;
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}`);
                reject(new Error(`Failed to load image: ${path}`));
            };
            
            img.src = path;
        });
    }
    
    /**
     * Check if image has transparent pixels
     * @param {Image} img - Image to check
     * @param {string} key - Image identifier
     */
    verifyTransparency(img, key) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, this.tileSize, this.tileSize).data;
        
        // Check alpha channel values (every 4th byte)
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] !== 255) {
                hasAlpha = true;
                break;
            }
        }
        
        if (hasAlpha) {
            console.log(`Image ${key} uses transparency`);
        }
    }
    
    /**
     * Get loaded image by key
     * @param {string} key - Image identifier
     * @returns {Image|null} - Image object or null if not found
     */
    getImage(key) {
        return this.images.get(key) || null;
    }
    
    /**
     * Extract sprite from sprite atlas for efficiency
     * @param {string} atlasKey - Atlas image identifier
     * @param {number} x - X position in atlas
     * @param {number} y - Y position in atlas
     * @param {number} width - Sprite width
     * @param {number} height - Sprite height
     * @returns {HTMLCanvasElement|null} - Canvas containing sprite
     */
    createSprite(atlasKey, x, y, width, height) {
        const atlas = this.images.get(atlasKey);
        if (!atlas) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
        ctx.drawImage(atlas, x, y, width, height, 0, 0, width, height);
        
        return canvas;
    }
}

// Export for module system
export default AssetManager;