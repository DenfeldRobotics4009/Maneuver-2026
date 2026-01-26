/**
 * Centralized Team Statistics Calculations - 2026 REBUILT
 * 
 * This is the SINGLE SOURCE OF TRUTH for all team stat calculations.
 * All pages (Strategy Overview, Match Strategy, etc.) should use this
 * via the useAllTeamStats hook instead of calculating their own stats.
 * 
 * 2026 GAME: Uses fuelScoredCount, fuelPassedCount, and climb toggles
 */

import type { ScoutingEntry } from "@/game-template/scoring";
import type { TeamStats } from "@/core/types/team-stats";
import { scoringCalculations } from "./scoring";

// Helper functions
const sum = <T>(arr: T[], fn: (item: T) => number): number =>
    arr.reduce((acc, item) => acc + fn(item), 0);

const round = (n: number, decimals: number = 1): number =>
    Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);

const percent = (count: number, total: number): number =>
    total > 0 ? Math.round((count / total) * 100) : 0;

const val = (n: number | unknown): number => (typeof n === 'number' ? n : 0);

/**
 * Calculate all statistics for a single team from their match entries.
 * Returns a complete TeamStats object with all metrics.
 */
export const calculateTeamStats = (teamMatches: ScoutingEntry[]): Omit<TeamStats, 'teamNumber' | 'eventKey'> => {
    if (teamMatches.length === 0) {
        return getEmptyStats();
    }

    const matchCount = teamMatches.length;

    // ============================================================================
    // POINT CALCULATIONS (using centralized scoring)
    // ============================================================================

    const totalAutoPoints = sum(teamMatches, m =>
        scoringCalculations.calculateAutoPoints({ gameData: m.gameData } as any)
    );
    const totalTeleopPoints = sum(teamMatches, m =>
        scoringCalculations.calculateTeleopPoints({ gameData: m.gameData } as any)
    );
    const totalEndgamePoints = sum(teamMatches, m =>
        scoringCalculations.calculateEndgamePoints({ gameData: m.gameData } as any)
    );
    const totalPoints = totalAutoPoints + totalTeleopPoints + totalEndgamePoints;

    // ============================================================================
    // FUEL CALCULATIONS (2026 Game)
    // ============================================================================

    // Auto fuel
    const autoFuelTotal = sum(teamMatches, m =>
        val(m.gameData?.auto?.fuelScoredCount)
    );

    const autoFuelPassedTotal = sum(teamMatches, m =>
        val(m.gameData?.auto?.fuelPassedCount)
    );

    // Teleop fuel
    const teleopFuelTotal = sum(teamMatches, m =>
        val(m.gameData?.teleop?.fuelScoredCount)
    );

    const teleopFuelPassedTotal = sum(teamMatches, m =>
        val(m.gameData?.teleop?.fuelPassedCount)
    );

    // Total fuel
    const totalFuelScored = autoFuelTotal + teleopFuelTotal;
    const totalFuelPassed = autoFuelPassedTotal + teleopFuelPassedTotal;
    const totalPieces = totalFuelScored; // For compatibility

    // ============================================================================
    // AUTO PHASE STATS
    // ============================================================================

    // Auto climb (new for 2026!)
    const autoClimbCount = teamMatches.filter(m => m.gameData?.auto?.autoClimbL1 === true).length;

    // Starting positions
    const startPositions = calculateStartPositions(teamMatches, matchCount);

    // Auto stuck tracking
    const autoTrenchStuckTotal = sum(teamMatches, m => val(m.gameData?.auto?.trenchStuckCount));
    const autoBumpStuckTotal = sum(teamMatches, m => val(m.gameData?.auto?.bumpStuckCount));
    const autoTrenchStuckDurationTotal = sum(teamMatches, m => val(m.gameData?.auto?.trenchStuckDuration));
    const autoBumpStuckDurationTotal = sum(teamMatches, m => val(m.gameData?.auto?.bumpStuckDuration));


    // ============================================================================
    // ENDGAME STATS (Tower Climbing - 2026)
    // ============================================================================

    const climbL1Count = teamMatches.filter(m => m.gameData?.endgame?.climbL1 === true).length;
    const climbL2Count = teamMatches.filter(m => m.gameData?.endgame?.climbL2 === true).length;
    const climbL3Count = teamMatches.filter(m => m.gameData?.endgame?.climbL3 === true).length;
    const climbFailedCount = teamMatches.filter(m => m.gameData?.endgame?.climbFailed === true).length;
    const climbSuccessCount = climbL1Count + climbL2Count + climbL3Count;

    // ============================================================================
    // TELEOP STATS
    // ============================================================================

    const defenseCount = teamMatches.filter(m => m.gameData?.teleop?.playedDefense === true).length;

    // Defense counts by zone
    const defenseAllianceTotal = sum(teamMatches, m => val(m.gameData?.teleop?.defenseAllianceCount));
    const defenseNeutralTotal = sum(teamMatches, m => val(m.gameData?.teleop?.defenseNeutralCount));
    const defenseOpponentTotal = sum(teamMatches, m => val(m.gameData?.teleop?.defenseOpponentCount));
    const totalDefenseActions = defenseAllianceTotal + defenseNeutralTotal + defenseOpponentTotal;

    // Steal count
    const stealTotal = sum(teamMatches, m => val(m.gameData?.teleop?.stealCount));

    // Stuck tracking
    const trenchStuckTotal = sum(teamMatches, m => val(m.gameData?.teleop?.trenchStuckCount));
    const bumpStuckTotal = sum(teamMatches, m => val(m.gameData?.teleop?.bumpStuckCount));
    const trenchStuckDurationTotal = sum(teamMatches, m => val(m.gameData?.teleop?.trenchStuckDuration));
    const bumpStuckDurationTotal = sum(teamMatches, m => val(m.gameData?.teleop?.bumpStuckDuration));

    // ============================================================================
    // RAW VALUES (for box plots and distribution charts)
    // ============================================================================

    const rawValues = {
        totalPoints: teamMatches.map(m =>
            scoringCalculations.calculateTotalPoints({ gameData: m.gameData } as any)
        ),
        autoPoints: teamMatches.map(m =>
            scoringCalculations.calculateAutoPoints({ gameData: m.gameData } as any)
        ),
        teleopPoints: teamMatches.map(m =>
            scoringCalculations.calculateTeleopPoints({ gameData: m.gameData } as any)
        ),
        endgamePoints: teamMatches.map(m =>
            scoringCalculations.calculateEndgamePoints({ gameData: m.gameData } as any)
        ),
    };

    // ============================================================================
    // RETURN COMPLETE STATS OBJECT
    // ============================================================================

    return {
        matchCount,

        // Aggregate scores
        totalPoints: round(totalPoints / matchCount),
        autoPoints: round(totalAutoPoints / matchCount),
        teleopPoints: round(totalTeleopPoints / matchCount),
        endgamePoints: round(totalEndgamePoints / matchCount),

        // Overall phase
        overall: {
            avgTotalPoints: round(totalPoints / matchCount),
            totalPiecesScored: round(totalPieces / matchCount),
            avgGamePiece1: round(totalFuelScored / matchCount),  // Fuel scored
            avgGamePiece2: round(totalFuelPassed / matchCount),  // Fuel passed
            // 2026-specific
            avgFuelScored: round(totalFuelScored / matchCount),
            avgFuelPassed: round(totalFuelPassed / matchCount),
        },

        // Auto phase
        auto: {
            avgPoints: round(totalAutoPoints / matchCount),
            avgGamePiece1: round(autoFuelTotal / matchCount),     // Auto fuel
            avgGamePiece2: round(autoFuelPassedTotal / matchCount), // Auto passed
            mobilityRate: 0, // Not applicable in 2026
            autoClimbRate: percent(autoClimbCount, matchCount),
            avgFuelScored: round(autoFuelTotal / matchCount),
            startPositions,
            // 2026-specific stuck stats
            avgTrenchStuck: round(autoTrenchStuckTotal / matchCount),
            avgBumpStuck: round(autoBumpStuckTotal / matchCount),
            avgTrenchStuckDuration: round(autoTrenchStuckDurationTotal / matchCount / 1000, 1), // in seconds
            avgBumpStuckDuration: round(autoBumpStuckDurationTotal / matchCount / 1000, 1), // in seconds
        },

        // Teleop phase
        teleop: {
            avgPoints: round(totalTeleopPoints / matchCount),
            avgGamePiece1: round(teleopFuelTotal / matchCount),     // Teleop fuel
            avgGamePiece2: round(teleopFuelPassedTotal / matchCount), // Teleop passed
            avgFuelScored: round(teleopFuelTotal / matchCount),
            avgFuelPassed: round(teleopFuelPassedTotal / matchCount),
            defenseRate: percent(defenseCount, matchCount),
            // 2026-specific detailed stats
            totalDefenseActions: round(totalDefenseActions / matchCount),
            avgSteals: round(stealTotal / matchCount),
            avgTrenchStuck: round(trenchStuckTotal / matchCount),
            avgBumpStuck: round(bumpStuckTotal / matchCount),
            avgTrenchStuckDuration: round(trenchStuckDurationTotal / matchCount / 1000, 1), // in seconds
            avgBumpStuckDuration: round(bumpStuckDurationTotal / matchCount / 1000, 1), // in seconds
        },

        // Endgame phase - tower climbing
        endgame: {
            avgPoints: round(totalEndgamePoints / matchCount),
            // Climb rates
            climbL1Rate: percent(climbL1Count, matchCount),
            climbL2Rate: percent(climbL2Count, matchCount),
            climbL3Rate: percent(climbL3Count, matchCount),
            climbSuccessRate: percent(climbSuccessCount, matchCount),
            climbFailedRate: percent(climbFailedCount, matchCount),
            // Legacy compatibility aliases
            climbRate: percent(climbSuccessCount, matchCount),
            parkRate: 0, // Not applicable in 2026
            shallowClimbRate: percent(climbL1Count, matchCount),
            deepClimbRate: percent(climbL3Count, matchCount),
            option1Rate: percent(climbL1Count, matchCount),
            option2Rate: percent(climbL2Count, matchCount),
            option3Rate: percent(climbL3Count, matchCount),
            option4Rate: 0,
            option5Rate: 0,
            toggle1Rate: percent(climbFailedCount, matchCount),
            toggle2Rate: 0, // Removed noClimb - can be inferred
        },

        // Raw values for charts
        rawValues,
    };
};

/**
 * Calculate starting position distribution
 */
function calculateStartPositions(
    teamMatches: ScoutingEntry[],
    matchCount: number
): Array<{ position: string; percentage: number }> {
    // Count occurrences of each start position (0-2 for 2026)
    const positionCounts: Record<number, number> = {};

    teamMatches.forEach(m => {
        const pos = m.gameData?.auto?.startPosition;
        if (typeof pos === 'number' && pos >= 0 && pos <= 5) {
            positionCounts[pos] = (positionCounts[pos] || 0) + 1;
        }
    });

    // Convert to array with percentages
    const result: Array<{ position: string; percentage: number }> = [];
    const posLabels = ['Left', 'Center', 'Right', 'Pos 3', 'Pos 4', 'Pos 5'];
    for (let i = 0; i <= 5; i++) {
        const count = positionCounts[i] || 0;
        const percentage = percent(count, matchCount);
        if (percentage > 0) {
            result.push({ position: posLabels[i] || `Pos ${i}`, percentage });
        }
    }

    return result;
}

/**
 * Return empty stats object (for teams with no data)
 */
function getEmptyStats(): Omit<TeamStats, 'teamNumber' | 'eventKey'> {
    return {
        matchCount: 0,
        totalPoints: 0,
        autoPoints: 0,
        teleopPoints: 0,
        endgamePoints: 0,
        overall: {
            avgTotalPoints: 0,
            totalPiecesScored: 0,
            avgGamePiece1: 0,
            avgGamePiece2: 0,
        },
        auto: {
            avgPoints: 0,
            avgGamePiece1: 0,
            avgGamePiece2: 0,
            mobilityRate: 0,
            startPositions: [],
        },
        teleop: {
            avgPoints: 0,
            avgGamePiece1: 0,
            avgGamePiece2: 0,
        },
        endgame: {
            avgPoints: 0,
            climbRate: 0,
            parkRate: 0,
            shallowClimbRate: 0,
            deepClimbRate: 0,
        },
        rawValues: {
            totalPoints: [],
            autoPoints: [],
            teleopPoints: [],
            endgamePoints: [],
        },
    };
}
