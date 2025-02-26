/**
 * Status bar for displaying player stats and game info
 */
import { MAP } from '../utils/Constants.js';

class StatusBar {
    constructor(game) {
        this.game = game;
        this.height = 40;
        this.width = MAP.CANVAS_WIDTH;
    }
    
    /**
     * Update status bar
     */
    update() {
        // Nothing to update for now
    }
    
    /**
     * Render status bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const player = this.game.player;
        if (!player) return;
        
        // Background
        ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
        ctx.fillRect(0, MAP.CANVAS_HEIGHT - this.height, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, MAP.CANVAS_HEIGHT - this.height, this.width, this.height);
        
        // Health bar
        this.renderHealthBar(ctx, player);
        
        // Player stats
        this.renderPlayerStats(ctx, player);
        
        // Floor info
        this.renderFloorInfo(ctx, player);
    }
    
    /**
     * Render health bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player object
     */
    renderHealthBar(ctx, player) {
        const barWidth = 200;
        const barHeight = 15;
        const barX = 10;
        const barY = MAP.CANVAS_HEIGHT - this.height + 10;
        
        // Background
        ctx.fillStyle = '#440000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate health percentage
        const healthPercent = player.hp / player.maxHp;
        const fillWidth = Math.max(0, Math.min(barWidth * healthPercent, barWidth));
        
        // Health fill
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Health text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            `HP: ${player.hp}/${player.maxHp}`,
            barX + (barWidth / 2),
            barY + 12
        );
    }
    
    /**
     * Render player stats
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player object
     */
    renderPlayerStats(ctx, player) {
        const statsX = 220;
        const statsY = MAP.CANVAS_HEIGHT - this.height + 15;
        
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        
        // Level and XP
        ctx.fillText(
            `Level: ${player.level} | XP: ${player.xp}/${player.nextLevelXp}`,
            statsX,
            statsY
        );
        
        // Attack and defense
        ctx.fillText(
            `ATK: ${player.getDamage()} | DEF: ${player.defense} | Gold: ${player.gold}`,
            statsX,
            statsY + 15
        );
    }
    
    /**
     * Render floor info
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player object
     */
    renderFloorInfo(ctx, player) {
        const floorX = MAP.CANVAS_WIDTH - 150;
        const floorY = MAP.CANVAS_HEIGHT - this.height + 15;
        
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        
        // Floor number
        ctx.fillText(
            `Floor: ${player.currentFloor + 1}`,
            floorX,
            floorY
        );
        
        // Controls hint
        ctx.fillText(
            'I: Inventory | C: Config',
            floorX,
            floorY + 15
        );
    }
    
    /**
     * Handle click on status bar
     * @param {number} x - Click X position
     * @param {number} y - Click Y position
     * @returns {boolean} - Whether click was handled
     */
    handleClick(x, y) {
        // Check if click is within status bar area
        if (y >= MAP.CANVAS_HEIGHT - this.height) {
            // Check for specific buttons/areas here
            return true;
        }
        
        return false;
    }
}

export default StatusBar;