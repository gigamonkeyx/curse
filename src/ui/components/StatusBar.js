/**
 * Game status bar displays player stats and game state
 */
import { MAP } from '../../utils/Constants.js';

class StatusBar {
    constructor(game) {
        this.game = game;
        
        // Position and size
        this.x = 0;
        this.y = 0;
        this.width = MAP.CANVAS_WIDTH;
        this.height = 30;
    }
    
    /**
     * Update status bar
     */
    update() {
        // Nothing to update currently
    }
    
    /**
     * Render status bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const player = this.game.player;
        if (!player) return;
        
        // Background
        ctx.fillStyle = '#222233';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Health bar
        this.renderHealthBar(ctx, player);
        
        // Level and floor info
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(
            `Level: ${player.level}   Floor: ${player.currentFloor + 1}`,
            MAP.CANVAS_WIDTH - 10,
            this.y + 20
        );
    }
    
    /**
     * Render player health bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderHealthBar(ctx, player) {
        const barWidth = 200;
        const barHeight = 16;
        const barX = 10;
        const barY = this.y + 7;
        
        // Background
        ctx.fillStyle = '#331111';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill
        const healthPct = Math.max(0, Math.min(player.hp / player.maxHp, 1));
        const fillWidth = Math.floor(barWidth * healthPct);
        
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Health text
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
            `HP: ${player.hp} / ${player.maxHp}`,
            barX + (barWidth / 2),
            barY + 12
        );
    }
}

export default StatusBar;