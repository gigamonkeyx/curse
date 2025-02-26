/**
 * Main UI manager that coordinates all UI components
 * Handles UI rendering, input, and game state presentation
 */
import { MAP } from '../utils/Constants.js';
import StatusBar from './components/StatusBar.js';
import MessageLog from './components/MessageLog.js';
import InventoryWindow from './windows/InventoryWindow.js';
import ConfigWindow from './windows/ConfigWindow.js';
import StartMenu from './windows/StartMenu.js';
import GameOverWindow from './windows/GameOverWindow.js';

class UI {
    constructor(game) {
        this.game = game;
        
        // Initialize components
        this.statusBar = new StatusBar(game);
        this.messageLog = new MessageLog(game);
        
        // Initialize windows (lazy-loaded when needed)
        this.inventory = null;
        this.configWindow = null;
        this.startMenu = null;
        this.gameOverWindow = null;
        
        // Track active windows
        this.activeWindows = [];
        
        // UI state
        this.showFps = false;
        this.lastFpsUpdate = 0;
        this.fpsCount = 0;
        this.fpsDisplay = 0;
    }
    
    /**
     * Update UI state
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update FPS counter
        this.updateFps(deltaTime);
        
        // Update all components
        this.statusBar.update();
        this.messageLog.update();
        
        // Update all active windows
        this.activeWindows.forEach(window => {
            if (window.update) window.update(deltaTime);
        });
    }
    
    /**
     * Render all UI elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render permanent UI components
        this.statusBar.render(ctx);
        this.messageLog.render(ctx);
        
        // Render active windows (in order, last is top-most)
        this.activeWindows.forEach(window => {
            window.render(ctx);
        });
        
        // Render FPS if enabled
        if (this.showFps) {
            this.renderFps(ctx);
        }
    }
    
    /**
     * Handle mouse click
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     * @returns {boolean} - Whether click was handled by UI
     */
    handleClick(x, y) {
        // Check windows first (in reverse order, so top-most gets priority)
        for (let i = this.activeWindows.length - 1; i >= 0; i--) {
            const window = this.activeWindows[i];
            if (window.handleClick && window.handleClick(x, y)) {
                return true;
            }
        }
        
        // Check standard components
        if (this.messageLog.handleClick && this.messageLog.handleClick(x, y)) {
            return true;
        }
        
        if (this.statusBar.handleClick && this.statusBar.handleClick(x, y)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle key press
     * @param {string} key - Key that was pressed
     * @returns {boolean} - Whether key was handled by UI
     */
    handleKeyPress(key) {
        // If we have active windows, send key to top-most window
        if (this.activeWindows.length > 0) {
            const topWindow = this.activeWindows[this.activeWindows.length - 1];
            if (topWindow.handleKeyPress && topWindow.handleKeyPress(key)) {
                return true;
            }
            
            // Escape key closes top window
            if (key === 'Escape') {
                this.closeTopWindow();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Display a message in the game log
     * @param {string} text - Message text
     * @param {string} type - Message type (info, warning, danger)
     */
    logMessage(text, type = 'info') {
        this.messageLog.addMessage(text, type);
    }
    
    /**
     * Open inventory window
     */
    openInventory() {
        if (!this.inventory) {
            this.inventory = new InventoryWindow(this.game);
        }
        
        this.openWindow(this.inventory);
    }
    
    /**
     * Close inventory window
     */
    closeInventory() {
        this.closeWindow(this.inventory);
    }
    
    /**
     * Open config window
     */
    openConfig() {
        if (!this.configWindow) {
            this.configWindow = new ConfigWindow(this.game);
        }
        
        this.openWindow(this.configWindow);
    }
    
    /**
     * Close config window
     */
    closeConfig() {
        this.closeWindow(this.configWindow);
    }
    
    /**
     * Open start menu
     */
    openStartMenu() {
        if (!this.startMenu) {
            this.startMenu = new StartMenu(this.game);
        }
        
        this.openWindow(this.startMenu);
    }
    
    /**
     * Close start menu
     */
    closeStartMenu() {
        this.closeWindow(this.startMenu);
    }
    
    /**
     * Show game over screen
     * @param {boolean} victory - Whether player won
     * @param {number} score - Final score
     */
    showGameOver(victory = false, score = 0) {
        if (!this.gameOverWindow) {
            this.gameOverWindow = new GameOverWindow(this.game);
        }
        
        this.gameOverWindow.setResult(victory, score);
        this.openWindow(this.gameOverWindow);
    }
    
    /**
     * Add window to active windows
     * @param {Object} window - Window to open
     */
    openWindow(window) {
        // Remove if already in list (will be re-added at top)
        this.closeWindow(window);
        
        // Add to active windows
        this.activeWindows.push(window);
        
        // Pause game if needed
        if (window.pausesGame) {
            this.game.pause();
        }
    }
    
    /**
     * Remove window from active windows
     * @param {Object} window - Window to close
     */
    closeWindow(window) {
        const index = this.activeWindows.indexOf(window);
        if (index !== -1) {
            // Call onClose if it exists
            if (window.onClose) {
                window.onClose();
            }
            
            // Remove from active windows
            this.activeWindows.splice(index, 1);
            
            // Resume game if no pausing windows left
            if (window.pausesGame && !this.hasWindowThatPausesGame()) {
                this.game.resume();
            }
        }
    }
    
    /**
     * Close the top-most window
     */
    closeTopWindow() {
        if (this.activeWindows.length > 0) {
            this.closeWindow(this.activeWindows[this.activeWindows.length - 1]);
        }
    }
    
    /**
     * Check if any active window pauses the game
     * @returns {boolean} - Whether any window pauses game
     */
    hasWindowThatPausesGame() {
        return this.activeWindows.some(w => w.pausesGame);
    }
    
    /**
     * Update FPS counter
     * @param {number} deltaTime - Time since last frame
     */
    updateFps(deltaTime) {
        this.fpsCount++;
        
        // Update FPS display every second
        if (performance.now() - this.lastFpsUpdate >= 1000) {
            this.fpsDisplay = this.fpsCount;
            this.fpsCount = 0;
            this.lastFpsUpdate = performance.now();
        }
    }
    
    /**
     * Render FPS counter
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFps(ctx) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(`FPS: ${this.fpsDisplay}`, MAP.CANVAS_WIDTH - 10, 20);
    }
    
    /**
     * Toggle FPS display
     */
    toggleFps() {
        this.showFps = !this.showFps;
    }
}

export default UI;