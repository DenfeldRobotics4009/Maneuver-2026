/**
 * Hook for tracking field container dimensions using ResizeObserver
 */

import { useState, useEffect, RefObject } from 'react';

export interface FieldDimensions {
    width: number;
    height: number;
}

export function useFieldDimensions(
    containerRef: RefObject<HTMLDivElement>,
    dependencies: unknown[] = []
): FieldDimensions {
    const [dimensions, setDimensions] = useState<FieldDimensions>({ width: 0, height: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateDimensions = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;

            setDimensions({ width, height });
        };

        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(container);
        updateDimensions();

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef, ...dependencies]);

    return dimensions;
}
