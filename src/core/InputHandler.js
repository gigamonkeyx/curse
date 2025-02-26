/**
 * Handles user input for the game
 * Maps keyboard, mouse, and gamepad events to game actions
 * Supports configurable controls and different input contexts
 */
import { INPUT_ACTIONS, DIRECTIONS } from '../utils/Constants.js';

class InputHandler {
    /**
     * Create a new input handler
     * @param {Object} game - Game instance
     * @param {HTMLCanvasElement} canvas - Game canvas
     */
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        
        // Input state
        this.keysDown = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.lastActionTime = {}; // For cooldowns/repeats
        
        // Context determines which key mappings are active
        this.context = 'game'; // 'game', 'inventory', 'menu', etc.
        
        // Key mappings - configurable by player
        this.keyMappings = this.getDefaultKeyMappings();
        
        // Gamepad state
        this.gamepadSupported = navigator.getGamepads !== undefined;
        this.activeGamepad = null;
        this.gamepadState = {};
        
        // Bind event handlers
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleBlur = this.handleBlur.bind(this);
        this.boundHandleGamepadConnected = this.handleGamepadConnected.bind(this);
        this.boundHandleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);
        
        // Register event listeners
        this.registerEventListeners();
    }
    
    /**
     * Get default key mappings
     * @returns {Object} Default key mappings
     */
    getDefaultKeyMappings() {
        return {
            game: {
                // Movement - arrow keys and vi keys
                'ArrowUp':    { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.NORTH },
                'ArrowDown':  { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.SOUTH },
                'ArrowLeft':  { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.WEST },
                'ArrowRight': { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.EAST },
                'k':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.NORTH },
                'j':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.SOUTH },
                'h':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.WEST },
                'l':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.EAST },
                'y':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.NORTHWEST },
                'u':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.NORTHEAST },
                'b':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.SOUTHWEST },
                'n':          { action: INPUT_ACTIONS.MOVE, params: DIRECTIONS.SOUTHEAST },
                
                // Wait
                '.':          { action: INPUT_ACTIONS.WAIT },
                ' ':          { action: INPUT_ACTIONS.WAIT },
                
                // Inventory and interactions
                'i':          { action: INPUT_ACTIONS.INVENTORY },
                'c':          { action: INPUT_ACTIONS.CHARACTER },
                'g':          { action: INPUT_ACTIONS.GET_ITEM },
                '>':          { action: INPUT_ACTIONS.USE_STAIRS },
                'd':          { action: INPUT_ACTIONS.DROP_ITEM },
                
                // Menus and system
                'Escape':     { action: INPUT_ACTIONS.MENU },
                'm':          { action: INPUT_ACTIONS.MAP },
                '?':          { action: INPUT_ACTIONS.HELP },
                'F1':         { action: INPUT_ACTIONS.HELP }
            },
            
            inventory: {
                // Inventory navigation
                'ArrowUp':    { action: INPUT_ACTIONS.NAVIGATE, params: 'up' },
                'ArrowDown':  { action: INPUT_ACTIONS.NAVIGATE, params: 'down' },
                'k':          { action: INPUT_ACTIONS.NAVIGATE, params: 'up' },
                'j':          { action: INPUT_ACTIONS.NAVIGATE, params: 'down' },
                
                // Inventory actions
                'Enter':      { action: INPUT_ACTIONS.SELECT },
                'u':          { action: INPUT_ACTIONS.USE_ITEM },
                'd':          { action: INPUT_ACTIONS.DROP_ITEM },
                'e':          { action: INPUT_ACTIONS.EQUIP_ITEM },
                
                // Exit inventory
                'Escape':     { action: INPUT_ACTIONS.CLOSE },
                'i':          { action: INPUT_ACTIONS.CLOSE }
            },
            
            menu: {
                'ArrowUp':    { action: INPUT_ACTIONS.NAVIGATE, params: 'up' },
                'ArrowDown':  { action: INPUT_ACTIONS.NAVIGATE, params: 'down' },
                'Enter':      { action: INPUT_ACTIONS.SELECT },
                'Escape':     { action: INPUT_ACTIONS.CLOSE }
            }
        };
    }
    
    /**
     * Register all event listeners
     */
    registerEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.boundHandleKeyDown);
        window.addEventListener('keyup', this.boundHandleKeyUp);
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
        this.canvas.addEventListener('click', this.boundHandleClick);
        
        // Window events (clear keys when focus is lost)
        window.addEventListener('blur', this.boundHandleBlur);
        
        // Gamepad events
        if (this.gamepadSupported) {
            window.addEventListener('gamepadconnected', this.boundHandleGamepadConnected);
            window.addEventListener('gamepaddisconnected', this.boundHandleGamepadDisconnected);
        }
    }
    
    /**
     * Remove all event listeners
     */
    removeEventListeners() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        window.removeEventListener('keyup', this.boundHandleKeyUp);
        this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
        this.canvas.removeEventListener('click', this.boundHandleClick);
        window.removeEventListener('blur', this.boundHandleBlur);
        
        if (this.gamepadSupported) {
            window.removeEventListener('gamepadconnected', this.boundHandleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.boundHandleGamepadDisconnected);
        }
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        // Add key to pressed keys
        this.keysDown.add(event.key);
        
        // Look up the action for this key in current context
        const mapping = this.getKeyMapping(event.key);
        if (mapping) {
            // Prevent default browser behavior for game controls
            event.preventDefault();
            
            // Cooldown check for actions that shouldn't repeat too quickly
            const now = Date.now();
            const actionKey = `${mapping.action}-${JSON.stringify(mapping.params || '')}`;
            const lastActionTime = this.lastActionTime[actionKey] || 0;
            const cooldown = this.getActionCooldown(mapping.action);
            
            if (now - lastActionTime >= cooldown) {
                this.lastActionTime[actionKey] = now;
                
                // Emit the action event
                this.game.events.emit('action', {
                    action: mapping.action,
                    params: mapping.params,
                    source: 'keyboard',
                    originalEvent: event
                });
            }
        }
        
        // Always emit raw keypress for custom handlers
        this.game.events.emit('keypress', { key: event.key, originalEvent: event });
    }
    
    /**
     * Handle key up event
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        // Remove key from pressed keys
        this.keysDown.delete(event.key);
        
        // Prevent default for game control keys
        if (this.isGameControlKey(event.key)) {
            event.preventDefault();
        }
        
        // Emit key release event
        this.game.events.emit('keyrelease', { key: event.key, originalEvent: event });
    }
    
    /**
     * Handle window blur event (clear all keys)
     */
    handleBlur() {
        // Clear all pressed keys when window loses focus
        this.keysDown.clear();
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        // Get mouse position relative to canvas with scaling
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mousePosition = {
            x: Math.floor((event.clientX - rect.left) * scaleX),
            y: Math.floor((event.clientY - rect.top) * scaleY)
        };
        
        // Convert to tile coordinates if we have a renderer
        if (this.game.renderer) {
            this.mouseTile = this.game.renderer.screenToTile(
                this.mousePosition.x, 
                this.mousePosition.y
            );
        }
        
        // Emit mouse move event
        this.game.events.emit('mousemove', {
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            tileX: this.mouseTile ? this.mouseTile.x : null,
            tileY: this.mouseTile ? this.mouseTile.y : null,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse click event
     * @param {MouseEvent} event - Mouse event
     */
    handleClick(event) {
        // Get click position relative to canvas with scaling
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const clickPos = {
            x: Math.floor((event.clientX - rect.left) * scaleX),
            y: Math.floor((event.clientY - rect.top) * scaleY)
        };
        
        // Convert to tile coordinates if we have a renderer
        let clickTile = null;
        if (this.game.renderer) {
            clickTile = this.game.renderer.screenToTile(clickPos.x, clickPos.y);
        }
        
        // Let UI handle click first
        if (this.game.ui && this.game.ui.handleClick(clickPos.x, clickPos.y)) {
            return;
        }
        
        // If click wasn't handled by UI, emit action for game logic
        if (clickTile) {
            this.game.events.emit('action', {
                action: INPUT_ACTIONS.CLICK_TILE,
                params: { x: clickTile.x, y: clickTile.y },
                source: 'mouse',
                originalEvent: event
            });
        }
        
        // Also emit raw click event
        this.game.events.emit('click', {
            x: clickPos.x,
            y: clickPos.y,
            tileX: clickTile ? clickTile.x : null,
            tileY: clickTile ? clickTile.y : null,
            button: event.button,
            originalEvent: event
        });
    }
    
    /**
     * Handle gamepad connected event
     * @param {GamepadEvent} event - Gamepad event
     */
    handleGamepadConnected(event) {
        this.activeGamepad = event.gamepad;
        console.log(`Gamepad connected: ${event.gamepad.id}`);
    }
    
    /**
     * Handle gamepad disconnected event
     * @param {GamepadEvent} event - Gamepad event
     */
    handleGamepadDisconnected(event) {
        if (this.activeGamepad && this.activeGamepad.index === event.gamepad.index) {
            this.activeGamepad = null;
        }
        console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    }
    
    /**
     * Update gamepad state (called each frame)
     */
    updateGamepadState() {
        if (!this.gamepadSupported || !this.activeGamepad) return;
        
        // Get fresh gamepad data
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.activeGamepad.index];
        
        if (!gamepad) return;
        
        // Store previous state for change detection
        const prevState = this.gamepadState;
        this.gamepadState = {
            buttons: Array.from(gamepad.buttons).map(b => b.pressed),
            axes: Array.from(gamepad.axes)
        };
        
        // Check for button presses
        for (let i = 0; i < this.gamepadState.buttons.length; i++) {
            // Button newly pressed
            if (this.gamepadState.buttons[i] && (!prevState.buttons || !prevState.buttons[i])) {
                this.handleGamepadButton(i, 'pressed');
            }
            // Button released
            else if (!this.gamepadState.buttons[i] && prevState.buttons && prevState.buttons[i]) {
                this.handleGamepadButton(i, 'released');
            }
        }
        
        // Check for directional input
        this.handleGamepadDirectional(
            this.gamepadState.axes[0], // X axis
            this.gamepadState.axes[1], // Y axis
            prevState.axes ? prevState.axes[0] : 0,
            prevState.axes ? prevState.axes[1] : 0
        );
    }
    
    /**
     * Handle gamepad button press/release
     * @param {number} buttonIndex - Button index
     * @param {string} state - 'pressed' or 'released'
     */
    handleGamepadButton(buttonIndex, state) {
        // Map gamepad buttons to actions
        const actionMap = {
            0: INPUT_ACTIONS.SELECT, // A/Cross
            1: INPUT_ACTIONS.CANCEL, // B/Circle
            2: INPUT_ACTIONS.CHARACTER, // X/Square
            3: INPUT_ACTIONS.INVENTORY, // Y/Triangle
            9: INPUT_ACTIONS.MENU // Start
        };
        
        const action = actionMap[buttonIndex];
        if (!action) return;
        
        if (state === 'pressed') {
            const now = Date.now();
            const actionKey = `${action}-gamepad`;
            const lastActionTime = this.lastActionTime[actionKey] || 0;
            const cooldown = this.getActionCooldown(action);
            
            if (now - lastActionTime >= cooldown) {
                this.lastActionTime[actionKey] = now;
                
                this.game.events.emit('action', {
                    action: action,
                    source: 'gamepad',
                    button: buttonIndex
                });
            }
        }
    }
    
    /**
     * Handle gamepad directional input
     * @param {number} xAxis - X axis value (-1 to 1)
     * @param {number} yAxis - Y axis value (-1 to 1)
     * @param {number} prevX - Previous X axis value
     * @param {number} prevY - Previous Y axis value
     */
    handleGamepadDirectional(xAxis, yAxis, prevX, prevY) {
        // Dead zone to prevent drift
        const deadZone = 0.25;
        
        // Only process if there's significant change or strong input
        const significantX = Math.abs(xAxis) > deadZone || Math.abs(prevX) > deadZone;
        const significantY = Math.abs(yAxis) > deadZone || Math.abs(prevY) > deadZone;
        
        if (!significantX && !significantY) return;
        
        // Determine direction based on stronger axis
        let direction = null;
        
        // Check for diagonal movements first
        if (Math.abs(xAxis) > deadZone && Math.abs(yAxis) > deadZone) {
            if (xAxis > deadZone && yAxis < -deadZone) {
                direction = DIRECTIONS.NORTHEAST;
            } else if (xAxis > deadZone && yAxis > deadZone) {
                direction = DIRECTIONS.SOUTHEAST;
            } else if (xAxis < -deadZone && yAxis < -deadZone) {
                direction = DIRECTIONS.NORTHWEST;
            } else if (xAxis < -deadZone && yAxis > deadZone) {
                direction = DIRECTIONS.SOUTHWEST;
            }
        }
        // Check for cardinal directions
        else if (Math.abs(xAxis) > Math.abs(yAxis)) {
            if (xAxis > deadZone) {
                direction = DIRECTIONS.EAST;
            } else if (xAxis < -deadZone) {
                direction = DIRECTIONS.WEST;
            }
        } else {
            if (yAxis < -deadZone) {
                direction = DIRECTIONS.NORTH;
            } else if (yAxis > deadZone) {
                direction = DIRECTIONS.SOUTH;
            }
        }
        
        if (direction) {
            const now = Date.now();
            const actionKey = `${INPUT_ACTIONS.MOVE}-${direction}`;
            const lastActionTime = this.lastActionTime[actionKey] || 0;
            const cooldown = this.getActionCooldown(INPUT_ACTIONS.MOVE);
            
            if (now - lastActionTime >= cooldown) {
                this.lastActionTime[actionKey] = now;
                
                this.game.events.emit('action', {
                    action: INPUT_ACTIONS.MOVE,
                    params: direction,
                    source: 'gamepad'
                });
            }
        }
    }
    
    /**
     * Get cooldown time for an action (prevents too-rapid repeats)
     * @param {string} action - Action type
     * @returns {number} - Cooldown time in ms
     */
    getActionCooldown(action) {
        const cooldowns = {
            [INPUT_ACTIONS.MOVE]: 150, // Movement repeat rate
            [INPUT_ACTIONS.NAVIGATE]: 200, // Menu navigation repeat rate
            default: 200 // Default cooldown
        };
        
        return cooldowns[action] || cooldowns.default;
    }
    
    /**
     * Get key mapping for current context
     * @param {string} key - Key pressed
     * @returns {Object|null} - Mapping if found
     */
    getKeyMapping(key) {
        const contextMap = this.keyMappings[this.context];
        if (!contextMap) return null;
        
        return contextMap[key] || null;
    }
    
    /**
     * Set input context
     * @param {string} context - New context ('game', 'inventory', 'menu')
     */
    setContext(context) {
        if (this.keyMappings[context]) {
            this.context = context;
        } else {
            console.warn(`Unknown input context: ${context}`);
        }
    }
    
    /**
     * Update input state (called each frame)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update gamepad state
        if (this.gamepadSupported) {
            this.updateGamepadState();
        }
    }
    
    /**
     * Check if key is a game control key
     * @param {string} key - Key to check
     * @returns {boolean} - Whether key is a game control
     */
    isGameControlKey(key) {
        // Check all contexts for this key
        for (const context in this.keyMappings) {
            if (this.keyMappings[context][key]) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if key is currently down
     * @param {string} key - Key to check
     * @returns {boolean} - Whether key is down
     */
    isKeyDown(key) {
        return this.keysDown.has(key);
    }
    
    /**
     * Get current mouse position
     * @returns {Object} - Mouse position {x, y}
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }
    
    /**
     * Get current mouse tile position
     * @returns {Object|null} - Mouse tile position {x, y} or null
     */
    getMouseTile() {
        return this.mouseTile ? { ...this.mouseTile } : null;
    }
    
    /**
     * Customize key mapping
     * @param {string} context - Input context
     * @param {string} key - Key to map
     * @param {Object} mapping - Action mapping
     */
    setKeyMapping(context, key, mapping) {
        if (!this.keyMappings[context]) {
            this.keyMappings[context] = {};
        }
        this.keyMappings[context][key] = mapping;
    }
    
    /**
     * Reset key mappings to default
     */
    resetKeyMappings() {
        this.keyMappings = this.getDefaultKeyMappings();
    }
    
    /**
     * Clean up and release resources
     */
    destroy() {
        this.removeEventListeners();
        this.keysDown.clear();
    }
}

export default InputHandler;