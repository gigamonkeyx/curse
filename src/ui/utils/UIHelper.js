/**
 * UI Helper utility
 * Provides common methods for UI rendering and interactions
 */
import { MAP } from '../../utils/Constants.js';

class UIHelper {
    /**
     * Render a panel with background and border
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {Object} options - Rendering options
     */
    static renderPanel(ctx, x, y, width, height, options = {}) {
        const {
            bgColor = 'rgba(20, 20, 30, 0.9)',
            borderColor = '#8888aa',
            borderWidth = 2,
            shadowColor = 'rgba(0, 0, 0, 0.5)',
            shadowBlur = 0,
            cornerRadius = 0
        } = options;
        
        // Shadow if specified
        if (shadowBlur > 0) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
        }
        
        // Background
        ctx.fillStyle = bgColor;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Border
        if (borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            
            if (cornerRadius > 0) {
                this.roundRect(ctx, x, y, width, height, cornerRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
    
    /**
     * Draw a rounded rectangle path
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     */
    static roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
    
    /**
     * Render a button
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Button text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {Object} options - Button options
     * @returns {Object} - Button object for interaction tracking
     */
    static renderButton(ctx, text, x, y, width, height, options = {}) {
        const {
            bgColor = '#444466',
            hoverColor = '#555577',
            activeColor = '#666688',
            borderColor = '#8888aa',
            textColor = '#ffffff',
            fontSize = 14,
            fontFamily = 'sans-serif',
            cornerRadius = 0,
            isHovered = false,
            isActive = false,
            isDisabled = false,
            textAlign = 'center',
            icon = null
        } = options;
        
        // Choose background color based on state
        let fillColor = bgColor;
        if (isDisabled) {
            fillColor = 'rgba(60, 60, 80, 0.5)';
        } else if (isActive) {
            fillColor = activeColor;
        } else if (isHovered) {
            fillColor = hoverColor;
        }
        
        // Button background
        ctx.fillStyle = fillColor;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Button border
        ctx.strokeStyle = isDisabled ? 'rgba(136, 136, 170, 0.5)' : borderColor;
        ctx.lineWidth = 1;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        // Button text
        ctx.fillStyle = isDisabled ? 'rgba(255, 255, 255, 0.5)' : textColor;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        
        const textY = y + (height / 2) + (fontSize / 3);
        
        // Draw icon if provided
        if (icon) {
            const iconSize = height * 0.6;
            const iconX = x + (height / 2) - (iconSize / 2);
            const iconY = y + (height / 2) - (iconSize / 2);
            
            ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
            
            // Adjust text position for icon
            if (textAlign === 'center') {
                ctx.fillText(text, x + (width / 2) + (iconSize / 2), textY);
            } else if (textAlign === 'left') {
                ctx.fillText(text, x + height + 5, textY);
            }
        } else {
            // No icon, just center the text
            if (textAlign === 'center') {
                ctx.fillText(text, x + (width / 2), textY);
            } else if (textAlign === 'left') {
                ctx.fillText(text, x + 10, textY);
            } else if (textAlign === 'right') {
                ctx.fillText(text, x + width - 10, textY);
            }
        }
        
        // Return button object for interaction tracking
        return {
            type: 'button',
            text,
            x,
            y,
            width,
            height,
            isDisabled,
            contains: (px, py) => {
                return !isDisabled && px >= x && px <= x + width && py >= y && py <= y + height;
            }
        };
    }
    
    /**
     * Render a progress bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Bar width
     * @param {number} height - Bar height
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @param {Object} options - Bar options
     */
    static renderBar(ctx, x, y, width, height, value, max, options = {}) {
        const {
            bgColor = '#222222',
            fillColor = '#33aa33',
            borderColor = '#444444',
            showText = false,
            textColor = '#ffffff',
            fontSize = 12,
            fontFamily = 'sans-serif',
            format = null,
            cornerRadius = 0
        } = options;
        
        // Background
        ctx.fillStyle = bgColor;
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Calculate fill width
        const percentage = Math.max(0, Math.min(1, value / max));
        const fillWidth = Math.max(0, Math.min(width, percentage * width));
        
        // Fill
        if (fillWidth > 0) {
            ctx.fillStyle = fillColor;
            if (cornerRadius > 0 && fillWidth >= cornerRadius * 2) {
                this.roundRect(ctx, x, y, fillWidth, height, cornerRadius);
                ctx.fill();
            } else if (fillWidth > 0) {
                ctx.fillRect(x, y, fillWidth, height);
            }
        }
        
        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        // Text
        if (showText) {
            ctx.fillStyle = textColor;
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let text;
            if (format) {
                text = format(value, max, percentage);
            } else {
                text = `${Math.round(value)}/${max}`;
            }
            
            ctx.fillText(text, x + (width / 2), y + (height / 2));
        }
    }
    
    /**
     * Render a slider control
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Slider width
     * @param {number} height - Slider height
     * @param {number} value - Current value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {Object} options - Slider options
     * @returns {Object} - Slider object for interaction tracking
     */
    static renderSlider(ctx, x, y, width, height, value, min, max, options = {}) {
        const {
            trackColor = '#333344',
            fillColor = '#5555aa',
            handleColor = '#aaaacc',
            borderColor = '#8888aa',
            showValue = true,
            valueFormat = null,
            fontSize = 14,
            fontFamily = 'sans-serif'
        } = options;
        
        // Calculate the position for the slider handle
        const normalizedValue = (value - min) / (max - min);
        const handlePosition = Math.max(0, Math.min(1, normalizedValue));
        const fillWidth = handlePosition * width;
        
        // Track background
        ctx.fillStyle = trackColor;
        ctx.fillRect(x, y, width, height);
        
        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, fillWidth, height);
        
        // Handle
        ctx.fillStyle = handleColor;
        const handleSize = height * 1.5;
        ctx.fillRect(x + fillWidth - handleSize/2, y - handleSize/4, handleSize, handleSize);
        
        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Value
        if (showValue) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'right';
            
            let displayValue;
            if (valueFormat) {
                displayValue = valueFormat(value);
            } else {
                displayValue = Math.round(value);
            }
            
            ctx.fillText(displayValue.toString(), x + width + 30, y + height/2 + 5);
        }
        
        // Return slider object for interaction tracking
        return {
            type: 'slider',
            x, 
            y,
            width,
            height, 
            value,
            min,
            max,
            handleSize,
            contains: (px, py) => {
                // Check handle first (with larger hit area)
                const handleX = x + fillWidth - handleSize/2;
                const handleY = y - handleSize/4;
                if (px >= handleX - 5 && px <= handleX + handleSize + 5 && 
                    py >= handleY - 5 && py <= handleY + handleSize + 5) {
                    return true;
                }
                
                // Then check track
                return px >= x && px <= x + width &&
                       py >= y && py <= y + height;
            },
            getValueFromPosition: (px) => {
                const percentage = Math.max(0, Math.min(1, (px - x) / width));
                return min + percentage * (max - min);
            }
        };
    }
    
    /**
     * Render a toggle switch
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Switch width
     * @param {number} height - Switch height
     * @param {boolean} value - Toggle state
     * @param {Object} options - Switch options
     * @returns {Object} - Toggle object for interaction tracking
     */
    static renderToggle(ctx, x, y, width, height, value, options = {}) {
        const {
            trackColorOff = '#333344',
            trackColorOn = '#5555aa',
            handleColor = '#ffffff',
            borderColor = '#8888aa',
            cornerRadius = height / 2
        } = options;
        
        // Background track
        ctx.fillStyle = value ? trackColorOn : trackColorOff;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Handle position
        const handleSize = height - 4;
        const handleX = value ? (x + width - handleSize - 2) : (x + 2);
        
        // Handle
        ctx.fillStyle = handleColor;
        if (cornerRadius > 0) {
            this.roundRect(ctx, handleX, y + 2, handleSize, handleSize, cornerRadius - 2);
            ctx.fill();
        } else {
            ctx.fillRect(handleX, y + 2, handleSize, handleSize);
        }
        
        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, width, height, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        // Return toggle object for interaction tracking
        return {
            type: 'toggle',
            x,
            y,
            width,
            height,
            value,
            contains: (px, py) => {
                return px >= x && px <= x + width &&
                       py >= y && py <= y + height;
            }
        };
    }
    
    /**
     * Render styled text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to render
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Text options
     */
    static renderText(ctx, text, x, y, options = {}) {
        const {
            color = '#ffffff',
            fontSize = 16,
            fontFamily = 'sans-serif',
            fontWeight = 'normal',
            align = 'left',
            baseline = 'alphabetic',
            maxWidth = null,
            shadow = false,
            shadowColor = 'rgba(0, 0, 0, 0.5)',
            shadowBlur = 3,
            shadowOffsetX = 2,
            shadowOffsetY = 2,
            stroke = false,
            strokeColor = '#000000',
            strokeWidth = 2
        } = options;
        
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        
        // Apply shadow if requested
        if (shadow) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = shadowOffsetX;
            ctx.shadowOffsetY = shadowOffsetY;
        }
        
        // Draw stroke if requested
        if (stroke) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            
            if (maxWidth) {
                ctx.strokeText(text, x, y, maxWidth);
            } else {
                ctx.strokeText(text, x, y);
            }
        }
        
        // Draw text
        ctx.fillStyle = color;
        
        if (maxWidth) {
            ctx.fillText(text, x, y, maxWidth);
        } else {
            ctx.fillText(text, x, y);
        }
        
        // Reset shadow
        if (shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }
    
    /**
     * Wrap text to fit within a certain width
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width
     * @param {Object} options - Text options
     * @returns {Array} - Array of text lines
     */
    static wrapText(ctx, text, maxWidth, options = {}) {
        const {
            fontSize = 16,
            fontFamily = 'sans-serif',
            fontWeight = 'normal'
        } = options;
        
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * Render a scroll bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Scrollbar width
     * @param {number} height - Scrollbar height
     * @param {number} scrollPosition - Current scroll position (0-1)
     * @param {number} viewportRatio - Visible portion ratio (0-1)
     * @param {Object} options - Scrollbar options
     * @returns {Object} - Scrollbar object for interaction tracking
     */
    static renderScrollbar(ctx, x, y, width, height, scrollPosition, viewportRatio, options = {}) {
        const {
            trackColor = '#222222',
            handleColor = '#555555',
            borderColor = '#333333',
            vertical = true
        } = options;
        
        // Ensure values are in valid range
        scrollPosition = Math.max(0, Math.min(1 - viewportRatio, scrollPosition));
        viewportRatio = Math.max(0.1, Math.min(1, viewportRatio));
        
        // Coordinates and dimensions based on orientation
        const trackX = vertical ? x : x;
        const trackY = vertical ? y : y;
        const trackW = vertical ? width : width;
        const trackH = vertical ? height : height;
        
        // Draw track
        ctx.fillStyle = trackColor;
        ctx.fillRect(trackX, trackY, trackW, trackH);
        
        // Calculate handle dimensions
        let handleSize = Math.max(20, (vertical ? height : width) * viewportRatio);
        let handlePos = (vertical ? height - handleSize : width - handleSize) * scrollPosition;
        
        // Draw handle
        ctx.fillStyle = handleColor;
        if (vertical) {
            ctx.fillRect(trackX, trackY + handlePos, trackW, handleSize);
        } else {
            ctx.fillRect(trackX + handlePos, trackY, handleSize, trackH);
        }
        
        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(trackX, trackY, trackW, trackH);
        
        // Return scrollbar object for interaction tracking
        return {
            type: 'scrollbar',
            x: trackX,
            y: trackY,
            width: trackW,
            height: trackH,
            handleSize: handleSize,
            handlePos: handlePos,
            vertical: vertical,
            scrollPosition: scrollPosition,
            viewportRatio: viewportRatio,
            contains: (px, py) => {
                return px >= trackX && px <= trackX + trackW &&
                       py >= trackY && py <= trackY + trackH;
            },
            isOnHandle: (px, py) => {
                if (vertical) {
                    return px >= trackX && px <= trackX + trackW &&
                           py >= trackY + handlePos && py <= trackY + handlePos + handleSize;
                } else {
                    return px >= trackX + handlePos && px <= trackX + handlePos + handleSize &&
                           py >= trackY && py <= trackY + trackH;
                }
            },
            getScrollPositionFromPoint: (px, py) => {
                if (vertical) {
                    let newPos = (py - trackY - handleSize/2) / (trackH - handleSize);
                    return Math.max(0, Math.min(1 - viewportRatio, newPos));
                } else {
                    let newPos = (px - trackX - handleSize/2) / (trackW - handleSize);
                    return Math.max(0, Math.min(1 - viewportRatio, newPos));
                }
            }
        };
    }
    
    /**
     * Render an icon button (image or symbol)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Button size
     * @param {Object} options - Button options
     * @returns {Object} - Button object for interaction tracking
     */
    static renderIconButton(ctx, x, y, size, options = {}) {
        const {
            icon = null,
            symbol = null,
            bgColor = '#444466',
            hoverColor = '#555577',
            activeColor = '#666688',
            color = '#ffffff',
            borderColor = '#8888aa',
            cornerRadius = size/4,
            isHovered = false,
            isActive = false,
            isDisabled = false,
        } = options;
        
        // Choose background color based on state
        let fillColor = bgColor;
        if (isDisabled) {
            fillColor = 'rgba(60, 60, 80, 0.5)';
        } else if (isActive) {
            fillColor = activeColor;
        } else if (isHovered) {
            fillColor = hoverColor;
        }
        
        // Button background
        ctx.fillStyle = fillColor;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, size, size, cornerRadius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, size, size);
        }
        
        // Draw icon or symbol
        if (icon && icon instanceof Image) {
            const padding = size * 0.2;
            ctx.drawImage(icon, x + padding, y + padding, size - padding*2, size - padding*2);
        } else if (symbol) {
            ctx.fillStyle = isDisabled ? 'rgba(255, 255, 255, 0.5)' : color;
            ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, x + size/2, y + size/2);
        }
        
        // Button border
        ctx.strokeStyle = isDisabled ? 'rgba(136, 136, 170, 0.5)' : borderColor;
        ctx.lineWidth = 1;
        
        if (cornerRadius > 0) {
            this.roundRect(ctx, x, y, size, size, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, size, size);
        }
        
        // Return button object for interaction tracking
        return {
            type: 'iconButton',
            x,
            y,
            width: size,
            height: size,
            isDisabled,
            contains: (px, py) => {
                return !isDisabled && px >= x && px <= x + size && py >= y && py <= y + size;
            }
        };
    }
    
    /**
     * Render a tooltip
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Tooltip text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Tooltip options
     */
    static renderTooltip(ctx, text, x, y, options = {}) {
        const {
            bgColor = 'rgba(40, 40, 50, 0.95)',
            textColor = '#ffffff',
            borderColor = '#8888aa',
            fontSize = 14,
            fontFamily = 'sans-serif',
            padding = 8,
            maxWidth = 200,
            position = 'bottom'
        } = options;
        
        // Set font for measurement
        ctx.font = `${fontSize}px ${fontFamily}`;
        
        // Wrap text if needed
        let lines;
        if (typeof text === 'string') {
            lines = this.wrapText(ctx, text, maxWidth - padding * 2, { fontSize, fontFamily });
        } else if (Array.isArray(text)) {
            lines = text;
        } else {
            lines = [String(text)];
        }
        
        // Calculate dimensions
        const lineHeight = fontSize * 1.2;
        const tooltipWidth = Math.min(
            maxWidth,
            lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0) + padding * 2
        );
        const tooltipHeight = lines.length * lineHeight + padding * 2;
        
        // Calculate position based on requested position
        let tooltipX = x;
        let tooltipY = y;
        
        switch (position) {
            case 'top':
                tooltipX -= tooltipWidth / 2;
                tooltipY -= tooltipHeight + 10;
                break;
            case 'bottom':
                tooltipX -= tooltipWidth / 2;
                tooltipY += 10;
                break;
            case 'left':
                tooltipX -= tooltipWidth + 10;
                tooltipY -= tooltipHeight / 2;
                break;
            case 'right':
                tooltipX += 10;
                tooltipY -= tooltipHeight / 2;
                break;
        }
        
        // Keep tooltip on screen
        tooltipX = Math.max(5, Math.min(MAP.CANVAS_WIDTH - tooltipWidth - 5, tooltipX));
        tooltipY = Math.max(5, Math.min(MAP.CANVAS_HEIGHT - tooltipHeight - 5, tooltipY));
        
        // Draw tooltip background
        ctx.fillStyle = bgColor;
        this.roundRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
        ctx.fill();
        
        // Draw tooltip border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        this.roundRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
        ctx.stroke();
        
        // Draw tooltip text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                tooltipX + padding,
                tooltipY + padding + (i * lineHeight)
            );
        }
    }
}

export default UIHelper;