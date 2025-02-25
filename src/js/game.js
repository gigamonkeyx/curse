// Welcome to Adventure Time Rogue! - A gritty, pixelated dungeon crawl in the depths of a cursed labyrinth.
// These comments echo the flickering torchlight of the dungeon, guiding us through the code like ancient runes on stone walls.

console.log('Script start - the adventure begins in the shadowy depths of the maze...');

const canvas = document.getElementById('game-canvas');
const statusBar = document.getElementById('status-bar');
if (!canvas || !statusBar) {
    console.error('Required DOM elements missing! - The dungeon collapses without its canvas in the maze...');
    throw new Error('Canvas or status bar not found - a fatal curse strikes the realm of the labyrinth!');
}

const ctx = canvas.getContext('2d', { alpha: true }); // Torchlight flickers, preserving the transparency of ancient artifacts, twisting through the maze.
const WIDTH = 80; // Width of the dungeon in 32px tiles - a sprawling, blocky expanse in the labyrinth.
const HEIGHT = 25; // Height of the cavern, carved in pixelated stone, navigating the maze.
const TILE_SIZE = 32; // Each tile, 32x32 pixels, a sacred unit of our retro realm, guiding the dungeon.
const CANVAS_WIDTH = WIDTH * TILE_SIZE; // The full width of our pixelated dungeon map, twisting in the maze.
const CANVAS_HEIGHT = HEIGHT * TILE_SIZE; // The towering height, shrouded in the maze’s darkness, through the labyrinth.
canvas.width = CANVAS_WIDTH; // Set the canvas bounds, ready for exploration in the maze.
canvas.height = CANVAS_HEIGHT; // Prepare the cursed ground for our hero’s tread, guiding the dungeon.

let mapLayout, player, enemies, items, inventory, debugLog, lootPool, FLOORS = []; // The dungeon’s soul - maps, heroes, foes, treasures, and secrets, twisting through the maze.
let enemyCount = 0; // Count the lurking shadows in the maze’s depths, navigating the labyrinth.
let itemIdCounter = 0; // Track the cursed artifacts scattered in the maze’s dark, guiding the dungeon.
let debugMode = true; // Toggle the arcane runes of debugging, revealing hidden truths in the maze.
let lastTime = 0; // Track the flickering torch’s tick in the eternal night of the labyrinth.

const tileImages = { // Pixelated glyphs of the maze, each with ghostly transparency, guiding the dungeon.
    player: new Image(), enemy: new Image(),
    rusty_dagger: new Image(), steel_sword: new Image(), dragonblade: new Image(),
    cloth_armor: new Image(), chainmail: new Image(), plate_armor: new Image(),
    minor_potion: new Image(), potion: new Image(), elixir: new Image(),
    speed_ring: new Image(), power_amulet: new Image(), magic_amulet: new Image(),
    cap: new Image(), helm: new Image(), crown: new Image(),
    shoes: new Image(), boots: new Image(), greaves: new Image(),
    gloves: new Image(), gauntlets: new Image(), claws: new Image(),
    shield: new Image(),
    floor: new Image(), floor_dirt: new Image(), floor_water: new Image(),
    wall: new Image(), stairs: new Image(), gem: new Image(),
    door: new Image(), locked_door: new Image(), secret_door: new Image(), // Pixelated barriers, blocking or hiding paths in the maze.
    trap: new Image(), hidden_trap: new Image() // Perilous shadows, revealed in the maze’s torch’s reach, through the labyrinth.
};

const imageSources = { // Paths to the pixelated relics, glowing with ancient magic, twisting in the maze.
    player: 'tiles/player.png', enemy: 'tiles/enemy.png',
    rusty_dagger: 'tiles/dagger_01.png', steel_sword: 'tiles/sword_01.png', dragonblade: 'tiles/sword_05.png',
    cloth_armor: 'tiles/body_01.png', chainmail: 'tiles/body_02.png', plate_armor: 'tiles/body_03.png',
    minor_potion: 'tiles/health_01.png', potion: 'tiles/health_02.png', elixir: 'tiles/health_04.png',
    speed_ring: 'tiles/ring_01.png', power_amulet: 'tiles/ring_02.png', magic_amulet: 'tiles/ring_03.png',
    cap: 'tiles/helm_01.png', helm: 'tiles/helm_02.png', crown: 'tiles/helm_03.png',
    shoes: 'tiles/boot_01.png', boots: 'tiles/boot_02.png', greaves: 'tiles/boot_03.png',
    gloves: 'tiles/glove_01.png', gauntlets: 'tiles/glove_02.png', claws: 'tiles/glove_03.png',
    shield: 'tiles/shield_01.png',
    floor: 'tiles/floor.png', floor_dirt: 'tiles/floor_dirt.png', floor_water: 'tiles/floor_water.png',
    wall: 'tiles/wall.png', stairs: 'tiles/stairs.png', gem: 'tiles/gem.png',
    door: 'tiles/door_01.png', locked_door: 'tiles/locked_door_01.png', secret_door: 'tiles/secret_door_01.png', // Paths to pixelated barriers, navigating the maze.
    trap: 'tiles/trap_01.png', hidden_trap: 'tiles/hidden_trap_01.png' // Paths to perilous shadows, pixelated and lurking in the labyrinth.
};

const LOOT_TYPES = { // Treasures of the maze, each with its pixelated glow and power, hidden in the dungeon.
    weapon: { bases: ['Rusty Dagger', 'Steel Sword', 'Dragonblade'], stat: 'damage', images: ['dagger_01.png', 'sword_01.png', 'sword_05.png'] },
    body_armor: { bases: ['Cloth Armor', 'Chainmail', 'Plate Armor'], stat: 'defense', images: ['body_01.png', 'body_02.png', 'body_03.png'] }
};

let config = JSON.parse(localStorage.getItem('defaultConfig')) || { // Settings etched in stone tablets, preserved across sessions, guiding the maze.
    floors: 10, difficultyLoot: 50, debugMode: true, visionRadius: 3
};
lootPool = JSON.parse(localStorage.getItem('lootPool')) || []; // The pool of cursed loot, hidden in the maze’s shadows, through the dungeon.
itemIdCounter = lootPool.length; // Count the artifacts unearthed from the maze’s depths, navigating the labyrinth.

// Utility Functions
function randomChoice(array) { // Roll the dice of fate, as the maze’s shadows shift, guiding the dungeon.
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) { // Shuffle the maze’s paths, flickering with randomness, through the dungeon’s twists.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap, pixel by pixel, in the maze’s dark, guiding the labyrinth.
    }
    return array; // Return the shuffled paths, glowing with fate, navigating the dungeon.
}

function getRarityWeight(level) { // Determine the rarity of treasures, glowing with arcane power in the maze’s dark, through the dungeon.
    const base = Math.min(level, 10); // Cap the dungeon’s depth at 10 for epic loot, twisting in the labyrinth.
    return {
        common: Math.max(0.2, 0.7 - (base * 0.05)), // Common loot, flickering faintly in the maze, guiding the dungeon.
        uncommon: Math.min(0.4, 0.2 + (base * 0.02)), // Uncommon treasures, glowing softly in the labyrinth, navigating the maze.
        rare: Math.min(0.4, 0.1 + (base * 0.03)) // Rare relics, shining with ancient light, through the maze’s depths.
    };
}

// Game Logic
function generateLoot(floorLevel, playerLevel, rarity = 'common') { // Forge a new artifact in the maze’s depths, with specified rarity, guiding the dungeon.
    const weights = getRarityWeight(Math.max(floorLevel, playerLevel)); // Balance the curse by floor and hero level, twisting in the labyrinth.
    let tier = { rare: 2, uncommon: 1, common: 0 }[rarity] || 0; // Set tier based on rarity, default to common.
    const type = randomChoice(Object.keys(LOOT_TYPES)); // Choose the type - weapon or armor, twisting in the maze.
    const base = LOOT_TYPES[type].bases[tier]; // Name the relic, etched in pixelated stone, guiding the labyrinth.
    const statKey = LOOT_TYPES[type].stat; // The stat it enhances - damage or defense, flickering in the maze.
    const stats = { [statKey]: tier + 1 }; // Set its power, glowing with magic, through the dungeon.
    const name = base; // The relic’s name, whispered in the maze’s dark, navigating the labyrinth.
    const image = 'tiles/' + randomChoice(LOOT_TYPES[type].images); // Its pixelated glyph, shimmering with transparency, in the maze’s light.
    const item = { id: `item_${itemIdCounter++}`, name, type, base, stats, image, equipped: false }; // Create the cursed treasure, hidden in the maze’s depths, guiding the dungeon.
    lootPool.push(item); // Add it to the pool, shrouded in the maze’s shadows, through the labyrinth.
    localStorage.setItem('lootPool', JSON.stringify(lootPool)); // Etch it into the dungeon’s memory, twisting in the maze.
    if (debugMode) console.log(`Loot generated: ${item.name} - a ${rarity} prize, flickering in the maze’s abyss, through the dungeon...`);
    return item; // Return the glowing relic to the hero’s grasp, guiding the labyrinth.
}

function initGame() { // Kindle the torch, summoning the hero into the maze’s heart, navigating the dungeon.
    player = { x: 1, y: 1, hp: 20, max_hp: 20, strength: 2, defense: 0, speed: 1, level: 1, currentFloor: 0, currentGoal: '' }; // The brave adventurer, pixelated and ready, with a known quest in the maze, guiding the dungeon.
    enemies = []; // The lurking shadows, waiting to strike, visible only in the maze’s light, through the labyrinth.
    items = []; // Treasures scattered in the maze’s dark, glowing with transparency, revealed by the torch, navigating the dungeon.
    inventory = []; // The hero’s bag, holding cursed relics and keys, twisting in the maze, guiding the labyrinth.
    debugLog = []; // Ancient runes of debugging, etched in the stone, guiding the maze’s depths, through the dungeon.
    enemyCount = 0; // Count the foes in the flickering light, twisting in the maze, navigating the labyrinth.
    if (debugMode) console.log('Game initialized - the dungeon awakens with a pixelated curse, maze-like and perilous, through the labyrinth...');
}

function generateMaze(width, height) { // Carve a maze-like labyrinth, twisting with pixelated purpose, through the dungeon’s depths.
    let maze = Array(height).fill().map(() => Array(width).fill('#')); // Fill with walls, solid and pixelated, guarding the maze, guiding the dungeon.
    function carve(x, y) {
        maze[y][x] = '.'; // Carve a floor tile, glowing faintly in the maze’s dark, through the labyrinth.
        const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]]; // Possible moves (2 steps to avoid walls), pixelated paths in the maze, navigating the dungeon.
        shuffle(directions); // Randomize the maze’s twists, flickering with fate, guiding the labyrinth.
        for (let [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === '#') {
                maze[y + dy / 2][x + dx / 2] = '.'; // Carve the wall between, pixelated and open, in the maze, through the dungeon.
                carve(nx, ny); // Recurse into the new area, deepening the labyrinth, guiding the maze.
            }
        }
    }
    carve(1, 1); // Start at [1, 1], leaving edges as walls, guarding the maze’s abyss, navigating the dungeon.
    return maze.map(row => row.map(char => ({ char, item: false, discovered: false, visible: false, floorType: 'default' }))); // Return structured tiles, pixelated and cursed, through the dungeon’s depths, guiding the labyrinth.
}

function isValidRoom(map, x, y, w, h) { // Check if a room fits, flickering with pixelated logic, in the maze’s twists, through the dungeon.
    for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
            if (rx < 0 || rx >= WIDTH || ry < 0 || ry >= HEIGHT || map[ry][rx].char === '#') return false; // Avoid walls, stone-cold and unyielding, in the maze’s labyrinth, guiding the dungeon.
        }
    }
    return true; // The room glows, pixelated and open, in the maze’s dark, navigating the labyrinth, through the dungeon.
}

function generateLevel(level, difficultyMultiplier = 1) { // Carve a maze-like floor in the dungeon’s depths, with purpose, rooms, and peril, twisting through the labyrinth, guiding the maze.
    const { map, enemies, items } = { map: generateMaze(WIDTH, HEIGHT), enemies: [], items: [] }; // Initialize with a maze, pixelated and perilous, in the maze, navigating the dungeon.

    // Place varied rooms, flickering with pixelated purpose in the maze, guiding the dungeon, through the labyrinth.
    const roomCount = Math.floor(2 + Math.random() * 4); // 2-5 rooms per floor, random but strategic, in the maze, navigating the dungeon.
    for (let i = 0; i < roomCount; i++) {
        let roomX, roomY, roomW, roomH;
        do {
            roomW = Math.floor(3 + Math.random() * 3); // Room width, 3-5 tiles, pixelated and open, in the maze, guiding the labyrinth.
            roomH = Math.floor(3 + Math.random() * 3); // Room height, 3-5 tiles, glowing faintly, through the maze, navigating the dungeon.
            roomX = Math.floor(Math.random() * (WIDTH - roomW - 2)) + 1; // Random X, within bounds, twisting in the maze, guiding the labyrinth.
            roomY = Math.floor(Math.random() * (HEIGHT - roomH - 2)) + 1; // Random Y, within bounds, navigating the dungeon, through the maze.
        } while (!isValidRoom(map, roomX, roomY, roomW, roomH)); // Ensure no overlap with walls or edges, pixelated and perilous, in the labyrinth, guiding the dungeon.
        for (let ry = roomY; ry < roomY + roomH; ry++) {
            for (let rx = roomX; rx < roomX + roomW; rx++) {
                map[ry][rx].char = '.'; // Carve the room, pixelated and open, in the maze’s light, through the labyrinth, navigating the dungeon.
            }
        }
    }

    // Place the goal - varied but known, glowing with purpose in the maze’s heart, guiding the dungeon, through the labyrinth.
    const goals = ['stairs', 'artifact', 'boss'];
    player.currentGoal = randomChoice(goals); // Set a random but known goal, flickering with narrative, in the maze, navigating the dungeon.
    let goalX, goalY;
    do {
        goalX = Math.floor(Math.random() * (WIDTH - 2)) + 1;
        goalY = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
    } while (map[goalY][goalX].char !== '.' || (goalX === 1 && goalY === 1)); // Avoid start and walls, pixelated and perilous, in the maze’s labyrinth, guiding the dungeon.
    if (player.currentGoal === 'stairs') map[goalY][goalX] = { ...map[goalY][goalX], char: '>' };
    else if (player.currentGoal === 'artifact') {
        const artifact = generateLoot(level, player.level, 'rare'); // Rare artifact, shining brightly, in the maze’s light, through the labyrinth, navigating the dungeon.
        items.push({ x: goalX, y: goalY, ...artifact });
        map[goalY][goalX].item = true;
    } else if (player.currentGoal === 'boss') {
        enemies.push({ x: goalX, y: goalY, hp: 20 + level * 2, strength: 3 + level }); // Powerful foe, pixelated and fierce, lurking in the maze, guiding the dungeon, through the labyrinth.
    }

    // Scatter common relics and foes, hidden in the maze’s shadows, visible only in light, guiding the dungeon, through the labyrinth.
    const commonItems = [];
    let x, y;
    do {
        x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
        y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
    } while (map[y][x].char !== '.' || (x === goalX && y === goalY) || (x === 1 && y === 1));
    const item = generateLoot(level, player.level); // Common artifact, glowing faintly, in the maze’s dark, navigating the dungeon, through the labyrinth.
    commonItems.push({ x, y, ...item });
    map[y][x].item = true;

    const enemySpawnCount = Math.floor(level * difficultyMultiplier);
    for (let i = 0; i < enemySpawnCount; i++) {
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        enemies.push({ x, y, hp: 5 + level, strength: 1 + level }); // A shadowy foe, pixelated and cunning, in the maze, guiding the dungeon, through the labyrinth.
    }

    // Add doors, traps, and secrets, pixelated and perilous, in the maze, guiding the dungeon, through the labyrinth.
    const commonDoorCount = Math.floor(2 + Math.random() * 2); // 2-3 doors, pixelated and blocking, in the maze, navigating the dungeon.
    for (let i = 0; i < commonDoorCount; i++) {
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || enemies.some(e => e.x === x && e.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        map[y][x] = { ...map[y][x], char: '+', locked: true, keyRequired: 'rusty_key' }; // Common door, pixelated and locked, in the maze, guiding the labyrinth.
    }

    if (Math.random() < 0.1) { // 10% chance for a rare locked door, pixelated and guarded, in the maze, navigating the dungeon.
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || enemies.some(e => e.x === x && e.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        map[y][x] = { ...map[y][x], char: 'L', locked: true, keyRequired: 'skeleton_key' }; // Rare locked door, pixelated and guarded, in the maze, guiding the dungeon, through the labyrinth.
        const workaroundX = x + (Math.random() < 0.5 ? 1 : -1); // Nearby tile, glowing with cunning, in the maze, through the dungeon.
        const workaroundY = y;
        if (workaroundX >= 0 && workaroundX < WIDTH && map[workaroundY][workaroundX].char === '#') {
            map[workaroundY][workaroundX] = { ...map[workaroundY][workaroundX], char: '.' }; // Open a path, pixelated and cunning, in the maze, guiding the labyrinth, through the dungeon.
        } else {
            const keyItem = generateLoot(level, player.level, 'rare'); // Rare key, glowing faintly, in the maze, navigating the dungeon, through the labyrinth.
            items.push({ x: workaroundX, y: workaroundY, ...keyItem });
            map[workaroundY][workaroundX].item = true; // Place the key, visible in the maze’s torchlight, guiding the maze, through the dungeon.
        }
    }

    if (Math.random() < 0.05) { // 5% chance for a secret door, pixelated and elusive, in the maze, navigating the dungeon.
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || enemies.some(e => e.x === x && e.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        map[y][x] = { ...map[y][x], char: 'S', locked: true, keyRequired: 'secret_key', secret: true }; // Secret door, pixelated and elusive, in the maze, guiding the dungeon, through the labyrinth.
        const bonusX = x + 2, bonusY = y;
        if (bonusX < WIDTH && map[bonusY][bonusX].char === '.') {
            map[bonusY][bonusX] = { ...map[bonusY][bonusX], item: true, floorType: 'bonus' };
            items.push({ x: bonusX, y: bonusY, ...generateLoot(level, player.level, 'rare') }); // Rare loot, shimmering with transparency, in the maze’s light, through the labyrinth, guiding the dungeon.
        } else {
            map[bonusY][bonusX] = { ...map[bonusY][bonusX], char: '^', trapType: 'hidden_pit', damage: 10, hidden: true }; // Deadly trap, pixelated and lurking, in the maze, navigating the dungeon, through the labyrinth.
        }
    }

    const commonTrapCount = Math.floor(2 + Math.random() * 2); // 2-4 traps, pixelated and perilous, in the maze, navigating the dungeon.
    for (let i = 0; i < commonTrapCount; i++) {
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || enemies.some(e => e.x === x && e.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        map[y][x] = { ...map[y][x], char: '^', trapType: 'spike', damage: Math.floor(1 + level / 2) }; // Spike trap, pixelated and deadly, twisting in the maze, guiding the labyrinth, through the dungeon.
    }

    if (Math.random() < 0.1) { // 10% chance for a rare trap, pixelated and perilous, in the maze, navigating the dungeon.
        do {
            x = Math.floor(Math.random() * (WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (HEIGHT - 2)) + 1;
        } while (map[y][x].char !== '.' || commonItems.some(item => item.x === x && item.y === y) || enemies.some(e => e.x === x && e.y === y) || (x === goalX && y === goalY) || (x === 1 && y === 1));
        map[y][x] = { ...map[y][x], char: '^', trapType: 'hidden_pit', damage: 10, hidden: true }; // Hidden pit trap, pixelated and deadly, in the maze, guiding the labyrinth, through the dungeon.
    }

    return { map, enemies, items }; // Return the cursed maze, rich with rooms, doors, traps, and purpose, guiding the dungeon’s depths, through the labyrinth.
}

function generateGame(floors = 10, difficultyMultiplier = 1) { // Build the labyrinth, floor by floor, with narrative-driven goals, through the maze, guiding the dungeon.
    initGame(); // Light the torch for the hero’s descent, navigating the maze, through the labyrinth.
    FLOORS = []; // Clear the ancient map, ready for new depths, twisting in the maze, guiding the dungeon.
    for (let i = 1; i <= floors; i++) { // Carve each level in pixelated stone, maze-like and perilous, in the labyrinth, navigating the dungeon.
        FLOORS.push(generateLevel(i, difficultyMultiplier)); // Summon a new floor, darker and deadlier, with known purpose, through the maze, guiding the labyrinth.
    }
    mapLayout = FLOORS[player.currentFloor].map; // Set the current cavern, shrouded in shadow, twisting in the maze, through the dungeon.
    enemies = FLOORS[player.currentFloor].enemies; // Unleash the lurking foes, visible only in the maze’s light, navigating the labyrinth, guiding the dungeon.
    items = FLOORS[player.currentFloor].items; // Scatter the glowing treasures, revealed by the torch, in the maze, through the labyrinth, guiding the dungeon.
    updateVisibility(); // Light the hero’s path with a 3-tile radius torch, showing the goal’s glow, in the maze’s light, navigating the dungeon.
    updateStatusBar(); // Etch the quest in pixelated runes, guiding the maze, through the labyrinth.
    draw(); // Render the flickering dungeon in pixelated glory, maze-like and perilous, in the maze, navigating the dungeon.
    if (debugMode) console.log(`Game generated: ${floors} floors - the abyss awaits, whispering of ${player.currentGoal} in the maze, through the dungeon...`);
}

function movePlayer(dx, dy) { // The hero steps forward, torch flickering in the maze’s dark, navigating peril, through the labyrinth.
    const newX = player.x + dx * player.speed; // Move through the pixelated shadows, twisting in the maze, guiding the dungeon.
    const newY = player.y + dy * player.speed; // Navigate the cursed ground, maze-like and perilous, in the labyrinth, navigating the maze.
    const tile = mapLayout[newY][newX];
    if (newX < 0 || newX >= WIDTH || newY < 0 || newY >= HEIGHT || tile.char === '#') return; // Stay within the cavern’s bounds, guiding the maze, through the dungeon.

    // Handle doors - unlock with keys, flickering with pixelated magic, through the maze, guiding the dungeon.
    if ((tile.char === '+' || tile.char === 'L' || tile.char === 'S') && tile.locked) {
        const keyName = tile.keyRequired;
        const key = inventory.find(item => item.name === keyName);
        if (!key) {
            if (debugMode) console.log(`Locked ${tile.char === 'S' ? 'secret' : tile.char === 'L' ? 'rare' : ''} door in the maze! Need a ${keyName} - the path remains dark, through the labyrinth...`);
            return;
        }
        inventory = inventory.filter(item => item !== key); // Use the key, vanishing in the maze’s light, guiding the dungeon.
        tile.locked = false; // Unlock the door, pixelated and open, in the maze, through the labyrinth, navigating the dungeon.
        tile.char = '.'; // Open the path, glowing faintly, in the maze, guiding the labyrinth.
        if (debugMode) console.log(`Unlocked ${tile.char === 'S' ? 'secret' : tile.char === 'L' ? 'rare' : ''} door with ${keyName} in the maze - the way opens, flickering in the torchlight, through the dungeon...`);
    }

    // Handle traps - trigger peril in the maze’s shadows, revealed in the light, guiding the dungeon, through the labyrinth.
    if (tile.char === '^') {
        const damage = tile.damage || 5; // Default spike damage, pixelated and deadly, in the maze, navigating the dungeon, through the labyrinth.
        player.hp = Math.max(0, player.hp - damage); // Take damage, flickering with pain, in the maze’s dark, guiding the dungeon.
        if (debugMode) console.log(`Triggered ${tile.trapType || 'unknown'} trap in the maze! -${damage} HP, the shadows strike, through the labyrinth...`);
        if (player.hp <= 0) {
            if (debugMode) console.log('Hero defeated by trap in the maze! - The dungeon claims another soul, pixelated and cursed, through the labyrinth...');
            return; // Game over, shrouded in the maze’s darkness, navigating the dungeon.
        }
    }

    player.x = newX; // Step into the light or shadow, twisting in the maze, guiding the dungeon, through the labyrinth.
    player.y = newY; // Tread the dungeon’s floor, pixel by pixel, in the maze, navigating the labyrinth, through the dungeon.
    pickupItem(); // Grab any glowing relics in the maze’s torchlight, guiding the dungeon, through the labyrinth.
    updateEnemies(); // Guide the pixelated shadows, simple and cunning, toward the hero, in the maze’s light, navigating the dungeon.
    if (mapLayout[newY][newX].char === '>') changeFloor(); // Ascend or descend the stair’s curse, navigating the maze, through the labyrinth, guiding the dungeon.
    updateVisibility(); // Recast the torch’s glow, 3 tiles wide, revealing foes and treasures, in the maze’s light, through the labyrinth, navigating the dungeon.
    draw(); // Redraw the flickering scene, preserving pixelated transparency, maze-like and perilous, in the maze, guiding the dungeon, through the labyrinth.
    if (debugMode) console.log(`Player moved to (${newX}, ${newY}) - deeper into the maze’s abyss, seeking ${player.currentGoal}, through the dungeon...`);
}

function changeFloor() { // Descend or ascend the cursed stairs, flickering with danger, toward the next goal, through the maze, guiding the dungeon, through the labyrinth.
    player.currentFloor++; // Step to the next level, darker and deadlier, in the maze, navigating the dungeon, through the labyrinth.
    if (player.currentFloor >= FLOORS.length) { // If the abyss ends, victory shines, in the maze, through the dungeon, guiding the labyrinth.
        if (debugMode) console.log('Game won! - The hero emerges, bathed in pixelated light, quest fulfilled in the maze, through the dungeon...');
        return;
    }
    mapLayout = FLOORS[player.currentFloor].map; // Enter the new cavern, shrouded in shadow, twisting in the maze, through the dungeon, guiding the labyrinth.
    enemies = FLOORS[player.currentFloor].enemies; // Face new shadows in the depths, seen only in the maze’s light, navigating the dungeon, through the labyrinth.
    items = FLOORS[player.currentFloor].items; // Seek new treasures, glowing with transparency in the maze’s torch’s reach, through the dungeon, guiding the labyrinth.
    player.x = 1; // Start anew at the entrance, torch in hand, navigating the maze, through the dungeon, guiding the labyrinth.
    player.y = 1; // Begin the descent, pixelated and perilous, in the maze’s depths, through the dungeon, navigating the labyrinth.
    player.currentGoal = randomChoice(['stairs', 'artifact', 'boss']); // Set a new known goal, flickering with narrative, in the maze, through the dungeon, guiding the labyrinth.
    updateVisibility(); // Light the path with a 3-tile radius glow, showing the quest’s glow, in the maze’s light, through the dungeon, navigating the labyrinth.
    updateStatusBar(); // Etch the new quest in pixelated runes, guiding the maze, through the dungeon, through the labyrinth.
    draw(); // Render the new floor, flickering in the maze’s dark, with purpose and peril, in the maze, through the dungeon, navigating the labyrinth.
    if (debugMode) console.log(`Moved to floor ${player.currentFloor + 1} - the maze’s shadows deepen, whispering of ${player.currentGoal}, through the dungeon, navigating the labyrinth...`);
}

function updateVisibility() { // Cast the torch’s light, illuminating a 3-tile radius in the maze’s dark, revealing foes, treasures, doors, and traps, through the dungeon, guiding the labyrinth.
    const radius = config.visionRadius || 3; // The sacred glow, adjustable in the maze’s settings, piercing the shadows, in the dungeon, through the labyrinth.
    for (let y = 0; y < HEIGHT; y++) { // Sweep the maze, resetting the darkness, twisting in the labyrinth, through the dungeon.
        for (let x = 0; x < WIDTH; x++) {
            mapLayout[y][x].visible = false; // Quench the light, leaving only the past, in the maze’s dark, guiding the dungeon, through the labyrinth.
        }
    }
    for (let dy = -radius; dy <= radius; dy++) { // Kindle the torch, lighting the hero’s path in a pixelated circle, revealing secrets, in the maze, through the dungeon, guiding the labyrinth.
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radius * radius) { // Draw a circular glow, adjustable in size, in the maze’s light, through the dungeon, guiding the labyrinth.
                const x = player.x + dx; // Extend the light left and right, navigating the maze, in the dungeon, through the labyrinth.
                const y = player.y + dy; // Stretch the glow up and down, piercing the maze’s shadows, in the dungeon, through the labyrinth, guiding the maze.
                if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) { // Stay within the cavern’s bounds, in the maze, through the dungeon, navigating the labyrinth.
                    mapLayout[y][x].discovered = true; // Mark the stone as seen, etched in memory, in the maze, through the dungeon, guiding the labyrinth.
                    mapLayout[y][x].visible = true;     // Kindle the current light, flickering brightly, in the maze’s light, through the dungeon, navigating the labyrinth.
                }
            }
        }
    }
}

function updateEnemies() { // Guide the pixelated shadows, simple and cunning, within the maze’s torch’s reach, twisting in the labyrinth, through the dungeon.
    const lightRadius = config.visionRadius || 3; // The sacred glow, adjustable, revealing foes in the maze, through the dungeon, guiding the labyrinth.
    for (let enemy of enemies) {
        const dx = enemy.x - player.x; // Measure the distance to the hero, flickering in the maze’s dark, through the dungeon, navigating the labyrinth.
        const dy = enemy.y - player.y; // Track the shadow’s path, pixel by pixel, in the maze, through the dungeon, guiding the labyrinth.
        const distance = Math.sqrt(dx * dx + dy * dy); // Calculate the torch’s reach to the foe, in the maze’s light, through the dungeon, navigating the labyrinth.

        if (distance <= lightRadius) { // If the foe lurks in the maze’s light, through the dungeon...
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) { // Adjacent, pixelated and fierce, in the maze, through the dungeon.
                const damage = Math.max(1, enemy.strength - player.defense); // Strike, dimming the hero’s light, in the maze, through the labyrinth, navigating the dungeon.
                player.hp = Math.max(0, player.hp - damage); // Deal damage, flickering with pain, in the maze’s dark, through the dungeon, guiding the labyrinth.
                if (debugMode) console.log(`Enemy attacks in the maze! -${damage} HP, the shadow strikes in the abyss, through the dungeon...`);
                if (player.hp <= 0) {
                    if (debugMode) console.log('Hero defeated by enemy in the maze! - The dungeon claims another soul, pixelated and cursed, through the labyrinth...');
                    return; // Game over, shrouded in the maze’s darkness, navigating the dungeon.
                }
            } else { // Chase the hero, simple and relentless, through the pixelated maze, twisting in the labyrinth, through the dungeon.
                const moves = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Possible moves, flickering with fate, in the maze, through the dungeon, guiding the labyrinth.
                let bestMove = null, minDist = distance;
                for (let [mx, my] of moves) {
                    const nx = enemy.x + mx, ny = enemy.y + my;
                    if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && mapLayout[ny][nx].char !== '#') { // Avoid walls, stone-cold and unyielding, in the maze, through the dungeon, navigating the labyrinth.
                        const newDist = Math.sqrt((nx - player.x) * (nx - player.x) + (ny - player.y) * (ny - player.y));
                        if (newDist < minDist) {
                            minDist = newDist; // Find the shortest path, pixelated and cunning, in the maze, through the dungeon, guiding the labyrinth.
                            bestMove = [mx, my]; // Mark the move, glowing with intent, in the maze, through the dungeon, navigating the labyrinth.
                        }
                    }
                }
                if (bestMove) {
                    enemy.x += bestMove[0]; // Step toward the hero, flickering in pursuit, in the maze, through the dungeon, guiding the labyrinth.
                    enemy.y += bestMove[1]; // Move through the shadows, pixel by pixel, in the maze, through the dungeon, navigating the labyrinth.
                }
            }
        } else {
            // Patrol randomly when out of sight, lurking in the maze’s dark, pixelated and silent, guiding the dungeon, through the labyrinth.
            const moves = shuffle([[0, 1], [0, -1], [1, 0], [-1, 0]]);
            for (let [mx, my] of moves) {
                const nx = enemy.x + mx, ny = enemy.y + my;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && mapLayout[ny][nx].char !== '#') {
                    enemy.x = nx;
                    enemy.y = ny;
                    break;
                }
            }
        }
    }
}

function pickupItem() { // Grasp a glowing relic, shimmering with pixelated transparency in the maze’s torchlight, within the light’s reach, through the dungeon, guiding the labyrinth.
    const itemIndex = items.findIndex(item => item.x === player.x && item.y === player.y); // Search the maze’s light for treasures, in the dungeon, through the labyrinth.
    if (itemIndex !== -1 && inventory.length < 8) { // If a relic lies in the glow and the bag isn’t full, in the maze, through the dungeon...
        inventory.push(items[itemIndex]); // Hoard the cursed prize, glowing with alpha, in the maze, through the dungeon, navigating the labyrinth.
        items.splice(itemIndex, 1); // Vanish the relic from the floor, pixel by pixel, in the maze, through the dungeon, guiding the labyrinth.
        mapLayout[player.y][player.x].item = false; // Clear the spot, dark and empty, in the maze, through the dungeon, navigating the labyrinth.
        if (debugMode) console.log(`Picked up ${inventory[inventory.length - 1].name} - a flickering prize in the maze’s abyss, through the dungeon...`);
        updateGearWindow(); // Update the hero’s gear, etched in pixelated stone, in the maze, through the dungeon, guiding the labyrinth.
    } else if (inventory.length >= 8) {
        if (debugMode) console.log('Inventory full in the maze! - The bag overflows with cursed relics, twisting through the labyrinth, through the dungeon...');
    }
}

function draw() { // Render the maze, layer by layer, as torchlight flickers in the pixelated dark, perilous and twisting, through the dungeon, guiding the labyrinth.
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Wipe the canvas, ready for the maze’s next scene, in the dungeon, through the labyrinth, guiding the maze.

    // Draw base map (background) for discovered tiles, at half albedo, preserving pixelated transparency, in the maze, through the dungeon.
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const tile = mapLayout[y][x];
            if (tile.discovered) { // Only light the seen stones, ghostly and pixelated, dimmed by the maze’s shadow, through the dungeon, guiding the labyrinth.
                let image = tileImages.floor; // Default to the cavern floor, etched in dim stone, in the maze, through the dungeon, navigating the labyrinth.
                if (tile.char === '#') image = tileImages.wall; // Solid walls, half-lit in the maze’s gloom, in the dungeon, guiding the maze.
                else if (tile.char === '.') image = tileImages[tile.floorType === 'bonus' ? 'floor_dirt' : 'floor']; // Open ground, faintly glowing, in the maze’s dark, through the labyrinth.
                ctx.globalCompositeOperation = 'source-over'; // Blend with the past, preserving alpha, in the maze, through the dungeon, guiding the labyrinth.
                ctx.globalAlpha = 0.5; // Half albedo for the base, shrouded in the maze’s shadow, in the dungeon, through the labyrinth, navigating the maze.
                ctx.drawImage(image, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw, keeping the pixelated transparency intact, in the maze’s light, through the dungeon, guiding the labyrinth.
            }
        }
    }

    // Apply illumination to the vision radius around the player, flickering with torchlight, in the maze, through the dungeon, guiding the labyrinth.
    const lightRadius = config.visionRadius || 3; // The sacred glow, adjustable, piercing the maze’s dark, in the dungeon, through the labyrinth.
    for (let dy = -lightRadius; dy <= lightRadius; dy++) {
        for (let dx = -lightRadius; dx <= lightRadius; dx++) {
            if (dx * dx + dy * dy <= lightRadius * lightRadius) { // Cast a circular light, adjustable in size, in the maze’s light, through the dungeon, guiding the labyrinth.
                const x = player.x + dx; // Extend the torch left and right, revealing the maze, in the dungeon, through the labyrinth.
                const y = player.y + dy; // Stretch the glow up and down, piercing the shadows, in the dungeon, through the labyrinth, guiding the maze.
                if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && mapLayout[y][x].discovered) { // Stay within bounds, lighting only seen ground, in the maze, through the dungeon, navigating the labyrinth.
                    let image = tileImages.floor; // Default to the cavern floor, pixelated and glowing, in the maze, through the dungeon, guiding the labyrinth.
                    if (mapLayout[y][x].char === '#') image = tileImages.wall; // Solid walls, dimly lit, in the maze’s dark, through the dungeon, navigating the maze.
                    else if (mapLayout[y][x].char === '.') image = tileImages[mapLayout[y][x].floorType === 'bonus' ? 'floor_dirt' : 'floor']; // Open ground, flickering brightly, in the maze’s light, through the labyrinth.
                    const distance = Math.sqrt(dx * dx + dy * dy); // Measure the torch’s reach, twisting in the maze, through the dungeon, navigating the labyrinth.
                    ctx.globalAlpha = distance <= lightRadius ? 1.0 : 0.5; // Full brightness inside, dim at the edge, preserving alpha, in the maze, through the dungeon, guiding the labyrinth.
                    ctx.globalCompositeOperation = 'source-over'; // Blend with the past, keeping transparency intact, in the maze, through the dungeon, navigating the labyrinth.
                    ctx.drawImage(image, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw the illuminated stone, pixel by pixel, with ghostly transparency, in the maze’s light, through the dungeon, guiding the labyrinth.
                }
            }
        }
    }
    ctx.globalAlpha = 1.0; // Reset the torch’s flicker, ready for the next layer, in the maze, through the dungeon, guiding the labyrinth.

    // Draw dynamic objects (player, enemies, items, doors, traps) within the visible radius, glowing with pixelated transparency, in the maze, through the dungeon, guiding the labyrinth.
    for (let dy = -lightRadius; dy <= lightRadius; dy++) {
        for (let dx = -lightRadius; dx <= lightRadius; dx++) {
            if (dx * dx + dy * dy <= lightRadius * lightRadius) { // Limit to the vision radius, revealing the maze’s secrets, in the dungeon, through the labyrinth, guiding the maze.
                const x = player.x + dx; // Extend the light left and right, revealing foes, treasures, and perils, in the maze, through the dungeon, navigating the labyrinth.
                const y = player.y + dy; // Stretch the glow up and down, piercing the maze’s shadows, in the dungeon, through the labyrinth, guiding the maze.
                if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && mapLayout[y][x].discovered) { // Stay within bounds, lighting only seen ground, in the maze, through the dungeon, navigating the labyrinth.
                    // Draw player - the hero, pixelated and bold, torch in hand, if within the maze’s light, through the dungeon, guiding the labyrinth.
                    if (player.x === x && player.y === y) {
                        ctx.globalCompositeOperation = 'source-over'; // Blend with the stone, preserving alpha, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.globalAlpha = 1.0; // Full brightness for the hero’s glow, in the maze, through the dungeon, guiding the labyrinth.
                        ctx.drawImage(tileImages.player, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw, keeping the pixelated transparency intact, in the maze’s light, through the dungeon, navigating the labyrinth.
                    }
                    // Draw enemies - shadowy foes, lurking only in the maze’s torch’s reach, pixelated and fierce, in the dungeon, through the labyrinth, guiding the maze.
                    const enemy = enemies.find(e => e.x === x && e.y === y);
                    if (enemy) {
                        ctx.globalCompositeOperation = 'source-over'; // Blend with the shadows, preserving alpha, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.globalAlpha = 1.0; // Full brightness for the pixelated monsters, visible in the maze’s light, through the dungeon, guiding the labyrinth.
                        ctx.drawImage(tileImages.enemy, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw, keeping their ghostly transparency, in the maze, through the dungeon, navigating the labyrinth.
                    }
                    // Draw items - cursed relics, shimmering with transparency only in the maze’s torch’s glow, in the dungeon, through the labyrinth, guiding the maze.
                    if (mapLayout[y][x].item && items.some(item => item.x === x && item.y === y)) {
                        const item = items.find(i => i.x === x && i.y === y);
                        const itemImage = tileImages[item.name.toLowerCase().replace(' ', '_')] || tileImages.floor; // Fallback to floor if image missing.
                        ctx.globalCompositeOperation = 'source-over'; // Blend with the stone, preserving transparency, in the maze, through the dungeon, guiding the labyrinth.
                        ctx.globalAlpha = 1.0; // Full brightness for the treasure’s glow, keeping alpha intact, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.drawImage(itemImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw the relic, pixel by pixel, with transparency preserved, in the maze’s light, through the dungeon, guiding the labyrinth.
                    }
                    // Draw doors - pixelated barriers, blocking or hiding paths in the maze’s light, in the dungeon, through the labyrinth, guiding the maze.
                    if (mapLayout[y][x].char === '+' || mapLayout[y][x].char === 'L' || mapLayout[y][x].char === 'S') {
                        let doorImage = tileImages.door; // Default door, pixelated and locked, in the maze, through the dungeon, navigating the labyrinth.
                        if (mapLayout[y][x].char === 'L') doorImage = tileImages.locked_door; // Rare locked door, glowing with peril, in the maze, through the dungeon, guiding the labyrinth.
                        else if (mapLayout[y][x].char === 'S') doorImage = tileImages.secret_door; // Secret door, pixelated and elusive, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.globalCompositeOperation = 'source-over'; // Blend with the stone, preserving alpha, in the maze, through the dungeon, guiding the labyrinth.
                        ctx.globalAlpha = 1.0; // Full brightness for the door’s glow, keeping transparency, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.drawImage(doorImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw the barrier, pixel by pixel, with transparency intact, in the maze’s light, through the dungeon, guiding the labyrinth.
                    }
                    // Draw traps - perilous shadows, revealed only in the maze’s torch’s reach, pixelated and deadly, in the dungeon, through the labyrinth, guiding the maze.
                    if (mapLayout[y][x].char === '^') {
                        let trapImage = tileImages.trap; // Default trap, pixelated and lurking, in the maze, through the dungeon, navigating the labyrinth.
                        if (mapLayout[y][x].trapType === 'hidden_pit') trapImage = tileImages.hidden_trap; // Rare trap, pixelated and hidden, in the maze, through the dungeon, guiding the labyrinth.
                        ctx.globalCompositeOperation = 'source-over'; // Blend with the stone, preserving alpha, in the maze, through the dungeon, navigating the labyrinth.
                        ctx.globalAlpha = 1.0; // Full brightness for the trap’s glow, keeping transparency, in the maze, through the dungeon, guiding the labyrinth.
                        ctx.drawImage(trapImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw the peril, pixel by pixel, with transparency preserved, in the maze’s light, through the dungeon, guiding the labyrinth.
                    }
                }
            }
        }
    }

    // Draw fog of war overlay, shrouding the uncharted dark, preserving pixelated transparency, in the maze, through the dungeon, guiding the labyrinth.
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (!mapLayout[y][x].discovered) { // Veil the unseen depths in black, hiding foes and treasures, in the maze’s shadow, through the dungeon, navigating the labyrinth.
                ctx.globalCompositeOperation = 'source-over'; // Blend with the seen, preserving alpha, in the maze, through the dungeon, guiding the labyrinth.
                ctx.globalAlpha = 1.0; // Full opacity for the fog’s curse, in the maze, through the dungeon, navigating the labyrinth.
                ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Opaque black, shrouding the maze’s abyss, in the dungeon, through the labyrinth, guiding the maze.
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Cover the dark, pixel by pixel, in the maze’s light, through the dungeon, navigating the labyrinth.
            }
        }
    }
    ctx.globalAlpha = 1.0; // Reset the torch’s flicker, ready for the next step, in the maze, through the dungeon, guiding the labyrinth.
    ctx.globalCompositeOperation = 'source-over'; // Reset blending, keeping the maze’s transparency intact, in the dungeon, through the labyrinth, navigating the maze.
    updateStatusBar(); // Etch the hero’s stats and quest in pixelated runes at the cavern’s edge, guiding the maze, through the dungeon, through the labyrinth.
}

function gameLoop(currentTime) { // The eternal loop of the dungeon, flickering with pixelated life, maze-like and perilous, in the maze, through the labyrinth, guiding the dungeon.
    const deltaTime = (currentTime - lastTime) / 1000; // Measure the torch’s tick in the maze’s shadows, in the dungeon, through the labyrinth, navigating the maze.
    lastTime = currentTime; // Mark the passage of time in the maze’s dark, twisting in the labyrinth, through the dungeon, guiding the maze.
    draw(); // Render the flickering scene, preserving the pixelated curse, in the maze, through the dungeon, navigating the labyrinth.
    requestAnimationFrame(gameLoop); // Keep the torch burning, frame by frame, guiding through the maze’s twists, in the dungeon, through the labyrinth.
}

// UI Functions
function showConfigPage() { // Open the ancient tome of settings, glowing with pixelated runes, guiding the maze’s curse, in the dungeon, through the labyrinth.
    const configPage = document.getElementById('config-page');
    if (!configPage) return console.error('Config page not found - the tome is lost in the maze’s abyss, through the dungeon...');
    configPage.classList.remove('hidden'); // Reveal the cursed options, flickering in the maze’s light, in the dungeon, through the labyrinth, navigating the maze.
    updateConfigUI(); // Update the rune-carved settings, etched in stone, in the maze, through the dungeon, guiding the labyrinth.

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => { // Flip the pages, revealing secrets in the maze’s dark, in the dungeon, through the labyrinth, navigating the maze.
            document.querySelector('.tab-button.active')?.classList.remove('active'); // Dim the old rune, in the maze, through the dungeon, guiding the labyrinth.
            document.querySelector('.tab-content.active')?.classList.remove('active'); // Hide the old text, in the maze, through the dungeon, navigating the labyrinth.
            button.classList.add('active'); // Light the new rune, glowing green, in the maze’s light, through the dungeon, guiding the labyrinth.
            document.getElementById(button.dataset.tab + '-tab')?.classList.add('active'); // Reveal the new text, pixelated and bright, in the maze, through the dungeon, navigating the labyrinth.
            updateTabContent(button.dataset.tab); // Update the flickering scroll, etched in the maze’s dark, in the dungeon, through the labyrinth, guiding the maze.
        });
    });

    document.getElementById('add-monster')?.addEventListener('click', () => alert('Add New Monster not implemented yet - the shadows stir, but remain unseen in the maze, through the dungeon...'));
    document.getElementById('add-spell')?.addEventListener('click', () => alert('Add New Spell not implemented yet - the magic hums, but stays silent in the maze’s labyrinth, through the dungeon...'));
    document.getElementById('close-config')?.addEventListener('click', hideConfigPage); // Close the tome, shrouding its secrets in the maze’s shadow, in the dungeon, through the labyrinth, navigating the maze.
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideConfigPage(); }, { once: true }); // Escape the tome’s curse with a keypress, navigating the maze’s depths, in the dungeon, through the labyrinth.
}

function updateConfigUI() { // Etch the settings in glowing runes, flickering with pixelated light, guiding the maze’s curse, in the dungeon, through the labyrinth.
    const floorsInput = document.getElementById('config-floors');
    const difficultyInput = document.getElementById('config-difficulty-loot');
    const difficultyValue = document.getElementById('config-difficulty-loot-value');
    const debugInput = document.getElementById('config-debug');
    const visionInput = document.getElementById('config-vision-radius');
    if (!floorsInput || !difficultyInput || !difficultyValue || !debugInput || !visionInput) return console.error('Config inputs missing - the runes fade in the maze’s dark, in the dungeon, through the labyrinth...');

    floorsInput.value = config.floors; // Set the depth of the dungeon, carved in stone, twisting in the maze’s labyrinth, in the dungeon, through the labyrinth.
    difficultyInput.value = config.difficultyLoot; // Adjust the curse’s weight, flickering in the maze’s light, in the dungeon, through the labyrinth, navigating the maze.
    difficultyValue.textContent = config.difficultyLoot <= 33 ? 'Easy/Scarce' : config.difficultyLoot <= 66 ? 'Normal/Balanced' : 'Hard/Abundant'; // Describe the loot’s glow, pixelated and bright in the maze’s depths, in the dungeon, through the labyrinth, guiding the maze.
    debugInput.checked = config.debugMode; // Toggle the arcane runes of debugging, glowing faintly in the maze, in the dungeon, through the labyrinth, navigating the maze.
    visionInput.value = config.visionRadius; // Set the torch’s reach, adjustable in the maze’s settings, in the dungeon, through the labyrinth, guiding the maze.

    difficultyInput.addEventListener('input', (e) => { // Slide the rune, shifting the maze’s curse’s balance, in the dungeon, through the labyrinth, navigating the maze.
        const value = parseInt(e.target.value); // Read the flickering number, etched in stone, in the maze, through the dungeon, guiding the labyrinth.
        difficultyValue.textContent = value <= 33 ? 'Easy/Scarce' : value <= 66 ? 'Normal/Balanced' : 'Hard/Abundant'; // Update the glow, pixelated and vivid in the maze’s labyrinth, in the dungeon, through the labyrinth, guiding the maze.
    });
}

function saveConfig() { // Seal the settings in the dungeon’s stone, glowing with pixelated magic, guiding the maze, in the dungeon, through the labyrinth.
    const floorsInput = document.getElementById('config-floors');
    const difficultyInput = document.getElementById('config-difficulty-loot');
    const debugInput = document.getElementById('config-debug');
    const visionInput = document.getElementById('config-vision-radius');
    config.floors = parseInt(floorsInput.value) || 10; // Carve the floor count, eternal in the dark, twisting in the maze’s labyrinth, in the dungeon, through the labyrinth.
    config.difficultyLoot = parseInt(difficultyInput.value) || 50; // Balance the curse, flickering brightly in the maze, in the dungeon, through the labyrinth, navigating the maze.
    config.debugMode = debugInput.checked; // Toggle the debug runes, glowing faintly in the maze’s depths, in the dungeon, through the labyrinth, guiding the maze.
    config.visionRadius = parseInt(visionInput.value) || 3; // Fix the torch’s reach, adjustable in the maze’s settings, in the dungeon, through the labyrinth, navigating the maze.
    debugMode = config.debugMode; // Light the debug path, pixelated and clear in the maze, in the dungeon, through the labyrinth, guiding the maze.
    if (document.getElementById('config-save-default')?.checked) { // Etch the settings as default, preserved in stone, in the maze, through the dungeon, guiding the labyrinth.
        localStorage.setItem('defaultConfig', JSON.stringify(config)); // Seal the curse in memory, flickering with purpose, in the maze’s light, through the dungeon, navigating the labyrinth.
    }
    document.getElementById('floor-count').value = config.floors; // Update the rune-carved floor count, pixelated in the maze’s depths, in the dungeon, through the labyrinth, guiding the maze.
    document.getElementById('difficulty-loot').value = config.difficultyLoot; // Adjust the loot’s glow, pixelated and bright in the maze’s labyrinth, in the dungeon, through the labyrinth, navigating the maze.
    hideConfigPage(); // Close the tome, shrouding the settings in the maze’s shadow, in the dungeon, through the labyrinth, guiding the maze.
}

function hideConfigPage() { // Veil the settings, returning to the dungeon’s dark, maze-like depths, in the maze, through the labyrinth, guiding the dungeon.
    document.getElementById('config-page')?.classList.add('hidden'); // Hide the glowing runes, pixelated and silent in the maze’s labyrinth, in the dungeon, through the labyrinth, navigating the maze.
    showStartMenu(); // Reveal the starting screen, flickering in the light, ready for the maze’s twists, in the dungeon, through the labyrinth, guiding the maze.
}

function updateTabContent(tab) { // Flip the pages of the tome, etching new secrets in the maze’s dark, in the dungeon, through the labyrinth, guiding the maze.
    if (debugMode) console.log(`Updating tab content: ${tab} - the runes shift, glowing with pixelated magic in the maze’s labyrinth, through the dungeon...`);
}

function showGearWindow() { // Open the hero’s bag, shimmering with pixelated relics in the maze’s torchlight, within the labyrinth’s reach, in the dungeon, guiding the maze.
    const gearWindow = document.getElementById('gear-window');
    if (!gearWindow) return console.error('Gear window not found - the bag is lost in the maze’s abyss, in the dungeon, through the labyrinth...');
    gearWindow.classList.remove('hidden'); // Reveal the cursed gear, glowing with transparency in the maze’s light, in the dungeon, through the labyrinth, navigating the maze.
    updateGearWindow(); // Refresh the flickering inventory, etched in stone, in the maze, through the dungeon, guiding the labyrinth.
}

function hideGearWindow() { // Close the hero’s bag, shrouding the relics in the maze’s shadow, in the dungeon, through the labyrinth, guiding the maze.
    document.getElementById('gear-window')?.classList.add('hidden'); // Veil the glowing treasures, pixelated and silent in the maze’s depths, in the dungeon, through the labyrinth, navigating the maze.
}

function updateGearWindow() { // Etch the hero’s gear in pixelated runes, flickering with transparency, navigating the maze’s depths, in the dungeon, through the labyrinth, guiding the maze.
    const equippedSlots = document.getElementById('equipped-slots');
    const bagList = document.getElementById('bag-list');
    const gearHp = document.getElementById('gear-hp');
    const gearStr = document.getElementById('gear-str');
    const gearDef = document.getElementById('gear-def');
    const gearSpd = document.getElementById('gear-spd');
    const gearLevel = document.getElementById('gear-level');
    if (!equippedSlots || !bagList || !gearHp || !gearStr || !gearDef || !gearSpd || !gearLevel) return console.error('Gear window elements missing - the runes fade in the maze’s dark, in the dungeon, through the labyrinth...');

    equippedSlots.innerHTML = inventory.filter(i => i.equipped).map(i => `<div>${i.name}</div>`).join('') || '<p>No items equipped yet - the bag lies empty, pixelated and silent in the maze’s labyrinth, in the dungeon, through the labyrinth...</p>';
    bagList.innerHTML = inventory.filter(i => !i.equipped).map(item => `<div>${item.name} (${item.stats[item.type === 'weapon' ? 'damage' : 'defense']}) <button onclick="equipItem('${item.id}')">Equip</button></div>`).join('') || '<p>Bag empty - no relics glow in the maze’s shadows, in the dungeon, through the labyrinth...</p>';
    gearHp.textContent = `${player.hp}/${player.max_hp}`; // Etch the hero’s life, flickering in the maze’s light, in the dungeon, through the labyrinth, guiding the maze.
    gearStr.textContent = player.strength; // Carve the strength, pixelated and bold, in the maze’s depths, in the dungeon, through the labyrinth, navigating the maze.
    gearDef.textContent = player.defense; // Mark the defense, glowing faintly in the maze, in the dungeon, through the labyrinth, guiding the maze.
    gearSpd.textContent = player.speed; // Note the speed, etched in the maze’s dark, in the dungeon, through the labyrinth, navigating the maze.
    gearLevel.textContent = player.level; // Record the level, shining with progress, in the maze’s abyss, in the dungeon, through the labyrinth, guiding the maze.
}

function equipItem(itemId) { // Wield a cursed relic, glowing with pixelated transparency in the maze’s torchlight, within the labyrinth’s reach, in the dungeon, guiding the maze.
    const item = inventory.find(i => i.id === itemId); // Search the bag for the relic’s glow, flickering in the maze’s depths, in the dungeon, through the labyrinth.
    if (item && !item.equipped) { // If the treasure lies unclaimed in the maze, through the dungeon...
        item.equipped = true; // Don the pixelated armor, shimmering with alpha, in the maze, through the dungeon, navigating the labyrinth, guiding the maze.
        if (item.type === 'weapon') player.strength += item.stats.damage; // Boost the hero’s might, flickering brightly in the maze’s light, in the dungeon, through the labyrinth, guiding the maze.
        else if (item.type === 'body_armor') player.defense += item.stats.defense; // Fortify the hero’s defense, glowing faintly in the maze, in the dungeon, through the labyrinth, navigating the maze.
        if (debugMode) console.log(`Equipped ${item.name} - the relic shines, pixelated and cursed in the maze’s abyss, in the dungeon, through the labyrinth, guiding the maze...`);
        updateGearWindow(); // Refresh the flickering inventory, etched in stone, in the maze, through the dungeon, guiding the labyrinth.
    }
}

function updateStatusBar() { // Etch the hero’s stats and quest in pixelated runes at the cavern’s edge, guiding the maze, through the dungeon, through the labyrinth.
    statusBar.textContent = `HP: ${player.hp}/${player.max_hp} | Str: ${player.strength} | Floor: ${player.currentFloor + 1} | Goal: ${player.currentGoal.charAt(0).toUpperCase() + player.currentGoal.slice(1)}`;
}

function initUI() { // Kindle the interface, glowing with pixelated runes at the dungeon’s edge, guiding the maze’s curse, in the dungeon, through the labyrinth.
    console.log('Initializing UI - the runes glow in the maze’s light...');
    const startButton = document.getElementById('start-game');
    const configButton = document.getElementById('config-button');
    const saveButton = document.getElementById('config-save-game');
    const closeGearButton = document.getElementById('close-gear');
    if (!startButton || !configButton || !saveButton || !closeGearButton) {
        console.error('UI buttons missing - the runes vanish in the maze’s dark, in the dungeon, through the labyrinth...');
        return;
    }

    startButton.addEventListener('click', () => {
        console.log('Start button clicked - the hero steps into the maze’s abyss...');
        const floors = parseInt(document.getElementById('floor-count')?.value) || 10;
        const sliderValue = parseInt(document.getElementById('difficulty-loot')?.value) || 50;
        const difficultyMultiplier = sliderValue <= 33 ? 0.8 : sliderValue <= 66 ? 1 : 1.2;
        generateGame(floors, difficultyMultiplier);
        document.getElementById('start-menu')?.classList.add('hidden');
        requestAnimationFrame(gameLoop);
    });

    configButton.addEventListener('click', () => {
        console.log('Config button clicked - the tome of settings opens in the maze’s light...');
        document.getElementById('start-menu')?.classList.add('hidden');
        showConfigPage();
    });

    saveButton.addEventListener('click', () => {
        console.log('Save settings clicked - the runes are etched in stone...');
        saveConfig();
    });

    closeGearButton.addEventListener('click', () => {
        console.log('Close gear clicked - the bag is veiled in shadow...');
        hideGearWindow();
    });

    document.addEventListener('keydown', (e) => { // The hero moves, torch flickering in the pixelated dark, navigating the maze, in the dungeon, through the labyrinth, guiding the maze.
        switch (e.key) { // Cast the keys, twisting through the maze’s abyss, in the dungeon, through the labyrinth, navigating the maze.
            case 'w': movePlayer(0, -1); break; // Step north, into the flickering light, through the maze’s corridors, in the dungeon, through the labyrinth, guiding the maze.
            case 's': movePlayer(0, 1); break; // Tread south, through the shadowed stone, twisting in the maze, in the dungeon, through the labyrinth, navigating the maze.
            case 'a': movePlayer(-1, 0); break; // Sidestep west, dodging pixelated foes, in the maze’s depths, in the dungeon, through the labyrinth, guiding the maze.
            case 'd': movePlayer(1, 0); break; // Stride east, chasing the torch’s glow, through the maze’s paths, in the dungeon, through the labyrinth, navigating the maze.
            case 'g': showGearWindow(); break; // Open the bag, revealing cursed relics in the light, in the maze, in the dungeon, through the labyrinth, guiding the maze.
            case 'Escape': hideGearWindow(); break; // Close the bag, shrouding the treasures in the maze’s shadow, in the dungeon, through the labyrinth, navigating the maze.
        }
    });
}

function showStartMenu() { // Reveal the starting screen, flickering with pixelated hope in the dark, ready for the maze’s twists, in the dungeon, through the labyrinth, guiding the maze.
    console.log('Showing start menu - the portal glows in the maze’s light...');
    const startMenu = document.getElementById('start-menu');
    if (!startMenu) return console.error('Start menu not found - the portal is lost in the maze’s abyss, in the dungeon, through the labyrinth...');
    startMenu.classList.remove('hidden'); // Light the path, glowing with transparency, in the maze, through the dungeon, guiding the labyrinth, navigating the maze.
    const difficultyInput = document.getElementById('difficulty-loot');
    const difficultyValue = document.getElementById('difficulty-loot-value');
    if (difficultyInput && difficultyValue) { // Adjust the curse’s balance, etched in runes, in the maze, through the dungeon, through the labyrinth, guiding the maze.
        difficultyInput.addEventListener('input', (e) => { // Slide the rune, shifting the maze’s shadows, in the dungeon, through the labyrinth, navigating the maze.
            const value = parseInt(e.target.value); // Read the flickering number, carved in stone, in the maze, through the dungeon, guiding the labyrinth.
            difficultyValue.textContent = value <= 33 ? 'Easy/Scarce' : value <= 66 ? 'Normal/Balanced' : 'Hard/Abundant'; // Update the glow, pixelated and vivid in the maze’s labyrinth, in the dungeon, through the labyrinth, guiding the maze.
        });
    }
}

function loadImages() { // Summon the pixelated glyphs, shimmering with transparency in the maze’s torchlight, in the dungeon, through the labyrinth, guiding the maze.
    return Promise.all(Object.keys(tileImages).map(key => {
        return new Promise((resolve, reject) => {
            tileImages[key].src = imageSources[key]; // Trace the path to the pixelated stone, twisting in the maze, in the dungeon, through the labyrinth, navigating the maze.
            tileImages[key].onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { alpha: true }); // Kindle a canvas, glowing with transparency, in the maze, in the dungeon, through the labyrinth, guiding the maze.
                canvas.width = TILE_SIZE; // Set the sacred size, 32 pixels square, pixelated in the maze, in the dungeon, through the labyrinth, navigating the maze.
                canvas.height = TILE_SIZE; // Match the pixelated grid, etched in stone, twisting in the maze, in the dungeon, through the labyrinth, guiding the maze.
                ctx.drawImage(tileImages[key], 0, 0); // Draw the relic, flickering with alpha, in the maze’s light, in the dungeon, through the labyrinth, navigating the maze.
                const data = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE).data; // Read the pixelated runes, in the maze, in the dungeon, through the labyrinth, guiding the maze.
                let hasAlpha = false; // Check for the ghost’s glow, pixel by pixel, in the maze’s dark, in the dungeon, through the labyrinth, navigating the maze.
                for (let i = 3; i < data.length; i += 4) { // Scan the alpha, flickering in the maze’s shadows, in the dungeon, through the labyrinth, guiding the maze.
                    if (data[i] !== 255) { // If the transparency shines (alpha < 255), the curse is real in the maze, in the dungeon, through the labyrinth, navigating the maze.
                        hasAlpha = true; // Mark the relic as ghostly, pixelated and transparent, in the maze, in the dungeon, through the labyrinth, guiding the maze.
                        break; // Halt the scan, the light is found in the maze, in the dungeon, through the labyrinth, navigating the maze.
                    }
                }
                if (hasAlpha && debugMode) console.log(`Transparency detected in ${imageSources[key]} - the relic shimmers, pixelated and cursed in the maze’s abyss, in the dungeon, through the labyrinth...`);
                resolve(); // The glyph is ready, glowing with alpha, in the maze, in the dungeon, through the labyrinth, guiding the maze.
            };
            tileImages[key].onerror = () => {
                console.warn(`Failed to load ${imageSources[key]} - using fallback. The relic fades, lost to the maze’s shadows...`);
                tileImages[key].src = 'tiles/floor.png'; // Fallback to floor image, ensuring the game continues, in the maze, through the dungeon, navigating the labyrinth.
                resolve(); // Continue even if an image fails, preserving the maze’s integrity, in the dungeon, through the labyrinth, guiding the maze.
            };
            });
        }));
    }
    
    document.addEventListener('DOMContentLoaded', () => { // The maze awakens, pixelated and ready, maze-like and perilous, in the dungeon, through the labyrinth, guiding the maze.
        console.log('DOM loaded - the portal to the abyss opens, flickering in the light, in the maze, in the dungeon, through the labyrinth, guiding the maze...');
        loadImages() // Summon the pixelated relics, glowing with transparency, in the maze, in the dungeon, through the labyrinth, navigating the maze.
            .then(() => { // When the glyphs shine, light the path, in the maze, in the dungeon, through the labyrinth, guiding the maze.
                initUI(); // Kindle the interface, etched in pixelated runes, in the maze, in the dungeon, through the labyrinth, navigating the maze.
                showStartMenu(); // Reveal the starting screen, glowing with hope in the dark, ready for the maze’s twists, in the dungeon, through the labyrinth, guiding the maze.
            })
            .catch(err => console.error('Image loading error:', err + ' - the relics fade, cursed in the maze’s shadows, in the dungeon, through the labyrinth...'));
    });