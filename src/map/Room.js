/**
 * Room class
 * Represents a distinct area in the dungeon with its own properties and contents
 */
class Room {
    /**
     * Create a new room
     * @param {number} x - X position in the dungeon grid
     * @param {number} y - Y position in the dungeon grid
     * @param {number} width - Room width
     * @param {number} height - Room height
     * @param {Object} options - Additional room options
     */
    constructor(x, y, width, height, options = {}) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Room properties
        this.id = options.id || Math.floor(Math.random() * 1000000);
        this.type = options.type || 'normal';
        this.theme = options.theme || 'default';
        this.discovered = options.discovered || false;
        
        // Special room flags
        this.isSpecial = options.isSpecial || false;
        this.isShop = options.isShop || false;
        this.isStartRoom = options.isStartRoom || false;
        this.isStairDown = options.isStairDown || false;
        this.isStairUp = options.isStairUp || false;
        this.isBossRoom = options.isBossRoom || false;
        this.isSecretRoom = options.isSecretRoom || false;
        
        // Content
        this.entities = options.entities || [];
        this.items = options.items || [];
        this.features = options.features || [];  // Special features like statues, altars, etc.
        this.traps = options.traps || [];
        this.chests = options.chests || [];
        
        // Connections to other rooms
        this.connections = options.connections || [];
        this.doors = options.doors || [];
        
        // Visual customization
        this.floorVariation = options.floorVariation || 0;
        this.wallVariation = options.wallVariation || 0;
        this.lightLevel = options.lightLevel || 1.0;  // 0.0 = dark, 1.0 = fully lit
        this.ambientColor = options.ambientColor || null;
        
        // State tracking
        this.cleared = options.cleared || false;  // Whether enemies have been defeated
        this.visited = options.visited || false;  // Whether player has entered
        
        // Environment effects
        this.hazard = options.hazard || null;  // E.g. poison gas, water, lava
        
        // Events
        this.onEnter = options.onEnter || null;
        this.onClear = options.onClear || null;
    }
    
    /**
     * Get the center coordinates of the room
     * @returns {Object} - {x, y} coordinates of room center
     */
    getCenter() {
        return {
            x: this.x + Math.floor(this.width / 2),
            y: this.y + Math.floor(this.height / 2)
        };
    }
    
    /**
     * Check if a point is inside the room
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} padding - Optional padding inside room edges
     * @returns {boolean} - True if point is inside room
     */
    contains(x, y, padding = 0) {
        return (
            x >= this.x + padding &&
            x < this.x + this.width - padding &&
            y >= this.y + padding &&
            y < this.y + this.height - padding
        );
    }
    
    /**
     * Check if this room overlaps another
     * @param {Room} otherRoom - Room to check against
     * @param {number} padding - Additional padding
     * @returns {boolean} - True if rooms overlap
     */
    overlaps(otherRoom, padding = 0) {
        return !(
            this.x - padding >= otherRoom.x + otherRoom.width + padding ||
            this.x + this.width + padding <= otherRoom.x - padding ||
            this.y - padding >= otherRoom.y + otherRoom.height + padding ||
            this.y + this.height + padding <= otherRoom.y - padding
        );
    }
    
    /**
     * Get a random position inside the room
     * @param {number} padding - Padding from walls
     * @returns {Object} - {x, y} coordinates
     */
    getRandomPosition(padding = 1) {
        const x = this.x + padding + Math.floor(Math.random() * (this.width - padding * 2));
        const y = this.y + padding + Math.floor(Math.random() * (this.height - padding * 2));
        return { x, y };
    }
    
    /**
     * Create a connection to another room
     * @param {Room} otherRoom - Room to connect to
     * @param {Object} doorInfo - Door information
     */
    connectTo(otherRoom, doorInfo = {}) {
        // Add to connections
        this.connections.push({
            roomId: otherRoom.id,
            doorInfo: doorInfo
        });
        
        // Add door
        if (doorInfo.x !== undefined && doorInfo.y !== undefined) {
            this.doors.push({
                x: doorInfo.x,
                y: doorInfo.y,
                type: doorInfo.type || 'normal',
                locked: doorInfo.locked || false,
                hidden: doorInfo.hidden || false,
                toRoomId: otherRoom.id
            });
        }
    }
    
    /**
     * Mark the room as discovered
     */
    discover() {
        this.discovered = true;
    }
    
    /**
     * Mark the room as visited
     */
    visit() {
        this.visited = true;
        this.discover();
    }
    
    /**
     * Mark the room as cleared of enemies
     */
    clear() {
        this.cleared = true;
        
        // Trigger onClear event if defined
        if (typeof this.onClear === 'function') {
            this.onClear(this);
        }
    }
    
    /**
     * Add an entity to the room
     * @param {Object} entity - Entity to add
     */
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    /**
     * Remove an entity from the room
     * @param {Object} entity - Entity to remove
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    
    /**
     * Add an item to the room
     * @param {Object} item - Item to add
     */
    addItem(item) {
        this.items.push(item);
    }
    
    /**
     * Remove an item from the room
     * @param {Object} item - Item to remove
     */
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
    
    /**
     * Add a trap to the room
     * @param {Object} trap - Trap data
     */
    addTrap(trap) {
        this.traps.push(trap);
    }
    
    /**
     * Add a chest to the room
     * @param {Object} chest - Chest data
     */
    addChest(chest) {
        this.chests.push(chest);
    }
    
    /**
     * Add a special feature to the room
     * @param {Object} feature - Feature data
     */
    addFeature(feature) {
        this.features.push(feature);
    }
    
    /**
     * Check if this is a special type of room
     * @returns {boolean} - True if room is special
     */
    isSpecialRoom() {
        return (
            this.isSpecial ||
            this.isShop ||
            this.isStartRoom ||
            this.isStairDown ||
            this.isStairUp ||
            this.isBossRoom ||
            this.isSecretRoom
        );
    }
    
    /**
     * Set the room type and related properties
     * @param {string} type - Room type
     */
    setType(type) {
        this.type = type;
        
        switch (type) {
            case 'start':
                this.isStartRoom = true;
                break;
            case 'stairDown':
                this.isStairDown = true;
                break;
            case 'stairUp':
                this.isStairUp = true;
                break;
            case 'boss':
                this.isBossRoom = true;
                break;
            case 'shop':
                this.isShop = true;
                break;
            case 'secret':
                this.isSecretRoom = true;
                break;
            case 'treasure':
            case 'altar':
            case 'library':
                this.isSpecial = true;
                break;
        }
    }
    
    /**
     * Convert room to serializable object
     * @returns {Object} - Serialized room data
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type,
            theme: this.theme,
            discovered: this.discovered,
            visited: this.visited,
            cleared: this.cleared,
            isSpecial: this.isSpecial,
            isShop: this.isShop,
            isStartRoom: this.isStartRoom,
            isStairDown: this.isStairDown,
            isStairUp: this.isStairUp,
            isBossRoom: this.isBossRoom,
            isSecretRoom: this.isSecretRoom,
            floorVariation: this.floorVariation,
            wallVariation: this.wallVariation,
            lightLevel: this.lightLevel,
            ambientColor: this.ambientColor,
            connections: this.connections,
            doors: this.doors,
            // Don't serialize entities/items/features as they're stored separately
            hazard: this.hazard
        };
    }
    
    /**
     * Create room from serialized data
     * @param {Object} data - Serialized room data
     * @returns {Room} - Room instance
     */
    static fromJSON(data) {
        const room = new Room(data.x, data.y, data.width, data.height);
        
        // Copy all serialized properties
        Object.assign(room, data);
        
        return room;
    }
    
    /**
     * Calculate the Manhattan distance to another room
     * @param {Room} otherRoom - Room to calculate distance to
     * @returns {number} - Manhattan distance between room centers
     */
    distanceTo(otherRoom) {
        const center1 = this.getCenter();
        const center2 = otherRoom.getCenter();
        
        return Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);
    }
    
    /**
     * Get map tiles covered by this room
     * @param {Object} map - Game map object
     * @returns {Array} - Array of tile objects
     */
    getTiles(map) {
        const tiles = [];
        
        for (let x = this.x; x < this.x + this.width; x++) {
            for (let y = this.y; y < this.y + this.height; y++) {
                const tile = map.getTile(x, y);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        
        return tiles;
    }
    
    /**
     * Get the perimeter coordinates of the room
     * @param {boolean} inner - Whether to get inner perimeter (default) or outer
     * @returns {Array} - Array of {x, y} coordinates
     */
    getPerimeter(inner = true) {
        const perimeter = [];
        const offset = inner ? 0 : -1;
        
        // Top and bottom walls
        for (let x = this.x + offset; x < this.x + this.width - offset; x++) {
            perimeter.push({ x, y: this.y + offset });
            perimeter.push({ x, y: this.y + this.height - 1 - offset });
        }
        
        // Left and right walls
        for (let y = this.y + offset + 1; y < this.y + this.height - 1 - offset; y++) {
            perimeter.push({ x: this.x + offset, y });
            perimeter.push({ x: this.x + this.width - 1 - offset, y });
        }
        
        return perimeter;
    }
}

export default Room;