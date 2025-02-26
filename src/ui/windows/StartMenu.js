/**
 * Start menu for the game
 * Provides options to start a new game, continue, adjust settings, etc.
 */
import { MAP } from '../../utils/Constants.js';

class StartMenu {
    constructor(game) {
        this.game = game;
        this.visible = true;
        
        // Menu dimensions
        this.width = MAP.CANVAS_WIDTH;
        this.height = MAP.CANVAS_HEIGHT;
        
        // Animation properties
        this.titleY = 100;
        this.titleBounce = 0;
        this.pulseAmount = 0;
        this.buttonFade = 0;
        this.torchFlicker = 0;
        
        // Menu items
        this.menuItems = [
            { text: "New Game", action: () => this.startNewGame() },
            { text: "Continue", action: () => this.continueGame(), disabled: !this.hasSavedGame() },
            { text: "Settings", action: () => this.openSettings() },
            { text: "Credits", action: () => this.showCredits() }
        ];
        
        this.selectedItem = 0;
        this.buttons = [];
    }
    
    /**
     * Update menu animations
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.visible) return;
        
        // Animate title bounce
        this.titleBounce += deltaTime * 2;
        
        // Animate button pulse
        this.pulseAmount = Math.sin(performance.now() / 1000) * 0.1 + 0.9;
        
        // Fade in buttons
        if (this.buttonFade < 1) {
            this.buttonFade += deltaTime * 0.5;
            if (this.buttonFade > 1) this.buttonFade = 1;
        }
        
        // Torch flicker effect
        this.torchFlicker = Math.random() * 0.1;
    }
    
    /**
     * Render menu
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.visible) return;
        
        this.buttons = [];
        
        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Vignette effect
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 100,
            this.width / 2, this.height / 2, this.width / 1.5
        );
        gradient.addColorStop(0, 'rgba(20, 20, 30, 0)');
        gradient.addColorStop(1, 'rgba(10, 10, 15, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw torch light effect with flicker
        const torchGlow = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 50, 
            this.width / 2, this.height / 2, 400
        );
        torchGlow.addColorStop(0, `rgba(255, 150, 50, ${0.2 + this.torchFlicker})`);
        torchGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
        ctx.fillStyle = torchGlow;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw title
        this.renderTitle(ctx);
        
        // Draw menu items
        this.renderMenuItems(ctx);
        
        // Draw version
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('v0.1.0', this.width - 20, this.height - 20);
    }
    
    /**
     * Render game title
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderTitle(ctx) {
        const titleY = this.titleY + Math.sin(this.titleBounce) * 5;
        
        // Title shadow
        ctx.fillStyle = 'rgba(100, 0, 0, 0.7)';
        ctx.font = '70px serif';
        ctx.textAlign = 'center';
        ctx.fillText('CURSE', this.width / 2 + 4, titleY + 4);
        
        // Title glow
        const glowSize = 20 + Math.sin(this.titleBounce * 0.5) * 5;
        const glow = ctx.createRadialGradient(
            this.width / 2, titleY - 20, 10,
            this.width / 2, titleY - 20, glowSize
        );
        glow.addColorStop(0, 'rgba(255, 50, 50, 0.3)');
        glow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(this.width / 2 - 150, titleY - 70, 300, 100);
        
        // Main title
        ctx.fillStyle = '#ff3333';
        ctx.font = '70px serif';
        ctx.fillText('CURSE', this.width / 2, titleY);
        
        // Subtitle
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '20px serif';
        ctx.fillText('A Roguelike Adventure', this.width / 2, titleY + 40);
    }
    
    /**
     * Render menu buttons
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderMenuItems(ctx) {
        const startY = 280;
        const itemHeight = 60;
        const itemWidth = 200;
        
        for (let i = 0; i < this.menuItems.length; i++) {
            const item = this.menuItems[i];
            const y = startY + i * itemHeight;
            const x = this.width / 2 - itemWidth / 2;
            const isSelected = i === this.selectedItem;
            const opacity = this.buttonFade * (item.disabled ? 0.5 : 1);
            
            // Button size with pulse effect for selected item
            let width = itemWidth;
            let height = itemHeight - 20;
            if (isSelected) {
                width *= this.pulseAmount;
                height *= this.pulseAmount;
            }
            
            const buttonX = this.width / 2 - width / 2;
            const buttonY = y - height / 2;
            
            // Button background
            ctx.fillStyle = isSelected ? `rgba(100, 30, 30, ${opacity})` : `rgba(40, 40, 50, ${opacity})`;
            ctx.fillRect(buttonX, buttonY, width, height);
            
            // Button border
            ctx.strokeStyle = isSelected ? `rgba(200, 50, 50, ${opacity})` : `rgba(100, 100, 120, ${opacity})`;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(buttonX, buttonY, width, height);
            
            // Button text
            ctx.fillStyle = isSelected ? `rgba(255, 255, 255, ${opacity})` : `rgba(200, 200, 200, ${opacity})`;
            ctx.font = isSelected ? '22px serif' : '20px serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.text, this.width / 2, y + 5);
            
            // Add button to clickable elements if not disabled
            if (!item.disabled) {
                this.buttons.push({
                    text: item.text,
                    x: buttonX,
                    y: buttonY,
                    width: width,
                    height: height,
                    action: item.action
                });
            }
        }
    }
    
    /**
     * Handle mouse click
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     * @returns {boolean} - Whether the click was handled
     */
    handleClick(x, y) {
        if (!this.visible) return false;
        
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
     * @returns {boolean} - Whether the key was handled
     */
    handleKeyPress(key) {
        if (!this.visible) return false;
        
        switch (key) {
            case 'ArrowUp':
                this.selectedItem = (this.selectedItem - 1 + this.menuItems.length) % this.menuItems.length;
                // Skip disabled options
                if (this.menuItems[this.selectedItem].disabled) {
                    this.handleKeyPress('ArrowUp');
                }
                return true;
                
            case 'ArrowDown':
                this.selectedItem = (this.selectedItem + 1) % this.menuItems.length;
                // Skip disabled options
                if (this.menuItems[this.selectedItem].disabled) {
                    this.handleKeyPress('ArrowDown');
                }
                return true;
                
            case 'Enter':
            case ' ':
                if (!this.menuItems[this.selectedItem].disabled) {
                    this.menuItems[this.selectedItem].action();
                }
                return true;
                
            default:
                return false;
        }
    }
    
    /**
     * Show the menu
     */
    show() {
        this.visible = true;
        this.buttonFade = 0;
    }
    
    /**
     * Hide the menu
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        this.hide();
        this.game.newGame();
    }
    
    /**
     * Continue saved game
     */
    continueGame() {
        if (this.hasSavedGame()) {
            this.hide();
            this.game.loadGame();
        }
    }
    
    /**
     * Check if saved game exists
     * @returns {boolean} - Whether a saved game exists
     */
    hasSavedGame() {
        return localStorage.getItem('curseSave') !== null;
    }
    
    /**
     * Open settings menu
     */
    openSettings() {
        this.game.ui.openConfigWindow();
    }
    
    /**
     * Show credits
     */
    showCredits() {
        // Implement credits display
        console.log('Credits: Thanks for playing Curse!');
    }
}

export default StartMenu;