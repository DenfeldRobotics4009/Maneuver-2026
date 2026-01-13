/**
 * Game Point Values
 * 
 * DERIVED FROM: game-schema.ts
 * 
 * This file re-exports point values from the schema for backwards compatibility.
 * New code should import directly from game-schema.ts.
 */

import { actions, toggles } from "./game-schema";

// Re-export point values derived from schema
export const AUTO_POINTS = {
    ACTION_1: actions.action1.points.auto ?? 0,
    ACTION_2: actions.action2.points.auto ?? 0,
    ACTION_3: actions.action3.points.auto ?? 0,
    ACTION_4: actions.action4.points.auto ?? 0,
} as const;

export const TELEOP_POINTS = {
    ACTION_1: actions.action1.points.teleop ?? 0,
    ACTION_2: actions.action2.points.teleop ?? 0,
    ACTION_3: actions.action3.points.teleop ?? 0,
    ACTION_4: actions.action4.points.teleop ?? 0,
    TELEOP_SPECIAL: actions.teleopSpecial.points.teleop ?? 0,
} as const;

export const ENDGAME_POINTS = {
    OPTION_1: toggles.endgame.option1.points,
    OPTION_2: toggles.endgame.option2.points,
    OPTION_3: toggles.endgame.option3.points,
    TOGGLE_1: toggles.endgame.toggle1.points,
    TOGGLE_2: toggles.endgame.toggle2.points,
} as const;

export const PENALTY_POINTS = {
    FOUL: 2,
    TECH_FOUL: 5,
} as const;
