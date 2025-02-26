/**
 * Text rendering utility
 * Handles formatted text, text effects, and advanced styling
 */

class TextRenderer {
    /**
     * Create a new text renderer
     */
    constructor() {
        // Default text styles
        this.defaultStyle = {
            font: 'sans-serif',
            size: 16,
            color: '#ffffff',
            align: 'left',
            baseline: 'alphabetic',
            bold: false,
            italic: false,
            shadow: false,
            shadowColor: 'rgba(0, 0, 0, 0.7)',
            shadowBlur: 3,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            stroke: false,
            strokeColor: '#000000',
            strokeWidth: 2,
            lineHeight: 1.2
        };
        
        // Pre-defined text styles
        this.styles = {
            default: { ...this.defaultStyle },
            title: {
                size: 32,
                bold: true,
                color: '#ffffff',
                align: 'center',
                shadow: true
            },
            subtitle: {
                size: 24,
                bold: true,
                color: '#cccccc',
                align: 'center'
            },
            heading: {
                size: 20,
                bold: true,
                color: '#aaaaff'
            },
            damage: {
                size: 18,
                bold: true,
                color: '#ff3333',
                stroke: true,
                strokeWidth: 3
            },
            healing: {
                size: 18,
                bold: true,
                color: '#33ff33',
                stroke: true,
                strokeWidth: 3
            },
            item_common: { color: '#ffffff' },
            item_uncommon: { color: '#00ff00' },
            item_rare: { color: '#0088ff' },
            item_epic: { color: '#aa00ff' },
            item_legendary: { color: '#ff8800', shadow: true }
        };
        
        // Animation settings
        this.animations = {
            typewriter: {
                speed: 30,  // ms per character
                cursorChar: '_',
                showCursor: true
            },
            fadeIn: {
                duration: 500  // ms
            },
            floating: {
                amplitude: 10,  // pixels
                period: 2000    // ms for one full cycle
            }
        };
    }
    
    /**
     * Set or create a named style
     * @param {string} name - Style name
     * @param {Object} style - Style properties
     */
    setStyle(name, style) {
        this.styles[name] = { ...this.defaultStyle, ...style };
    }
    
    /**
     * Get a named style or default
     * @param {string} name - Style name
     * @returns {Object} - Style properties
     */
    getStyle(name) {
        return this.styles[name] || this.defaultStyle;
    }
    
    /**
     * Apply text style to canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object|string} style - Style properties or style name
     */
    applyStyle(ctx, style) {
        // If style is a string, get the named style
        if (typeof style === 'string') {
            style = this.getStyle(style);
        } else {
            // Merge with default style
            style = { ...this.defaultStyle, ...style };
        }
        
        // Build font string
        let fontString = '';
        if (style.bold) fontString += 'bold ';
        if (style.italic) fontString += 'italic ';
        fontString += `${style.size}px ${style.font}`;
        
        // Apply text styles
        ctx.font = fontString;
        ctx.fillStyle = style.color;
        ctx.textAlign = style.align;
        ctx.textBaseline = style.baseline;
        
        // Apply shadow if enabled
        if (style.shadow) {
            ctx.shadowColor = style.shadowColor;
            ctx.shadowBlur = style.shadowBlur;
            ctx.shadowOffsetX = style.shadowOffsetX;
            ctx.shadowOffsetY = style.shadowOffsetY;
        } else {
            // Reset shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Apply stroke settings
        if (style.stroke) {
            ctx.strokeStyle = style.strokeColor;
            ctx.lineWidth = style.strokeWidth;
        }
        
        return style;
    }
    
    /**
     * Render simple text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to render
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object|string} style - Style properties or style name
     */
    renderText(ctx, text, x, y, style) {
        const appliedStyle = this.applyStyle(ctx, style);
        
        // Draw stroke if enabled
        if (appliedStyle.stroke) {
            ctx.strokeText(text, x, y);
        }
        
        // Draw text
        ctx.fillText(text, x, y);
    }
    
    /**
     * Render multiline text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string|Array} text - Text to render (string or array of lines)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Render options
     */
    renderMultilineText(ctx, text, x, y, options = {}) {
        const {
            style = 'default',
            maxWidth = null,
            maxLines = null,
            lineSpacing = null
        } = options;
        
        const appliedStyle = this.applyStyle(ctx, style);
        
        // Get line height
        const lineHeight = lineSpacing !== null 
            ? lineSpacing 
            : appliedStyle.size * appliedStyle.lineHeight;
        
        // Convert text to array of lines
        let lines;
        if (typeof text === 'string') {
            if (maxWidth) {
                lines = this.wrapText(ctx, text, maxWidth);
            } else {
                lines = text.split('\n');
            }
        } else if (Array.isArray(text)) {
            lines = text;
        } else {
            lines = [String(text)];
        }
        
        // Limit number of lines if specified
        if (maxLines && lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            // Add ellipsis to last line
            const lastLine = lines[lines.length - 1];
            lines[lines.length - 1] = this.truncateWithEllipsis(ctx, lastLine, maxWidth);
        }
        
        // Draw each line
        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * lineHeight);
            
            // Draw stroke if enabled
            if (appliedStyle.stroke) {
                ctx.strokeText(lines[i], x, lineY);
            }
            
            // Draw text
            ctx.fillText(lines[i], x, lineY);
        }
        
        return {
            lines,
            height: lines.length * lineHeight,
            style: appliedStyle
        };
    }
    
    /**
     * Wrap text to fit within width
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {Array} - Array of wrapped text lines
     */
    wrapText(ctx, text, maxWidth) {
        const lines = [];
        const paragraphs = text.split('\n');
        
        for (const paragraph of paragraphs) {
            if (paragraph.length === 0) {
                lines.push('');
                continue;
            }
            
            const words = paragraph.split(' ');
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
        }
        
        return lines;
    }
    
    /**
     * Truncate text and add ellipsis if too long
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to truncate
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {string} - Truncated text
     */
    truncateWithEllipsis(ctx, text, maxWidth) {
        const ellipsis = '...';
        const ellipsisWidth = ctx.measureText(ellipsis).width;
        
        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }
        
        let truncatedText = '';
        let currentWidth = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            
            if (currentWidth + charWidth + ellipsisWidth > maxWidth) {
                break;
            }
            
            truncatedText += char;
            currentWidth += charWidth;
        }
        
        return truncatedText + ellipsis;
    }
    
    /**
     * Render formatted text with different styles
     * Format: "Regular text %style:styled text% more regular text"
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Formatted text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object|string} defaultStyle - Default style
     */
    renderFormattedText(ctx, text, x, y, defaultStyle = 'default') {
        const baseStyle = this.applyStyle(ctx, defaultStyle);
        let currentX = x;
        
        // Regular expression to match style tags
        const styleRegex = /%([a-zA-Z0-9_]+):([^%]+)%/g;
        let lastIndex = 0;
        let match;
        
        while ((match = styleRegex.exec(text)) !== null) {
            const styleName = match[1];
            const styledText = match[2];
            const beforeText = text.substring(lastIndex, match.index);
            
            // Render text before the style tag
            if (beforeText) {
                this.applyStyle(ctx, baseStyle);
                ctx.fillText(beforeText, currentX, y);
                currentX += ctx.measureText(beforeText).width;
            }
            
            // Render styled text
            this.applyStyle(ctx, styleName);
            if (this.styles[styleName]?.stroke) {
                ctx.strokeText(styledText, currentX, y);
            }
            ctx.fillText(styledText, currentX, y);
            currentX += ctx.measureText(styledText).width;
            
            lastIndex = match.index + match[0].length;
        }
        
        // Render any remaining text
        const remainingText = text.substring(lastIndex);
        if (remainingText) {
            this.applyStyle(ctx, baseStyle);
            ctx.fillText(remainingText, currentX, y);
        }
    }
    
    /**
     * Render text with typewriter effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Full text to render
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Animation options
     * @param {number} progress - Animation progress (0-1)
     */
    renderTypewriter(ctx, text, x, y, options = {}, progress = 1) {
        const {
            style = 'default',
            maxWidth = null,
            showCursor = true,
            cursorChar = this.animations.typewriter.cursorChar
        } = options;
        
        // Apply style
        const appliedStyle = this.applyStyle(ctx, style);
        
        // Calculate visible portion of text
        const charCount = Math.floor(text.length * progress);
        const visibleText = text.substring(0, charCount);
        
        // Add cursor if not complete
        const displayText = progress < 1 && showCursor 
            ? visibleText + cursorChar
            : visibleText;
        
        // Render text
        if (maxWidth) {
            this.renderMultilineText(ctx, displayText, x, y, { 
                style: appliedStyle, 
                maxWidth 
            });
        } else {
            this.renderText(ctx, displayText, x, y, appliedStyle);
        }
    }
    
    /**
     * Render animated floating text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to render
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {Object} options - Animation options
     * @param {number} time - Current time for animation
     */
    renderFloatingText(ctx, text, x, y, options = {}, time = 0) {
        const {
            style = 'damage',
            amplitude = this.animations.floating.amplitude,
            period = this.animations.floating.period,
            fade = true,
            duration = 1000,
            age = 0
        } = options;
        
        // Calculate vertical offset using sine wave
        const offset = amplitude * Math.sin((2 * Math.PI * time) / period);
        
        // Calculate alpha if fading
        let alpha = 1;
        if (fade && duration > 0) {
            alpha = Math.max(0, 1 - (age / duration));
        }
        
        // Apply style with modified alpha
        const baseStyle = this.getStyle(typeof style === 'string' ? style : 'default');
        const renderStyle = { 
            ...baseStyle,
            color: this.adjustAlpha(baseStyle.color, alpha),
            shadowColor: baseStyle.shadowColor ? this.adjustAlpha(baseStyle.shadowColor, alpha) : undefined,
            strokeColor: baseStyle.strokeColor ? this.adjustAlpha(baseStyle.strokeColor, alpha) : undefined
        };
        
        // Render text with offset
        this.renderText(ctx, text, x, y + offset, renderStyle);
    }
    
    /**
     * Adjust alpha of a color string
     * @param {string} color - CSS color string
     * @param {number} alpha - New alpha value (0-1)
     * @returns {string} - Color with adjusted alpha
     */
    adjustAlpha(color, alpha) {
        // Handle rgba format
        if (color.startsWith('rgba(')) {
            return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, 
                               `rgba($1, $2, $3, ${alpha})`);
        }
        
        // Handle rgb format
        if (color.startsWith('rgb(')) {
            return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 
                               `rgba($1, $2, $3, ${alpha})`);
        }
        
        // Handle hex format
        if (color.startsWith('#')) {
            // Convert hex to rgb
            let r, g, b;
            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        // Default fallback
        return color;
    }
    
    /**
     * Get color for item rarity
     * @param {number} tier - Item tier/rarity level
     * @returns {string} - Style name for the tier
     */
    getItemRarityStyle(tier) {
        switch (tier) {
            case 0: return 'item_common';
            case 1: return 'item_uncommon';
            case 2: return 'item_rare';
            case 3: return 'item_epic';
            case 4: return 'item_legendary';
            default: return 'item_common';
        }
    }
    
    /**
     * Measure text dimensions
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string|Array} text - Text to measure
     * @param {Object|string} style - Text style
     * @param {number} maxWidth - Maximum width for wrapping
     * @returns {Object} - Text dimensions {width, height}
     */
    measureText(ctx, text, style, maxWidth = null) {
        const appliedStyle = this.applyStyle(ctx, style);
        const lineHeight = appliedStyle.size * appliedStyle.lineHeight;
        
        // Handle multiline text
        let lines;
        if (typeof text === 'string') {
            if (maxWidth) {
                lines = this.wrapText(ctx, text, maxWidth);
            } else {
                lines = text.split('\n');
            }
        } else if (Array.isArray(text)) {
            lines = text;
        } else {
            lines = [String(text)];
        }
        
        // Calculate max width of all lines
        let maxLineWidth = 0;
        for (const line of lines) {
            const lineWidth = ctx.measureText(line).width;
            if (lineWidth > maxLineWidth) {
                maxLineWidth = lineWidth;
            }
        }
        
        return {
            width: maxLineWidth,
            height: lines.length * lineHeight,
            lines: lines.length
        };
    }
}

// Create singleton instance
const textRenderer = new TextRenderer();
export default textRenderer;