import { DIRECTIONS, KEYS } from '../utils/Constants.js';

class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(event) {
        const key = event.key;
        this.keys[key] = true;
        
        // Process movement inputs
        if (KEYS.UP.includes(key)) {
            this.game.movePlayer(0, -1);
        } else if (KEYS.DOWN.includes(key)) {
            this.game.movePlayer(0, 1);
        } else if (KEYS.LEFT.includes(key)) {
            this.game.movePlayer(-1, 0);
        } else if (KEYS.RIGHT.includes(key)) {
            this.game.movePlayer(1, 0);
        }
        
        // Process action inputs
        if (KEYS.INVENTORY.includes(key)) {
            this.game.toggleInventory();
        } else if (KEYS.PICKUP.includes(key)) {
            this.game.pickupItem();
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.key] = false;
    }
    
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
}

export default InputHandler;
