/**
 * Configuration menu component
 * Handles game settings like difficulty, vision radius, etc.
 */
import { GAME } from '../utils/Constants.js';

class ConfigMenu {
    /**
     * Create a new config menu
     * @param {Object} game - Game instance
     * @param {Object} options - Menu options
     */
    constructor(game, options = {}) {
        this.game = game;
        this.visible = false;
        
        // Inherit position or use defaults
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 300;
        this.height = options.height || 200;
        
        // Settings
        this.settings = {
            difficulty: GAME.DEFAULT_DIFFICULTY,
            visionRadius: GAME.DEFAULT_VISION_RADIUS,
            floors: GAME.DEFAULT_FLOORS,
            debugMode: GAME.DEFAULT_DEBUG_MODE,
            soundVolume: 0.7,
            musicVolume: 0.5,
            fullscreen: false
        };
        
        // UI elements
        this.buttons = [];
        this.sliders = [];
        this.toggles = [];
        this.onSave = options.onSave || null;
        this.onCancel = options.onCancel || null;
    }
    
    /**
     * Update menu state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Animation updates if needed
    }
    
    /**
     * Render the config menu
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.visible) return;
        
        // Clear interaction arrays
        this.buttons = [];
        this.sliders = [];
        this.toggles = [];
        
        // Background
        ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Settings', this.x + this.width/2, this.y + 25);
        
        // Settings
        this.renderSettings(ctx);
        
        // Buttons
        this.renderButton(ctx, "Save", this.x + this.width/2 - 60, this.y + this.height - 40, 50, 30, () => this.saveSettings());
        this.renderButton(ctx, "Cancel", this.x + this.width/2 + 10, this.y + this.height - 40, 50, 30, () => this.cancel());
    }
    
    /**
     * Render all settings controls
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderSettings(ctx) {
        const startY = this.y + 50;
        const spacing = 35;
        const labelWidth = 120;
        
        // Set text properties
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#dddddd';
        
        // Difficulty
        ctx.fillText('Difficulty:', this.x + 20, startY);
        this.renderSlider(ctx, this.x + labelWidth, startY - 15, 150, 20, 
            this.settings.difficulty, 1, 5, (val) => this.settings.difficulty = val);
        
        // Vision Radius
        ctx.fillText('Vision Radius:', this.x + 20, startY + spacing);
        this.renderSlider(ctx, this.x + labelWidth, startY + spacing - 15, 150, 20, 
            this.settings.visionRadius, 3, 10, (val) => this.settings.visionRadius = val);
        
        // Floors
        ctx.fillText('Floors:', this.x + 20, startY + spacing * 2);
        this.renderSlider(ctx, this.x + labelWidth, startY + spacing * 2 - 15, 150, 20, 
            this.settings.floors, 5, 20, (val) => this.settings.floors = val);
        
        // Sound Volume
        ctx.fillText('Sound:', this.x + 20, startY + spacing * 3);
        this.renderSlider(ctx, this.x + labelWidth, startY + spacing * 3 - 15, 150, 20, 
            this.settings.soundVolume * 10, 0, 10, (val) => this.settings.soundVolume = val/10);
        
        // Music Volume
        ctx.fillText('Music:', this.x + 20, startY + spacing * 4);
        this.renderSlider(ctx, this.x + labelWidth, startY + spacing * 4 - 15, 150, 20, 
            this.settings.musicVolume * 10, 0, 10, (val) => this.settings.musicVolume = val/10);
        
        // Debug Mode Toggle
        ctx.fillText('Debug Mode:', this.x + 20, startY + spacing * 5);
        this.renderToggle(ctx, this.x + labelWidth, startY + spacing * 5 - 15, 40, 20,
            this.settings.debugMode, (val) => this.settings.debugMode = val);
            
        // Fullscreen Toggle
        ctx.fillText('Fullscreen:', this.x + 20, startY + spacing * 6);
        this.renderToggle(ctx, this.x + labelWidth, startY + spacing * 6 - 15, 40, 20,
            this.settings.fullscreen, (val) => this.settings.fullscreen = val);
    }
    
    /**
     * Render a slider control
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Slider width
     * @param {number} height - Slider height
     * @param {number} value - Current value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {Function} onChange - Value change handler
     */
    renderSlider(ctx, x, y, width, height, value, min, max, onChange) {
        // Background track
        ctx.fillStyle = '#333344';
        ctx.fillRect(x, y, width, height);
        
        // Calculate the position for the slider handle
        const normalizedValue = (value - min) / (max - min);
        const handlePosition = Math.max(0, Math.min(1, normalizedValue));
        const fillWidth = handlePosition * width;
        
        // Fill
        ctx.fillStyle = '#5555aa';
        ctx.fillRect(x, y, fillWidth, height);
        
        // Handle
        ctx.fillStyle = '#aaaacc';
        const handleSize = height * 1.5;
        ctx.fillRect(x + fillWidth - handleSize/2, y - handleSize/4, handleSize, handleSize);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Value
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value), x + width + 30, y + height/2 + 5);
        ctx.textAlign = 'left';
        
        // Store slider info for interaction
        this.sliders.push({
            x, y, width, height, value, min, max, onChange
        });
    }
    
    /**
     * Render a toggle/checkbox
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Toggle width
     * @param {number} height - Toggle height
     * @param {boolean} value - Current value
     * @param {Function} onChange - Value change handler
     */
    renderToggle(ctx, x, y, width, height, value, onChange) {
        // Background
        ctx.fillStyle = value ? '#5555aa' : '#333344';
        ctx.fillRect(x, y, width, height);
        
        // Toggle position
        const toggleSize = height - 4;
        const toggleX = value ? x + width - toggleSize - 2 : x + 2;
        
        // Toggle handle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(toggleX, y + 2, toggleSize, toggleSize);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Store toggle info for interaction
        this.toggles.push({
            x, y, width, height, value, onChange
        });
    }
    
    /**
     * Render a button
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Button text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {Function} onClick - Click handler
     */
    renderButton(ctx, text, x, y, width, height, onClick) {
        // Button background
        ctx.fillStyle = '#444466';
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Button text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width/2, y + height/2 + 5);
        
        // Store button info for interaction
        this.buttons.push({
            text, x, y, width, height, onClick
        });
    }
    
    /**
     * Handle mouse click
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} - Whether the click was handled
     */
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Check if click is inside config area
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
            this.cancel();
            return true;
        }
        
        // Check buttons
        for (const button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.onClick();
                return true;
            }
        }
        
        // Check toggles
        for (const toggle of this.toggles) {
            if (x >= toggle.x && x <= toggle.x + toggle.width &&
                y >= toggle.y && y <= toggle.y + toggle.height) {
                toggle.onChange(!toggle.value);
                return true;
            }
        }
        
        // Check sliders
        for (const slider of this.sliders) {
            if (x >= slider.x && x <= slider.x + slider.width &&
                y >= slider.y && y <= slider.y + slider.height) {
                const percentage = (x - slider.x) / slider.width;
                const value = slider.min + percentage * (slider.max - slider.min);
                slider.onChange(Math.round(value));
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Handle mouse movement/drag
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {boolean} isDragging - Whether mouse button is pressed
     * @returns {boolean} - Whether the move was handled
     */
    handleMouseMove(x, y, isDragging) {
        if (!this.visible || !isDragging) return false;
        
        // Update sliders when dragging
        for (const slider of this.sliders) {
            if (x >= slider.x && x <= slider.x + slider.width &&
                y >= slider.y - 10 && y <= slider.y + slider.height + 10) {
                const percentage = Math.max(0, Math.min(1, (x - slider.x) / slider.width));
                const value = slider.min + percentage * (slider.max - slider.min);
                slider.onChange(Math.round(value));
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Handle key press
     * @param {string} key - Key that was pressed
     * @returns {boolean} - Whether the key was handled
     */
    handleKeyPress(key) {
        if (!this.visible) return false;
        
        switch (key) {
            case 'Escape':
                this.cancel();
                return true;
                
            case 'Enter':
                this.saveSettings();
                return true;
                
            default:
                return false;
        }
    }
    
    /**
     * Show the config menu
     * @param {Object} currentSettings - Current game settings (optional)
     */
    show(currentSettings = null) {
        this.visible = true;
        
        // Initialize with current settings if provided
        if (currentSettings) {
            this.settings = { ...this.settings, ...currentSettings };
        }
    }
    
    /**
     * Hide the config menu
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * Save settings and close menu
     */
    saveSettings() {
        if (this.onSave) {
            this.onSave(this.settings);
        }
        this.hide();
    }
    
    /**
     * Cancel changes and close menu
     */
    cancel() {
        if (this.onCancel) {
            this.onCancel();
        }
        this.hide();
    }
}

export default ConfigMenu;