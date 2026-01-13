/**
 * Team Stats Display Configuration Types
 * 
 * These interfaces define how game implementations configure the
 * Team Statistics page display. The framework renders stats based
 * on these configurations.
 */

import type * as React from 'react';

/**
 * Defines a section of stats to display (e.g., "Auto Coral Scoring")
 */
export interface StatSectionDefinition {
  /** Unique identifier */
  id: string;
  /** Display title (e.g., "Auto Coral Scoring") */
  title: string;
  /** Which tab to show this section on */
  tab: 'overview' | 'scoring' | 'performance';
  /** Stats to display in this section */
  stats: StatDefinition[];
  /** Optional: grid columns (default: 2) */
  columns?: 2 | 4;
}

/**
 * Defines a single stat to display
 */
export interface StatDefinition {
  /** Key in TeamStats object */
  key: string;
  /** Display label */
  label: string;
  /** How to format & display */
  type: 'number' | 'percentage';
  /** Optional subtitle (e.g., "avg per match") */
  subtitle?: string;
  /** Optional color coding */
  color?: 'default' | 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Defines progress/rate stats (for Key Rates, Climb Breakdown sections)
 */
export interface RateSectionDefinition {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Which tab to show this section on */
  tab: 'overview' | 'performance';
  /** Rates to display in this section */
  rates: RateDefinition[];
}

/**
 * Defines a single rate/percentage stat with progress bar
 */
export interface RateDefinition {
  /** Key in TeamStats object (e.g., 'climbRate') */
  key: string;
  /** Display label (e.g., 'Climb Success Rate') */
  label: string;
}

/**
 * Defines a badge to show in match-by-match list (e.g., "Climbed", "Broke Down")
 */
export interface MatchBadgeDefinition {
  /** Key in match result data (e.g., 'climbed') */
  key: string;
  /** Badge text to display (e.g., 'Climbed') */
  label: string;
  /** Badge styling variant */
  variant: 'default' | 'secondary' | 'destructive';
  /** Show badge when value equals this (typically true) */
  showWhen: boolean;
}

/**
 * Zone definition for auto start position map visualization
 * Coordinates are relative to a 640x480 base canvas
 */
export interface StartPositionZone {
  /** Position index (0, 1, 2, etc.) */
  position: number;
  /** X coordinate on 640x480 base */
  x: number;
  /** Y coordinate on 640x480 base */
  y: number;
  /** Width on 640x480 base */
  width: number;
  /** Height on 640x480 base */
  height: number;
  /** Optional label override for this zone */
  label?: string;
}

/**
 * Start position configuration for the Auto tab
 */
export interface StartPositionConfig {
  /** Number of starting positions (e.g., 5 for 2025 Reefscape) */
  positionCount: number;
  /** Optional custom labels for each position */
  positionLabels?: string[];
  /** Optional colors for each position */
  positionColors?: string[];
  /** Field background image path for red alliance (game-specific) */
  fieldImageRed?: string;
  /** Field background image path for blue alliance (game-specific) */
  fieldImageBlue?: string;
  /** Zone definitions for the auto start position map (coordinates on 640x480 base) */
  zones?: StartPositionZone[];
}

/**
 * Complete team stats display configuration
 * 
 * Game implementations provide this to configure how
 * the Team Statistics page displays their stats.
 */
export interface TeamStatsDisplayConfig {
  /** Stat sections to display */
  statSections: StatSectionDefinition[];
  /** Rate sections to display (progress bars) */
  rateSections: RateSectionDefinition[];
  /** Match badges to show in match-by-match list */
  matchBadges: MatchBadgeDefinition[];
  /** Start position configuration */
  startPositions: StartPositionConfig;
}
