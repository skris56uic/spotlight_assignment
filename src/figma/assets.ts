import { FigmaNode } from './types';

export function isImageNode(node: FigmaNode): boolean {
    // Vector types that should be rendered as images/SVGs
    const vectorTypes = [
        'VECTOR',
        'BOOLEAN_OPERATION',
        'STAR',
        'LINE',
        'ELLIPSE',
        'REGULAR_POLYGON',
        'SLICE'
    ];

    if (vectorTypes.includes(node.type)) {
        return true;
    }

    // Check for image fills
    if (node.fills) {
        const hasImageFill = node.fills.some(fill => fill.type === 'IMAGE' && fill.visible !== false);
        if (hasImageFill) {
            return true;
        }
    }

    return false;
}

export function collectImageNodes(node: FigmaNode, imageNodes: string[] = []): string[] {
    if (isImageNode(node)) {
        imageNodes.push(node.id);
    }

    if (node.children) {
        node.children.forEach(child => collectImageNodes(child, imageNodes));
    }

    return imageNodes;
}
