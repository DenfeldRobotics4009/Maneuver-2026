/**
 * Game Scoring Calculations
 * 
 * Calculates points for auto, teleop, and endgame phases.
 * 
 * DERIVED FROM: game-schema.ts
 * All point values come from the schema.
 */

import type { ScoringCalculations } from "@/types/game-interfaces";
import type { ScoutingEntryBase } from "@/core/types/scouting-entry";
import { toggles, getActionKeys, getActionPoints, getEndgamePoints } from "./game-schema";

/**
 * GameData interface derived from schema
 * Auto-includes all action counts and toggles defined in schema
 */
export interface GameData {
    auto: {
        startPosition: number | null;
        // Action counters (derived from schema)
        action1Count?: number;
        action2Count?: number;
        action3Count?: number;
        action4Count?: number;
        // Auto toggles (derived from schema)
        autoToggle?: boolean;
        [key: string]: unknown;
    };
    teleop: {
        // Action counters (derived from schema)
        action1Count?: number;
        action2Count?: number;
        action3Count?: number;
        action4Count?: number;
        teleopSpecialCount?: number;
        // Teleop toggles (derived from schema)
        teleopToggle?: boolean;
        [key: string]: unknown;
    };
    endgame: {
        // Endgame options (derived from schema)
        option1?: boolean;
        option2?: boolean;
        option3?: boolean;
        toggle1?: boolean;
        toggle2?: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface ScoutingEntry extends ScoutingEntryBase {
    gameData: GameData;
}

export const scoringCalculations: ScoringCalculations<ScoutingEntry> = {
    calculateAutoPoints(entry) {
        const gameData = entry.gameData as GameData;
        let points = 0;

        // Sum points for all actions with auto points
        getActionKeys().forEach(key => {
            const autoPoints = getActionPoints(key, 'auto');
            if (autoPoints > 0) {
                const count = gameData?.auto?.[`${key}Count`] as number || 0;
                points += count * autoPoints;
            }
        });

        return points;
    },

    calculateTeleopPoints(entry) {
        const gameData = entry.gameData as GameData;
        let points = 0;

        // Sum points for all actions with teleop points
        getActionKeys().forEach(key => {
            const teleopPoints = getActionPoints(key, 'teleop');
            if (teleopPoints > 0) {
                const count = gameData?.teleop?.[`${key}Count`] as number || 0;
                points += count * teleopPoints;
            }
        });

        return points;
    },

    calculateEndgamePoints(entry) {
        const gameData = entry.gameData as GameData;
        let points = 0;

        // Sum points for all endgame toggles that are true
        Object.keys(toggles.endgame).forEach(key => {
            const toggleKey = key as keyof typeof toggles.endgame;
            const togglePoints = getEndgamePoints(toggleKey);
            if (gameData?.endgame?.[key] === true) {
                points += togglePoints;
            }
        });

        return points;
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
