/**
 * Interactive Field Map Component
 * 
 * A reusable canvas-based field map that supports:
 * - Clickable zones for starting position selection (scouting workflow)
 * - Alliance-specific field images (red/blue)
 * 
 * SINGLE SOURCE OF TRUTH: Uses zones from StartPositionConfig
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { StartPositionZone } from '@/types/team-stats-display';

interface InteractiveFieldMapProps {
    /** Array of selected positions (true/false for each position) */
    startPositions: (boolean | null)[];
    /** Array of setter functions for each position */
    setStartPositions: Array<(value: boolean) => void>;
    /** Current alliance (determines which field image to use) */
    alliance?: string;
    /** Field image for red alliance */
    fieldImageRed: string;
    /** Field image for blue alliance */
    fieldImageBlue?: string;
    /** Zone definitions (from StartPositionConfig in analysis.ts) */
    zones: StartPositionZone[];
}

/**
 * Interactive Field Map
 * 
 * Renders a clickable canvas with starting position zones overlay.
 * Used in the scouting workflow Auto Start page.
 * 
 * SINGLE SOURCE OF TRUTH: Zones MUST be provided from analysis.ts via getStartPositionConfig()
 */
export function InteractiveFieldMap({
    startPositions,
    setStartPositions,
    alliance,
    fieldImageRed,
    fieldImageBlue,
    zones,
}: InteractiveFieldMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get the appropriate field image based on alliance
    const currentFieldImage = useMemo(() => {
        if (alliance === 'blue' && fieldImageBlue) {
            return fieldImageBlue;
        }
        return fieldImageRed;
    }, [alliance, fieldImageRed, fieldImageBlue]);

    const drawSelectionIndicators = useCallback((
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number
    ) => {
        // Add semi-transparent mask over the entire field image
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const scaleX = canvasWidth / 640;
        const scaleY = canvasHeight / 480;

        zones.forEach((zone) => {
            const scaledX = zone.x * scaleX;
            const scaledY = zone.y * scaleY;
            const scaledWidth = zone.width * scaleX;
            const scaledHeight = zone.height * scaleY;

            const isSelected = startPositions[zone.position] === true;

            // Clear the mask in the zone area for better visibility
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            ctx.globalCompositeOperation = 'source-over';

            // Draw zone background
            if (isSelected) {
                // Selected zone - bright green background
                ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
            } else {
                // Unselected zone - lighter background for visibility
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            }
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // Draw zone outline
            ctx.strokeStyle = isSelected ? '#16a34a' : '#374151';
            ctx.lineWidth = isSelected ? 4 : 2;
            ctx.setLineDash(isSelected ? [] : [5, 5]);
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            ctx.setLineDash([]);

            // Draw zone number with better contrast
            ctx.fillStyle = isSelected ? '#ffffff' : '#1f2937';
            ctx.font = `bold ${Math.max(20 * Math.min(scaleX, scaleY), 16)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add text shadow for readability
            ctx.shadowColor = isSelected ? '#000000' : '#ffffff';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            const label = zone.label ?? zone.position.toString();
            ctx.fillText(
                label,
                scaledX + scaledWidth / 2,
                scaledY + scaledHeight / 2
            );

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        });
    }, [startPositions, zones]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !currentFieldImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Calculate container size
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;

            // Calculate aspect ratio preserving dimensions
            const imgAspectRatio = img.width / img.height;
            const containerAspectRatio = containerWidth / containerHeight;

            let canvasWidth, canvasHeight;

            if (imgAspectRatio > containerAspectRatio) {
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / imgAspectRatio;
            } else {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * imgAspectRatio;
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.height = `${canvasHeight}px`;

            // Draw the field image
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // Draw selection indicators
            drawSelectionIndicators(ctx, canvasWidth, canvasHeight);
        };

        img.src = currentFieldImage;
    }, [currentFieldImage, drawSelectionIndicators]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const canvasScaleX = canvas.width / 640;
        const canvasScaleY = canvas.height / 480;

        // Check which zone was clicked
        for (const zone of zones) {
            const scaledX = zone.x * canvasScaleX;
            const scaledY = zone.y * canvasScaleY;
            const scaledWidth = zone.width * canvasScaleX;
            const scaledHeight = zone.height * canvasScaleY;

            if (x >= scaledX && x <= scaledX + scaledWidth &&
                y >= scaledY && y <= scaledY + scaledHeight) {

                // Clear all other selections
                setStartPositions.forEach((setter, index) => {
                    setter(index === zone.position);
                });
                break;
            }
        }
    };

    if (!currentFieldImage) {
        return (
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No field image configured</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-1 lg:p-2 xl:p-3">
            <canvas
                ref={canvasRef}
                className="cursor-pointer max-w-full max-h-full shadow-lg rounded-md xl:shadow-xl 2xl:shadow-2xl"
                onClick={handleCanvasClick}
            />
        </div>
    );
}

export default InteractiveFieldMap;
