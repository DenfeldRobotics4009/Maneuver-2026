/**
 * GAME SCHEMA - SINGLE SOURCE OF TRUTH
 * 
 * This file defines ALL game-specific configuration in one place.
 * When customizing for a new game year, edit ONLY this file.
 * 
 * Everything else is automatically derived:
 * - transformation.ts → uses schema to generate defaults
 * - scoring.ts → uses schema for point calculations
 * - calculations.ts → uses schema for stat aggregations
 * - strategy-config.ts → uses schema to generate columns
 * 
 * HOW TO CUSTOMIZE FOR YOUR GAME YEAR:
 * ====================================
 * 1. Update `workflowConfig` to enable/disable scouting pages
 * 2. Update `actions` with your game's scoring actions
 * 3. Update `toggles` with your game's status toggles
 * 4. Update `strategyColumns` with display preferences
 * 5. Everything else updates automatically!
 */

// =============================================================================
// WORKFLOW CONFIGURATION
// =============================================================================

/**
 * Configure which pages are included in the scouting workflow.
 * Set to `false` to skip a page entirely.
 * 
 * Examples:
 * - Skip starting position: autoStart: false
 * - Skip endgame: endgame: false  (teleop becomes submit page)
 */
export interface WorkflowConfig {
    pages: {
        autoStart: boolean;
        autoScoring: boolean;
        teleopScoring: boolean;
        endgame: boolean;
    };
}

export const workflowConfig: WorkflowConfig = {
    pages: {
        autoStart: true,      // Starting position selection page
        autoScoring: true,    // Auto period scoring (required)
        teleopScoring: true,  // Teleop period scoring (required)
        endgame: true,        // Endgame page with status toggles & submit
    },
};

export type WorkflowPage = keyof WorkflowConfig['pages'];

// =============================================================================
// ACTION DEFINITIONS
// =============================================================================

/**
 * Actions are things robots DO that get tracked during matches.
 * Each action has a name, labels, and point values per phase.
 */
export const actions = {
    // Auto + Teleop actions (tracked in both phases)
    action1: {
        label: "Action 1",
        description: "First scoring action",
        points: { auto: 3, teleop: 2 },
    },
    action2: {
        label: "Action 2",
        description: "Second scoring action",
        points: { auto: 5, teleop: 4 },
    },
    action3: {
        label: "Action 3",
        description: "Third scoring action",
        points: { auto: 2, teleop: 3 },
    },
    action4: {
        label: "Action 4",
        description: "Fourth scoring action",
        points: { auto: 4, teleop: 4 },
    },
    // Teleop-only actions
    teleopSpecial: {
        label: "Teleop Special",
        description: "Special teleop-only action",
        points: { teleop: 5 },
    },
} as const;

// =============================================================================
// TOGGLE DEFINITIONS
// =============================================================================

/**
 * Toggles are boolean status indicators for each phase.
 * They are used in StatusToggles component and stored in robot status.
 */
export const toggles = {
    auto: {
        autoToggle: {
            label: "Auto Toggle",
            description: "Example: Left Starting Zone",
        },
    },
    teleop: {
        teleopToggle: {
            label: "Teleop Toggle",
            description: "Example: Played Defense",
        },
    },
    endgame: {
        // Single selection group (mutually exclusive options)
        option1: {
            label: "Option 1",
            description: "Example: Shallow Climb",
            points: 10,
            group: "selection",
        },
        option2: {
            label: "Option 2",
            description: "Example: Deep Climb",
            points: 5,
            group: "selection",
        },
        option3: {
            label: "Option 3",
            description: "Example: Park",
            points: 2,
            group: "selection",
        },
        // Multiple selection toggles (independent)
        toggle1: {
            label: "Toggle 1",
            description: "Example: Climb Failed",
            points: 0,
            group: "toggles",
        },
        toggle2: {
            label: "Toggle 2",
            description: "Example: Broke Down",
            points: 0,
            group: "toggles",
        },
    },
} as const;

// =============================================================================
// STRATEGY DISPLAY CONFIGURATION
// =============================================================================

/**
 * Strategy columns define what's shown in the Strategy Overview table.
 * Uses dot notation to reference nested stat values.
 */
export const strategyColumns = {
    // Team info (always visible)
    teamInfo: {
        teamNumber: { label: "Team", visible: true, numeric: false },
        eventKey: { label: "Event", visible: true, numeric: false },
        matchCount: { label: "Matches", visible: true, numeric: true },
    },
    // Point totals
    points: {
        totalPoints: { label: "Total Pts", visible: true, numeric: true },
        autoPoints: { label: "Auto Pts", visible: true, numeric: true },
        teleopPoints: { label: "Teleop Pts", visible: true, numeric: true },
        endgamePoints: { label: "Endgame Pts", visible: true, numeric: true },
    },
    // Overall stats
    overall: {
        "overall.totalPiecesScored": { label: "Avg Pieces", visible: true, numeric: true },
        "overall.avgGamePiece1": { label: "Avg Action 1+2", visible: false, numeric: true },
        "overall.avgGamePiece2": { label: "Avg Action 3+4", visible: false, numeric: true },
    },
    // Auto stats
    auto: {
        "auto.avgPoints": { label: "Auto Avg", visible: false, numeric: true },
        "auto.avgGamePiece1": { label: "Auto Actions 1+2", visible: true, numeric: true },
        "auto.avgGamePiece2": { label: "Auto Actions 3+4", visible: false, numeric: true },
        "auto.mobilityRate": { label: "Mobility %", visible: true, numeric: true, percentage: true },
    },
    // Teleop stats
    teleop: {
        "teleop.avgPoints": { label: "Teleop Avg", visible: false, numeric: true },
        "teleop.avgGamePiece1": { label: "Teleop Actions 1+2", visible: true, numeric: true },
        "teleop.avgGamePiece2": { label: "Teleop Action 3", visible: false, numeric: true },
    },
    // Endgame stats
    endgame: {
        "endgame.avgPoints": { label: "Endgame Avg", visible: false, numeric: true },
        "endgame.option1Rate": { label: "Option 1 %", visible: true, numeric: true, percentage: true },
        "endgame.option2Rate": { label: "Option 2 %", visible: true, numeric: true, percentage: true },
        "endgame.option3Rate": { label: "Option 3 %", visible: false, numeric: true, percentage: true },
        "endgame.toggle1Rate": { label: "Toggle 1 %", visible: false, numeric: true, percentage: true },
        "endgame.toggle2Rate": { label: "Toggle 2 %", visible: false, numeric: true, percentage: true },
    },
} as const;

/**
 * Strategy presets for quick column selection
 * NOTE: Not using 'as const' so arrays are mutable for StrategyConfig compatibility
 */
export const strategyPresets: Record<string, string[]> = {
    essential: ["teamNumber", "matchCount", "totalPoints", "overall.totalPiecesScored", "endgame.option1Rate"],
    auto: ["teamNumber", "matchCount", "autoPoints", "auto.avgGamePiece1", "auto.avgGamePiece2", "auto.mobilityRate"],
    teleop: ["teamNumber", "matchCount", "teleopPoints", "teleop.avgGamePiece1", "teleop.avgGamePiece2"],
    endgame: ["teamNumber", "matchCount", "endgamePoints", "endgame.option1Rate", "endgame.option2Rate", "endgame.toggle1Rate"],
    basic: ["teamNumber", "eventKey", "matchCount"],
};

// =============================================================================
// TBA VALIDATION MAPPINGS
// =============================================================================

/**
 * Mapping types for TBA validation.
 * - 'count': Direct numeric comparison
 * - 'countMatching': Count occurrences matching a specific value
 * - 'boolean': True/false comparison
 */
export type TBAMappingType = 'count' | 'countMatching' | 'boolean';

/**
 * Maps game actions/toggles to TBA score breakdown fields for validation.
 * This allows the validation system to compare scouted data against TBA data.
 * 
 * HOW TO CUSTOMIZE:
 * 1. Update `categories` with your game's validation groupings
 * 2. Update `actionMappings` to map your actions to TBA breakdown paths
 * 3. Update `toggleMappings` for endgame/mobility toggles
 * 
 * TBA breakdown paths can be found by inspecting TBA API responses for your event.
 * See: https://www.thebluealliance.com/apidocs/v3
 */
export const tbaValidation = {
    /**
     * Validation categories group related fields for display
     */
    categories: [
        { key: 'auto-actions', label: 'Auto Scoring', phase: 'auto' as const },
        { key: 'teleop-actions', label: 'Teleop Scoring', phase: 'teleop' as const },
        { key: 'endgame', label: 'Endgame', phase: 'endgame' as const },
        { key: 'mobility', label: 'Auto Mobility', phase: 'auto' as const },
    ],

    /**
     * Action mappings - maps scouting action keys to TBA breakdown fields
     * 
     * Template structure (customize for your game):
     * 'actionKey': {
     *   tbaPath: 'path.in.breakdown' or ['robot1Path', 'robot2Path', 'robot3Path'],
     *   type: 'count' | 'countMatching' | 'boolean',
     *   matchValue?: 'value to match' (required for countMatching),
     *   category: 'category-key',
     * }
     * 
     * Example for 2025 REEFSCAPE:
     * 'autoCoralL1': { tbaPath: 'autoReef.trough', type: 'count', category: 'auto-actions' },
     * 'autoCoralL4': { tbaPath: 'autoReef.tba_topRowCount', type: 'count', category: 'auto-actions' },
     */
    actionMappings: {
        // Auto phase actions
        action1: {
            tbaPath: 'autoBreakdownField1',
            type: 'count' as TBAMappingType,
            category: 'auto-actions',
        },
        action2: {
            tbaPath: 'autoBreakdownField2',
            type: 'count' as TBAMappingType,
            category: 'auto-actions',
        },
        action3: {
            tbaPath: 'autoBreakdownField3',
            type: 'count' as TBAMappingType,
            category: 'auto-actions',
        },
        action4: {
            tbaPath: 'autoBreakdownField4',
            type: 'count' as TBAMappingType,
            category: 'auto-actions',
        },
        // Teleop phase actions
        teleopSpecial: {
            tbaPath: 'teleopBreakdownField',
            type: 'count' as TBAMappingType,
            category: 'teleop-actions',
        },
    },

    /**
     * Toggle mappings - maps scouting toggles to TBA breakdown fields
     * 
     * For per-robot fields (endgame, mobility), use array of paths:
     * tbaPath: ['endGameRobot1', 'endGameRobot2', 'endGameRobot3']
     * 
     * Example for 2025 REEFSCAPE:
     * 'deepClimb': {
     *   tbaPath: ['endGameRobot1', 'endGameRobot2', 'endGameRobot3'],
     *   type: 'countMatching',
     *   matchValue: 'DeepCage',
     *   category: 'endgame',
     * },
     */
    toggleMappings: {
        // Auto toggle (mobility example)
        autoToggle: {
            tbaPath: ['autoLineRobot1', 'autoLineRobot2', 'autoLineRobot3'],
            type: 'countMatching' as TBAMappingType,
            matchValue: 'Yes',
            category: 'mobility',
        },
        // Endgame toggles
        option1: {
            tbaPath: ['endGameRobot1', 'endGameRobot2', 'endGameRobot3'],
            type: 'countMatching' as TBAMappingType,
            matchValue: 'Option1',
            category: 'endgame',
        },
        option2: {
            tbaPath: ['endGameRobot1', 'endGameRobot2', 'endGameRobot3'],
            type: 'countMatching' as TBAMappingType,
            matchValue: 'Option2',
            category: 'endgame',
        },
        option3: {
            tbaPath: ['endGameRobot1', 'endGameRobot2', 'endGameRobot3'],
            type: 'countMatching' as TBAMappingType,
            matchValue: 'Option3',
            category: 'endgame',
        },
    },
} as const;

// =============================================================================
// TYPE EXPORTS (derived from schema)
// =============================================================================

export type ActionKey = keyof typeof actions;
export type AutoToggleKey = keyof typeof toggles.auto;
export type TeleopToggleKey = keyof typeof toggles.teleop;
export type EndgameToggleKey = keyof typeof toggles.endgame;

// TBA Validation types
export type ValidationCategoryKey = typeof tbaValidation.categories[number]['key'];
export type ActionMappingKey = keyof typeof tbaValidation.actionMappings;
export type ToggleMappingKey = keyof typeof tbaValidation.toggleMappings;


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all action keys
 */
export function getActionKeys(): ActionKey[] {
    return Object.keys(actions) as ActionKey[];
}

/**
 * Get action point value for a phase
 * Returns 0 if the action doesn't have points for that phase
 */
export function getActionPoints(actionKey: ActionKey, phase: 'auto' | 'teleop'): number {
    const action = actions[actionKey];
    const points = action.points as Record<string, number>;
    return points[phase] ?? 0;
}

/**
 * Get endgame toggle point value
 */
export function getEndgamePoints(toggleKey: EndgameToggleKey): number {
    const toggle = toggles.endgame[toggleKey];
    return 'points' in toggle ? toggle.points : 0;
}

/**
 * Generate flat columns array for strategy config
 */
export function generateStrategyColumns(): Array<{
    key: string;
    label: string;
    category: string;
    visible: boolean;
    numeric: boolean;
    percentage?: boolean;
}> {
    const columns: Array<{
        key: string;
        label: string;
        category: string;
        visible: boolean;
        numeric: boolean;
        percentage?: boolean;
    }> = [];

    Object.entries(strategyColumns).forEach(([category, cols]) => {
        Object.entries(cols).forEach(([key, config]) => {
            columns.push({
                key,
                label: config.label,
                category: category.charAt(0).toUpperCase() + category.slice(1),
                visible: config.visible,
                numeric: config.numeric,
                percentage: 'percentage' in config ? config.percentage : undefined,
            });
        });
    });

    return columns;
}

// =============================================================================
// TBA VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Get all validation categories
 */
export function getValidationCategories() {
    return tbaValidation.categories;
}

/**
 * Get TBA mapping for an action
 */
export function getActionMapping(actionKey: ActionMappingKey) {
    return tbaValidation.actionMappings[actionKey];
}

/**
 * Get TBA mapping for a toggle
 */
export function getToggleMapping(toggleKey: ToggleMappingKey) {
    return tbaValidation.toggleMappings[toggleKey];
}

/**
 * Get all action keys that have TBA mappings
 */
export function getAllMappedActionKeys(): ActionMappingKey[] {
    return Object.keys(tbaValidation.actionMappings) as ActionMappingKey[];
}

/**
 * Get all toggle keys that have TBA mappings
 */
export function getAllMappedToggleKeys(): ToggleMappingKey[] {
    return Object.keys(tbaValidation.toggleMappings) as ToggleMappingKey[];
}

/**
 * Get actions/toggles for a specific validation category
 */
export function getMappingsForCategory(categoryKey: ValidationCategoryKey) {
    const actions = Object.entries(tbaValidation.actionMappings)
        .filter(([, mapping]) => mapping.category === categoryKey)
        .map(([key]) => ({ key, type: 'action' as const }));

    const toggles = Object.entries(tbaValidation.toggleMappings)
        .filter(([, mapping]) => mapping.category === categoryKey)
        .map(([key]) => ({ key, type: 'toggle' as const }));

    return [...actions, ...toggles];
}
