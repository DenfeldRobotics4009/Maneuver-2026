/**
 * Hook for alliance-aware coordinate mirroring
 * 
 * All canonical coordinates are stored in blue alliance perspective (left side = alliance zone).
 * For red alliance, visual X is mirrored: visualX = 1 - canonicalX
 * This hook provides helpers to convert between canonical and visual coordinates.
 */

import { useCallback } from 'react';

export interface AllianceMirroringHelpers {
    /**
     * Convert canonical X to visual X based on alliance
     * Blue: no change, Red: flip horizontally
     */
    getVisualX: (canonicalX: number) => number;

    /**
     * Convert visual X to canonical X based on alliance
     * Inverse of getVisualX
     */
    getCanonicalX: (visualX: number) => number;

    /**
     * Convert a full position from canonical to visual
     */
    toVisualPosition: (pos: { x: number; y: number }) => { x: number; y: number };

    /**
     * Convert a full position from visual to canonical
     */
    toCanonicalPosition: (pos: { x: number; y: number }) => { x: number; y: number };
}

export function useAllianceMirroring(alliance: 'red' | 'blue'): AllianceMirroringHelpers {
    const getVisualX = useCallback(
        (canonicalX: number) => (alliance === 'red' ? 1 - canonicalX : canonicalX),
        [alliance]
    );

    const getCanonicalX = useCallback(
        (visualX: number) => (alliance === 'red' ? 1 - visualX : visualX),
        [alliance]
    );

    const toVisualPosition = useCallback(
        (pos: { x: number; y: number }) => ({
            x: getVisualX(pos.x),
            y: pos.y,
        }),
        [getVisualX]
    );

    const toCanonicalPosition = useCallback(
        (pos: { x: number; y: number }) => ({
            x: getCanonicalX(pos.x),
            y: pos.y,
        }),
        [getCanonicalX]
    );

    return { getVisualX, getCanonicalX, toVisualPosition, toCanonicalPosition };
}
