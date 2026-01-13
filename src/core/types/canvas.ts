/**
 * Canvas Overlay Types
 * 
 * Defines the structure for different types of overlays that can be rendered
 * on the strategy field canvas.
 */

export interface Point {
    x: number;
    y: number;
}

export interface AutoPathData {
    teamNumber: string;
    pathPoints: Point[];
    color: string;
    label?: string;
}

export interface TeamLabelData {
    teamNumber: string;
    alliance: 'red' | 'blue';
    slot: number; // 0, 1, or 2 within alliance
}

export type OverlayType = 'teamLabel' | 'autoPath';

export interface CanvasOverlay {
    id: string;
    type: OverlayType;
    data: TeamLabelData | AutoPathData;
    isVisible: boolean;
}

export interface CanvasDimensions {
    width: number;
    height: number;
}
