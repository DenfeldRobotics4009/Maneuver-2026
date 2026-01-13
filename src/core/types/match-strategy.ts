/**
 * Match Strategy page configuration types
 */

export interface MatchStrategyStatConfig {
    key: string;              // Data path like "auto.avgCoral" or "overall.avgTotalPoints"
    label: string;            // Display label
    color: string;            // Tailwind color name (e.g., "orange", "blue", "green")
    format?: "number" | "percent";  // How to display the value
}

export interface MatchStrategyPhaseConfig {
    label: string;            // Display label for the phase tab
    stats: MatchStrategyStatConfig[];
    showStartPositions?: boolean;
    startPositionsKey?: string;  // Path to start positions data (e.g., "auto.startPositions")
}

export interface MatchStrategyAssets {
    fieldImage: string;       // Field image for drawing canvas
    fieldPositionsImage?: string;  // Optional: auto start position selector overlay
}

export interface MatchStrategyConfig {
    // Assets
    assets: MatchStrategyAssets;

    // Game phases (e.g., ["autonomous", "teleop", "endgame"])
    phases: string[];

    // Stats display configuration for each phase
    statsDisplay: Record<string, MatchStrategyPhaseConfig>;
}
