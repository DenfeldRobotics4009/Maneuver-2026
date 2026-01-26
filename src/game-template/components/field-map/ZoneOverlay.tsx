/**
 * ZoneOverlay Component
 * 
 * Clickable zone overlay that appears when a zone is not active.
 * Used in Teleop for manual zone selection.
 */

import { cn } from '@/core/lib/utils';
import type { ZoneOverlayProps, ZoneType } from './types';
import { ZONE_BOUNDS } from './constants';

// =============================================================================
// ZONE LABELS
// =============================================================================

const ZONE_LABELS: Record<ZoneType, string> = {
    allianceZone: 'Alliance Zone',
    neutralZone: 'Neutral Zone',
    opponentZone: 'Opponent Zone',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ZoneOverlay({
    zone,
    isActive,
    alliance,
    isDisabled = false,
    isFieldRotated = false,
    onClick,
}: ZoneOverlayProps) {
    const bounds = ZONE_BOUNDS[zone];

    // Mirror bounds for red alliance (only X is mirrored for alliance perspective)
    const visualXMin = alliance === 'red' ? 1 - bounds.xMax : bounds.xMin;
    const visualXMax = alliance === 'red' ? 1 - bounds.xMin : bounds.xMax;
    const visualYMin = bounds.yMin;
    const visualYMax = bounds.yMax;

    // When active, don't render (zone overlay disappears, showing buttons)
    if (isActive) {
        return null;
    }

    // Determine zone color
    const getZoneColor = () => {
        if (zone === 'neutralZone') {
            return 'bg-amber-500/10 border-amber-500/50';
        }
        // Alliance zone shows alliance color, opponent zone shows opposite
        if (zone === 'allianceZone') {
            return alliance === 'red'
                ? 'bg-red-500/15 border-red-500/50'
                : 'bg-blue-500/15 border-blue-500/50';
        }
        // Opponent zone
        return alliance === 'red'
            ? 'bg-blue-500/15 border-blue-500/50'
            : 'bg-red-500/15 border-red-500/50';
    };

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                "absolute",
                "flex items-center justify-center",
                "border-2 border-dashed",
                "transition-all duration-200",
                !isDisabled && "hover:bg-white/5 hover:scale-[1.02] cursor-pointer",
                isDisabled && "opacity-20 cursor-not-allowed",
                getZoneColor(),
            )}
            style={{
                left: `${visualXMin * 100}%`,
                top: `${visualYMin * 100}%`,
                width: `${(visualXMax - visualXMin) * 100}%`,
                height: `${(visualYMax - visualYMin) * 100}%`,
            }}
        >
            <span className={cn(
                "text-sm font-bold px-2 py-1 rounded",
                "bg-slate-900/60 text-slate-300",
                isFieldRotated && "rotate-180"
            )}>
                {ZONE_LABELS[zone]}
            </span>
        </button>
    );
}
