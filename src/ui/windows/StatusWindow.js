/**
 * Status window that displays player stats, buffs, and other conditions
 */
import { MAP } from '../../utils/Constants.js';

class StatusWindow {
    constructor(game) {
        this.game = game;
        this.visible = false;
        
        // Window dimensions
        this.width = MAP.CANVAS_WIDTH * 0.6;
        this.height = MAP.CANVAS_HEIGHT * 0.7;
        this.x = (MAP.CANVAS_WIDTH - this.width) / 2;
        this.y = (MAP.CANVAS_HEIGHT - this.height) / 2;
        
        // UI elements
        this.buttons = [];
    }
    
    /**
     * Show the status window
     */
    open() {
        this.visible = true;
    }
    
    /**
     * Hide the status window
     */
    close() {
        this.visible = false;
    }
    
    /**
     * Toggle window visibility
     */
    toggle() {
        this.visible = !this.visible;
    }
    
    /**
     * Render the status window
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.visible) return;
        
        this.buttons = [];
        
        const player = this.game.player;
        if (!player) return;
        
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
        ctx.fillText('Character Status', this.x + (this.width / 2), this.y + 30);
        
        // Render sections
        this.renderBasicStats(ctx, player);
        this.renderAttributes(ctx, player);
        this.renderEquipment(ctx, player);
        this.renderStatusEffects(ctx, player);
        
        // Close button
        this.renderButton(ctx, "X", this.x + this.width - 30, this.y + 10, 20, 20, () => {
            this.close();
        });
    }
    
    /**
     * Render basic player stats
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderBasicStats(ctx, player) {
        const startY = this.y + 70;
        const startX = this.x + 30;
        const lineHeight = 25;
        
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        
        // Health
        ctx.fillText(`Health: ${player.hp || 0}/${player.maxHp || 0}`, startX, startY);
        this.renderBar(ctx, startX + 120, startY - 15, 150, 20, player.hp || 0, player.maxHp || 100, '#ff3333');
        
        // Level and XP
        ctx.fillText(`Level: ${player.level || 1}`, startX, startY + lineHeight);
        
        // XP bar
        const xpNeeded = player.nextLevel || 100;
        const currentXP = player.xp || 0;
        ctx.fillText(`XP: ${currentXP}/${xpNeeded}`, startX + 120, startY + lineHeight);
        this.renderBar(ctx, startX + 120, startY + lineHeight - 15, 150, 20, currentXP, xpNeeded, '#33ff33');
        
        // Floor
        ctx.fillText(`Dungeon Floor: ${player.floor || 1}`, startX, startY + lineHeight * 2);
        
        // Gold
        ctx.fillText(`Gold: ${player.gold || 0}`, startX, startY + lineHeight * 3);
        
        // Moves
        ctx.fillText(`Turns: ${player.moves || 0}`, startX + 200, startY + lineHeight * 3);
    }
    
    /**
     * Render player attributes
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderAttributes(ctx, player) {
        const startY = this.y + 180;
        const startX = this.x + 30;
        const lineHeight = 25;
        
        // Section title
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#aaaaff';
        ctx.fillText('Attributes', startX, startY);
        
        // Attributes
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#dddddd';
        
        const attributes = [
            { name: 'Strength', value: player.strength || 10, bonus: player.strengthBonus || 0 },
            { name: 'Defense', value: player.defense || 5, bonus: player.defenseBonus || 0 },
            { name: 'Dexterity', value: player.dexterity || 10, bonus: player.dexterityBonus || 0 },
            { name: 'Intelligence', value: player.intelligence || 10, bonus: player.intelligenceBonus || 0 }
        ];
        
        attributes.forEach((attr, index) => {
            const y = startY + lineHeight * (index + 1);
            ctx.fillText(`${attr.name}: ${attr.value}`, startX, y);
            
            // Show bonuses from equipment
            if (attr.bonus > 0) {
                ctx.fillStyle = '#33ff33';
                ctx.fillText(`+${attr.bonus}`, startX + 150, y);
                ctx.fillStyle = '#dddddd';
            }
        });
        
        // Combat stats
        const combatX = this.x + this.width / 2 + 20;
        
        ctx.fillStyle = '#aaaaff';
        ctx.fillText('Combat', combatX, startY);
        
        ctx.fillStyle = '#dddddd';
        ctx.fillText(`Damage: ${player.damage || 1}-${player.maxDamage || 4}`, combatX, startY + lineHeight);
        ctx.fillText(`Armor: ${player.armor || 0}`, combatX, startY + lineHeight * 2);
        ctx.fillText(`Hit Chance: ${player.hitChance || 80}%`, combatX, startY + lineHeight * 3);
        ctx.fillText(`Critical: ${player.critChance || 5}%`, combatX, startY + lineHeight * 4);
    }
    
    /**
     * Render player equipment
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderEquipment(ctx, player) {
        const startY = this.y + 300;
        const startX = this.x + 30;
        const lineHeight = 25;
        
        // Section title
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#aaaaff';
        ctx.fillText('Equipment', startX, startY);
        
        // Equipment slots
        ctx.font = '16px sans-serif';
        const equipment = player.equipment || {};
        const slots = [
            { name: 'Weapon', key: 'weapon' },
            { name: 'Armor', key: 'armor' },
            { name: 'Helmet', key: 'head' },
            { name: 'Amulet', key: 'amulet' },
            { name: 'Ring', key: 'ring' }
        ];
        
        slots.forEach((slot, index) => {
            const y = startY + lineHeight * (index + 1);
            const item = equipment[slot.key];
            
            ctx.fillStyle = '#dddddd';
            ctx.fillText(`${slot.name}: `, startX, y);
            
            if (item) {
                // Color based on item tier
                let tierColor = '#ffffff';
                if (item.tier === 1) tierColor = '#00ff00'; // Uncommon
                else if (item.tier === 2) tierColor = '#0088ff'; // Rare
                else if (item.tier === 3) tierColor = '#aa00ff'; // Epic
                else if (item.tier === 4) tierColor = '#ff8800'; // Legendary
                
                ctx.fillStyle = tierColor;
                ctx.fillText(item.name, startX + 80, y);
                
                // Show item stats
                ctx.fillStyle = '#aaaaaa';
                if (slot.key === 'weapon' && item.damage) {
                    ctx.fillText(`(${item.damage} dmg)`, startX + 240, y);
                } else if (item.defense) {
                    ctx.fillText(`(${item.defense} def)`, startX + 240, y);
                }
            } else {
                ctx.fillStyle = '#666666';
                ctx.fillText('- None -', startX + 80, y);
            }
        });
    }
    
    /**
     * Render player status effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderStatusEffects(ctx, player) {
        const startY = this.y + 300;
        const startX = this.x + this.width / 2 + 20;
        const lineHeight = 25;
        
        // Section title
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#aaaaff';
        ctx.fillText('Status Effects', startX, startY);
        
        // Status effects
        const statusEffects = player.statusEffects || [];
        
        if (statusEffects.length === 0) {
            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#888888';
            ctx.fillText('No active effects', startX, startY + lineHeight);
            return;
        }
        
        ctx.font = '16px sans-serif';
        statusEffects.forEach((effect, index) => {
            const y = startY + lineHeight * (index + 1);
            
            // Effect name and duration
            let effectColor;
            if (effect.beneficial) effectColor = '#33ff33';
            else effectColor = '#ff3333';
            
            ctx.fillStyle = effectColor;
            ctx.fillText(effect.name, startX, y);
            
            // Duration
            if (effect.duration) {
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText(`(${effect.duration} turns)`, startX + 140, y);
            }
            
            // Description
            if (effect.description) {
                ctx.fillStyle = '#dddddd';
                ctx.fillText(effect.description, startX, y + lineHeight/2);
            }
        });
    }
    
    /**
     * Render a progress bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Bar X position
     * @param {number} y - Bar Y position
     * @param {number} width - Bar width
     * @param {number} height - Bar height
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @param {string} color - Bar fill color
     */
    renderBar(ctx, x, y, width, height, value, max, color) {
        // Background
        ctx.fillStyle = '#222222';
        ctx.fillRect(x, y, width, height);
        
        // Calculate fill width
        const fillWidth = Math.max(0, Math.min(width, (value / max) * width));
        
        // Fill
        ctx.fillStyle = color;
        ctx.fillRect(x, y, fillWidth, height);
        
        // Border
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * Render a button
     * @param {CanvasRenderingContext2D} ctx - Canvas context
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
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + (width / 2), y + (height / 2) + 5);
        
        // Add button to clickable elements
        this.buttons.push({
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
        
        // Check if click is outside window
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
            this.close();
            return true;
        }
        
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
        
        switch (key) {
            case 'Escape':
            case 'c':
                this.close();
                return true;
            default:
                return false;
        }
    }
}

export default StatusWindow;