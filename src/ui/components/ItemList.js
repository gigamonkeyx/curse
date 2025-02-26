/**
 * ItemList component
 * Displays a scrollable, interactive list of game items with selection, filtering and sorting
 */
import UIHelper from '../utils/UIHelper.js';
import textRenderer from '../utils/TextRenderer.js';

class ItemList {
    /**
     * Create a new item list component
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Position and dimensions
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 300;
        this.height = options.height || 400;
        
        // Appearance
        this.bgColor = options.bgColor || 'rgba(20, 20, 30, 0.7)';
        this.borderColor = options.borderColor || '#8888aa';
        this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 1;
        this.itemHeight = options.itemHeight || 40;
        this.itemPadding = options.itemPadding || 5;
        this.selectedBgColor = options.selectedBgColor || 'rgba(60, 60, 100, 0.7)';
        this.hoverBgColor = options.hoverBgColor || 'rgba(50, 50, 80, 0.5)';
        
        // Content configuration
        this.items = options.items || [];
        this.selectedIndex = options.selectedIndex || -1;
        this.hoverIndex = -1;
        this.showItemDetails = options.showItemDetails !== undefined ? options.showItemDetails : true;
        this.showItemStats = options.showItemStats !== undefined ? options.showItemStats : true;
        this.showItemIcon = options.showItemIcon !== undefined ? options.showItemIcon : true;
        this.showPrices = options.showPrices || false;
        this.showQuantities = options.showQuantities || true;
        this.sortBy = options.sortBy || null;
        this.filterBy = options.filterBy || null;
        this.itemSubtext = options.itemSubtext || null; // Function to get subtext for an item
        this.emptyText = options.emptyText || "No items";
        
        // Scroll state
        this.scrollPosition = 0;
        this.maxScrollPosition = 0;
        this.scrollbarWidth = 10;
        
        // Interactivity
        this.isScrolling = false;
        this.scrollStartY = 0;
        this.scrollStartPosition = 0;
        
        // UI elements
        this.scrollbar = null;
        
        // Callbacks
        this.onSelect = options.onSelect || null;
        this.onDoubleClick = options.onDoubleClick || null;
        this.onRightClick = options.onRightClick || null;
        this.onHover = options.onHover || null;
        
        // State tracking
        this.lastClickTime = 0;
        this.lastClickIndex = -1;
        this.doubleClickDelay = 300; // ms
        
        // Apply initial sorting if specified
        if (this.sortBy) {
            this.sort(this.sortBy);
        }
        
        // Apply initial filtering if specified
        if (this.filterBy) {
            this.filter(this.filterBy);
        }
    }
    
    /**
     * Set the items to display
     * @param {Array} items - Array of items
     */
    setItems(items) {
        this.items = items || [];
        this.selectedIndex = Math.min(this.selectedIndex, this.items.length - 1);
        
        // Apply sorting and filtering
        if (this.sortBy) {
            this.sort(this.sortBy);
        }
        
        if (this.filterBy) {
            this.filter(this.filterBy);
        }
        
        // Reset scroll position if we're showing fewer items than before
        this.updateMaxScroll();
    }
    
    /**
     * Get the currently selected item
     * @returns {Object|null} - Selected item or null
     */
    getSelectedItem() {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
            return this.items[this.selectedIndex];
        }
        return null;
    }
    
    /**
     * Set the selected item by index
     * @param {number} index - Item index to select
     */
    selectItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.selectedIndex = index;
            
            // Ensure the selected item is visible
            this.scrollToItem(index);
            
            // Call selection callback
            if (this.onSelect) {
                this.onSelect(this.items[index], index);
            }
        }
    }
    
    /**
     * Set selected item by reference
     * @param {Object} item - Item to select
     */
    selectItemByRef(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.selectItem(index);
        }
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedIndex = -1;
        if (this.onSelect) {
            this.onSelect(null, -1);
        }
    }
    
    /**
     * Ensure an item is visible in the viewport
     * @param {number} index - Item index to scroll to
     */
    scrollToItem(index) {
        if (index < 0 || index >= this.items.length) return;
        
        const itemTop = index * this.itemHeight;
        const itemBottom = itemTop + this.itemHeight;
        
        // If item is above viewport, scroll up
        if (itemTop < this.scrollPosition) {
            this.scrollPosition = itemTop;
        }
        // If item is below viewport, scroll down
        else if (itemBottom > this.scrollPosition + this.height) {
            this.scrollPosition = itemBottom - this.height;
        }
        
        // Clamp scroll position
        this.updateMaxScroll();
        this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
    }
    
    /**
     * Sort items by a key or function
     * @param {string|Function} sorter - Sort key or function
     * @param {boolean} reverse - Whether to reverse sort
     */
    sort(sorter, reverse = false) {
        this.sortBy = sorter;
        
        if (!this.items || this.items.length === 0) return;
        
        // Get currently selected item to maintain selection
        const selectedItem = this.getSelectedItem();
        
        if (typeof sorter === 'string') {
            // Sort by property
            this.items.sort((a, b) => {
                if (a[sorter] === undefined || b[sorter] === undefined) return 0;
                return a[sorter] < b[sorter] ? -1 : a[sorter] > b[sorter] ? 1 : 0;
            });
        } else if (typeof sorter === 'function') {
            // Sort by custom function
            this.items.sort(sorter);
        }
        
        // Apply reverse order if needed
        if (reverse) {
            this.items.reverse();
        }
        
        // Restore selection
        if (selectedItem) {
            this.selectItemByRef(selectedItem);
        }
    }
    
    /**
     * Filter items based on predicate
     * @param {Function} predicate - Filter function
     */
    filter(predicate) {
        this.filterBy = predicate;
        
        if (!this.items || !predicate) return;
        
        // Remember selected item
        const selectedItem = this.getSelectedItem();
        
        // Apply filter
        const filteredItems = this.items.filter(predicate);
        this.items = filteredItems;
        
        // Try to restore selection or select first item
        if (selectedItem && this.items.includes(selectedItem)) {
            this.selectItemByRef(selectedItem);
        } else {
            this.selectedIndex = this.items.length > 0 ? 0 : -1;
        }
        
        // Update scroll
        this.updateMaxScroll();
    }
    
    /**
     * Update maximum scroll position based on content height
     */
    updateMaxScroll() {
        const contentHeight = this.items.length * this.itemHeight;
        this.maxScrollPosition = Math.max(0, contentHeight - this.height);
        
        // Clamp current scroll position
        this.scrollPosition = Math.max(0, Math.min(this.scrollPosition, this.maxScrollPosition));
    }
    
    /**
     * Render the item list
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Save current transformation matrix
        ctx.save();
        
        // Background
        UIHelper.renderPanel(ctx, this.x, this.y, this.width, this.height, {
            bgColor: this.bgColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        });
        
        // Create clipping region for list content
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width - this.scrollbarWidth, this.height);
        ctx.clip();
        
        // Render empty state if no items
        if (!this.items || this.items.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.emptyText,
                this.x + (this.width - this.scrollbarWidth) / 2,
                this.y + this.height / 2
            );
        } else {
            // Determine visible range based on scroll position
            const startIndex = Math.floor(this.scrollPosition / this.itemHeight);
            const endIndex = Math.min(
                this.items.length - 1,
                Math.ceil((this.scrollPosition + this.height) / this.itemHeight)
            );
            
            // Render visible items
            for (let i = startIndex; i <= endIndex; i++) {
                const item = this.items[i];
                this.renderItem(ctx, item, i);
            }
        }
        
        // Restore transformation
        ctx.restore();
        
        // Render scrollbar if needed
        if (this.items && this.items.length > 0 && this.maxScrollPosition > 0) {
            const scrollbarX = this.x + this.width - this.scrollbarWidth;
            const scrollbarY = this.y;
            const scrollbarHeight = this.height;
            
            // Calculate viewport ratio
            const viewportRatio = this.height / (this.items.length * this.itemHeight);
            const scrollPercent = this.scrollPosition / this.maxScrollPosition;
            
            // Render scrollbar
            this.scrollbar = UIHelper.renderScrollbar(
                ctx,
                scrollbarX,
                scrollbarY,
                this.scrollbarWidth,
                scrollbarHeight,
                scrollPercent,
                viewportRatio
            );
        } else {
            this.scrollbar = null;
        }
    }
    
    /**
     * Render a single item
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} item - Item to render
     * @param {number} index - Item index
     */
    renderItem(ctx, item, index) {
        const isSelected = index === this.selectedIndex;
        const isHovered = index === this.hoverIndex && !isSelected;
        const y = this.y + (index * this.itemHeight) - this.scrollPosition;
        
        // Skip if item is outside visible area
        if (y + this.itemHeight < this.y || y > this.y + this.height) return;
        
        // Item background
        ctx.fillStyle = isSelected ? this.selectedBgColor : 
                        isHovered ? this.hoverBgColor : 
                        index % 2 === 0 ? 'rgba(30, 30, 40, 0.4)' : 'rgba(35, 35, 45, 0.4)';
        ctx.fillRect(this.x, y, this.width - this.scrollbarWidth, this.itemHeight);
        
        // Item border if selected
        if (isSelected) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.x + 1, 
                y + 1, 
                this.width - this.scrollbarWidth - 2, 
                this.itemHeight - 2
            );
        }
        
        // Determine text position based on whether icons are shown
        const textX = this.showItemIcon ? this.x + this.itemHeight + this.itemPadding : this.x + this.itemPadding;
        const textWidth = this.width - (textX - this.x) - (this.showPrices ? 70 : 15) - this.scrollbarWidth;
        
        // Render item icon
        if (this.showItemIcon) {
            this.renderItemIcon(ctx, item, this.x + this.itemPadding, y + this.itemPadding);
        }
        
        // Get item rarity style
        const rarity = item.tier !== undefined ? item.tier : (item.rarity || 0);
        const rarityStyle = textRenderer.getItemRarityStyle(rarity);
        
        // Item name
        textRenderer.renderText(
            ctx, 
            item.name || 'Unknown Item', 
            textX, 
            y + 18, 
            rarityStyle
        );
        
        // Item subtext if available
        if (this.itemSubtext && typeof this.itemSubtext === 'function') {
            const subtext = this.itemSubtext(item);
            if (subtext) {
                ctx.fillStyle = '#999999';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(
                    subtext,
                    textX,
                    y + 32,
                    textWidth
                );
            }
        } else if (this.showItemStats && item.description) {
            // Show brief description if no custom subtext
            ctx.fillStyle = '#999999';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(
                item.description,
                textX,
                y + 32,
                textWidth
            );
        }
        
        // Render price if shop mode is active
        if (this.showPrices && item.price !== undefined) {
            ctx.fillStyle = '#ffdd44';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                `${item.price}g`,
                this.x + this.width - this.scrollbarWidth - 10,
                y + this.itemHeight / 2 + 5
            );
        }
        
        // Render quantity if available
        if (this.showQuantities && item.quantity && item.quantity > 1) {
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                `x${item.quantity}`,
                this.x + this.width - this.scrollbarWidth - (this.showPrices ? 80 : 10),
                y + this.itemHeight / 2 + 5
            );
        }
    }
    
    /**
     * Render an item's icon
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} item - Item to render icon for
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    renderItemIcon(ctx, item, x, y) {
        const iconSize = this.itemHeight - this.itemPadding * 2;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y, iconSize, iconSize);
        
        // Border based on rarity
        let borderColor;
        switch (item.tier || item.rarity || 0) {
            case 1: borderColor = '#44ff44'; break; // Uncommon - green
            case 2: borderColor = '#4488ff'; break; // Rare - blue
            case 3: borderColor = '#aa44ff'; break; // Epic - purple
            case 4: borderColor = '#ffaa44'; break; // Legendary - orange
            default: borderColor = '#aaaaaa'; break; // Common - gray
        }
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, iconSize, iconSize);
        
        // If item has image, render it
        if (item.image) {
            ctx.drawImage(item.image, x, y, iconSize, iconSize);
            return;
        }
        
        // Otherwise render a simple icon based on item type
        const itemType = item.type || 'misc';
        
        ctx.fillStyle = borderColor;
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol;
        switch (itemType.toLowerCase()) {
            case 'weapon': symbol = '⚔️'; break;
            case 'armor': symbol = '🛡️'; break;
            case 'potion': symbol = '🧪'; break;
            case 'scroll': symbol = '📜'; break;
            case 'food': symbol = '🍖'; break;
            case 'ring': symbol = '💍'; break;
            case 'amulet': symbol = '📿'; break;
            case 'gold': symbol = '💰'; break;
            default: symbol = '❓'; break;
        }
        
        ctx.fillText(symbol, x + iconSize/2, y + iconSize/2);
    }
    
    /**
     * Handle mouse down event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {boolean} isRightClick - Whether this is a right click
     * @returns {boolean} - Whether the event was handled
     */
    handleMouseDown(x, y, isRightClick = false) {
        // Check if click is within component bounds
        if (x < this.x || x > this.x + this.width ||
            y < this.y || y > this.y + this.height) {
            return false;
        }
        
        // Handle scrollbar interaction
        if (this.scrollbar && this.scrollbar.contains(x, y)) {
            this.isScrolling = true;
            this.scrollStartY = y;
            this.scrollStartPosition = this.scrollPosition;
            return true;
        }
        
        // Handle item click
        if (x < this.x + this.width - this.scrollbarWidth) {
            const relativeY = y - this.y + this.scrollPosition;
            const clickedIndex = Math.floor(relativeY / this.itemHeight);
            
            if (clickedIndex >= 0 && clickedIndex < this.items.length) {
                const clickedItem = this.items[clickedIndex];
                
                if (isRightClick) {
                    // Handle right click
                    if (this.onRightClick) {
                        this.onRightClick(clickedItem, clickedIndex);
                    }
                } else {
                    // Check for double click
                    const now = Date.now();
                    if (clickedIndex === this.lastClickIndex && 
                        now - this.lastClickTime < this.doubleClickDelay) {
                        // Double click detected
                        if (this.onDoubleClick) {
                            this.onDoubleClick(clickedItem, clickedIndex);
                        }
                    } else {
                        // Single click
                        this.selectItem(clickedIndex);
                    }
                    
                    // Update click tracking
                    this.lastClickTime = now;
                    this.lastClickIndex = clickedIndex;
                }
                
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Handle mouse move event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} - Whether the event was handled
     */
    handleMouseMove(x, y) {
        // Update hover state
        if (x >= this.x && x <= this.x + this.width - this.scrollbarWidth &&
            y >= this.y && y <= this.y + this.height) {
            
            const relativeY = y - this.y + this.scrollPosition;
            const hoveredIndex = Math.floor(relativeY / this.itemHeight);
            
            if (hoveredIndex >= 0 && hoveredIndex < this.items.length) {
                if (this.hoverIndex !== hoveredIndex) {
                    this.hoverIndex = hoveredIndex;
                    
                    // Call hover callback
                    if (this.onHover) {
                        this.onHover(this.items[hoveredIndex], hoveredIndex);
                    }
                }
            } else {
                this.hoverIndex = -1;
            }
        } else {
            this.hoverIndex = -1;
        }
        
        // Handle scrollbar dragging
        if (this.isScrolling && this.scrollbar) {
            const deltaY = y - this.scrollStartY;
            
            // Calculate scroll position based on scrollbar movement
            if (this.scrollbar.vertical) {
                const scrollRatio = (this.items.length * this.itemHeight) / this.height;
                this.scrollPosition = this.scrollStartPosition + (deltaY * scrollRatio);
                
                // Clamp scroll position
                this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle mouse up event
     * @returns {boolean} - Whether the event was handled
     */
    handleMouseUp() {
        const wasScrolling = this.isScrolling;
        this.isScrolling = false;
        return wasScrolling;
    }
    
    /**
     * Handle mouse wheel event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {number} delta - Wheel delta
     * @returns {boolean} - Whether the event was handled
     */
    handleWheel(x, y, delta) {
        // Check if mouse is over component
        if (x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height) {
            
            // Calculate scroll amount (delta is positive when scrolling down)
            const scrollAmount = delta * 40;
            
            // Update scroll position
            this.scrollPosition += scrollAmount;
            
            // Clamp scroll position
            this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition));
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle keyboard navigation
     * @param {string} key - Key pressed
     * @returns {boolean} - Whether the key was handled
     */
    handleKeyPress(key) {
        if (!this.items || this.items.length === 0) return false;
        
        switch (key) {
            case 'ArrowUp':
                if (this.selectedIndex > 0) {
                    this.selectItem(this.selectedIndex - 1);
                    return true;
                }
                break;
                
            case 'ArrowDown':
                if (this.selectedIndex < this.items.length - 1) {
                    this.selectItem(this.selectedIndex + 1);
                    return true;
                }
                break;
                
            case 'Home':
                this.selectItem(0);
                return true;
                
            case 'End':
                this.selectItem(this.items.length - 1);
                return true;
                
            case 'Enter':
            case ' ':
                if (this.selectedIndex >= 0 && this.onDoubleClick) {
                    this.onDoubleClick(this.items[this.selectedIndex], this.selectedIndex);
                    return true;
                }
                break;
        }
        
        return false;
    }
}

export default ItemList;