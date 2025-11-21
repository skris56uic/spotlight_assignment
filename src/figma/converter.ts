import { FigmaNode, Paint, Effect, TypeStyle, Color, LayoutConstraint } from './types';
import { rgbaToCss, rgbToHex, isVisible } from './utils';

interface ConversionResult {
    html: string;
    css: string;
    className: string;
}

export class FigmaConverter {
    private styles: Map<string, string> = new Map();
    private classCounter = 0;
    private imageMap: Record<string, string> = {};
    private fonts: Set<string> = new Set();

    constructor(imageMap: Record<string, string> = {}) {
        this.imageMap = imageMap;
    }

    convert(node: FigmaNode): string {
        this.styles.clear();
        this.fonts.clear();
        this.classCounter = 0;
        const result = this.processNode(node);

        const cssOutput = Array.from(this.styles.entries())
            .map(([className, rules]) => `.${className} { ${rules} }`)
            .join('\n');

        const fontLinks = Array.from(this.fonts)
            .map(font => `<link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@100..900&display=swap" rel="stylesheet">`)
            .join('\n');

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${node.name}</title>
    ${fontLinks}
    <style>
        body { margin: 0; padding: 0; background-color: black; }
        * { box-sizing: border-box; }
        ${cssOutput}
    </style>
</head>
<body>
    ${result.html}
</body>
</html>`;
    }

    private processNode(node: FigmaNode, parent?: FigmaNode): ConversionResult {
        if (!isVisible(node)) {
            return { html: '', css: '', className: '' };
        }

        const className = `node-${this.classCounter++}-${node.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
        let css = this.extractStyles(node, parent);
        let htmlContent = '';

        // Check if it's an image node and we have a URL
        if (this.imageMap[node.id]) {
            return {
                html: `<img src="${this.imageMap[node.id]}" class="${className}" alt="${node.name}" />`,
                css,
                className
            };
        }

        if (node.children) {
            node.children.forEach(child => {
                const childResult = this.processNode(child, node);
                htmlContent += childResult.html;
            });
        }

        if (node.type === 'TEXT' && node.characters) {
            // Replace newlines with <br> for basic text rendering
            htmlContent = node.characters.replace(/\n/g, '<br>');
        }

        this.styles.set(className, css);

        // Determine the appropriate HTML tag based on node name and type
        const elementType = this.detectElementType(node);
        let tag = elementType.tag;
        let attributes = elementType.attributes;

        // Build the opening tag with attributes
        let openingTag = `<${tag} class="${className}"`;
        if (attributes) {
            openingTag += ` ${attributes}`;
        }
        openingTag += '>';

        // Self-closing tags
        if (tag === 'input') {
            return {
                html: `<${tag} class="${className}" ${attributes || ''} />`,
                css,
                className
            };
        }

        return {
            html: `${openingTag}${htmlContent}</${tag}>`,
            css,
            className
        };
    }

    private detectElementType(node: FigmaNode): { tag: string; attributes?: string } {
        const nodeName = node.name.toLowerCase();

        // Detect buttons
        if (nodeName.includes('button') || nodeName.includes('btn')) {
            return { tag: 'button', attributes: 'type="button"' };
        }

        // Detect input fields
        if (nodeName.includes('input') || nodeName.includes('field') || nodeName.includes('textbox')) {
            // Check if it's a password field
            if (nodeName.includes('password')) {
                return { tag: 'input', attributes: 'type="password" placeholder="Password"' };
            }
            // Check if it's an email field
            if (nodeName.includes('email')) {
                return { tag: 'input', attributes: 'type="email" placeholder="Email"' };
            }
            // Default text input
            const placeholder = node.type === 'TEXT' && node.characters ? node.characters : '';
            return { tag: 'input', attributes: `type="text" placeholder="${placeholder}"` };
        }

        // Default to div or span
        if (node.type === 'TEXT') {
            return { tag: 'span' };
        }

        return { tag: 'div' };
    }

    private extractStyles(node: FigmaNode, parent?: FigmaNode): string {
        let styles: string[] = [];

        // Auto Layout -> Flexbox
        if (node.layoutMode && node.layoutMode !== 'NONE') {
            styles.push('display: flex');
            styles.push(`flex-direction: ${node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'}`);

            const alignItemsMap: Record<string, string> = {
                'MIN': 'flex-start',
                'CENTER': 'center',
                'MAX': 'flex-end',
                'BASELINE': 'baseline',
                'SPACE_BETWEEN': 'space-between'
            };

            const justifyContentMap: Record<string, string> = {
                'MIN': 'flex-start',
                'CENTER': 'center',
                'MAX': 'flex-end',
                'SPACE_BETWEEN': 'space-between'
            };

            if (node.primaryAxisAlignItems) {
                styles.push(`justify-content: ${justifyContentMap[node.primaryAxisAlignItems] || 'flex-start'}`);
            }

            if (node.counterAxisAlignItems) {
                styles.push(`align-items: ${alignItemsMap[node.counterAxisAlignItems] || 'flex-start'}`);
            }

            if (node.itemSpacing) {
                styles.push(`gap: ${node.itemSpacing}px`);
            }

            if (node.paddingTop) styles.push(`padding-top: ${node.paddingTop}px`);
            if (node.paddingRight) styles.push(`padding-right: ${node.paddingRight}px`);
            if (node.paddingBottom) styles.push(`padding-bottom: ${node.paddingBottom}px`);
            if (node.paddingLeft) styles.push(`padding-left: ${node.paddingLeft}px`);

            // Flex child properties
            if (parent && parent.layoutMode && parent.layoutMode !== 'NONE') {
                styles.push('position: static');
            } else {
                styles.push('position: absolute');
                if (parent && node.absoluteBoundingBox && parent.absoluteBoundingBox) {
                    styles.push(`left: ${node.absoluteBoundingBox.x - parent.absoluteBoundingBox.x}px`);
                    styles.push(`top: ${node.absoluteBoundingBox.y - parent.absoluteBoundingBox.y}px`);
                }
            }

        } else {
            // No Auto Layout
            if (parent && parent.layoutMode && parent.layoutMode !== 'NONE') {
                styles.push('position: static');
                if (node.layoutPositioning === 'ABSOLUTE') {
                    styles.push('position: absolute');
                    if (node.absoluteBoundingBox && parent.absoluteBoundingBox) {
                        styles.push(`left: ${node.absoluteBoundingBox.x - parent.absoluteBoundingBox.x}px`);
                        styles.push(`top: ${node.absoluteBoundingBox.y - parent.absoluteBoundingBox.y}px`);
                    }
                }
            } else {
                // Absolute positioning relative to parent
                if (parent) {
                    styles.push('position: absolute');
                    if (node.absoluteBoundingBox && parent.absoluteBoundingBox) {
                        styles.push(`left: ${node.absoluteBoundingBox.x - parent.absoluteBoundingBox.x}px`);
                        styles.push(`top: ${node.absoluteBoundingBox.y - parent.absoluteBoundingBox.y}px`);
                    } else {
                        console.warn(`Missing absoluteBoundingBox for node ${node.name} (${node.id}) or parent ${parent.name}`);
                    }
                } else {
                    // Root node
                    styles.push('position: relative');
                    styles.push('margin: 0 auto');
                }
            }
        }

        // Dimensions
        if (node.absoluteBoundingBox) {
            styles.push(`width: ${node.absoluteBoundingBox.width}px`);
            styles.push(`height: ${node.absoluteBoundingBox.height}px`);
        }

        // Fills (Background) - SKIP for TEXT nodes
        if (node.type !== 'TEXT' && node.fills && node.fills.length > 0) {
            const visibleFills = node.fills.filter(f => f.visible !== false);
            if (visibleFills.length > 0) {
                const fill = visibleFills[visibleFills.length - 1];
                if (fill.type === 'SOLID' && fill.color) {
                    styles.push(`background-color: ${rgbaToCss(fill.color)}`);
                } else if (fill.type.startsWith('GRADIENT')) {
                    styles.push(`background: ${this.parseGradient(fill)}`);
                }
            }
        }

        // Strokes (Border)
        if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
            const visibleStrokes = node.strokes.filter(s => s.visible !== false);
            if (visibleStrokes.length > 0) {
                const stroke = visibleStrokes[0];
                if (stroke.type === 'SOLID' && stroke.color) {
                    styles.push(`border: ${node.strokeWeight}px solid ${rgbaToCss(stroke.color)}`);
                }
            }
        }

        // Effects (Shadows)
        if (node.effects) {
            const shadows = node.effects
                .filter(e => e.visible !== false && (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'))
                .map(e => {
                    const inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
                    const x = e.offset?.x || 0;
                    const y = e.offset?.y || 0;
                    const blur = e.radius || 0;
                    const spread = e.spread || 0;
                    const color = e.color ? rgbaToCss(e.color) : 'rgba(0,0,0,0)';
                    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
                });

            if (shadows.length > 0) {
                styles.push(`box-shadow: ${shadows.join(', ')}`);
            }
        }

        // Typography
        if (node.type === 'TEXT' && node.style) {
            const s = node.style;
            this.fonts.add(s.fontFamily);
            styles.push(`font-family: '${s.fontFamily}', sans-serif`);
            styles.push(`font-weight: ${s.fontWeight}`);
            styles.push(`font-size: ${s.fontSize}px`);
            styles.push(`text-align: ${s.textAlignHorizontal.toLowerCase()}`);
            if (s.lineHeightPx) {
                styles.push(`line-height: ${s.lineHeightPx}px`);
            }
            if (s.letterSpacing) {
                styles.push(`letter-spacing: ${s.letterSpacing}px`);
            }

            // Text Color (Fills on text node)
            if (node.fills && node.fills.length > 0) {
                const fill = node.fills[0];
                if (fill.type === 'SOLID' && fill.color) {
                    styles.push(`color: ${rgbaToCss(fill.color)}`);
                }
            }
        }

        // Border Radius
        const anyNode = node as any;
        if (anyNode.cornerRadius) {
            styles.push(`border-radius: ${anyNode.cornerRadius}px`);
        }

        return styles.join('; ');
    }

    private parseGradient(paint: Paint): string {
        if (paint.type === 'GRADIENT_LINEAR' && paint.gradientStops && paint.gradientHandlePositions && paint.gradientHandlePositions.length >= 2) {
            const start = paint.gradientHandlePositions[0];
            const end = paint.gradientHandlePositions[1];

            // Calculate angle
            const deltaX = end.x - start.x;
            const deltaY = end.y - start.y;

            // CSS gradients start from top (0deg) and go clockwise.
            // Math.atan2 returns angle in radians from x-axis (right).
            // We need to convert to degrees and adjust for CSS standard.
            // 90deg - (angle * 180 / PI)
            let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

            // Adjust for CSS linear-gradient angle (0deg is up, 90deg is right, 180deg is down)
            // Figma coordinates: y increases downwards.
            // atan2(y, x) gives angle from positive x-axis.
            // We want angle from positive y-axis (downwards in CSS for 180deg).
            // Actually, standard CSS: 0deg = Up, 90deg = Right, 180deg = Down.
            // Figma: (0,0) top-left.

            // Let's use the standard formula: 90 + degrees
            let cssAngle = angle + 90;

            if (cssAngle < 0) cssAngle += 360;

            const stops = paint.gradientStops.map(stop => `${rgbaToCss(stop.color)} ${Math.round(stop.position * 100)}%`).join(', ');
            return `linear-gradient(${Math.round(cssAngle)}deg, ${stops})`;
        }
        return 'none';
    }
}
