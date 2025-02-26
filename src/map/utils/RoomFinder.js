/**
 * RoomFinder
 * Utility class for finding and navigating rooms in the dungeon
 */
class RoomFinder {
    /**
     * Create a new room finder
     * @param {Array} rooms - Array of room objects
     * @param {Object} map - Reference to the dungeon map
     */
    constructor(rooms = [], map = null) {
        this.rooms = rooms;
        this.map = map;
        this.roomLookup = {}; // Fast lookup by ID
        
        // Build lookup table if rooms are provided
        if (rooms.length > 0) {
            this.buildRoomLookup();
        }
    }
    
    /**
     * Set or update rooms
     * @param {Array} rooms - Array of room objects
     */
    setRooms(rooms) {
        this.rooms = rooms;
        this.buildRoomLookup();
    }
    
    /**
     * Set or update map reference
     * @param {Object} map - Dungeon map reference
     */
    setMap(map) {
        this.map = map;
    }
    
    /**
     * Build room lookup table for fast access by ID
     */
    buildRoomLookup() {
        this.roomLookup = {};
        for (const room of this.rooms) {
            this.roomLookup[room.id] = room;
        }
    }
    
    /**
     * Find the room that contains a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} - Room that contains the position, or null
     */
    findRoomAt(x, y) {
        for (const room of this.rooms) {
            if (room.contains(x, y)) {
                return room;
            }
        }
        return null;
    }
    
    /**
     * Get a room by its ID
     * @param {number|string} roomId - Room ID
     * @returns {Object|null} - Room object or null if not found
     */
    getRoomById(roomId) {
        return this.roomLookup[roomId] || null;
    }
    
    /**
     * Find rooms of a specific type
     * @param {string} type - Room type to find
     * @returns {Array} - Array of matching rooms
     */
    findRoomsByType(type) {
        return this.rooms.filter(room => room.type === type);
    }
    
    /**
     * Find rooms by property
     * @param {string} property - Property name
     * @param {any} value - Property value to match
     * @returns {Array} - Array of matching rooms
     */
    findRoomsByProperty(property, value) {
        return this.rooms.filter(room => room[property] === value);
    }
    
    /**
     * Find special rooms
     * @returns {Array} - Array of special rooms
     */
    findSpecialRooms() {
        return this.rooms.filter(room => room.isSpecialRoom());
    }
    
    /**
     * Find start room
     * @returns {Object|null} - Start room or null if not found
     */
    findStartRoom() {
        return this.rooms.find(room => room.isStartRoom);
    }
    
    /**
     * Find stairs (up or down)
     * @param {boolean} down - True for downstairs, false for upstairs
     * @returns {Object|null} - Stair room or null if not found
     */
    findStairs(down = true) {
        return this.rooms.find(room => down ? room.isStairDown : room.isStairUp);
    }
    
    /**
     * Find boss room
     * @returns {Object|null} - Boss room or null if not found
     */
    findBossRoom() {
        return this.rooms.find(room => room.isBossRoom);
    }
    
    /**
     * Find shop rooms
     * @returns {Array} - Array of shop rooms
     */
    findShops() {
        return this.rooms.filter(room => room.isShop);
    }
    
    /**
     * Get all directly connected rooms for a room
     * @param {Object} room - Room to check
     * @returns {Array} - Array of connected rooms
     */
    getConnectedRooms(room) {
        const connected = [];
        
        if (!room || !room.connections) return connected;
        
        for (const connection of room.connections) {
            const connectedRoom = this.getRoomById(connection.roomId);
            if (connectedRoom) {
                connected.push(connectedRoom);
            }
        }
        
        return connected;
    }
    
    /**
     * Find all rooms connected to a room, directly or indirectly
     * @param {Object} startRoom - Starting room
     * @returns {Array} - Array of connected rooms
     */
    getAllReachableRooms(startRoom) {
        const visited = new Set();
        const queue = [startRoom];
        visited.add(startRoom.id);
        
        while (queue.length > 0) {
            const current = queue.shift();
            const connected = this.getConnectedRooms(current);
            
            for (const room of connected) {
                if (!visited.has(room.id)) {
                    visited.add(room.id);
                    queue.push(room);
                }
            }
        }
        
        return Array.from(visited).map(id => this.getRoomById(id));
    }
    
    /**
     * Find the shortest path between two rooms
     * @param {Object} startRoom - Starting room
     * @param {Object} endRoom - Destination room
     * @returns {Array} - Array of rooms forming the path, or empty if no path
     */
    findPath(startRoom, endRoom) {
        if (!startRoom || !endRoom) return [];
        if (startRoom.id === endRoom.id) return [startRoom];
        
        // Use breadth-first search for shortest path
        const queue = [{ room: startRoom, path: [startRoom] }];
        const visited = new Set([startRoom.id]);
        
        while (queue.length > 0) {
            const { room, path } = queue.shift();
            const connected = this.getConnectedRooms(room);
            
            for (const nextRoom of connected) {
                if (nextRoom.id === endRoom.id) {
                    return [...path, nextRoom];
                }
                
                if (!visited.has(nextRoom.id)) {
                    visited.add(nextRoom.id);
                    queue.push({
                        room: nextRoom,
                        path: [...path, nextRoom]
                    });
                }
            }
        }
        
        return []; // No path found
    }
    
    /**
     * Find rooms adjacent to a given room
     * @param {Object} room - Room to check
     * @param {number} padding - Extra space to check for adjacency
     * @returns {Array} - Array of adjacent rooms
     */
    findAdjacentRooms(room, padding = 0) {
        const adjacent = [];
        
        for (const other of this.rooms) {
            if (room.id === other.id) continue;
            
            // Check if rooms are adjacent (share part of a wall or are diagonal)
            if (this.areRoomsAdjacent(room, other, padding)) {
                adjacent.push(other);
            }
        }
        
        return adjacent;
    }
    
    /**
     * Check if two rooms are adjacent
     * @param {Object} roomA - First room
     * @param {Object} roomB - Second room
     * @param {number} padding - Extra space to check for adjacency
     * @returns {boolean} - True if rooms are adjacent
     */
    areRoomsAdjacent(roomA, roomB, padding = 0) {
        // Two rooms are adjacent if they're touching or at most 1+padding tiles apart
        const aMaxX = roomA.x + roomA.width;
        const aMaxY = roomA.y + roomA.height;
        const bMaxX = roomB.x + roomB.width;
        const bMaxY = roomB.y + roomB.height;
        
        // Check for horizontal adjacency
        const horizontalAdjacent =
            (Math.abs(aMaxX - roomB.x) <= 1 + padding || Math.abs(roomA.x - bMaxX) <= 1 + padding) &&
            (roomA.y <= bMaxY && aMaxY >= roomB.y);
            
        // Check for vertical adjacency
        const verticalAdjacent =
            (Math.abs(aMaxY - roomB.y) <= 1 + padding || Math.abs(roomA.y - bMaxY) <= 1 + padding) &&
            (roomA.x <= bMaxX && aMaxX >= roomB.x);
            
        return horizontalAdjacent || verticalAdjacent;
    }
    
    /**
     * Find potential door positions between two rooms
     * @param {Object} roomA - First room
     * @param {Object} roomB - Second room
     * @returns {Array} - Array of {x, y} positions suitable for doors
     */
    findPotentialDoorPositions(roomA, roomB) {
        const doorPositions = [];
        
        if (!this.areRoomsAdjacent(roomA, roomB, 0)) {
            return doorPositions;
        }
        
        // Get room boundaries
        const aMinX = roomA.x;
        const aMaxX = roomA.x + roomA.width - 1;
        const aMinY = roomA.y;
        const aMaxY = roomA.y + roomA.height - 1;
        
        const bMinX = roomB.x;
        const bMaxX = roomB.x + roomB.width - 1;
        const bMinY = roomB.y;
        const bMaxY = roomB.y + roomB.height - 1;
        
        // Check horizontal alignment (rooms stacked vertically)
        const xOverlap = Math.max(0, Math.min(aMaxX, bMaxX) - Math.max(aMinX, bMinX) + 1);
        if (xOverlap > 0) {
            // Find horizontal overlap range
            const startX = Math.max(aMinX, bMinX);
            const endX = Math.min(aMaxX, bMaxX);
            
            // Check if roomA is above roomB
            if (aMaxY + 1 === bMinY) {
                for (let x = startX; x <= endX; x++) {
                    doorPositions.push({ x, y: aMaxY + 1 });
                }
            }
            // Check if roomB is above roomA
            else if (bMaxY + 1 === aMinY) {
                for (let x = startX; x <= endX; x++) {
                    doorPositions.push({ x, y: bMaxY + 1 });
                }
            }
        }
        
        // Check vertical alignment (rooms side by side)
        const yOverlap = Math.max(0, Math.min(aMaxY, bMaxY) - Math.max(aMinY, bMinY) + 1);
        if (yOverlap > 0) {
            // Find vertical overlap range
            const startY = Math.max(aMinY, bMinY);
            const endY = Math.min(aMaxY, bMaxY);
            
            // Check if roomA is left of roomB
            if (aMaxX + 1 === bMinX) {
                for (let y = startY; y <= endY; y++) {
                    doorPositions.push({ x: aMaxX + 1, y });
                }
            }
            // Check if roomB is left of roomA
            else if (bMaxX + 1 === aMinX) {
                for (let y = startY; y <= endY; y++) {
                    doorPositions.push({ x: bMaxX + 1, y });
                }
            }
        }
        
        return doorPositions;
    }
    
    /**
     * Find the nearest room of a specific type
     * @param {Object} startRoom - Starting room
     * @param {string} type - Room type to find
     * @returns {Object|null} - Nearest room of the specified type, or null
     */
    findNearestRoomOfType(startRoom, type) {
        let nearestRoom = null;
        let minDistance = Infinity;
        
        const targetRooms = this.findRoomsByType(type);
        
        for (const room of targetRooms) {
            if (room.id === startRoom.id) continue;
            
            const distance = startRoom.distanceTo(room);
            if (distance < minDistance) {
                minDistance = distance;
                nearestRoom = room;
            }
        }
        
        return nearestRoom;
    }
    
    /**
     * Get a list of all discovered rooms
     * @returns {Array} - Array of discovered rooms
     */
    getDiscoveredRooms() {
        return this.rooms.filter(room => room.discovered);
    }
    
    /**
     * Get a list of all cleared rooms
     * @returns {Array} - Array of cleared rooms
     */
    getClearedRooms() {
        return this.rooms.filter(room => room.cleared);
    }
    
    /**
     * Get a list of all uncleared rooms
     * @returns {Array} - Array of uncleared rooms
     */
    getUnclearedRooms() {
        return this.rooms.filter(room => !room.cleared);
    }
    
    /**
     * Find the room that contains a door
     * @param {number} doorX - Door X coordinate
     * @param {number} doorY - Door Y coordinate
     * @returns {Object|null} - Room containing the door, or null
     */
    findRoomWithDoor(doorX, doorY) {
        for (const room of this.rooms) {
            for (const door of room.doors) {
                if (door.x === doorX && door.y === doorY) {
                    return room;
                }
            }
        }
        return null;
    }
    
    /**
     * Find all rooms within a certain distance
     * @param {Object} startRoom - Starting room
     * @param {number} maxDistance - Maximum Manhattan distance between room centers
     * @returns {Array} - Array of rooms within the distance
     */
    findRoomsWithinDistance(startRoom, maxDistance) {
        return this.rooms.filter(room => {
            if (room.id === startRoom.id) return false;
            return startRoom.distanceTo(room) <= maxDistance;
        });
    }
    
    /**
     * Find door that connects two rooms
     * @param {Object} roomA - First room
     * @param {Object} roomB - Second room
     * @returns {Object|null} - Door object or null if not found
     */
    findConnectingDoor(roomA, roomB) {
        if (!roomA || !roomB) return null;
        
        // Check all doors in the first room
        for (const door of roomA.doors) {
            if (door.toRoomId === roomB.id) {
                return door;
            }
        }
        
        // Check all doors in the second room
        for (const door of roomB.doors) {
            if (door.toRoomId === roomA.id) {
                return door;
            }
        }
        
        return null;
    }
    
    /**
     * Find all hidden doors in the dungeon
     * @returns {Array} - Array of hidden door objects
     */
    findHiddenDoors() {
        const hiddenDoors = [];
        
        for (const room of this.rooms) {
            for (const door of room.doors) {
                if (door.hidden) {
                    hiddenDoors.push({
                        door,
                        room
                    });
                }
            }
        }
        
        return hiddenDoors;
    }
    
    /**
     * Find all locked doors in the dungeon
     * @returns {Array} - Array of locked door objects
     */
    findLockedDoors() {
        const lockedDoors = [];
        
        for (const room of this.rooms) {
            for (const door of room.doors) {
                if (door.locked) {
                    lockedDoors.push({
                        door,
                        room
                    });
                }
            }
        }
        
        return lockedDoors;
    }
    
    /**
     * Generate a map of connections between rooms
     * @returns {Object} - Map of room connections
     */
    generateConnectionMap() {
        const connectionMap = {};
        
        for (const room of this.rooms) {
            connectionMap[room.id] = [];
            
            for (const connection of room.connections) {
                const connectedRoom = this.getRoomById(connection.roomId);
                if (connectedRoom) {
                    connectionMap[room.id].push({
                        id: connectedRoom.id,
                        type: connectedRoom.type,
                        doorInfo: connection.doorInfo
                    });
                }
            }
        }
        
        return connectionMap;
    }
}

export default RoomFinder;