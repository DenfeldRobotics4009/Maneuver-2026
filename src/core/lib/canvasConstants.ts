/**
 * Canvas Constants
 * 
 * Shared constants for field canvas rendering, positioning, and sizing.
 */

import { matchStrategyConfig } from "@/game-template/match-strategy-config";

export const CANVAS_CONSTANTS = {
    // Font size as ratio of canvas width
    TEAM_LABEL_FONT_SIZE_RATIO: matchStrategyConfig.fieldLayout?.TEAM_LABEL_FONT_SIZE_RATIO ?? 0.02,

    // X-positions as ratio of canvas width
    BLUE_ALLIANCE_X_POSITION: matchStrategyConfig.fieldLayout?.BLUE_ALLIANCE_X_POSITION ?? 0.03, // Left edge
    RED_ALLIANCE_X_POSITION: matchStrategyConfig.fieldLayout?.RED_ALLIANCE_X_POSITION ?? 0.97,  // Right edge

    // Y-positions as ratio of canvas height
    TEAM_POSITION_TOP_Y: matchStrategyConfig.fieldLayout?.TEAM_POSITION_TOP_Y ?? 0.275,
    TEAM_POSITION_MIDDLE_Y: matchStrategyConfig.fieldLayout?.TEAM_POSITION_MIDDLE_Y ?? 0.505,
    TEAM_POSITION_BOTTOM_Y: matchStrategyConfig.fieldLayout?.TEAM_POSITION_BOTTOM_Y ?? 0.735,

    // Mobile UI constants
    MOBILE_RESERVED_WIDTH_FOR_CONTROLS: 160,
    MOBILE_RESERVED_HEIGHT_BASE: 100,
    DESKTOP_RESERVED_HEIGHT_BASE: 180,
};
