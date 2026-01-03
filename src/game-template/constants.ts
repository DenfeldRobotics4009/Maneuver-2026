/**
 * Game Point Values
 * 
 * Centralizing these values ensures consistency across the application
 * and makes it easy to update each season.
 */

export const AUTO_POINTS = {
    ACTION_1: 3,
    ACTION_2: 5,
    MOBILITY: 3,
} as const;

export const TELEOP_POINTS = {
    ACTION_1: 2,
    ACTION_2: 4,
} as const;

export const ENDGAME_POINTS = {
    SUCCESS: 10,
    PARK: 2,
} as const;

export const PENALTY_POINTS = {
    FOUL: 2,
    TECH_FOUL: 5,
} as const;
