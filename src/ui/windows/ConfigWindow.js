/**
 * Configuration window for game settings
 */
import { GAME } from '../../utils/Constants.js';

class ConfigWindow {
    constructor(game) {
        this.game = game;
        this.visible = false;
        
        // Window dimensions
        this.width = 400;
        this.height = 300;
        this.x = (window.innerWidth - this.width) / 2;
        this.y = (window.innerHeight - this.height) / 2;
        
        // Settings
        this.settings = {
            difficulty: GAME.DEFAULT_DIFFICULTY,
            visionRadius: GAME.DEFAULT_VISION_RADIUS,
            floors: GAME.DEFAULT_FLOORS,
            debugMode: GAME.DEFAULT_DEBUG_MODE
        };
        
        // UI elements
        this.buttons = [];
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        this.buttons = [];
        
        // Background
        ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Settings', this.x + (this.width / 2), this.y + 30);
        
        // Settings
        this.renderSettings(ctx);
        
        // Close button
        this.renderButton(ctx, "X", this.x + this.width - 30, this.y + 10, 20, 20, () => {
            this.close();
        });
        
        // Save button
        this.renderButton(ctx, "Save", this.x + (this.width / 2) - 50, this.y + this.height - 50, 100, 30, () => {
            this.applySettings();
        });
    }
    
    renderSettings(ctx) {
        const startY = this.y + 70;
        const lineHeight = 40;
        
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        
        // Difficulty
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Difficulty:', this.x + 30, startY);
        this.renderSlider(ctx, this.x + 120, startY - 10, 200, 20, this.settings.difficulty, 0, 100, (value) => {
            this.settings.difficulty = value;
        });
        
        // Vision Radius
        ctx.fillText('Vision Radius:', this.x + 30, startY + lineHeight);
        this.renderSlider(ctx, this.x + 120, startY + lineHeight - 10, 200, 20, this.settings.visionRadius, 1, 10, (value) => {
            this.settings.visionRadius = value;
        });
        
        // Floors
        ctx.fillText('Floors:', this.x + 30, startY + lineHeight * 2);
        this.renderSlider(ctx, this.x + 120, startY + lineHeight * 2 - 10, 200, 20, this.settings.floors, 
                         GAME.MIN_FLOORS, GAME.MAX_FLOORS, (value) => {
            this.settings.floors = value;
        });
        
        // Debug Mode
        ctx.fillText('Debug Mode:', this.x + 30, startY + lineHeight * 3);
        this.renderToggle(ctx, this.x + 120, startY + lineHeight * 3 - 10, 50, 20, this.settings.debugMode, (value) => {
            this.settings.debugMode = value;
        });
    }
    
    renderSlider(ctx, x, y, width, height, value, min, max, onChange) {
        // Background
        ctx.fillStyle = '#333344';
        ctx.fillRect(x, y, width, height);
        
        // Fill
        const fillWidth = (value - min) / (max - min) * width;
        ctx.fillStyle = '#5555aa';
        ctx.fillRect(x, y, fillWidth, height);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Value text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value), x + width + 30, y + 15);
        ctx.textAlign = 'left';
        
        // Add slider button
        this.buttons.push({
            type: 'slider',
            x,
            y, 
            width,
            height,
            value,
            min,
            max,
            onChange,
            action: (mouseX) => {
                const percentage = Math.max(0, Math.min(1, (mouseX - x) / width));
                const newValue = min + percentage * (max - min);
                onChange(Math.round(newValue));
            }
        });
    }
    
    renderToggle(ctx, x, y, width, height, value, onChange) {
        // Background
        ctx.fillStyle = value ? '#5555aa' : '#333344';
        ctx.fillRect(x, y, width, height);
        
        // Toggle position
        const toggleX = value ? x + width - height : x;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(toggleX, y, height, height);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Add toggle button
        this.buttons.push({
            type: 'toggle',
            x,
            y,
            width,
            height,
            value,
            onChange,
            action: () => {
                onChange(!value);
            }
        });
    }
    
    renderButton(ctx, text, x, y, width, height, action) {
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
        ctx.fillText(text, x + (width / 2), y + (height / 2) + 5);
        
        // Add button to clickable elements
        this.buttons.push({
            type: 'button',
            x,
            y,
            width,
            height,
            action
        });
    }
    
    close() {
        this.visible = false;
    }
    
    applySettings() {
        // Apply settings to the game
        this.game.applySettings(this.settings);
        this.close();
    }
}

export default ConfigWindow;