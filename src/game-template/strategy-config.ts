/**
 * Strategy Configuration for Strategy Overview Page
 * 
 * DERIVED FROM: game-schema.ts
 * 
 * Column definitions and presets are generated from the schema.
 */

import { StrategyConfig } from "@/core/types/strategy";
import { scoringCalculations } from "./scoring";
import { generateStrategyColumns, strategyPresets } from "./game-schema";

// Generate columns from schema
const generatedColumns = generateStrategyColumns();

export const strategyConfig: StrategyConfig = {
    columns: generatedColumns,
    presets: strategyPresets,
    aggregates: {
        // Point calculations use scoringCalculations from scoring.ts
        totalPoints: (match) => scoringCalculations.calculateTotalPoints({ gameData: match } as any),
        autoPoints: (match) => scoringCalculations.calculateAutoPoints({ gameData: match } as any),
        teleopPoints: (match) => scoringCalculations.calculateTeleopPoints({ gameData: match } as any),
        endgamePoints: (match) => scoringCalculations.calculateEndgamePoints({ gameData: match } as any),
    }
};

export default strategyConfig;
