/**
 * Game over screen showing player stats and restart options
 */
import { MAP } from '../../utils/Constants.js';

class GameOverWindow {
    constructor(game) {
        this.game = game;
        this.visible = false;
        
        // Window dimensions
        this.width = MAP.CANVAS_WIDTH * 0.7;
        this.height = MAP.CANVAS_HEIGHT * 0.7;
        this.x = (MAP.CANVAS_WIDTH - this.width) / 2;
        this.y = (MAP.CANVAS_HEIGHT - this.height) / 2;
        
        // Animation properties
        this.fadeIn = 0;
        this.maxFade = 0.9;
        
        // UI elements
        this.buttons = [];
    }
    
    /**
     * Show the game over screen
     * @param {Object} stats - Player's final statistics
     */
    show(stats) {
        this.visible = true;
        this.fadeIn = 0;
        this.stats = stats || {
            level: 1,
            floorsCleared: 0,
            enemiesKilled: 0,
            itemsCollected: 0,
            turns: 0,
            causeOfDeath: "Unknown"
        };
    }
    
    /**
     * Hide the game over screen
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * Update animation state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.visible) return;
        
        // Fade in effect
        if (this.fadeIn < this.maxFade) {
            this.fadeIn += deltaTime * 0.5;
            if (this.fadeIn > this.maxFade) this.fadeIn = this.maxFade;
        }
    }
    
    /**
     * Render the game over screen
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.visible) return;
        
        this.buttons = [];
        
        // Dark overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeIn})`;
        ctx.fillRect(0, 0, MAP.CANVAS_WIDTH, MAP.CANVAS_HEIGHT);
        
        // Panel background
        ctx.fillStyle = 'rgba(30, 30, 40, 0.95)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#aa3333';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Title
        ctx.fillStyle = '#ff5555';
        ctx.font = '48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.x + this.width / 2, this.y + 60);
        
        // Cause of death
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px serif';
        ctx.fillText(this.stats.causeOfDeath || "You have perished", 
                    this.x + this.width / 2, this.y + 100);
        
        // Stats
        this.renderStats(ctx);
        
        // Buttons
        const buttonY = this.y + this.height - 70;
        this.renderButton(ctx, "Try Again", this.x + this.width / 2 - 120, buttonY, 100, 40, () => {
            this.game.restart();
        });
        
        this.renderButton(ctx, "Main Menu", this.x + this.width / 2 + 20, buttonY, 100, 40, () => {
            this.game.showMainMenu();
        });
    }
    
    /**
     * Render player statistics
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderStats(ctx) {
        const stats = this.stats;
        const startY = this.y + 140;
        const lineHeight = 30;
        const leftX = this.x + this.width / 2 - 140;
        
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#cccccc';
        
        // Left column
        ctx.fillText(`Character Level: ${stats.level || 1}`, leftX, startY);
        ctx.fillText(`Floors Cleared: ${stats.floorsCleared || 0}`, leftX, startY + lineHeight);
        ctx.fillText(`Enemies Slain: ${stats.enemiesKilled || 0}`, leftX, startY + lineHeight * 2);
        
        // Right column
        const rightX = this.x + this.width / 2 + 20;
        ctx.fillText(`Items Collected: ${stats.itemsCollected || 0}`, rightX, startY);
        ctx.fillText(`Turns Survived: ${stats.turns || 0}`, rightX, startY + lineHeight);
        
        // Final score
        const score = this.calculateScore(stats);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText(`Final Score: ${score}`, this.x + this.width / 2, startY + lineHeight * 4);
    }
    
    /**
     * Calculate player's final score
     * @param {Object} stats - Player statistics
     * @returns {number} - Final score
     */
    calculateScore(stats) {
        let score = 0;
        
        score += (stats.level || 1) * 100;
        score += (stats.floorsCleared || 0) * 200;
        score += (stats.enemiesKilled || 0) * 50;
        score += (stats.itemsCollected || 0) * 25;
        score += Math.floor((stats.turns || 0) / 10);
        
        return score;
    }
    
    /**
     * Render a button
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} text - Button text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {Function} action - Click handler
     */
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
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width / 2, y + height / 2 + 5);
        
        // Add button to clickable elements
        this.buttons.push({
            type: 'button',
            text,
            x,
            y,
            width,
            height,
            action
        });
    }
    
    /**
     * Handle mouse click
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} - Whether click was handled
     */
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Check buttons
        for (const button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.action();
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Handle key press
     * @param {string} key - Key that was pressed
     * @returns {boolean} - Whether key was handled
     */
    handleKeyPress(key) {
        if (!this.visible) return false;
        
        if (key === 'Enter' || key === ' ') {
            this.game.restart();
            return true;
        }
        
        return true;
    }
}

export default GameOverWindow;