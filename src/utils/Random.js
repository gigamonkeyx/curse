/**
 * Random number generation utility
 * Provides functions for various random operations needed in the game
 */

class Random {
    /**
     * Initialize random number generator
     * @param {number} seed - Optional seed for deterministic generation
     */
    constructor(seed = null) {
        this.seed = seed || Math.random() * 10000000 | 0;
        this._state = this.seed;
    }
    
    /**
     * Set a new seed for the random number generator
     * @param {number} seed - New seed value
     */
    setSeed(seed) {
        this.seed = seed;
        this._state = seed;
    }
    
    /**
     * Get current seed value
     * @returns {number} - Current seed
     */
    getSeed() {
        return this.seed;
    }
    
    /**
     * Generate a random number between 0 and 1
     * Uses a simple but fast PRNG algorithm
     * @returns {number} - Random decimal between 0-1
     */
    random() {
        // If no seed is set, use Math.random
        if (this.seed === null) {
            return Math.random();
        }
        
        // Xorshift algorithm for seeded random
        this._state ^= this._state << 13;
        this._state ^= this._state >>> 17;
        this._state ^= this._state << 5;
        
        // Convert to a decimal between 0-1
        return Math.abs((this._state % 100000) / 100000);
    }
    
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    randInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
    
    /**
     * Generate a random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random float
     */
    randFloat(min, max) {
        return this.random() * (max - min) + min;
    }
    
    /**
     * Get a random boolean with specified probability
     * @param {number} probability - Probability of true (0.0 to 1.0)
     * @returns {boolean} - Random boolean
     */
    chance(probability = 0.5) {
        return this.random() < probability;
    }
    
    /**
     * Get a random item from an array
     * @param {Array} array - Source array
     * @returns {*} - Random item from array
     */
    randItem(array) {
        if (!array || array.length === 0) return null;
        return array[this.randInt(0, array.length - 1)];
    }
    
    /**
     * Get multiple random items from an array
     * @param {Array} array - Source array
     * @param {number} count - Number of items to select
     * @param {boolean} allowDuplicates - Whether to allow duplicate selections
     * @returns {Array} - Array of randomly selected items
     */
    sample(array, count, allowDuplicates = false) {
        if (!array || array.length === 0) return [];
        if (count <= 0) return [];
        
        if (allowDuplicates) {
            // Simple random sampling with replacement
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(this.randItem(array));
            }
            return result;
        } else {
            // Fisher-Yates shuffle and take first n elements
            count = Math.min(count, array.length);
            const arrayCopy = [...array];
            
            for (let i = 0; i < count; i++) {
                const j = this.randInt(i, arrayCopy.length - 1);
                [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
            }
            
            return arrayCopy.slice(0, count);
        }
    }
    
    /**
     * Get a weighted random selection
     * @param {Array} items - Array of items
     * @param {Array|Function} weights - Array of weights or function that returns weight for item
     * @returns {*} - Selected item
     */
    weighted(items, weights) {
        if (!items || items.length === 0) return null;
        
        // Create weights array if a function was provided
        const weightArray = typeof weights === 'function' 
            ? items.map(weights) 
            : weights;
        
        if (!weightArray || weightArray.length !== items.length) {
            throw new Error('Weights must match items length');
        }
        
        // Calculate sum of weights
        let sum = 0;
        for (const weight of weightArray) {
            sum += weight;
        }
        
        // Generate random value between 0 and sum
        const rand = this.randFloat(0, sum);
        
        // Find the item that corresponds to this value
        let current = 0;
        for (let i = 0; i < items.length; i++) {
            current += weightArray[i];
            if (rand <= current) {
                return items[i];
            }
        }
        
        // Fallback
        return items[items.length - 1];
    }
    
    /**
     * Shuffle array in-place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array (same reference)
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.randInt(0, i);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * Create a new shuffled copy of an array
     * @param {Array} array - Source array
     * @returns {Array} - New shuffled array
     */
    shuffled(array) {
        return this.shuffle([...array]);
    }
    
    /**
     * Create a random point within a rectangle
     * @param {number} x - Left position of rectangle
     * @param {number} y - Top position of rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {Object} - Random point {x, y}
     */
    pointInRect(x, y, width, height) {
        return {
            x: x + this.randFloat(0, width),
            y: y + this.randFloat(0, height)
        };
    }
    
    /**
     * Create a random integer point within a rectangle
     * @param {number} x - Left position of rectangle
     * @param {number} y - Top position of rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {Object} - Random integer point {x, y}
     */
    pointInRectInt(x, y, width, height) {
        return {
            x: this.randInt(x, x + width - 1),
            y: this.randInt(y, y + height - 1)
        };
    }
    
    /**
     * Generate a set of unique points within a rectangular area
     * @param {number} x - Starting X coordinate
     * @param {number} y - Starting Y coordinate
     * @param {number} width - Width of area
     * @param {number}