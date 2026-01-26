/**
 * Game-Specific Strategy Analysis - 2026 REBUILT
 * 
 * This module provides team statistics calculations and display configuration
 * for the Team Statistics page.
 * 
 * 2026 GAME: REBUILT
 * - Primary: Fuel scoring (bulk counters)
 * - Secondary: Tower climbing (3 levels)
 * - New: Auto L1 climb for bonus points
 */

import type { StrategyAnalysis, TeamStats } from "@/types/game-interfaces";
import type { ScoutingEntryBase } from "@/types/scouting-entry";
import type {
    StatSectionDefinition,
    RateSectionDefinition,
    MatchBadgeDefinition,
    StartPositionConfig,
} from "@/types/team-stats-display";
import { scoringCalculations } from "@/game-template/scoring";
import type { GameData as CoreGameData } from "@/game-template/scoring";
// Use 2026 field images
import fieldMapRedImage from "@/game-template/assets/2026-field-red.png";
import fieldMapBlueImage from "@/game-template/assets/2026-field-blue.png";


/**
 * Template scouting entry type
 * Extends ScoutingEntryBase with game-specific gameData
 */
type ScoutingEntryTemplate = ScoutingEntryBase & {
    gameData: CoreGameData;
};

/**
 * Team statistics for 2026 REBUILT
 */
interface TeamStatsTemplate extends TeamStats {
    // Point averages
    avgTotalPoints: number;
    avgAutoPoints: number;
    avgTeleopPoints: number;
    avgEndgamePoints: number;

    // Fuel averages
    avgAutoFuel: number;
    avgTeleopFuel: number;
    avgFuelPassed: number;
    avgTotalFuel: number;

    // Rate metrics (0-100%)
    mobilityRate: number;
    autoClimbRate: number;
    climbL1Rate: number;
    climbL2Rate: number;
    climbL3Rate: number;
    climbSuccessRate: number;
    defenseRate: number;

    // Start position percentages
    startPositions: Record<string, number>;

    // Match results for performance tab
    matchResults: MatchResult[];
}

/**
 * Match result data for performance display
 */
export interface MatchResult {
    matchNumber: string;
    alliance: string;
    eventKey: string;
    teamNumber?: number;
    scoutName?: string;
    totalPoints: number;
    autoPoints: number;
    teleopPoints: number;
    endgamePoints: number;
    endgameSuccess: boolean;
    climbLevel: number; // 0=none, 1-3=level
    brokeDown: boolean;
    startPosition: number;
    comment: string;
    // Fuel data
    autoFuel: number;
    teleopFuel: number;
    fuelPassed: number;
    [key: string]: unknown;
}

/**
 * Strategy Analysis Implementation for 2026
 */
export const strategyAnalysis: StrategyAnalysis<ScoutingEntryTemplate> = {
    /**
     * Calculate basic statistics for a team
     */
    calculateBasicStats(entries: ScoutingEntryTemplate[]): TeamStatsTemplate {
        const matchCount = entries.length;

        if (matchCount === 0) {
            return {
                // Base TeamStats required fields
                teamNumber: 0,
                eventKey: '',
                matchCount: 0,
                totalPoints: 0,
                autoPoints: 0,
                teleopPoints: 0,
                endgamePoints: 0,
                overall: { avgTotalPoints: 0, totalPiecesScored: 0, avgGamePiece1: 0, avgGamePiece2: 0 },
                auto: { avgPoints: 0, avgGamePiece1: 0, avgGamePiece2: 0, mobilityRate: 0, startPositions: [] },
                teleop: { avgPoints: 0, avgGamePiece1: 0, avgGamePiece2: 0 },
                endgame: { avgPoints: 0, climbRate: 0, parkRate: 0 },
                // Template-specific fields
                matchesPlayed: 0,
                avgTotalPoints: 0,
                avgAutoPoints: 0,
                avgTeleopPoints: 0,
                avgEndgamePoints: 0,
                avgAutoFuel: 0,
                avgTeleopFuel: 0,
                avgFuelPassed: 0,
                avgTotalFuel: 0,
                mobilityRate: 0,
                autoClimbRate: 0,
                climbL1Rate: 0,
                climbL2Rate: 0,
                climbL3Rate: 0,
                climbSuccessRate: 0,
                defenseRate: 0,
                startPositions: {},
                matchResults: [],
            };
        }

        // Calculate totals
        const totals = entries.reduce((acc, entry) => {
            const gameData = entry.gameData;

            // Fuel counts
            acc.autoFuel += gameData?.auto?.fuelScoredCount || 0;
            acc.teleopFuel += gameData?.teleop?.fuelScoredCount || 0;
            acc.fuelPassed += (gameData?.auto?.fuelPassedCount || 0) + (gameData?.teleop?.fuelPassedCount || 0);

            // Toggles
            acc.mobility += gameData?.auto?.leftStartZone ? 1 : 0;
            acc.autoClimb += gameData?.auto?.autoClimbL1 ? 1 : 0;
            acc.climbL1 += gameData?.endgame?.climbL1 ? 1 : 0;
            acc.climbL2 += gameData?.endgame?.climbL2 ? 1 : 0;
            acc.climbL3 += gameData?.endgame?.climbL3 ? 1 : 0;
            acc.defense += gameData?.teleop?.playedDefense ? 1 : 0;

            // Track start positions
            const pos = gameData?.auto?.startPosition;
            if (pos !== null && pos !== undefined && pos >= 0) {
                acc.startPositionCounts[pos] = (acc.startPositionCounts[pos] || 0) + 1;
            }

            return acc;
        }, {
            autoFuel: 0,
            teleopFuel: 0,
            fuelPassed: 0,
            mobility: 0,
            autoClimb: 0,
            climbL1: 0,
            climbL2: 0,
            climbL3: 0,
            defense: 0,
            startPositionCounts: {} as Record<number, number>,
        });

        // Calculate match results
        const matchResults: MatchResult[] = entries.map(entry => {
            const autoPoints = scoringCalculations.calculateAutoPoints(entry as any);
            const teleopPoints = scoringCalculations.calculateTeleopPoints(entry as any);
            const endgamePoints = scoringCalculations.calculateEndgamePoints(entry as any);

            // Determine climb level
            let climbLevel = 0;
            if (entry.gameData?.endgame?.climbL3) climbLevel = 3;
            else if (entry.gameData?.endgame?.climbL2) climbLevel = 2;
            else if (entry.gameData?.endgame?.climbL1) climbLevel = 1;

            return {
                matchNumber: String(entry.matchNumber),
                teamNumber: entry.teamNumber,
                scoutName: entry.scoutName,
                alliance: entry.allianceColor,
                eventKey: entry.eventKey || '',
                totalPoints: autoPoints + teleopPoints + endgamePoints,
                autoPoints,
                teleopPoints,
                endgamePoints,
                endgameSuccess: climbLevel > 0,
                climbLevel,
                brokeDown: entry.gameData?.endgame?.climbFailed || false,
                startPosition: entry.gameData?.auto?.startPosition ?? -1,
                comment: entry.comments || '',
                autoFuel: entry.gameData?.auto?.fuelScoredCount || 0,
                teleopFuel: entry.gameData?.teleop?.fuelScoredCount || 0,
                fuelPassed: (entry.gameData?.auto?.fuelPassedCount || 0) + (entry.gameData?.teleop?.fuelPassedCount || 0),
                gameData: entry.gameData,
            };
        });

        // Calculate start position percentages
        const startPositions: Record<string, number> = {};
        Object.entries(totals.startPositionCounts).forEach(([pos, count]) => {
            startPositions[`position${pos}`] = Math.round((count / matchCount) * 100);
        });

        const avgAutoPoints = matchResults.reduce((sum, m) => sum + m.autoPoints, 0) / matchCount;
        const avgTeleopPoints = matchResults.reduce((sum, m) => sum + m.teleopPoints, 0) / matchCount;
        const avgEndgamePoints = matchResults.reduce((sum, m) => sum + m.endgamePoints, 0) / matchCount;
        const climbSuccessCount = totals.climbL1 + totals.climbL2 + totals.climbL3;

        return {
            // Base TeamStats required fields
            teamNumber: entries[0]?.teamNumber || 0,
            eventKey: entries[0]?.eventKey || '',
            matchCount,
            totalPoints: matchResults.reduce((sum, m) => sum + m.totalPoints, 0),
            autoPoints: matchResults.reduce((sum, m) => sum + m.autoPoints, 0),
            teleopPoints: matchResults.reduce((sum, m) => sum + m.teleopPoints, 0),
            endgamePoints: matchResults.reduce((sum, m) => sum + m.endgamePoints, 0),
            overall: {
                avgTotalPoints: Math.round((avgAutoPoints + avgTeleopPoints + avgEndgamePoints) * 10) / 10,
                totalPiecesScored: Math.round((totals.autoFuel + totals.teleopFuel) / matchCount * 10) / 10,
                avgGamePiece1: Math.round(((totals.autoFuel + totals.teleopFuel) / matchCount) * 10) / 10,
                avgGamePiece2: Math.round((totals.fuelPassed / matchCount) * 10) / 10,
            },
            auto: {
                avgPoints: Math.round(avgAutoPoints * 10) / 10,
                avgGamePiece1: Math.round((totals.autoFuel / matchCount) * 10) / 10,
                avgGamePiece2: 0,
                mobilityRate: Math.round((totals.mobility / matchCount) * 100),
                startPositions: Object.entries(startPositions).map(([key, value]) => ({ position: key, percentage: value })),
            },
            teleop: {
                avgPoints: Math.round(avgTeleopPoints * 10) / 10,
                avgGamePiece1: Math.round((totals.teleopFuel / matchCount) * 10) / 10,
                avgGamePiece2: Math.round((totals.fuelPassed / matchCount) * 10) / 10,
            },
            endgame: {
                avgPoints: Math.round(avgEndgamePoints * 10) / 10,
                climbRate: Math.round((climbSuccessCount / matchCount) * 100),
                parkRate: 0,
            },
            // Template-specific fields
            matchesPlayed: matchCount,
            avgTotalPoints: Math.round((avgAutoPoints + avgTeleopPoints + avgEndgamePoints) * 10) / 10,
            avgAutoPoints: Math.round(avgAutoPoints * 10) / 10,
            avgTeleopPoints: Math.round(avgTeleopPoints * 10) / 10,
            avgEndgamePoints: Math.round(avgEndgamePoints * 10) / 10,
            avgAutoFuel: Math.round((totals.autoFuel / matchCount) * 10) / 10,
            avgTeleopFuel: Math.round((totals.teleopFuel / matchCount) * 10) / 10,
            avgFuelPassed: Math.round((totals.fuelPassed / matchCount) * 10) / 10,
            avgTotalFuel: Math.round(((totals.autoFuel + totals.teleopFuel) / matchCount) * 10) / 10,
            mobilityRate: Math.round((totals.mobility / matchCount) * 100),
            autoClimbRate: Math.round((totals.autoClimb / matchCount) * 100),
            climbL1Rate: Math.round((totals.climbL1 / matchCount) * 100),
            climbL2Rate: Math.round((totals.climbL2 / matchCount) * 100),
            climbL3Rate: Math.round((totals.climbL3 / matchCount) * 100),
            climbSuccessRate: Math.round((climbSuccessCount / matchCount) * 100),
            defenseRate: Math.round((totals.defense / matchCount) * 100),
            startPositions,
            matchResults: matchResults.sort((a, b) => parseInt(a.matchNumber) - parseInt(b.matchNumber)),
        };
    },

    /**
     * Get stat sections for the Team Statistics page
     */
    getStatSections(): StatSectionDefinition[] {
        return [
            // Overview tab - summary stats
            {
                id: 'points-overview',
                title: 'Points Overview',
                tab: 'overview',
                columns: 2,
                stats: [
                    { key: 'avgTotalPoints', label: 'Total Points', type: 'number', color: 'green' },
                    { key: 'avgAutoPoints', label: 'Auto Points', type: 'number', color: 'blue' },
                    { key: 'avgTeleopPoints', label: 'Teleop Points', type: 'number', color: 'purple' },
                    { key: 'avgEndgamePoints', label: 'Endgame Points', type: 'number', color: 'orange' },
                ],
            },
            {
                id: 'fuel-overview',
                title: 'Fuel Scoring',
                tab: 'overview',
                columns: 2,
                stats: [
                    { key: 'avgTotalFuel', label: 'Total Fuel', type: 'number', color: 'yellow', subtitle: 'avg per match' },
                    { key: 'avgFuelPassed', label: 'Fuel Passed', type: 'number', color: 'blue', subtitle: 'avg per match' },
                ],
            },

            // Scoring tab - fuel breakdown
            {
                id: 'auto-scoring',
                title: 'Auto Fuel',
                tab: 'scoring',
                columns: 2,
                stats: [
                    { key: 'avgAutoFuel', label: 'Auto Fuel Scored', type: 'number', subtitle: 'avg per match' },
                ],
            },
            {
                id: 'teleop-scoring',
                title: 'Teleop Fuel',
                tab: 'scoring',
                columns: 2,
                stats: [
                    { key: 'avgTeleopFuel', label: 'Teleop Fuel Scored', type: 'number', subtitle: 'avg per match' },
                    { key: 'avgFuelPassed', label: 'Fuel Passed', type: 'number', subtitle: 'avg per match' },
                ],
            },
        ];
    },

    /**
     * Get rate sections (progress bars) for the Team Statistics page
     */
    getRateSections(): RateSectionDefinition[] {
        return [
            {
                id: 'key-rates',
                title: 'Key Rates',
                tab: 'overview',
                rates: [
                    { key: 'climbSuccessRate', label: 'Climb Success Rate' },
                    { key: 'autoClimbRate', label: 'Auto Climb Rate' },
                ],
            },
            {
                id: 'climb-breakdown',
                title: 'Climb Breakdown',
                tab: 'performance',
                rates: [
                    { key: 'climbL1Rate', label: 'Level 1 (10 pts)' },
                    { key: 'climbL2Rate', label: 'Level 2 (20 pts)' },
                    { key: 'climbL3Rate', label: 'Level 3 (30 pts)' },
                ],
            },
            {
                id: 'playstyle',
                title: 'Playstyle Metrics',
                tab: 'performance',
                rates: [
                    { key: 'defenseRate', label: 'Defense Played' },
                ],
            },
        ];
    },

    /**
     * Get match badges for match-by-match performance list
     */
    getMatchBadges(): MatchBadgeDefinition[] {
        return [
            { key: 'endgameSuccess', label: 'Climbed', variant: 'secondary', showWhen: true },
            { key: 'brokeDown', label: 'Failed', variant: 'destructive', showWhen: true },
        ];
    },

    /**
     * Get start position configuration for 2026 field
     * Uses the 2026 field images with starting positions along the alliance wall
     */
    getStartPositionConfig(): StartPositionConfig {
        return {
            positionCount: 3, // 3 starting positions along the alliance wall
            positionLabels: ['Left', 'Center', 'Right'],
            positionColors: ['blue', 'blue', 'blue'],
            fieldImageRed: fieldMapRedImage,
            fieldImageBlue: fieldMapBlueImage,
            // Zone definitions for the auto start position map (based on field image layout)
            zones: [
                { x: 10, y: 150, width: 180, height: 180, position: 0, label: 'Left' },
                { x: 230, y: 150, width: 180, height: 180, position: 1, label: 'Center' },
                { x: 450, y: 150, width: 180, height: 180, position: 2, label: 'Right' },
            ],
        };
    },
};

export default strategyAnalysis;
