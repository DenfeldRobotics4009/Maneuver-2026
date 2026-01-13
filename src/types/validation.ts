/**
 * Validation-related types
 * 
 * Types for match validation system that compares scouted data with TBA.
 * Framework provides generic validation infrastructure; game implementations
 * provide specific field mappings and scoring calculations.
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
  | 'pending'      // Not yet validated
  | 'passed'       // No significant discrepancies
  | 'flagged'      // Discrepancies detected, review recommended
  | 'failed'       // Major discrepancies, re-scouting required
  | 'no-tba-data'; // TBA data not available

/**
 * Confidence level in the scouted data
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Category of data being compared (game-specific)
 */
export type DataCategory = string; // e.g., 'auto-coral', 'teleop-coral', 'algae', 'endgame', etc.

// ============================================================================
// Discrepancy Reporting
// ============================================================================

/**
 * Represents a single discrepancy between scouted and TBA data
 */
export interface Discrepancy {
  category: DataCategory;
  field: string;           // Specific field name (e.g., "autoCoralL4Count")
  scoutedValue: number;
  tbaValue: number;
  difference: number;      // Absolute difference
  percentDiff: number;     // Percentage difference (0-100)
  severity: DiscrepancySeverity;
  message: string;         // Human-readable description
}

/**
 * Alliance-level validation result
 */
export interface AllianceValidation {
  teams: string[];         // Team keys (e.g., ["frc3314", "frc10143", "frc1234"])
  status: 'complete' | 'incomplete';
  confidence: ConfidenceLevel;
  discrepancies: Discrepancy[];
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
  
  // Scoring breakdown (game-specific structure)
  scoringBreakdown?: Record<string, unknown>;
}

/**
 * Complete match validation result
 */
export interface MatchValidationResult {
  id: string;              // Unique ID for storage: `${eventKey}_${matchKey}`
  eventKey: string;
  matchKey: string;        // TBA match key (e.g., "2025mrcmp_qm1")
  matchNumber: string;
  compLevel: string;       // "qm", "qf", "sf", "f"

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
  validatedAt: number;     // Unix timestamp
  validatedBy?: string;    // Optional validator name
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
  critical: number;        // > this % = critical (e.g., 25%)
  warning: number;         // > this % = warning (e.g., 15%)
  minor: number;           // > this % = minor (e.g., 5%)
  // Below minor = none

  // Absolute difference thresholds (for low-count items)
  criticalAbsolute: number; // > this count = critical (e.g., 5)
  warningAbsolute: number;  // > this count = warning (e.g., 3)
  minorAbsolute: number;    // > this count = minor (e.g., 1)
}

/**
 * Per-category threshold overrides
 * If not specified for a category, falls back to default thresholds
 */
export interface CategoryThresholds {
  [category: string]: ValidationThresholds;
}

/**
 * Configuration for validation behavior
 */
export interface ValidationConfig {
  thresholds: ValidationThresholds;          // Default thresholds
  categoryThresholds?: CategoryThresholds;   // Per-category overrides

  // Flags for enabling/disabling specific checks
  checkAutoScoring: boolean;
  checkTeleopScoring: boolean;
  checkEndgame: boolean;
  checkFouls: boolean;
  checkTotalScore: boolean;

  // Confidence calculation settings
  minMatchesForHighConfidence: number;       // Scout needs this many matches
  maxDiscrepanciesForHighConfidence: number;

  // Re-scouting recommendations
  autoFlagThreshold: number;                 // Auto-flag if this many critical discrepancies
  requireReScoutThreshold: number;           // Require re-scout if severity exceeds this
}

// ============================================================================
// Validation Summary
// ============================================================================

/**
 * Summary statistics for validation across multiple matches
 */
export interface ValidationSummary {
  eventKey: string;
  totalMatches: number;
  validatedMatches: number;
  pendingMatches: number;
  passedMatches: number;
  flaggedMatches: number;
  failedMatches: number;
  noTBADataMatches: number;

  totalDiscrepancies: number;
  criticalDiscrepancies: number;
  warningDiscrepancies: number;
  minorDiscrepancies: number;

  averageConfidence: ConfidenceLevel;
  matchesRequiringReScout: number;

  generatedAt: number;
}

/**
 * Database entry for validation result (for IndexedDB storage)
 * 
 * Stored in TBACacheDB.validationResults table (see database.ts)
 * This is the canonical definition - use this import in application code.
 */
export interface ValidationResultDB {
  id: string;              // Primary key: `${eventKey}_${matchKey}`
  eventKey: string;
  matchKey: string;
  matchNumber: string;
  result: MatchValidationResult;
  timestamp: number;
}
