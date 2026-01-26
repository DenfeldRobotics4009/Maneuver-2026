/**
 * Hook for path drawing with pointer capture
 * 
 * Handles pointer events on canvas to capture free-form drawing paths.
 * Converts screen coordinates to normalized 0-1 coordinates, applying
 * both field rotation and alliance mirroring transformations.
 */

import { useState, useCallback, RefObject } from 'react';

export interface PathDrawingState {
    drawingPoints: { x: number; y: number }[];
    isDrawing: boolean;
}

export interface PathDrawingHandlers {
    handleDrawStart: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    handleDrawMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    handleDrawEnd: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    resetDrawing: () => void;
}

export interface UsePathDrawingOptions {
    canvasRef: RefObject<HTMLCanvasElement>;
    isFieldRotated: boolean;
    alliance: 'red' | 'blue';
    isEnabled: boolean;
    onDrawComplete?: (points: { x: number; y: number }[]) => void;
    /** Optional zone bounds to constrain drawing (in canonical blue-alliance coordinates) */
    zoneBounds?: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export function usePathDrawing({
    canvasRef,
    isFieldRotated,
    alliance,
    isEnabled,
    onDrawComplete,
    zoneBounds,
}: UsePathDrawingOptions): PathDrawingState & PathDrawingHandlers {
    const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);

    const getCanonicalPoint = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            const rect = canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;

            // Transform coordinates when field is rotated 180°
            if (isFieldRotated) {
                x = 1 - x;
                y = 1 - y;
            }

            // Mirror X coordinate for Red Alliance to keep data canonical (blue-perspective)
            if (alliance === 'red') {
                x = 1 - x;
                y = 1 - y;
            }

            // Clamp to zone bounds if provided
            if (zoneBounds) {
                x = Math.max(zoneBounds.xMin, Math.min(zoneBounds.xMax, x));
                y = Math.max(zoneBounds.yMin, Math.min(zoneBounds.yMax, y));
            }

            return { x, y };
        },
        [canvasRef, isFieldRotated, alliance, zoneBounds]
    );

    const handleDrawStart = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (!isEnabled) return;

            e.preventDefault();
            e.stopPropagation();

            const point = getCanonicalPoint(e);
            if (!point) return;

            const canvas = canvasRef.current;
            if (canvas) {
                canvas.setPointerCapture(e.pointerId);
            }

            setDrawingPoints([point]);
        },
        [isEnabled, getCanonicalPoint, canvasRef]
    );

    const handleDrawMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (drawingPoints.length === 0) return;

            e.preventDefault();
            e.stopPropagation();

            const point = getCanonicalPoint(e);
            if (!point) return;

            setDrawingPoints(prev => [...prev, point]);
        },
        [drawingPoints.length, getCanonicalPoint]
    );

    const handleDrawEnd = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (drawingPoints.length === 0) return;

            e.preventDefault();
            e.stopPropagation();

            const canvas = canvasRef.current;
            if (canvas) {
                canvas.releasePointerCapture(e.pointerId);
            }

            if (onDrawComplete) {
                onDrawComplete(drawingPoints);
            }

            setDrawingPoints([]);
        },
        [drawingPoints, canvasRef, onDrawComplete]
    );

    const resetDrawing = useCallback(() => {
        setDrawingPoints([]);
    }, []);

    return {
        drawingPoints,
        isDrawing: drawingPoints.length > 0,
        handleDrawStart,
        handleDrawMove,
        handleDrawEnd,
        resetDrawing,
    };
}
