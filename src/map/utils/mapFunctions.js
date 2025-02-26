export function createEmptyMap(width, height, tileFactory) {
    // ...existing code...
}

export function fillRect(map, x, y, width, height, tileUpdater) {
    // ...existing code...
}

export function createBorder(map, x, y, width, height, tileUpdater) {
    // ...existing code...
}

export function isInBounds(map, x, y) {
    // ...existing code...
}

export function createCorridor(map, x1, y1, x2, y2, tileUpdater, straight = true) {
    // ...existing code...
}

export function connectRooms(map, rooms, tileUpdater, straight = true) {
    // ...existing code...
}

export function connectRoomsMST(map, rooms, tileUpdater, straight = true, extraConnections = 0) {
    // ...existing code...
}

export function generateRandomRooms(mapWidth, mapHeight, attempts, roomSizes = null) {
    // ...existing code...
}

export function generateDungeon(width, height, options = {}) {
    // ...existing code...
}

export function addRandomFeatures(map, options = {}) {
    // ...existing code...
}

export function getRandomTrapType() {
    // ...existing code...
}

export function getRandomDecoration() {
    // ...existing code...
}

export function findOpenTile(map, roomIndex = -1, rooms = []) {
    // ...existing code...
}

export function isOpenTile(map, x, y) {
    // ...existing code...
}

export function getNeighbors(map, x, y, diagonals = false) {
    // ...existing code...
}

export function getWalkableNeighbors(map, x, y, diagonals = false) {
    // ...existing code...
}

export function countNeighborsOfType(map, x, y, type, diagonals = false) {
    // ...existing code...
}

export function generateCave(width, height, options = {}) {
    // ...existing code...
}

export function simulateCellularAutomata(map, birthLimit, deathLimit) {
    // ...existing code...
}

export function connectCaveRegions(map) {
    // ...existing code...
}

export function findRegions(map, predicate) {
    // ...existing code...
}

export function calculateDistanceField(map, startX, startY) {
    // ...existing code...
}

export function generateWalls(map) {
    // ...existing code...
}

export function isDeadEnd(map, x, y) {
    // ...existing code...
}

export function removeDeadEnds(map, iterations = 1) {
    // ...existing code...
}
