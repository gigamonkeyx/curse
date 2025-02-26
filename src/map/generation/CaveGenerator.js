/**
 * Cave Generator
 * Provides functions to generate caves using cellular automata
 */

class CaveGenerator {
    /**
     * Generate a cave using the cellular automata algorithm
     * @param {number} width - Cave width
     * @param {number} height - Cave height
     * @param {Object} options - Generation options
     * @returns {Array} 2D array representing the cave
     */
    static generateCave(width, height, options = {}) {
        const {
            fillProbability = 0.45,
            iterations = 4,
            birthLimit = 4,
            deathLimit = 3
        } = options;

        // Create initial random map
        let map = this.createEmptyMap(width, height);

        // Randomly fill with walls
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    // Border is always walls
                    map[x][y].type = 'wall';
                } else {
                    // Random fill
                    map[x][y].type = Math.random() < fillProbability ? 'wall' : 'floor';
                    map[x][y].walkable = map[x][y].type === 'floor';
                    map[x][y].transparent = map[x][y].type === 'floor';
                }
            }
        }

        // Run cellular automata
        for (let i = 0; i < iterations; i++) {
            map = this.simulateCellularAutomata(map, birthLimit, deathLimit);
        }

        // Ensure the cave is connected
        map = this.connectCaveRegions(map);

        return map;
    }

    /**
     * Simulate one step of cellular automata
     * @param {Array} map - 2D map array
     * @param {number} birthLimit - Minimum neighbors for birth
     * @param {number} deathLimit - Maximum neighbors for survival
     * @returns {Array} - New map after simulation step
     */
    static simulateCellularAutomata(map, birthLimit, deathLimit) {
        const width = map.length;
        const height = map[0].length;

        // Create new map for next generation
        const newMap = this.createEmptyMap(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // Copy existing properties
                Object.assign(newMap[x][y], map[x][y]);

                // Skip borders
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    newMap[x][y].type = 'wall';
                    newMap[x][y].walkable = false;
                    newMap[x][y].transparent = false;
                    continue;
                }

                // Count wall neighbors
                const wallCount = this.countNeighborsOfType(map, x, y, 'wall', true);

                // Apply cellular automata rules
                if (map[x][y].type === 'wall') {
                    newMap[x][y].type = wallCount >= deathLimit ? 'wall' : 'floor';
                } else {
                    newMap[x][y].type = wallCount >= birthLimit ? 'wall' : 'floor';
                }

                // Update walkable and transparent properties
                newMap[x][y].walkable = newMap[x][y].type === 'floor';
                newMap[x][y].transparent = newMap[x][y].type === 'floor';
            }
        }

        return newMap;
    }

    /**
     * Connect disconnected cave regions
     * @param {Array} map - 2D map array
     * @returns {Array} - Connected map
     */
    static connectCaveRegions(map) {
        const width = map.length;
        const height = map[0].length;

        // Find all distinct cave regions
        const regions = this.findRegions(map, (tile) => tile.type === 'floor');

        // No need to connect if only 0 or 1 regions
        if (regions.length <= 1) return map;

        // Store connections to make
        const connections = [];

        // Find shortest connections between regions
        for (let i = 0; i < regions.length - 1; i++) {
            let shortestDistance = Infinity;
            let bestConnection = null;

            // Connect each region to the next one
            const regionA = regions[i];
            const regionB = regions[i + 1];

            // Find closest points between regions
            for (const tileA of regionA) {
                for (const tileB of regionB) {
                    const distance = Math.abs(tileA.x - tileB.x) + Math.abs(tileA.y - tileB.y);

                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        bestConnection = { from: tileA, to: tileB };
                    }
                }
            }

            if (bestConnection) {
                connections.push(bestConnection);
            }
        }

        // Create corridors for connections
        for (const connection of connections) {
            this.createCorridor(
                map,
                connection.from.x,
                connection.from.y,
                connection.to.x,
                connection.to.y,
                (tile) => {
                    tile.type = 'floor';
                    tile.walkable = true;
                    tile.transparent = true;
                    tile.corridor = true;
                },
                true // Use straight corridors
            );
        }

        return map;
    }

    // Add more cave generation methods as needed
}

export default CaveGenerator;
