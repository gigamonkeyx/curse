/**
 * Panel component
 * A reusable UI container with customizable appearance and behavior
 */
import UIHelper from '../utils/UIHelper.js';

class Panel {
    /**
     * Create a new panel
     * @param {Object} options - Panel configuration
     */
    constructor(options = {}) {
        // Position and dimensions
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 200;
        this.height = options.height || 150;
        
        // Appearance
        this.bgColor = options.bgColor || 'rgba(20, 20, 30, 0.9)';
        this.borderColor = options.borderColor || '#8888aa';
        this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 2;
        this.cornerRadius = options.cornerRadius || 0;
        this.shadowBlur = options.shadowBlur || 0;
        this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.5)';
        
        // Content options
        this.padding = options.padding !== undefined ? options.padding : 10;
        this.title = options.title || null;
        this.titleHeight = options.titleHeight || 30;
        this.titleFont = options.titleFont || '18px sans-serif';
        this.titleColor = options.titleColor || '#ffffff';
        this.titleAlign = options.titleAlign || 'center';
        this.titleBgColor = options.titleBgColor || null;
        
        // Scroll
        this.scrollable = options.scrollable || false;
        this.scrollPosition = 0;
        this.contentHeight = 0;
        this.scrollTrackWidth = 12;
        
        // State
        this.visible = options.visible !== undefined ? options.visible : true;
        this.active = options.active !== undefined ? options.active : true;
        this.draggable = options.draggable || false;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.resizable = options.resizable || false;
        this.isResizing = false;
        this.minWidth = options.minWidth || 100;
        this.minHeight = options.minHeight || 50;
        this.maxWidth = options.maxWidth || Infinity;
        this.maxHeight = options.maxHeight || Infinity;
        
        // Close button
        this.closable = options.closable || false;
        
        // Callbacks
        this.onClose = options.onClose || null;
        this.onResize = options.onResize || null;
        this.onDrag = options.onDrag || null;
        
        // Child elements
        this.children = [];
        
        // Interactive elements
        this.buttons = [];
        this.scrollbar = null;
    }
    
    /**
     * Add a child element
     * @param {Object} child - Child element with render method
     */
    addChild(child) {
        this.children.push(child);
    }
    
    /**
     * Remove a child element
     * @param {Object} child - Child to remove
     */
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
    
    /**
     * Get content area dimensions
     * @returns {Object} - {x, y, width, height}
     */
    getContentArea() {
        const titleOffset = this.title ? this.titleHeight : 0;
        const x = this.x + this.padding;
        const y = this.y + this.padding + titleOffset;
        const width = this.width - (this.padding * 2) - (this.scrollable ? this.scrollTrackWidth : 0);
        const height = this.height - (this.padding * 2) - titleOffset;
        
        return { x, y, width, height };
    }
    
    /**
     * Render panel
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.visible) return;
        
        this.buttons = [];
        
        // Panel background and border
        UIHelper.renderPanel(ctx, this.x, this.y, this.width, this.height, {
            bgColor: this.bgColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth,
            cornerRadius: this.cornerRadius,
            shadowBlur: this.shadowBlur,
            shadowColor: this.shadowColor
        });
        
        // Title area
        if (this.title) {
            // Title background
            if (this.titleBgColor) {
                ctx.fillStyle = this.titleBgColor;
                if (this.cornerRadius > 0) {
                    // Special handling for title with rounded corners
                    ctx.beginPath();
                    ctx.moveTo(this.x + this.cornerRadius, this.y);
                    ctx.lineTo(this.x + this.width - this.cornerRadius, this.y);
                    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.cornerRadius, this.cornerRadius);
                    ctx.lineTo(this.x + this.width, this.y + this.titleHeight);
                    ctx.lineTo(this.x, this.y + this.titleHeight);
                    ctx.lineTo(this.x, this.y + this.cornerRadius);
                    ctx.arcTo(this.x, this.y, this.x + this.cornerRadius, this.y, this.cornerRadius);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillRect(this.x, this.y, this.width, this.titleHeight);
                }
            }
            
            // Title text
            ctx.fillStyle = this.titleColor;
            ctx.font = this.titleFont;
            ctx.textAlign = this.titleAlign;
            
            let titleX;
            if (this.titleAlign === 'center') {
                titleX = this.x + this.width / 2;
            } else if (this.titleAlign === 'left') {
                titleX = this.x + this.padding;
            } else {
                titleX = this.x + this.width - this.padding;
            }
            
            ctx.fillText(this.title, titleX, this.y + this.titleHeight / 2 + 6);
        }
        
        // Close button
        if (this.closable) {
            const closeButton = UIHelper.renderIconButton(ctx, 
                this.x + this.width - 25, 
                this.y + 5, 
                20, 
                {
                    symbol: "×",
                    color: "#ffffff",
                    bgColor: "rgba(80, 80, 100, 0.7)",
                    hoverColor: "rgba(255, 80, 80, 0.8)"
                }
            );
            
            this.buttons.push({
                ...closeButton,
                action: () => {
                    if (this.onClose) {
                        this.onClose();
                    }
                    this.visible = false;
                }
            });
        }
        
        // Calculate content area
        const contentArea = this.getContentArea();
        
        // Create clipping region for content
        ctx.save();
        ctx.beginPath();
        ctx.rect(contentArea.x, contentArea.y, contentArea.width, contentArea.height);
        ctx.clip();
        
        // Render children with scroll offset
        if (this.children.length > 0) {
            // Calculate content height
            this.contentHeight = 0;
            for (const child of this.children) {
                if (child.height) {
                    this.contentHeight = Math.max(this.contentHeight, child.y + child.height);
                }
            }
            
            // Apply scroll offset
            ctx.translate(0, -this.scrollPosition);
            
            // Render each child
            for (const child of this.children) {
                if (child.render) {
                    child.render(ctx, contentArea.x, contentArea.y);
                }
            }
            
            // Reset transform
            ctx.restore();
            
            // Render scrollbar if needed
            if (this.scrollable && this.contentHeight > contentArea.height) {
                const scrollTrackX = this.x + this.width - this.scrollTrackWidth - this.padding;
                const scrollTrackY = contentArea.y;
                const scrollTrackHeight = contentArea.height;
                
                // Calculate viewport ratio and scroll position percentage
                const viewportRatio = contentArea.height / this.contentHeight;
                const scrollPercent = this.scrollPosition / (this.contentHeight - contentArea.height);
                
                // Render scrollbar
                this.scrollbar = UIHelper.renderScrollbar(ctx, 
                    scrollTrackX, 
                    scrollTrackY, 
                    this.scrollTrackWidth, 
                    scrollTrackHeight, 
                    scrollPercent, 
                    viewportRatio, 
                    { vertical: true }
                );
            } else {
                this.scrollbar = null;
            }
        } else {
            // No children, so just restore context
            ctx.restore();
        }
        
        // Resize handle
        if (this.resizable) {
            // Bottom-right corner resize handle
            ctx.fillStyle = this.borderColor;
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const offset = (i * 4) + 4;
                ctx.moveTo(this.x + this.width - offset, this.y + this.height - 4);
                ctx.lineTo(this.x + this.width - 4, this.y + this.height - offset);
                ctx.lineTo(this.x + this.width - 4 - 1, this.y + this.height - offset - 1);
                ctx.lineTo(this.x + this.width - offset - 1, this.y + this.height - 4 - 1);
            }
            ctx.fill();
        }
    }
    
    /**
     * Handle mouse down event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} - Whether the event was handled
     */
    handleMouseDown(x, y) {
        if (!this.visible || !this.active) return false;
        
        // Check if click is within panel
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
            return false;
        }
        
        // Check buttons first
        for (const button of this.buttons) {
            if (button.contains(x, y)) {
                button.action();
                return true;
            }
        }
        
        // Check if dragging the scrollbar
        if (this.scrollbar && this.scrollbar.contains(x, y)) {
            const scrollInfo = this.scrollbar;
            const contentArea = this.getContentArea();
            
            // Calculate new scroll position based on mouse position
            if (scrollInfo.isOnHandle(x, y)) {
                // Start dragging the scrollbar handle
                this._scrollDragging = true;
                this._scrollDragStartY = y;
                this._scrollStartPosition = this.scrollPosition;
                return true;
            } else {
                // Click on the scrollbar track
                const scrollPercent = scrollInfo.getScrollPositionFromPoint(x, y);
                this.scrollPosition = Math.round(scrollPercent * (this.contentHeight - contentArea.height));
                return true;
            }
        }
        
        // Check for resize handle click
        if (this.resizable && 
            x >= this.x + this.width - 20 && 
            x <= this.x + this.width &&
            y >= this.y + this.height - 20 && 
            y <= this.y + this.height) {
            this.isResizing = true;
            this._resizeStartX = x;
            this._resizeStartY = y;
            this._resizeStartWidth = this.width;
            this._resizeStartHeight = this.height;
            return true;
        }
        
        // Check for title bar drag
        if (this.draggable && this.title && 
            x >= this.x && 
            x <= this.x + this.width &&
            y >= this.y && 
            y <= this.y + this.titleHeight) {
            this.isDragging = true;
            this.dragOffsetX = x - this.x;
            this.dragOffsetY = y - this.y;
            return true;
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
        if (!this.visible || !this.active) return false;
        
        // Handle scrollbar dragging
        if (this._scrollDragging && this.scrollbar) {
            const delta = y - this._scrollDragStartY;
            const contentArea = this.getContentArea();
            const scrollableAmount = this.contentHeight - contentArea.height;
            const scrollTrackHeight = contentArea.height;
            
            // Calculate movement scale based on content vs viewport ratio
            const movementScale = scrollableAmount / scrollTrackHeight;
            
            // Calculate new scroll position
            this.scrollPosition = this._scrollStartPosition + (delta * movementScale);
            
            // Clamp scroll position
            this.scrollPosition = Math.max(0, Math.min(scrollableAmount, this.scrollPosition));
            
            return true;
        }
        
        // Handle resizing
        if (this.isResizing) {
            const deltaX = x - this._resizeStartX;
            const deltaY = y - this._resizeStartY;
            
            // Calculate new dimensions
            let newWidth = this._resizeStartWidth + deltaX;
            let newHeight = this._resizeStartHeight + deltaY;
            
            // Apply constraints
            newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
            newHeight = Math.max(this.minHeight, Math.min(this.maxHeight, newHeight));
            
            // Update dimensions
            this.width = newWidth;
            this.height = newHeight;
            
            // Call resize callback
            if (this.onResize) {
                this.onResize(this.width, this.height);
            }
            
            return true;
        }
        
        // Handle dragging
        if (this.isDragging) {
            // Calculate new position
            const newX = x - this.dragOffsetX;
            const newY = y - this.dragOffsetY;
            
            // Update position
            this.x = newX;
            this.y = newY;
            
            // Call drag callback
            if (this.onDrag) {
                this.onDrag(this.x, this.y);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle mouse up event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @returns {boolean} - Whether the event was handled
     */
    handleMouseUp(x, y) {
        // Reset drag and resize states
        const wasDragging = this.isDragging || this.isResizing || this._scrollDragging;
        this.isDragging = false;
        this.isResizing = false;
        this._scrollDragging = false;
        
        return wasDragging;
    }
    
    /**
     * Handle mouse wheel event
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {number} deltaY - Scroll amount
     * @returns {boolean} - Whether the event was handled
     */
    handleWheel(x, y, deltaY) {
        if (!this.visible || !this.active || !this.scrollable) return false;
        
        // Check if mouse is over content area
        const contentArea = this.getContentArea();
        if (x >= contentArea.x && 
            x <= contentArea.x + contentArea.width &&
            y >= contentArea.y && 
            y <= contentArea.y + contentArea.height) {
            
            // Calculate scroll amount
            const scrollAmount = deltaY > 0 ? 40 : -40;
            
            // Update scroll position
            const maxScroll = Math.max(0, this.contentHeight - contentArea.height);
            this.scrollPosition = Math.max(0, Math.min(maxScroll, this.scrollPosition + scrollAmount));
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Show the panel
     */
    show() {
        this.visible = true;
    }
    
    /**
     * Hide the panel
     */
    hide() {
        this.visible = false;
    }
    
    /**
     * Toggle panel visibility
     */
    toggle() {
        this.visible = !this.visible;
    }
    
    /**
     * Set panel position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Set panel dimensions
     * @param {number} width - Width
     * @param {number} height - Height
     */
    setDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Set panel title
     * @param {string} title - New title
     */
    setTitle(title) {
        this.title = title;
    }
    
    /**
     * Add content directly as a child with position
     * @param {Object} content - Content object with render method
     * @param {number} x - X position relative to content area
     * @param {number} y - Y position relative to content area
     */
    addContent(content, x = 0, y = 0) {
        content.x = x;
        content.y = y;
        this.addChild(content);
    }
}

export default Panel;