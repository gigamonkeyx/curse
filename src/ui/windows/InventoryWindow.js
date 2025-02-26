/**
 * Inventory window for managing items and equipment
 * Handles item display, equipment, and player stats
 */
import { MAP, ITEM_TYPES } from '../../utils/Constants.js';

class InventoryWindow {
    constructor(game) {
        this.game = game;
        this.visible = false;
        
        // Window dimensions
        this.width = MAP.CANVAS_WIDTH * 0.8;
        this.height = MAP.CANVAS_HEIGHT * 0.8;
        this.x = (MAP.CANVAS_WIDTH - this.width) / 2;
        this.y = (MAP.CANVAS_HEIGHT - this.height) / 2;
        
        // Tabs
        this.tabs = ['Items', 'Equipment', 'Stats'];
        this.activeTab = 'Items';
        
        // Selected item/equipment
        this.selectedItemIndex = null;
        this.selectedEquipSlot = null;
        
        // Scroll position
        this.scrollOffset = 0;
        this.maxItemsVisible = 10;
        
        // UI elements
        this.buttons = [];
    }
    
    /**
     * Open the inventory window
     */
    open() {
        this.visible = true;
        this.selectedItemIndex = null;
        this.selectedEquipSlot = null;
        this.scrollOffset = 0;
    }
    
    /**
     * Close the inventory window
     */
    close() {
        this.visible = false;
    }
    
    /**
     * Toggle inventory visibility
     */
    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.selectedItemIndex = null;
            this.selectedEquipSlot = null;
            this.scrollOffset = 0;
        }
    }
    
    /**
     * Render the inventory window
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.visible) return;
        
        // Reset buttons array
        this.buttons = [];
        
        const player = this.game.player;
        if (!player) return;
        
        // Draw window background
        ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', this.x + (this.width / 2), this.y + 30);
        
        // Draw tabs
        this.renderTabs(ctx);
        
        // Draw content based on active tab
        if (this.activeTab === 'Items') {
            this.renderItemsTab(ctx, player);
        } else if (this.activeTab === 'Equipment') {
            this.renderEquipmentTab(ctx, player);
        } else if (this.activeTab === 'Stats') {
            this.renderStatsTab(ctx, player);
        }
        
        // Draw close button
        this.renderButton(ctx, "X", this.x + this.width - 30, this.y + 10, 20, 20, () => {
            this.close();
        });
    }
    
    /**
     * Render inventory tabs
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderTabs(ctx) {
        const tabWidth = this.width / this.tabs.length;
        const tabHeight = 30;
        const tabY = this.y + 40;
        
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tabX = this.x + (i * tabWidth);
            const isActive = this.tabs[i] === this.activeTab;
            
            // Tab background
            ctx.fillStyle = isActive ? '#444466' : '#333344';
            ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
            
            // Tab border
            ctx.strokeStyle = '#8888aa';
            ctx.lineWidth = 1;
            ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
            
            // Tab text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.tabs[i], tabX + (tabWidth / 2), tabY + 20);
            
            // Add tab button
            this.buttons.push({
                type: 'tab',
                text: this.tabs[i],
                x: tabX,
                y: tabY,
                width: tabWidth,
                height: tabHeight,
                action: () => {
                    this.activeTab = this.tabs[i];
                    this.selectedItemIndex = null;
                    this.selectedEquipSlot = null;
                    this.scrollOffset = 0;
                }
            });
        }
    }
    
    /**
     * Render items tab
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderItemsTab(ctx, player) {
        const items = player.inventory || [];
        const startY = this.y + 90;
        const itemHeight = 30;
        
        // Draw item list
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        
        // Draw item count
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Items: ${items.length}`, this.x + 20, this.y + 80);
        
        // No items message
        if (items.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.fillText('No items in inventory', this.x + (this.width / 2) - 80, startY + 20);
            return;
        }
        
        // Calculate visible range
        const startIndex = this.scrollOffset;
        const endIndex = Math.min(startIndex + this.maxItemsVisible, items.length);
        
        // Draw items
        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i];
            const itemY = startY + ((i - startIndex) * itemHeight);
            const isSelected = i === this.selectedItemIndex;
            
            // Item background
            ctx.fillStyle = isSelected ? '#555577' : 'transparent';
            ctx.fillRect(this.x + 10, itemY, this.width - 20, itemHeight);
            
            // Item border
            if (isSelected) {
                ctx.strokeStyle = '#aaaaff';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x + 10, itemY, this.width - 20, itemHeight);
            }
            
            // Item name and quantity
            ctx.fillStyle = isSelected ? '#ffffff' : '#cccccc';
            
            // Get tier color
            let tierColor = '#ffffff';
            if (item.tier === 1) tierColor = '#00ff00'; // Uncommon
            else if (item.tier === 2) tierColor = '#0088ff'; // Rare
            else if (item.tier === 3) tierColor = '#aa00ff'; // Epic
            else if (item.tier === 4) tierColor = '#ff8800'; // Legendary
            
            ctx.fillStyle = tierColor;
            ctx.fillText(item.name, this.x + 20, itemY + 20);
            
            // Show quantity if stackable
            if (item.quantity && item.quantity > 1) {
                ctx.fillStyle = '#aaaaaa';
                ctx.textAlign = 'right';
                ctx.fillText(`x${item.quantity}`, this.x + this.width - 30, itemY + 20);
                ctx.textAlign = 'left';
            }
            
            // Add item button
            this.buttons.push({
                type: 'item',
                item: item,
                index: i,
                x: this.x + 10,
                y: itemY,
                width: this.width - 20,
                height: itemHeight,
                action: () => {
                    this.selectedItemIndex = i;
                }
            });
        }
        
        // Draw scroll indicators if needed
        if (items.length > this.maxItemsVisible) {
            // Up indicator
            if (this.scrollOffset > 0) {
                ctx.fillStyle = '#aaaaaa';
                ctx.beginPath();
                ctx.moveTo(this.x + (this.width / 2), this.y + 70);
                ctx.lineTo(this.x + (this.width / 2) - 10, this.y + 80);
                ctx.lineTo(this.x + (this.width / 2) + 10, this.y + 80);
                ctx.closePath();
                ctx.fill();
                
                // Add up button
                this.buttons.push({
                    type: 'scroll',
                    direction: 'up',
                    x: this.x + (this.width / 2) - 15,
                    y: this.y + 70,
                    width: 30,
                    height: 15,
                    action: () => {
                        this.scrollOffset = Math.max(0, this.scrollOffset - 1);
                    }
                });
            }
            
            // Down indicator
            if (endIndex < items.length) {
                const downY = startY + (this.maxItemsVisible * itemHeight) + 10;
                ctx.fillStyle = '#aaaaaa';
                ctx.beginPath();
                ctx.moveTo(this.x + (this.width / 2), downY + 10);
                ctx.lineTo(this.x + (this.width / 2) - 10, downY);
                ctx.lineTo(this.x + (this.width / 2) + 10, downY);
                ctx.closePath();
                ctx.fill();
                
                // Add down button
                this.buttons.push({
                    type: 'scroll',
                    direction: 'down',
                    x: this.x + (this.width / 2) - 15,
                    y: downY,
                    width: 30,
                    height: 15,
                    action: () => {
                        this.scrollOffset = Math.min(items.length - this.maxItemsVisible, this.scrollOffset + 1);
                    }
                });
            }
        }
        
        // Draw item details if selected
        if (this.selectedItemIndex !== null && items[this.selectedItemIndex]) {
            this.renderItemDetails(ctx, items[this.selectedItemIndex]);
        }
    }
    
    /**
     * Render equipment tab
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderEquipmentTab(ctx, player) {
        const equipment = player.equipment || {};
        const slots = ['weapon', 'armor', 'head', 'amulet', 'ring'];
        const slotNames = {
            weapon: 'Weapon',
            armor: 'Body Armor',
            head: 'Helmet',
            amulet: 'Amulet',
            ring: 'Ring'
        };
        
        const startY = this.y + 90;
        const slotHeight = 50;
        
        // Draw equipment slots
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const slotY = startY + (i * slotHeight);
            const isSelected = slot === this.selectedEquipSlot;
            const item = equipment[slot];
            
            // Slot background
            ctx.fillStyle = isSelected ? '#555577' : '#333344';
            ctx.fillRect(this.x + 20, slotY, this.width - 40, slotHeight - 10);
            
            // Slot border
            ctx.strokeStyle = '#8888aa';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 20, slotY, this.width - 40, slotHeight - 10);
            
            // Slot name
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(slotNames[slot] || slot, this.x + 30, slotY + 20);
            
            // Item name if equipped
            if (item) {
                // Get tier color
                let tierColor = '#ffffff';
                if (item.tier === 1) tierColor = '#00ff00'; // Uncommon
                else if (item.tier === 2) tierColor = '#0088ff'; // Rare
                else if (item.tier === 3) tierColor = '#aa00ff'; // Epic
                else if (item.tier === 4) tierColor = '#ff8800'; // Legendary
                
                ctx.fillStyle = tierColor;
                ctx.fillText(item.name, this.x + 180, slotY + 20);
                
                // Item stats
                ctx.fillStyle = '#888888';
                if (item.type === ITEM_TYPES.WEAPON && item.damage) {
                    ctx.fillText(`Damage: ${item.damage}`, this.x + 180, slotY + 40);
                } else if (item.type === ITEM_TYPES.ARMOR && item.defense) {
                    ctx.fillText(`Defense: ${item.defense}`, this.x + 180, slotY + 40);
                }
            } else {
                ctx.fillStyle = '#666666';
                ctx.fillText('- Empty -', this.x + 180, slotY + 20);
            }
            
            // Add slot button
            this.buttons.push({
                type: 'equipment',
                slot: slot,
                x: this.x + 20,
                y: slotY,
                width: this.width - 40,
                height: slotHeight - 10,
                action: () => {
                    this.selectedEquipSlot = slot;
                    this.selectedItemIndex = null;
                }
            });
        }
        
        // Draw equipment actions if slot is selected
        if (this.selectedEquipSlot !== null && equipment[this.selectedEquipSlot]) {
            this.renderEquipmentActions(ctx);
        }
    }
    
    /**
     * Render stats tab
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} player - Player entity
     */
    renderStatsTab(ctx, player) {
        const startY = this.y + 90;
        const lineHeight = 25;
        
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        
        // Basic stats
        ctx.fillText(`Level: ${player.level || 1}`, this.x + 30, startY);
        ctx.fillText(`Experience: ${player.xp || 0} / ${player.nextLevel || 100}`, this.x + 30, startY + lineHeight);
        ctx.fillText(`Health: ${player.hp || 0} / ${player.maxHp || 100}`, this.x + 30, startY + lineHeight * 2);
        
        // Combat stats
        ctx.fillText(`Strength: ${player.strength || 10}`, this.x + 30, startY + lineHeight * 4);
        ctx.fillText(`Defense: ${player.defense || 5}`, this.x + 30, startY + lineHeight * 5);
        
        // Equipped item bonuses
        const bonuses = this.calculateBonuses(player);
        ctx.fillStyle = '#00ff00';
        if (bonuses.attack > 0) {
            ctx.fillText(`Attack Bonus: +${bonuses.attack}`, this.x + 30, startY + lineHeight * 7);
        }
        if (bonuses.defense > 0) {
            ctx.fillText(`Defense Bonus: +${bonuses.defense}`, this.x + 30, startY + lineHeight * 8);
        }
        
        // Game stats
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Monsters Slain: ${player.kills || 0}`, this.x + 30, startY + lineHeight * 10);
        ctx.fillText(`Items Collected: ${player.itemsFound || 0}`, this.x + 30, startY + lineHeight * 11);
        ctx.fillText(`Floors Explored: ${player.floorsExplored || 1}`, this.x + 30, startY + lineHeight * 12);
    }
    
    /**
     * Calculate equipment bonuses
     * @param {Object} player - Player entity
     * @returns {Object} - Attack and defense bonuses
     */
    calculateBonuses(player) {
        const equipment = player.equipment || {};
        let attackBonus = 0;
        let defenseBonus = 0;
        
        Object.values(equipment).forEach(item => {
            if (item) {
                if (item.type === ITEM_TYPES.WEAPON && item.damage) {
                    attackBonus += item.damage;
                } else if (item.defense) {
                    defenseBonus += item.defense;
                }
            }
        });
        
        return { attack: attackBonus, defense: defenseBonus };
    }
    
    /**
     * Render item details
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} item - Selected item
     */
    renderItemDetails(ctx, item) {
        const detailsX = this.x + 20;
        const detailsY = this.y + this.height - 150;
        const detailsWidth = this.width - 40;
        const detailsHeight = 120;
        
        // Background
        ctx.fillStyle = '#333344';
        ctx.fillRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        // Border
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        // Item name
        let tierColor = '#ffffff';
        if (item.tier === 1) tierColor = '#00ff00'; // Uncommon
        else if (item.tier === 2) tierColor = '#0088ff'; // Rare
        else if (item.tier === 3) tierColor = '#aa00ff'; // Epic
        else if (item.tier === 4) tierColor = '#ff8800'; // Legendary
        
        ctx.fillStyle = tierColor;
        ctx.font = '18px sans-serif';
        ctx.fillText(item.name, detailsX + 10, detailsY + 25);
        
        // Item type
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '14px sans-serif';
        ctx.fillText(this.getItemTypeText(item), detailsX + 10, detailsY + 45);
        
        // Item stats
        ctx.fillStyle = '#dddddd';
        if (item.type === ITEM_TYPES.WEAPON && item.damage) {
            ctx.fillText(`Damage: ${item.damage}`, detailsX + 10, detailsY + 65);
        } else if (item.defense) {
            ctx.fillText(`Defense: ${item.defense}`, detailsX + 10, detailsY + 65);
        }
        
        // Item description
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(item.description || 'No description available', detailsX + 10, detailsY + 85);
        
        // Item actions
        const actionY = detailsY + 110;
        
        if (item.type === ITEM_TYPES.WEAPON || item.type === ITEM_TYPES.ARMOR) {
            this.renderButton(ctx, "Equip", detailsX + 10, actionY - 15, 80, 30, () => {
                this.equipSelectedItem();
            });
        } else if (item.type === ITEM_TYPES.POTION || item.type === ITEM_TYPES.SCROLL) {
            this.renderButton(ctx, "Use", detailsX + 10, actionY - 15, 80, 30, () => {
                this.useSelectedItem();
            });
        }
        
        this.renderButton(ctx, "Drop", detailsX + 100, actionY - 15, 80, 30, () => {
            this.dropSelectedItem();
        });
    }
    
    /**
     * Get readable item type text
     * @param {Object} item - Item object
     * @returns {string} - Human-readable item type
     */
    getItemTypeText(item) {
        const types = {
            [ITEM_TYPES.WEAPON]: 'Weapon',
            [ITEM_TYPES.ARMOR]: 'Armor',
            [ITEM_TYPES.POTION]: 'Potion',
            [ITEM_TYPES.SCROLL]: 'Scroll',
            [ITEM_TYPES.GOLD]: 'Gold',
            [ITEM_TYPES.KEY]: 'Key',
            [ITEM_TYPES.AMULET]: 'Amulet'
        };
        
        return types[item.type] || 'Item';
    }
    
    /**
     * Render equipment action buttons
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderEquipmentActions(ctx) {
        const actionX = this.x + 20;
        const actionY = this.y + this.height - 70;
        
        this.renderButton(ctx, "Unequip", actionX, actionY, 100, 40, () => {
            this.unequipSelectedItem();
        });
    }
    
    /**
     * Render a button
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Button text
     * @param {number} x - Button X position
     * @param {number} y - Button Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {Function} action - Button click action
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
            type: 'action',
            text: text,
            x: x,
            y: y,
            width: width,
            height: height,
            action: action
        });
    }
    
    /**
     * Use selected item
     */
    useSelectedItem() {
        if (this.selectedItemIndex === null) return;
        
        const player = this.game.player;
        if (!player || !player.inventory) return;
        
        const item = player.inventory[this.selectedItemIndex];
        if (!item) return;
        
        // Call player's use item method
        if (player.useItem) {
            const success = player.useItem(item, this.selectedItemIndex);
            if (success) {
                this.selectedItemIndex = null;
            }
        }
    }
    
    /**
     * Equip selected item
     */
    equipSelectedItem() {
        if (this.selectedItemIndex === null) return;
        
        const player = this.game.player;
        if (!player || !player.inventory) return;
        
        const item = player.inventory[this.selectedItemIndex];
        if (!item) return;
        
        // Call player's equip item method
        if (player.equipItem) {
            const success = player.equipItem(item, this.selectedItemIndex);
            if (success) {
                this.selectedItemIndex = null;
            }
        }
    }
    
    /**
     * Drop selected item
     */
    dropSelectedItem() {
        if (this.selectedItemIndex === null) return;
        
        const player = this.game.player;
        if (!player || !player.inventory) return;
        
        const item = player.inventory[this.selectedItemIndex];
        if (!item) return;
        
        // Call player's drop item method
        if (player.dropItem) {
            const success = player.dropItem(this.selectedItemIndex);
            if (success) {
                this.selectedItemIndex = null;
            }
        }
    }
    
    /**
     * Unequip selected item
     */
    unequipSelectedItem() {
        if (this.selectedEquipSlot === null) return;
        
        const player = this.game.player;
        if (!player || !player.equipment) return;
        
        // Call player's unequip item method
        if (player.unequipItem) {
            const success = player.unequipItem(this.selectedEquipSlot);
            if (success) {
                this.selectedEquipSlot = null;
            }
        }
    }
    
    /**
     * Handle mouse click
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     * @returns {boolean} - Whether click was handled
     */
    handleClick(x, y) {
        if (!this.visible) return false;
        
        // Check if click is inside window
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
            this.close();
            return true;
        }
        
        // Check buttons
        for (const button of this.buttons) {
            if (x >= button.x && 
                x <= button.x + button.width && 
                y >= button.y && 
                y <= button.y + button.height) {
                if (button.action) {
                    button.action();
                }
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
                this.close();
                return true;
            case 'Tab':
                // Cycle through tabs
                const currentIndex = this.tabs.indexOf(this.activeTab);
                const nextIndex = (currentIndex + 1) % this.tabs.length;
                this.activeTab = this.tabs[nextIndex];
                this.selectedItemIndex = null;
                this.selectedEquipSlot = null;
                this.scrollOffset = 0;
                return true;
            case 'ArrowUp':
                if (this.activeTab === 'Items') {
                    if (this.selectedItemIndex === null) {
                        this.selectedItemIndex = 0;
                    } else {
                        this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
                        // Adjust scroll if needed
                        if (this.selectedItemIndex < this.scrollOffset) {
                            this.scrollOffset = this.selectedItemIndex;
                        }
                    }
                } else if (this.activeTab === 'Equipment') {
                    if (this.selectedEquipSlot === null) {
                        this.selectedEquipSlot = 'weapon';
                    } else {
                        const slots = ['weapon', 'armor', 'head', 'amulet', 'ring'];
                        const currentIndex = slots.indexOf(this.selectedEquipSlot);
                        if (currentIndex > 0) {
                            this.selectedEquipSlot = slots[currentIndex - 1];
                        }
                    }
                }
                return true;
            case 'ArrowDown':
                if (this.activeTab === 'Items') {
                    const player = this.game.player;
                    const items = player?.inventory || [];
                    
                    if (this.selectedItemIndex === null) {
                        this.selectedItemIndex = 0;
                    } else {
                        this.selectedItemIndex = Math.min(items.length - 1, this.selectedItemIndex + 1);
                        // Adjust scroll if needed
                        if (this.selectedItemIndex >= this.scrollOffset + this.maxItemsVisible) {
                            this.scrollOffset = this.selectedItemIndex - this.maxItemsVisible + 1;
                        }
                    }
                } else if (this.activeTab === 'Equipment') {
                    if (this.selectedEquipSlot === null) {
                        this.selectedEquipSlot = 'weapon';
                    } else {
                        const slots = ['weapon', 'armor', 'head', 'amulet', 'ring'];
                        const currentIndex = slots.indexOf(this.selectedEquipSlot);
                        if (currentIndex < slots.length - 1) {
                            this.selectedEquipSlot = slots[currentIndex + 1];
                        }
                    }
                }
                return true;
            case 'Enter':
                if (this.activeTab === 'Items' && this.selectedItemIndex !== null) {
                    this.useSelectedItem();
                } else if (this.activeTab === 'Equipment' && this.selectedEquipSlot !== null) {
                    this.unequipSelectedItem();
                }
                return true;
            default:
                return false;
        }
    }
}

export default InventoryWindow;