/**
 * PathFinder
 * Utility for finding paths through the dungeon map using A* algorithm
 */
class PathFinder {
    /**
     * Create a new path finder
     * @param {Object} map - Dungeon map reference
     */
    constructor(map = null) {
        this.map = map;
        
        // Default options
        this.allowDiagonal = true;
        this.avoidEntities = true;
        this.avoidTraps = true;
        this.cutCorners = false;
        this.maxIterations = 1000; // Prevent infinite loops
        this.heuristicWeight = 1.2; // Slight bias toward goal
        
        // Cached data
        this.entityMap = new Map();
    }
    
    /**
     * Set the map reference
     * @param {Object} map - Dungeon map reference
     */
    setMap(map) {
        this.map = map;
    }
    
    /**
     * Set pathfinding options
     * @param {Object} options - Pathfinding options
     */
    setOptions(options = {}) {
        if (options.allowDiagonal !== undefined) this.allowDiagonal = options.allowDiagonal;
        if (options.avoidEntities !== undefined) this.avoidEntities = options.avoidEntities;
        if (options.avoidTraps !== undefined) this.avoidTraps = options.avoidTraps;
        if (options.cutCorners !== undefined) this.cutCorners = options.cutCorners;
        if (options.maxIterations !== undefined) this.maxIterations = options.maxIterations;
        if (options.heuristicWeight !== undefined) this.heuristicWeight = options.heuristicWeight;
    }
    
    /**
     * Update the entity positions cache for faster pathfinding
     * @param {Array} entities - Array of entities with x,y positions
     */
    updateEntityMap(entities) {
        this.entityMap.clear();
        
        if (!entities || !this.avoidEntities) return;
        
        for (const entity of entities) {
            if (entity.x !== undefined && entity.y !== undefined) {
                const key = `${entity.x},${entity.y}`;
                this.entityMap.set(key, entity);
            }
        }
    }
    
    /**
     * Check if a position is occupied by an entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if occupied
     */
    isOccupiedByEntity(x, y) {
        if (!this.avoidEntities) return false;
        return this.entityMap.has(`${x},${y}`);
    }
    
    /**
     * Find a path from start to end position
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @param {Object} options - Pathfinding options
     * @returns {Array|null} - Array of {x,y} positions or null if no path
     */
    findPath(startX, startY, endX, endY, options = {}) {
        // Set options for this pathfinding operation
        const prevOptions = {
            allowDiagonal: this.allowDiagonal,
            avoidEntities: this.avoidEntities,
            avoidTraps: this.avoidTraps,
            cutCorners: this.cutCorners,
            maxIterations: this.maxIterations,
            heuristicWeight: this.heuristicWeight
        };
        this.setOptions(options);
        
        // Ensure map is available
        if (!this.map) {
            console.error('PathFinder: No map set for pathfinding');
            this.setOptions(prevOptions); // Restore options
            return null;
        }
        
        // Quick check if start or end is invalid
        if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
            this.setOptions(prevOptions); // Restore options
            return null;
        }
        
        // A* algorithm implementation
        const openSet = new PriorityQueue();
        const closedSet = new Map();
        const gScore = new Map();
        const fScore = new Map();
        const cameFrom = new Map();
        
        // Initialize starting node
        const startKey = this.posToKey(startX, startY);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
        openSet.enqueue(startKey, fScore.get(startKey));
        
        let iterations = 0;
        
        while (!openSet.isEmpty() && iterations < this.maxIterations) {
            iterations++;
            
            // Get the node with lowest fScore
            const currentKey = openSet.dequeue();
            const [currentX, currentY] = this.keyToPos(currentKey);
            
            // Check if we reached the goal
            if (currentX === endX && currentY === endY) {
                const path = this.reconstructPath(cameFrom, currentKey);
                this.setOptions(prevOptions); // Restore options
                return path;
            }
            
            // Mark as processed
            closedSet.set(currentKey, true);
            
            // Process neighbors
            const neighbors = this.getNeighbors(currentX, currentY);
            
            for (const neighbor of neighbors) {
                const neighborKey = this.posToKey(neighbor.x, neighbor.y);
                
                // Skip if already processed
                if (closedSet.has(neighborKey)) continue;
                
                // Calculate tentative gScore
                const tentativeGScore = gScore.get(currentKey) + neighbor.cost;
                
                // Check if new path to neighbor is better
                const neighborInOpenSet = openSet.containsValue(neighborKey);
                if (!neighborInOpenSet || tentativeGScore < gScore.get(neighborKey)) {
                    // Update path info
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(
                        neighborKey,
                        tentativeGScore + this.heuristic(neighbor.x, neighbor.y, endX, endY) * this.heuristicWeight
                    );
                    
                    // Add to open set if not there
                    if (!neighborInOpenSet) {
                        openSet.enqueue(neighborKey, fScore.get(neighborKey));
                    } else {
                        openSet.updatePriority(neighborKey, fScore.get(neighborKey));
                    }
                }
            }
        }
        
        // No path found
        this.setOptions(prevOptions); // Restore options
        return null;
    }
    
    /**
     * Check if a position is walkable
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if walkable
     */
    isWalkable(x, y) {
        // Check map boundaries
        if (!this.map.isInBounds(x, y)) {
            return false;
        }
        
        // Get tile
        const tile = this.map.getTile(x, y);
        if (!tile) return false;
        
        // Check if tile is walkable
        if (!tile.walkable) return false;
        
        // Check for entities
        if (this.avoidEntities && this.isOccupiedByEntity(x, y)) {
            return false;
        }
        
        // Check for traps
        if (this.avoidTraps && tile.hasTrap && !tile.hidden) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get walkable neighbors for a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array} - Array of walkable neighbor positions with cost
     */
    getNeighbors(x, y) {
        const neighbors = [];
        
        // Cardinal directions (4-way movement)
        this.checkNeighbor(x + 1, y, 1, neighbors);
        this.checkNeighbor(x - 1, y, 1, neighbors);
        this.checkNeighbor(x, y + 1, 1, neighbors);
        this.checkNeighbor(x, y - 1, 1, neighbors);
        
        // Diagonal directions (8-way movement)
        if (this.allowDiagonal) {
            const diagonalCost = 1.4; // Approximate sqrt(2)
            
            // Only allow diagonals if we can cut corners or both adjacent tiles are walkable
            if (this.cutCorners || (this.isWalkable(x + 1, y) && this.isWalkable(x, y + 1))) {
                this.checkNeighbor(x + 1, y + 1, diagonalCost, neighbors);
            }
            
            if (this.cutCorners || (this.isWalkable(x + 1, y) && this.isWalkable(x, y - 1))) {
                this.checkNeighbor(x + 1, y - 1, diagonalCost, neighbors);
            }
            
            if (this.cutCorners || (this.isWalkable(x - 1, y) && this.isWalkable(x, y + 1))) {
                this.checkNeighbor(x - 1, y + 1, diagonalCost, neighbors);
            }
            
            if (this.cutCorners || (this.isWalkable(x - 1, y) && this.isWalkable(x, y - 1))) {
                this.checkNeighbor(x - 1, y - 1, diagonalCost, neighbors);
            }
        }
        
        return neighbors;
    }
    
    /**
     * Check if a neighbor is valid and add it to the list
     * @param {number} x - Neighbor X coordinate
     * @param {number} y - Neighbor Y coordinate
     * @param {number} baseCost - Base movement cost
     * @param {Array} neighbors - Array to add valid neighbors to
     */
    checkNeighbor(x, y, baseCost, neighbors) {
        if (this.isWalkable(x, y)) {
            // Apply terrain cost if available
            let cost = baseCost;
            const tile = this.map.getTile(x, y);
            
            if (tile && tile.moveCost) {
                cost *= tile.moveCost;
            }
            
            neighbors.push({ x, y, cost });
        }
    }
    
    /**
     * Calculate heuristic (estimated cost) between two points
     * @param {number} x1 - Start X coordinate
     * @param {number} y1 - Start Y coordinate
     * @param {number} x2 - End X coordinate
     * @param {number} y2 - End Y coordinate
     * @returns {number} - Heuristic value
     */
    heuristic(x1, y1, x2, y2) {
        if (this.allowDiagonal) {
            // Octile distance (allows diagonal movement)
            const dx = Math.abs(x1 - x2);
            const dy = Math.abs(y1 - y2);
            return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
        } else {
            // Manhattan distance (4-way movement)
            return Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }
    }
    
    /**
     * Convert position to unique string key
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} - Unique key
     */
    posToKey(x, y) {
        return `${x},${y}`;
    }
    
    /**
     * Convert key back to position
     * @param {string} key - Position key
     * @returns {Array} - [x, y] coordinates
     */
    keyToPos(key) {
        const [x, y] = key.split(',').map(Number);
        return [x, y];
    }
    
    /**
     * Reconstruct path from A* search result
     * @param {Map} cameFrom - Map of node relationships
     * @param {string} currentKey - Current position key
     * @returns {Array} - Array of {x,y} positions
     */
    reconstructPath(cameFrom, currentKey) {
        const path = [];
        let current = currentKey;
        
        while (cameFrom.has(current)) {
            const [x, y] = this.keyToPos(current);
            path.unshift({ x, y });
            current = cameFrom.get(current);
        }
        
        // Add start position if path is not empty
        if (path.length > 0) {
            const [x, y] = this.keyToPos(current);
            path.unshift({ x, y });
        }
        
        return path;
    }
    
    /**
     * Check if a path exists between two points without generating the full path
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @param {Object} options - Pathfinding options
     * @returns {boolean} - True if a path exists
     */
    hasPath(startX, startY, endX, endY, options = {}) {
        // Use full pathfinding but with low max iterations for better performance
        const pathOptions = {
            ...options,
            maxIterations: options.maxIterations || 500 
        };
        
        const path = this.findPath(startX, startY, endX, endY, pathOptions);
        return path !== null;
    }
    
    /**
     * Get line of sight path between two points
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @returns {Array|null} - Array of {x,y} positions or null if no line of sight
     */
    getLineOfSight(startX, startY, endX, endY) {
        const path = [];
        
        // Use Bresenham's line algorithm
        let x0 = startX;
        let y0 = startY;
        const x1 = endX;
        const y1 = endY;
        
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            path.push({ x: x0, y: y0 });
            
            // Check if we've reached the end
            if (x0 === x1 && y0 === y1) break;
            
            // Check if the current position blocks line of sight
            if (x0 !== startX || y0 !== startY) { // Skip the starting position
                const tile = this.map.getTile(x0, y0);
                if (!tile || !tile.transparent) {
                    // Line of sight is blocked
                    return null;
                }
            }
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return path;
    }
    
    /**
     * Check if there is line of sight between two points
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @returns {boolean} - True if there is line of sight
     */
    hasLineOfSight(startX, startY, endX, endY) {
        return this.getLineOfSight(startX, startY, endX, endY) !== null;
    }
    
    /**
     * Find nearest walkable position to a target
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {number} maxRadius - Maximum search radius
     * @returns {Object|null} - {x,y} of nearest walkable position or null
     */
    findNearestWalkable(targetX, targetY, maxRadius = 5) {
        // Check target position first
        if (this.isWalkable(targetX, targetY)) {
            return { x: targetX, y: targetY };
        }
        
        // Search in expanding circles
        for (let radius = 1; radius <= maxRadius; radius++) {
            // Check positions in a square around the target
            for (let offsetX = -radius; offsetX <= radius; offsetX++) {
                for (let offsetY = -radius; offsetY <= radius; offsetY++) {
                    // Skip positions that aren't on the edge of the square
                    if (
                        Math.abs(offsetX) !== radius && 
                        Math.abs(offsetY) !== radius
                    ) continue;
                    
                    const x = targetX + offsetX;
                    const y = targetY + offsetY;
                    
                    if (this.isWalkable(x, y)) {
                        return { x, y };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Get a smoothed path between two points
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @param {Object} options - Pathfinding options
     * @returns {Array|null} - Array of {x,y} positions or null if no path
     */
    findSmoothPath(startX, startY, endX, endY, options = {}) {
        // Find the raw path first
        const rawPath = this.findPath(startX, startY, endX, endY, options);
        if (!rawPath) return null;
        
        // If path is very short, no need to smooth
        if (rawPath.length <= 2) return rawPath;
        
        // Smooth the path by removing unnecessary points
        const smoothedPath = [rawPath[0]];
        let currentIndex = 0;
        
        // Look ahead for line-of-sight shortcuts
        while (currentIndex < rawPath.length - 1) {
            let furthestVisible = currentIndex + 1;
            
            // Find the furthest point we can see directly
            for (let i = currentIndex + 2; i < rawPath.length; i++) {
                if (this.hasLineOfSight(
                    rawPath[currentIndex].x,
                    rawPath[currentIndex].y,
                    rawPath[i].x,
                    rawPath[i].y
                )) {
                    furthestVisible = i;
                } else {
                    break;
                }
            }
            
            // Add the furthest visible point to our path
            if (furthestVisible !== currentIndex) {
                currentIndex = furthestVisible;
                smoothedPath.push(rawPath[currentIndex]);
            } else {
                // Should never happen, but just in case
                currentIndex++;
                if (currentIndex < rawPath.length) {
                    smoothedPath.push(rawPath[currentIndex]);
                }
            }
        }
        
        return smoothedPath;
    }
    
    /**
     * Find a flee path away from a target
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} avoidX - X coordinate to flee from
     * @param {number} avoidY - Y coordinate to flee from
     * @param {number} maxLength - Maximum path length
     * @param {Object} options - Pathfinding options
     * @returns {Array|null} - Array of {x,y} positions or null if no path
     */
    findFleePath(startX, startY, avoidX, avoidY, maxLength = 8, options = {}) {
        // Calculate opposite direction
        const dx = startX - avoidX;
        const dy = startY - avoidY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If already at a good distance, no need to flee
        if (distance > maxLength * 2) {
            return [{ x: startX, y: startY }];
        }
        
        // Find target point away from threat
        const fleeDistance = maxLength;
        const targetX = Math.round(startX + (dx / distance) * fleeDistance);
        const targetY = Math.round(startY + (dy / distance) * fleeDistance);
        
        // Find nearest walkable position to this ideal flee point
        const fleeTarget = this.findNearestWalkable(
            targetX,
            targetY,
            Math.ceil(fleeDistance)
        );
        
        if (!fleeTarget) return null;
        
        // Find path to flee target
        const fleePath = this.findPath(startX, startY, fleeTarget.x, fleeTarget.y, options);
        
        // Limit path length
        if (fleePath && fleePath.length > maxLength) {
            return fleePath.slice(0, maxLength);
        }
        
        return fleePath;
    }
}

/**
 * Priority Queue implementation for A* algorithm
 */
class PriorityQueue {
    constructor() {
        this.values = [];
        this.valueMap = new Map();
    }
    
    isEmpty() {
        return this.values.length === 0;
    }
    
    enqueue(value, priority) {
        const element = { value, priority };
        this.values.push(element);
        this.valueMap.set(value, element);
        this._bubbleUp();
    }
    
    dequeue() {
        if (this.isEmpty()) return null;
        
        const min = this.values[0];
        const end = this.values.pop();
        this.valueMap.delete(min.value);
        
        if (this.values.length > 0) {
            this.values[0] = end;
            this._sinkDown();
        }
        
        return min.value;
    }
    
    updatePriority(value, newPriority) {
        const element = this.valueMap.get(value);
        if (!element) return false;
        
        const oldPriority = element.priority;
        element.priority = newPriority;
        
        // Bubble up or sink down based on priority change
        if (newPriority < oldPriority) {
            this._bubbleUpElement(element);
        } else if (newPriority > oldPriority) {
            this._sinkDownElement(element);
        }
        
        return true;
    }
    
    containsValue(value) {
        return this.valueMap.has(value);
    }
    
    _bubbleUp() {
        let idx = this.values.length - 1;
        const element = this.values[idx];
        
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.values[parentIdx];
            
            if (element.priority >= parent.priority) break;
            
            this.values[parentIdx] = element;
            this.values[idx] = parent;
            idx = parentIdx;
        }
    }
    
    _bubbleUpElement(element) {
        let idx = this.values.indexOf(element);
        
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.values[parentIdx];
            
            if (element.priority >= parent.priority) break;
            
            this.values[parentIdx] = element;
            this.values[idx] = parent;
            idx = parentIdx;
        }
    }
    
    _sinkDown() {
        let idx = 0;
        const length = this.values.length;
        const element = this.values[0];
        
        while (true) {
            const leftChildIdx = 2 * idx + 1;
            const rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;
            
            if (leftChildIdx < length) {
                leftChild = this.values[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }
            
            if (rightChildIdx < length) {
                rightChild = this.values[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            
            if (swap === null) break;
            
            this.values[idx] = this.values[swap];
            this.values[swap] = element;
            idx = swap;
        }
    }
    
    _sinkDownElement(element) {
        let idx = this.values.indexOf(element);
        const length = this.values.length;
        
        while (true) {
            const leftChildIdx = 2 * idx + 1;
            const rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;
            
            if (leftChildIdx < length) {
                leftChild = this.values[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }
            
            if (rightChildIdx < length) {
                rightChild = this.values[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            
            if (swap === null) break;
            
            this.values[idx] = this.values[swap];
            this.values[swap] = element;
            idx = swap;
        }
    }
}

export default PathFinder;