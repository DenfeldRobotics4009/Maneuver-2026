/**
 * Match Strategy Page Configuration
 * 
 * Defines the structure and display of team statistics on the Match Strategy page.
 * This configuration makes the page year-agnostic by allowing customization of:
 * - Which stats to display in each phase (overall, auto, teleop, endgame)
 * - Stat labels and formatting
 * - Colors and display properties
 */

export interface MatchStrategyStatConfig {
    key: string;  // Path to stat in TeamStats object (e.g., "overall.avgGamePiece1")
    label: string;  // Display label
    color?: string;  // Tailwind color class (e.g., "text-orange-600")
    format?: 'number' | 'percent';  // How to display the value
    decimals?: number;  // Number of decimal places (default: 1)
}

export interface MatchStrategyPhaseConfig {
    id: string;  // Phase ID (overall, auto, teleop, endgame)
    label: string;  // Display label
    stats: MatchStrategyStatConfig[];  // Stats to display in this phase
    gridCols?: number;  // Number of grid columns (default: 3)
}

/**
 * Match Strategy Page Configuration
 * 
 * Customize this for each game year to display relevant stats.
 */
export const matchStrategyConfig: {
    phases: MatchStrategyPhaseConfig[];
    fieldLayout?: {
        TEAM_LABEL_FONT_SIZE_RATIO: number;
        BLUE_ALLIANCE_X_POSITION: number;
        RED_ALLIANCE_X_POSITION: number;
        TEAM_POSITION_TOP_Y: number;
        TEAM_POSITION_MIDDLE_Y: number;
        TEAM_POSITION_BOTTOM_Y: number;
    };
} = {
    phases: [
        {
            id: 'overall',
            label: 'Overall',
            gridCols: 3,
            stats: [
                {
                    key: 'overall.avgGamePiece1',
                    label: 'Game Piece 1',  // Customize per year (e.g., "Coral", "Cargo", "Cones")
                    color: 'text-orange-600',
                    format: 'number',
                    decimals: 1
                },
                {
                    key: 'overall.avgGamePiece2',
                    label: 'Game Piece 2',  // Customize per year (e.g., "Algae", "Hatch Panels", "Cubes")
                    color: 'text-green-600',
                    format: 'number',
                    decimals: 1
                },
                {
                    key: 'overall.avgTotalPoints',
                    label: 'Avg Points',
                    color: 'text-blue-600',
                    format: 'number',
                    decimals: 1
                }
            ]
        },
        {
            id: 'auto',
            label: 'Auto',
            gridCols: 2,
            stats: [
                {
                    key: 'auto.avgGamePiece1',
                    label: 'Game Piece 1',
                    color: 'text-orange-600',
                    format: 'number',
                    decimals: 1
                },
                {
                    key: 'auto.avgGamePiece2',
                    label: 'Game Piece 2',
                    color: 'text-green-600',
                    format: 'number',
                    decimals: 1
                }
            ]
        },
        {
            id: 'teleop',
            label: 'Teleop',
            gridCols: 2,
            stats: [
                {
                    key: 'teleop.avgGamePiece1',
                    label: 'Game Piece 1',
                    color: 'text-orange-600',
                    format: 'number',
                    decimals: 1
                },
                {
                    key: 'teleop.avgGamePiece2',
                    label: 'Game Piece 2',
                    color: 'text-green-600',
                    format: 'number',
                    decimals: 1
                }
            ]
        },
        {
            id: 'endgame',
            label: 'Endgame',
            gridCols: 5,
            stats: [
                {
                    key: 'endgame.option1Rate',
                    label: 'Option 1',  // Customize per year
                    color: 'text-purple-600',
                    format: 'percent',
                    decimals: 0
                },
                {
                    key: 'endgame.option2Rate',
                    label: 'Option 2',  // Customize per year
                    color: 'text-gray-600',
                    format: 'percent',
                    decimals: 0
                },
                {
                    key: 'endgame.option3Rate',
                    label: 'Option 3',  // Customize per year (or hide if not applicable)
                    color: 'text-blue-600',
                    format: 'percent',
                    decimals: 0
                },
                {
                    key: 'endgame.toggle1Rate',
                    label: 'Toggle 1',  // Customize per year (or hide if not applicable)
                    color: 'text-red-600',
                    format: 'percent',
                    decimals: 0
                },
                {
                    key: 'endgame.toggle2Rate',
                    label: 'Toggle 2',  // Customize per year (or hide if not applicable)
                    color: 'text-red-600',
                    format: 'percent',
                    decimals: 0
                }
            ]
        }
    ],
    fieldLayout: {
        TEAM_LABEL_FONT_SIZE_RATIO: 0.02,
        BLUE_ALLIANCE_X_POSITION: 0.03, // Left edge
        RED_ALLIANCE_X_POSITION: 0.97,  // Right edge
        TEAM_POSITION_TOP_Y: 0.275,
        TEAM_POSITION_MIDDLE_Y: 0.505,
        TEAM_POSITION_BOTTOM_Y: 0.735,
    }
};

/**
 * Helper function to get a stat value from TeamStats object using a key path
 * Example: getStatValue(stats, "overall.avgGamePiece1") => stats.overall.avgGamePiece1
 */
export function getStatValue(stats: any, keyPath: string): number | undefined {
    const keys = keyPath.split('.');
    let value = stats;

    for (const key of keys) {
        if (value === null || value === undefined) return undefined;
        value = value[key];
    }

    return typeof value === 'number' ? value : undefined;
}

/**
 * Format a stat value for display
 */
export function formatStatValue(
    value: number | undefined,
    format: 'number' | 'percent' = 'number',
    decimals: number = 1
): string {
    if (value === undefined || value === null) return '-';

    const rounded = Number(value.toFixed(decimals));

    if (format === 'percent') {
        return `${rounded}%`;
    }

    return rounded.toString();
}
