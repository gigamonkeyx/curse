/**
 * Game message log displays game events and information
 */
import { MAP } from '../../utils/Constants.js';

class MessageLog {
    constructor(game) {
        this.game = game;
        
        // Message log properties
        this.messages = [];
        this.maxMessages = 50;
        this.visibleMessages = 5;
        
        // Position and size
        this.x = 10;
        this.y = MAP.CANVAS_HEIGHT - 120;
        this.width = MAP.CANVAS_WIDTH - 20;
        this.height = 110;
        
        // Message colors
        this.colors = {
            info: '#ffffff',
            warning: '#ffcc00',
            danger: '#ff6666',
            success: '#66ff66',
            system: '#aaaaff'
        };
    }
    
    /**
     * Add a message to the log
     * @param {string} text - Message text 
     * @param {string} type - Message type (info, warning, danger, success, system)
     */
    addMessage(text, type = 'info') {
        // Add timestamp to message
        const message = {
            text,
            type,
            turn: this.game.state?.turnCount || 0,
            timestamp: Date.now()
        };
        
        // Add to log
        this.messages.unshift(message);
        
        // Limit message count
        if (this.messages.length > this.maxMessages) {
            this.messages.pop();
        }
    }
    
    /**
     * Update message log
     */
    update() {
        // Nothing to update currently
    }
    
    /**
     * Render message log
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Render messages (most recent first)
        const messageHeight = 20;
        const startY = this.y + this.height - 10;
        
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < this.visibleMessages && i < this.messages.length; i++) {
            const message = this.messages[i];
            const messageY = startY - (i * messageHeight);
            
            // Message text
            ctx.fillStyle = this.colors[message.type] || this.colors.info;
            ctx.fillText(message.text, this.x + 10, messageY);
        }
    }
}

export default MessageLog;