import { createEmptyMap, fillRect, createBorder, isInBounds, createCorridor, connectRooms, connectRoomsMST, generateRandomRooms, generateDungeon, addRandomFeatures, getRandomTrapType, getRandomDecoration, findOpenTile, isOpenTile, getNeighbors, getWalkableNeighbors, countNeighborsOfType, generateCave, simulateCellularAutomata, connectCaveRegions, findRegions, calculateDistanceField, generateWalls, isDeadEnd, removeDeadEnds } from './mapFunctions.js';

export default {
    createEmptyMap,
    fillRect,
    createBorder,
    isInBounds,
    createCorridor,
    connectRooms,
    connectRoomsMST,
    generateRandomRooms,
    generateDungeon,
    addRandomFeatures,
    getRandomTrapType,
    getRandomDecoration,
    findOpenTile,
    isOpenTile,
    getNeighbors,
    getWalkableNeighbors,
    countNeighborsOfType,
    generateCave,
    simulateCellularAutomata,
    connectCaveRegions,
    findRegions,
    calculateDistanceField,
    generateWalls,
    isDeadEnd,
    removeDeadEnds
};