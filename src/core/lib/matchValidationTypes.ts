/**
 * Match Validation Types
 * 
 * Generic type definitions for match validation.
 * Uses dynamic action/toggle keys from game-schema instead of hardcoded fields.
 */

// ============================================================================
// Core Validation Types
// ============================================================================

/**
 * Severity level of a discrepancy between scouted and TBA data
 */
export type DiscrepancySeverity = 'critical' | 'warning' | 'minor' | 'none';

/**
 * Overall validation status for a match
 */
export type ValidationStatus =
  | 'pending'        // Not yet validated
  | 'passed'         // No significant discrepancies
  | 'flagged'        // Discrepancies detected, review recommended
  | 'failed'         // Major discrepancies, re-scouting required
  | 'no-tba-data'    // TBA data not available
  | 'no-scouting';   // No scouting data for this match

/**
 * Confidence level in the scouted data
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Category of data being compared (derived from game-schema)
 */
export type DataCategory = string;  // Dynamic, comes from game-schema.tbaValidation.categories

// ============================================================================
// Discrepancy Reporting
// ============================================================================

/**
 * Represents a single discrepancy between scouted and TBA data
 */
export interface Discrepancy {
  category: DataCategory;
  field: string;  // Action/toggle key from game-schema
  fieldLabel: string;  // Human-readable label
  scoutedValue: number;
  tbaValue: number;
  difference: number;  // Absolute difference
  percentDiff: number;  // Percentage difference (0-100)
  severity: DiscrepancySeverity;
  message: string;  // Human-readable description
}

/**
 * Alliance-level validation result
 */
export interface AllianceValidation {
  alliance: 'red' | 'blue';
  status: ValidationStatus;
  confidence: ConfidenceLevel;
  discrepancies: Discrepancy[];
  totalScoutedPoints: number;
  totalTBAPoints: number;
  scoreDifference: number;
  scorePercentDiff: number;

  // Raw data for detailed breakdown (optional, for debugging)
  scoutedData?: ScoutedAllianceData;
  tbaData?: TBAAllianceData;

  // Generic calculation breakdown
  calculationBreakdown?: {
    scouted: Record<string, number>;  // Points by category
    tba: Record<string, number>;  // Points by category
  };
}

/**
 * Team-level validation result
 */
export interface TeamValidation {
  teamNumber: string;
  alliance: 'red' | 'blue';
  scoutName: string;
  hasScoutedData: boolean;
  discrepancies: Discrepancy[];
  confidence: ConfidenceLevel;
  flagForReview: boolean;
  notes: string[];

  // Correction metadata
  isCorrected?: boolean;
  correctionCount?: number;
  lastCorrectedAt?: number;
  lastCorrectedBy?: string;
  correctionNotes?: string;
  originalScoutName?: string;

  // Generic scoring breakdown - keys are action/toggle names from schema
  scoringBreakdown?: {
    auto: Record<string, number>;     // Auto phase actions
    teleop: Record<string, number>;   // Teleop phase actions
    endgame: Record<string, boolean>; // Endgame toggles
  };
}

/**
 * Complete match validation result
 */
export interface MatchValidationResult {
  id: string;  // Unique ID for storage
  eventKey: string;
  matchKey: string;  // TBA match key (e.g., "2025mrcmp_qm1")
  matchNumber: string;
  compLevel: string;  // "qm", "qf", "sf", "f"
  setNumber?: number; // For elim matches

  // Overall status
  status: ValidationStatus;
  confidence: ConfidenceLevel;

  // Alliance results
  redAlliance: AllianceValidation;
  blueAlliance: AllianceValidation;

  // Team results
  teams: TeamValidation[];

  // Summary
  totalDiscrepancies: number;
  criticalDiscrepancies: number;
  warningDiscrepancies: number;
  flaggedForReview: boolean;
  requiresReScout: boolean;

  // Metadata
  validatedAt: number;  // Unix timestamp
  validatedBy?: string;  // Optional validator name
  notes?: string;
}

// ============================================================================
// Validation Configuration
// ============================================================================

/**
 * Thresholds for determining discrepancy severity
 */
export interface ValidationThresholds {
  // Percentage difference thresholds
  critical: number;  // > this % = critical (e.g., 25%)
  warning: number;   // > this % = warning (e.g., 15%)
  minor: number;     // > this % = minor (e.g., 5%)
  // Below minor = none

  // Absolute difference thresholds (for low-count items)
  criticalAbsolute: number;  // > this count = critical (e.g., 5)
  warningAbsolute: number;   // > this count = warning (e.g., 3)
  minorAbsolute: number;     // > this count = minor (e.g., 1)
}

/**
 * Per-category threshold overrides
 * Keys are category names from game-schema
 */
export type CategoryThresholds = Record<string, ValidationThresholds | undefined>;

/**
 * Configuration for validation behavior
 */
export interface ValidationConfig {
  thresholds: ValidationThresholds;  // Default thresholds
  categoryThresholds?: CategoryThresholds;  // Per-category overrides

  // Flags for enabling/disabling validation by phase
  checkAutoScoring: boolean;
  checkTeleopScoring: boolean;
  checkEndgame: boolean;
  checkMobility: boolean;
  checkTotalScore: boolean;

  // Confidence calculation settings
  minMatchesForHighConfidence: number;  // Scout needs this many matches
  maxDiscrepanciesForHighConfidence: number;

  // Re-scouting recommendations
  autoFlagThreshold: number;  // Auto-flag if this many critical discrepancies
  requireReScoutThreshold: number;  // Require re-scout if severity exceeds this
}

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  thresholds: {
    critical: 25,  // 25% difference
    warning: 15,   // 15% difference
    minor: 5,      // 5% difference
    criticalAbsolute: 5,
    warningAbsolute: 3,
    minorAbsolute: 1
  },
  categoryThresholds: {},
  checkAutoScoring: true,
  checkTeleopScoring: true,
  checkEndgame: true,
  checkMobility: true,
  checkTotalScore: true,
  minMatchesForHighConfidence: 10,
  maxDiscrepanciesForHighConfidence: 2,
  autoFlagThreshold: 2,  // 2+ critical = auto-flag
  requireReScoutThreshold: 3  // 3+ critical = require re-scout
};

// ============================================================================
// Aggregated Data for Comparison (Generic)
// ============================================================================

/**
 * Aggregated scouted data for one alliance (sum of all team data)
 * Uses generic Record types for action/toggle data
 */
export interface ScoutedAllianceData {
  alliance: 'red' | 'blue';
  matchKey: string;
  matchNumber: string;
  eventKey: string;
  teams: string[];  // Team numbers
  scoutNames: string[];

  // Generic action aggregation - keys come from game-schema
  actions: Record<string, number>;  // e.g., { 'action1': 5, 'action2': 3 }

  // Generic toggle aggregation - count of robots with toggle true
  toggles: Record<string, number>;  // e.g., { 'autoToggle': 2, 'option1': 1 }

  // Missing data tracking
  missingTeams: string[];  // Teams in match but not scouted
  scoutedTeamsCount: number;
}

/**
 * TBA alliance data extracted for comparison
 * Uses generic Record type for breakdown data
 */
export interface TBAAllianceData {
  alliance: 'red' | 'blue';
  teams: string[];  // Team numbers (without "frc" prefix)

  // Scores from TBA
  totalPoints: number;
  autoPoints: number;
  teleopPoints: number;
  foulPoints: number;

  // Generic breakdown - keys derived from TBA mappings in game-schema
  breakdown: Record<string, number>;  // e.g., { 'action1': 5, 'option1': 2 }

  // Penalties (always present in TBA data)
  foulCount: number;
  techFoulCount: number;
}

// ============================================================================
// Match Display Types (TBA-First)
// ============================================================================

/**
 * Match item for display in match list
 * Combines TBA match data with scouting/validation status
 */
export interface MatchListItem {
  matchKey: string;
  matchNumber: number;
  compLevel: string;
  setNumber: number;
  displayName: string;  // e.g., "Qual 15", "SF 1-1", "Final 2"

  // Teams
  redTeams: string[];
  blueTeams: string[];

  // Status
  hasScouting: boolean;  // Whether any scouting data exists
  scoutingComplete: boolean;  // All 6 teams scouted
  redTeamsScouted: number;  // 0-3
  blueTeamsScouted: number; // 0-3

  // Validation (only present if validated)
  validationResult?: MatchValidationResult;

  // TBA data availability
  hasTBAResults: boolean;  // Whether TBA has score breakdown

  // TBA scores (optional, only if hasTBAResults is true)
  redScore?: number;
  blueScore?: number;
  redAutoScore?: number;
  blueAutoScore?: number;
  redTeleopScore?: number;
  blueTeleopScore?: number;

  // Match timing
  scheduledTime?: number;
  actualTime?: number;
}

// ============================================================================
// Validation Storage
// ============================================================================

/**
 * Database entry for validation result (for IndexedDB)
 */
export interface ValidationResultDB {
  id: string;  // Primary key: `${eventKey}_${matchKey}`
  eventKey: string;
  matchKey: string;
  matchNumber: string;
  result: MatchValidationResult;
  timestamp: number;
}

/**
 * Summary statistics for validation across multiple matches
 */
export interface ValidationSummary {
  eventKey: string;
  totalMatches: number;  // Total matches from TBA
  scoutedMatches: number;  // Matches with any scouting data
  validatedMatches: number;  // Matches that have been validated
  pendingMatches: number;  // Matches with scouting but not validated
  passedMatches: number;
  flaggedMatches: number;
  failedMatches: number;
  noTBADataMatches: number;
  noScoutingMatches: number;

  totalDiscrepancies: number;
  criticalDiscrepancies: number;
  warningDiscrepancies: number;
  minorDiscrepancies: number;

  averageConfidence: ConfidenceLevel;
  matchesRequiringReScout: number;

  generatedAt: number;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Match list filter options
 */
export interface MatchFilters {
  status: 'all' | 'passed' | 'flagged' | 'failed' | 'pending' | 'no-tba-data' | 'no-scouting';
  matchType: 'all' | 'qm' | 'sf' | 'f';
  scoutingStatus: 'all' | 'complete' | 'partial' | 'none';
  searchQuery: string;
  sortBy: 'match' | 'status' | 'discrepancies' | 'confidence';
  sortOrder: 'asc' | 'desc';
}
