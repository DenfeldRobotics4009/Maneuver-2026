/**
 * Game Scoring Calculations
 * 
 * Implements the ScoringCalculations interface using centralized constants.
 */

import type { ScoringCalculations } from "@/types/game-interfaces";
import type { ScoutingEntryBase } from "@/types/scouting-entry";
import { AUTO_POINTS, TELEOP_POINTS, ENDGAME_POINTS } from "./constants";

/**
 * Standard game data structure
 */
export interface GameData {
    auto: {
        startPosition: number | null;
        action1Count: number;
        action2Count: number;
        mobility: boolean;
    };
    teleop: {
        action1Count: number;
        action2Count: number;
        scoreAmplified?: boolean; // Example of a boolean flag
    };
    endgame: {
        success: boolean;
        park: boolean;
        failed?: boolean;
    };
    [key: string]: unknown;
}

/**
 * Scouting entry type with game-specific data
 */
export interface ScoutingEntry extends ScoutingEntryBase {
    gameData: GameData;
}

export const scoringCalculations: ScoringCalculations<ScoutingEntry> = {
    calculateAutoPoints(entry) {
        const gameData = entry.gameData as GameData;
        const action1Points = (gameData?.auto?.action1Count || 0) * AUTO_POINTS.ACTION_1;
        const action2Points = (gameData?.auto?.action2Count || 0) * AUTO_POINTS.ACTION_2;
        const mobilityPoints = gameData?.auto?.mobility ? AUTO_POINTS.MOBILITY : 0;
        return action1Points + action2Points + mobilityPoints;
    },

    calculateTeleopPoints(entry) {
        const gameData = entry.gameData as GameData;
        const action1Points = (gameData?.teleop?.action1Count || 0) * TELEOP_POINTS.ACTION_1;
        const action2Points = (gameData?.teleop?.action2Count || 0) * TELEOP_POINTS.ACTION_2;
        return action1Points + action2Points;
    },

    calculateEndgamePoints(entry) {
        const gameData = entry.gameData as GameData;
        if (gameData?.endgame?.success) return ENDGAME_POINTS.SUCCESS;
        if (gameData?.endgame?.park) return ENDGAME_POINTS.PARK;
        return 0;
    },

    calculateTotalPoints(entry) {
        return (
            this.calculateAutoPoints(entry) +
            this.calculateTeleopPoints(entry) +
            this.calculateEndgamePoints(entry)
        );
    }
};

export default scoringCalculations;
