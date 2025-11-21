export interface FigmaDocument {
    document: FigmaNode;
    components: { [key: string]: Component };
    styles: { [key: string]: Style };
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    version: string;
}

export interface FigmaNode {
    id: string;
    name: string;
    type: NodeType;
    children?: FigmaNode[];
    absoluteBoundingBox?: Rect;
    absoluteRenderBounds?: Rect;
    constraints?: LayoutConstraint;
    fills?: Paint[];
    strokes?: Paint[];
    strokeWeight?: number;
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
    effects?: Effect[];
    characters?: string;
    style?: TypeStyle;
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number;
    backgroundColor?: Color;
    opacity?: number;
    visible?: boolean;
    componentId?: string;
    styles?: Record<StyleType, string>;
    layoutPositioning?: 'AUTO' | 'ABSOLUTE';
}

export type NodeType =
    | 'DOCUMENT'
    | 'CANVAS'
    | 'FRAME'
    | 'GROUP'
    | 'VECTOR'
    | 'BOOLEAN_OPERATION'
    | 'STAR'
    | 'LINE'
    | 'ELLIPSE'
    | 'REGULAR_POLYGON'
    | 'RECTANGLE'
    | 'TEXT'
    | 'SLICE'
    | 'COMPONENT'
    | 'COMPONENT_SET'
    | 'INSTANCE';

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface LayoutConstraint {
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface Paint {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
    visible?: boolean;
    opacity?: number;
    color?: Color;
    gradientHandlePositions?: Vector[];
    gradientStops?: ColorStop[];
    scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
    imageRef?: string;
}

export interface Vector {
    x: number;
    y: number;
}

export interface ColorStop {
    position: number;
    color: Color;
}

export interface Effect {
    type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    visible: boolean;
    radius: number;
    color?: Color;
    blendMode?: BlendMode;
    offset?: Vector;
    spread?: number;
}

export type BlendMode =
    | 'PASS_THROUGH'
    | 'NORMAL'
    | 'DARKEN'
    | 'MULTIPLY'
    | 'LINEAR_BURN'
    | 'COLOR_BURN'
    | 'LIGHTEN'
    | 'SCREEN'
    | 'LINEAR_DODGE'
    | 'COLOR_DODGE'
    | 'OVERLAY'
    | 'SOFT_LIGHT'
    | 'HARD_LIGHT'
    | 'DIFFERENCE'
    | 'EXCLUSION'
    | 'HUE'
    | 'SATURATION'
    | 'COLOR'
    | 'LUMINOSITY';

export interface TypeStyle {
    fontFamily: string;
    fontPostScriptName: string;
    fontWeight: number;
    fontSize: number;
    textAlignHorizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
    letterSpacing: number;
    lineHeightPx: number;
    lineHeightPercent: number;
    lineHeightUnit: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
    italic?: boolean;
}

export interface Component {
    key: string;
    name: string;
    description: string;
}

export interface Style {
    key: string;
    name: string;
    description: string;
    styleType: StyleType;
}

export type StyleType = 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
