# Framework Design - Core Interfaces

**Version:** 1.0  
**Date:** December 15, 2025  
**Status:** Phase 1 - Template Foundation  
**Reference:** ARCHITECTURE_STRATEGY.md

---

## 🎯 Purpose

This document defines the **TypeScript interfaces** that create the contract between:

- **maneuver-core** (the year-agnostic framework)
- **maneuver-YYYY** (year-specific game implementations)

Every game year must implement these interfaces to work with the core framework.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     maneuver-core                           │
│  (Framework - knows nothing about specific games)           │
├─────────────────────────────────────────────────────────────┤
│  • Database Layer (Dexie/IndexedDB)                         │
│  • PWA Infrastructure (Service Workers, Install)            │
│  • Data Transfer (QR, WebRTC)                               │
│  • UI Components (shadcn/ui)                                │
│  • Routing & Navigation                                     │
│  • TBA Integration (match schedules)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
              Defines interfaces & expects
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Game Configuration                         │
│              (What every game must provide)                  │
├─────────────────────────────────────────────────────────────┤
│  • GameConfig - metadata, scoring constants                  │
│  • ScoutingEntry - data structure for one match             │
│  • ScoringCalculations - how to calculate points            │
│  • ValidationRules - match validation logic                  │
│  • StrategyAnalysis - basic statistics calculation           │
│  • UIComponents - game-specific screens                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     Implemented by
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  maneuver-2025 (Reefscape)                   │
│            Concrete implementation for 2025                  │
├─────────────────────────────────────────────────────────────┤
│  • gameConfig2025.ts                                         │
│  • scoutingEntry2025.ts                                      │
│  • scoring2025.ts                                            │
│  • validation2025.ts                                         │
│  • analysis2025.ts                                           │
│  • components/ (Coral, Algae, etc.)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Core Interfaces

### 1. `GameConfig` - Game Metadata & Constants

Every game must provide basic information and scoring constants.

```typescript
/**
 * Core game configuration and metadata
 * Provides year-specific information to the framework
 */
interface GameConfig {
  // ===== REQUIRED FIELDS (used by framework) =====
  
  year: number;                    // e.g., 2025 - Used for display, database queries
  gameName: string;                // e.g., "Reefscape" - Shown in UI headers
  
  // Scoring constants (CRITICAL - used by all scoring calculations)
  scoring: {
    auto: Record<string, number>;      // Auto period point values
    teleop: Record<string, number>;    // Teleop period point values
    endgame: Record<string, number>;   // Endgame point values
    penalties?: Record<string, number>; // Optional penalty values
  };
  
  // ===== OPTIONAL FIELDS (future features) =====
  
  // Game description (metadata only, not used by framework)
  gameDescription?: string;        // e.g., "Coral placement and algae processing"
  
  // Match timing (future: could be used for in-app timers or validation)
  matchDuration?: {
    auto: number;      // Seconds (typically 15)
    teleop: number;    // Seconds (typically 135)
    total: number;     // Seconds (typically 150)
  };
  
  // Field dimensions (future: could be used for canvas drawing features)
  fieldDimensions?: {
    width: number;   // Feet or meters
    height: number;
    units: 'feet' | 'meters';
  };
  
  // Feature flags (future: could conditionally show/hide UI sections)
  // Example: if hasStartingPosition=false, skip the GameStartPage entirely
  features?: {
    hasAutonomous?: boolean;         // Default: true (every game has auto)
    hasTeleop?: boolean;             // Default: true (every game has teleop)
    hasEndgame?: boolean;            // Default: true (every game has endgame)
    hasPenalties?: boolean;          // Default: true (fouls exist in all games)
    hasStartingPosition?: boolean;   // Default: false (not all games care about this)
  };
}
```

**What's Actually Used (Current Implementation):**

- ✅ `year` - Displayed in UI, used in database queries
- ✅ `gameName` - Shown in page headers ("Scouting for Reefscape")
- ✅ `scoring` - **Critical** - used by all scoring calculations
- ❌ `gameDescription` - Not currently displayed anywhere
- ❌ `matchDuration` - Not used (no in-app timer yet)
- ❌ `fieldDimensions` - Not used (no field canvas yet)
- ❌ `features` - Not used (UI always shows all sections)

**Future Possibilities:**

The `features` object could enable **conditional scouting workflows**:

```typescript
// Example: Framework checks features before rendering
function ScoutingFlow() {
  const { config } = useGame();
  
  return (
    <Routes>
      {config.features?.hasStartingPosition && (
        <Route path="/game-start" element={<GameStartPage />} />
      )}
      
      {config.features?.hasAutonomous && (
        <Route path="/auto" element={<AutoPage />} />
      )}
      
      <Route path="/scoring" element={<ScoringPage />} />
      
      {config.features?.hasEndgame && (
        <Route path="/endgame" element={<EndgamePage />} />
      )}
    </Routes>
  );
}
```

This would let teams **opt out of scouting certain things** if they don't care about them (e.g., skip starting position if it doesn't matter for their strategy).

**Recommendation for Phase 1:**

Keep it **minimal** - only require what's actually used:

```typescript
interface GameConfigMinimal {
  year: number;
  gameName: string;
  scoring: {
    auto: Record<string, number>;
    teleop: Record<string, number>;
    endgame: Record<string, number>;
    penalties?: Record<string, number>;
  };
}
```

Add the optional fields later if/when they're actually implemented in the framework.

**Example Implementation (2025 Reefscape):**

```typescript
// gameConfig2025.ts
export const gameConfig2025: GameConfig = {
  // Required fields
  year: 2025,
  gameName: "Reefscape",
  
  // Scoring constants (CRITICAL - used by scoring calculations)
  scoring: {
    auto: {
      coralL1: 3,
      coralL2: 4,
      coralL3: 6,
      coralL4: 7,
      algaeNet: 4,
      algaeProcessor: 6,
      leave: 3,
    },
    teleop: {
      coralL1: 2,
      coralL2: 3,
      coralL3: 4,
      coralL4: 5,
      algaeNet: 4,
      algaeProcessor: 6,
    },
    endgame: {
      park: 2,
      shallowClimb: 6,
      deepClimb: 12,
      harmony: 2,
    },
    penalties: {
      foul: 5,
      techFoul: 12,
    },
  },
  
  // Optional metadata (not currently used by framework)
  gameDescription: "Coral placement and algae processing",
  
  // Optional match timing (future: could enable in-app timer)
  matchDuration: {
    auto: 15,
    teleop: 135,
    total: 150,
  },
  
  // Optional features (future: could conditionally show/hide UI sections)
  features: {
    hasAutonomous: true,
    hasTeleop: true,
    hasEndgame: true,
    hasPenalties: true,
    hasStartingPosition: true,
  },
};
```

**Minimal Version (recommended for Phase 1):**

```typescript
// gameConfig2025.ts - Minimal version with only what's actually used
export const gameConfig2025: GameConfig = {
  year: 2025,
  gameName: "Reefscape",
  
  scoring: {
    auto: {
      coralL1: 3,
      coralL2: 4,
      coralL3: 6,
      coralL4: 7,
      algaeNet: 4,
      algaeProcessor: 6,
      leave: 3,
    },
    teleop: {
      coralL1: 2,
      coralL2: 3,
      coralL3: 4,
      coralL4: 5,
      algaeNet: 4,
      algaeProcessor: 6,
    },
    endgame: {
      park: 2,
      shallowClimb: 6,
      deepClimb: 12,
      harmony: 2,
    },
  },
};
```

---

### 2. `ScoutingEntry` - Data Structure

The base interface for scouting data. Each game extends this with specific fields.

```typescript
/**
 * Base scouting entry that all games must extend
 * Core framework uses these fields for data management
 */
interface ScoutingEntryBase {
  // Identity fields (required by core framework)
  id: string;                    // Unique identifier: "eventKey::matchKey::teamNumber::alliance"
                                 // Example: "2025mrcmp::qm24::3314::red" or "2025mrcmp::sf1m1::3314::red"
  scoutName: string;             // Who scouted this match
  teamNumber: number;            // Team being scouted
  matchNumber: number;           // Numeric match number (extracted from matchKey for sorting)
                                 // Example: 24 (from qm24), 1 (from sf1m1)
                                 // Used for: UI display, sorting within same match type
  
  // Match context (required by core framework)
  eventKey: string;              // TBA event key (e.g., "2025mrcmp")
  matchKey: string;              // TBA match key (e.g., "qm24", "sf1m1", "f1m2") - REQUIRED
                                 // Uniquely identifies match including type (qual/elim)
                                 // Critical for: TBA validation, distinguishing match types
                                 // Full TBA format: "{eventKey}_{matchKey}" → "2025mrcmp_qm24"
  allianceColor: 'red' | 'blue'; // Alliance color
  
  // Timestamps (managed by core framework)
  timestamp: number;             // Unix timestamp (ms)
  
  // Comments (universal across games)
  comments?: string;             // Scout's notes
  
  // Correction metadata (for data quality tracking)
  isCorrected?: boolean;
  correctionCount?: number;
  lastCorrectedAt?: number;
  lastCorrectedBy?: string;
  correctionNotes?: string;
  
  // Game-specific data (all year-specific fields stored here)
  gameData: Record<string, unknown>;
}

/**
 * Game-specific scouting entry
 * Extends the base with typed gameData structure
 */
interface GameScoutingEntry extends ScoutingEntryBase {
  gameData: {
    // Game defines typed structure for gameData
    // Example for 2025: { autoCoralL4Count: number, teleopAlgaeNet: number, ... }
    [key: string]: any;
  };
}
```

**Example Implementation (2025 Reefscape):**

```typescript
// scoutingEntry2025.ts
export interface ScoutingEntry2025 extends ScoutingEntryBase {
  gameData: {
    // Pre-match
    startingPosition: 0 | 1 | 2 | 3 | 4 | 5;
    
    // Autonomous period
    autoLeave: boolean;
    autoCoralPlaceL1Count: number;
    autoCoralPlaceL2Count: number;
    autoCoralPlaceL3Count: number;
    autoCoralPlaceL4Count: number;
    autoAlgaeNetCount: number;
    autoAlgaeProcessorCount: number;
    
    // Teleop period
    teleopCoralPlaceL1Count: number;
    teleopCoralPlaceL2Count: number;
    teleopCoralPlaceL3Count: number;
    teleopCoralPlaceL4Count: number;
    teleopAlgaeNetCount: number;
    teleopAlgaeProcessorCount: number;
    
    // Endgame
    endgameAttempt: 'none' | 'park' | 'shallow' | 'deep';
    endgameSuccess: boolean;
    
    // Robot status
    robotBroke: boolean;
  };
}
```

---

### 3. `ScoringCalculations` - Point Calculation Logic

How to calculate points from a scouting entry.

```typescript
/**
 * Scoring calculation functions
 * Framework calls these to display predicted scores
 */
interface ScoringCalculations {
  /**
   * Calculate autonomous period points
   * @param entry - The scouting entry (game-specific type)
   * @returns Total auto points
   */
  calculateAutoPoints(entry: GameScoutingEntry): number;
  
  /**
   * Calculate teleop period points
   * @param entry - The scouting entry
   * @returns Total teleop points
   */
  calculateTeleopPoints(entry: GameScoutingEntry): number;
  
  /**
   * Calculate endgame points
   * @param entry - The scouting entry
   * @returns Total endgame points
   */
  calculateEndgamePoints(entry: GameScoutingEntry): number;
  
  /**
   * Calculate total match points
   * @param entry - The scouting entry
   * @returns Total match points (auto + teleop + endgame)
   */
  calculateTotalPoints(entry: GameScoutingEntry): number;
  
  /**
   * Calculate penalty points (optional)
   * @param entry - The scouting entry
   * @returns Total penalty points deducted
   */
  calculatePenaltyPoints?(entry: GameScoutingEntry): number;
  
  /**
   * Calculate contribution points (for alliance scoring)
   * Some games have alliance-wide bonuses
   * @param entries - All entries for the alliance
   * @returns Alliance bonus points
   */
  calculateAllianceBonus?(entries: GameScoutingEntry[]): number;
}
```

**Example Implementation (2025 Reefscape):**

```typescript
// scoring2025.ts
export const scoring2025: ScoringCalculations = {
  calculateAutoPoints(entry: ScoutingEntry2025): number {
    const { scoring } = gameConfig2025;
    const { gameData } = entry;
    let points = 0;
    
    // Leave bonus
    if (gameData.autoLeave) points += scoring.auto.leave;
    
    // Coral placement
    points += gameData.autoCoralPlaceL1Count * scoring.auto.coralL1;
    points += gameData.autoCoralPlaceL2Count * scoring.auto.coralL2;
    points += gameData.autoCoralPlaceL3Count * scoring.auto.coralL3;
    points += gameData.autoCoralPlaceL4Count * scoring.auto.coralL4;
    
    // Algae scoring
    points += gameData.autoAlgaeNetCount * scoring.auto.algaeNet;
    points += gameData.autoAlgaeProcessorCount * scoring.auto.algaeProcessor;
    
    return points;
  },
  
  calculateTeleopPoints(entry: ScoutingEntry2025): number {
    const { scoring } = gameConfig2025;
    const { gameData } = entry;
    let points = 0;
    
    // Coral placement
    points += gameData.teleopCoralPlaceL1Count * scoring.teleop.coralL1;
    points += gameData.teleopCoralPlaceL2Count * scoring.teleop.coralL2;
    points += gameData.teleopCoralPlaceL3Count * scoring.teleop.coralL3;
    points += gameData.teleopCoralPlaceL4Count * scoring.teleop.coralL4;
    
    // Algae scoring
    points += gameData.teleopAlgaeNetCount * scoring.teleop.algaeNet;
    points += gameData.teleopAlgaeProcessorCount * scoring.teleop.algaeProcessor;
    
    return points;
  },
  
  calculateEndgamePoints(entry: ScoutingEntry2025): number {
    const { scoring } = gameConfig2025;
    const { gameData } = entry;
    let points = 0;
    
    if (gameData.endgameSuccess) {
      if (gameData.endgameAttempt === 'park') points += scoring.endgame.park;
      if (gameData.endgameAttempt === 'shallow') points += scoring.endgame.shallowClimb;
      if (gameData.endgameAttempt === 'deep') points += scoring.endgame.deepClimb;
    }
    
    return points;
  },
  
  calculateTotalPoints(entry: ScoutingEntry2025): number {
    return (
      this.calculateAutoPoints(entry) +
      this.calculateTeleopPoints(entry) +
      this.calculateEndgamePoints(entry)
    );
  },
  
  calculatePenaltyPoints(entry: ScoutingEntry2025): number {
    const { gameData } = entry;
    // 2025 rules: Foul = 5 points, Tech Foul = 12 points
    return (gameData.foulsCommitted * 5) + (gameData.techFoulsCommitted * 12);
  },
};
```

---

### 4. `ValidationRules` - Match Validation

How to validate scouting data against TBA actual match results.

> **Note:** The validation system compares the **SUM of all 3 scouted robots** on an alliance against TBA's alliance-level data. TBA doesn't provide individual robot breakdowns (that's why we scout!), so we aggregate scouted data for comparison.

```typescript
/**
 * Validation rules for comparing scouted data to actual match results
 * Framework provides configurable thresholds, game provides field mappings
 */
interface ValidationRules {
  /**
   * Define data categories for this game
   * Used for grouping related fields and applying category-specific thresholds
   * @returns Array of category definitions
   */
  getDataCategories(): DataCategory[];
  
  /**
   * Map scouted alliance data to TBA score breakdown fields
   * This tells the framework how to extract comparable values from both sources
   * @param allianceEntries - All 3 scouting entries for alliance (scouted data)
   * @param tbaScoreBreakdown - TBA's score_breakdown object (varies by year)
   * @param alliance - Which alliance ('red' or 'blue')
   * @returns Array of field comparisons for validation
   */
  mapFieldsForValidation(
    allianceEntries: GameScoutingEntry[],
    tbaScoreBreakdown: any,
    alliance: 'red' | 'blue'
  ): FieldComparison[];
  
  /**
   * Calculate total alliance score from scouting entries
   * @param allianceEntries - All scouting entries for alliance
   * @returns Total predicted score
   */
  calculateAllianceScore(allianceEntries: GameScoutingEntry[]): number;
  
  /**
   * Validate that teams were actually in the match
   * @param allianceEntries - Scouting entries to check
   * @param tbaMatch - TBA match data
   * @param alliance - Which alliance
   * @returns Array of team validation results
   */
  validateTeamsInMatch(
    allianceEntries: GameScoutingEntry[],
    tbaMatch: TBAMatch,
    alliance: 'red' | 'blue'
  ): TeamValidationResult[];
}

/**
 * Data category definition
 * Groups related fields for threshold configuration
 */
interface DataCategory {
  id: string;              // e.g., "auto-coral", "teleop-coral", "algae", "endgame"
  label: string;           // Human-readable name
  description?: string;    // What this category includes
}

/**
 * Field comparison for validation
 * Maps a scouted value to corresponding TBA value
 */
interface FieldComparison {
  category: string;        // Category ID (e.g., "auto-coral")
  field: string;           // Field name for display (e.g., "Auto L4 Coral")
  scoutedValue: number;    // Sum from all 3 scouted robots
  tbaValue: number;        // Value from TBA score_breakdown
  
  // Optional: Provide context for better validation messages
  fieldKey?: string;       // Technical field name (e.g., "autoCoralL4Count")
  unit?: string;           // Unit of measurement (e.g., "pieces", "points")
}

/**
 * Team validation result
 * Checks if a team was actually in the match
 */
interface TeamValidationResult {
  teamNumber: number;
  wasInMatch: boolean;
  expectedAlliance: 'red' | 'blue';
  actualAlliance?: 'red' | 'blue';
  error?: string;          // Error message if team wasn't in match or wrong alliance
}

// TBA Match structure (from TBA API)
interface TBAMatch {
  key: string;
  comp_level: string;
  match_number: number;
  alliances: {
    red: { score: number; team_keys: string[] };
    blue: { score: number; team_keys: string[] };
  };
  score_breakdown?: any; // Game-specific scoring details
}
```

**How It Works:**

The framework handles:

- ✅ Configurable thresholds (user can adjust via settings)
- ✅ Severity calculation (critical/warning/minor/none)
- ✅ Field-by-field comparison using game's mappings
- ✅ Category-specific threshold overrides
- ✅ Detailed discrepancy reporting

The game provides:

- ✅ Category definitions (what types of data exist)
- ✅ Field mappings (how to compare scouted vs TBA data)
- ✅ Score calculation (how to sum alliance totals)
- ✅ Team validation (who was actually in the match)

**Example Implementation (2025 Reefscape):**

```typescript
// validation2025.ts
export const validation2025: ValidationRules = {
  getDataCategories(): DataCategory[] {
    return [
      { id: 'auto-coral', label: 'Auto Coral', description: 'Autonomous coral placement (all levels)' },
      { id: 'teleop-coral', label: 'Teleop Coral', description: 'Teleoperated coral placement (all levels)' },
      { id: 'algae', label: 'Algae', description: 'Algae scoring (net + processor, auto + teleop)' },
      { id: 'endgame', label: 'Endgame', description: 'Parking and climbing' },
      { id: 'mobility', label: 'Mobility', description: 'Leaving starting zone in auto' },
      { id: 'total-score', label: 'Total Score', description: 'Overall alliance score' },
    ];
  },
  
  mapFieldsForValidation(
    allianceEntries: ScoutingEntry2025[],
    tbaScoreBreakdown: any,
    alliance: 'red' | 'blue'
  ): FieldComparison[] {
    // Sum all scouted values across 3 robots
    const scoutedAuto = {
      coralL1: allianceEntries.reduce((sum, e) => sum + e.gameData.autoCoralPlaceL1Count, 0),
      coralL2: allianceEntries.reduce((sum, e) => sum + e.gameData.autoCoralPlaceL2Count, 0),
      coralL3: allianceEntries.reduce((sum, e) => sum + e.gameData.autoCoralPlaceL3Count, 0),
      coralL4: allianceEntries.reduce((sum, e) => sum + e.gameData.autoCoralPlaceL4Count, 0),
      algaeNet: allianceEntries.reduce((sum, e) => sum + e.gameData.autoAlgaeNetCount, 0),
      algaeProcessor: allianceEntries.reduce((sum, e) => sum + e.gameData.autoAlgaeProcessorCount, 0),
      leave: allianceEntries.filter(e => e.gameData.autoLeave).length,
    };
    
    const scoutedTeleop = {
      coralL1: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopCoralPlaceL1Count, 0),
      coralL2: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopCoralPlaceL2Count, 0),
      coralL3: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopCoralPlaceL3Count, 0),
      coralL4: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopCoralPlaceL4Count, 0),
      algaeNet: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopAlgaeNetCount, 0),
      algaeProcessor: allianceEntries.reduce((sum, e) => sum + e.gameData.teleopAlgaeProcessorCount, 0),
    };
    
    const scoutedEndgame = {
      deep: allianceEntries.filter(e => e.gameData.endgameAttempt === 'deep' && e.gameData.endgameSuccess).length,
      shallow: allianceEntries.filter(e => e.gameData.endgameAttempt === 'shallow' && e.gameData.endgameSuccess).length,
      park: allianceEntries.filter(e => e.gameData.endgameAttempt === 'park' && e.gameData.endgameSuccess).length,
    };
    
    // Extract TBA values (field names vary by year!)
    const tba = tbaScoreBreakdown[alliance];
    
    // Return field comparisons
    return [
      // Auto Coral
      { category: 'auto-coral', field: 'Auto L1 Coral', scoutedValue: scoutedAuto.coralL1, tbaValue: tba.autoCoralL1 || 0, unit: 'pieces' },
      { category: 'auto-coral', field: 'Auto L2 Coral', scoutedValue: scoutedAuto.coralL2, tbaValue: tba.autoCoralL2 || 0, unit: 'pieces' },
      { category: 'auto-coral', field: 'Auto L3 Coral', scoutedValue: scoutedAuto.coralL3, tbaValue: tba.autoCoralL3 || 0, unit: 'pieces' },
      { category: 'auto-coral', field: 'Auto L4 Coral', scoutedValue: scoutedAuto.coralL4, tbaValue: tba.autoCoralL4 || 0, unit: 'pieces' },
      
      // Teleop Coral
      { category: 'teleop-coral', field: 'Teleop L1 Coral', scoutedValue: scoutedTeleop.coralL1, tbaValue: tba.teleopCoralL1 || 0, unit: 'pieces' },
      { category: 'teleop-coral', field: 'Teleop L2 Coral', scoutedValue: scoutedTeleop.coralL2, tbaValue: tba.teleopCoralL2 || 0, unit: 'pieces' },
      { category: 'teleop-coral', field: 'Teleop L3 Coral', scoutedValue: scoutedTeleop.coralL3, tbaValue: tba.teleopCoralL3 || 0, unit: 'pieces' },
      { category: 'teleop-coral', field: 'Teleop L4 Coral', scoutedValue: scoutedTeleop.coralL4, tbaValue: tba.teleopCoralL4 || 0, unit: 'pieces' },
      
      // Algae (combined auto + teleop)
      { category: 'algae', field: 'Algae Net', scoutedValue: scoutedAuto.algaeNet + scoutedTeleop.algaeNet, tbaValue: tba.totalAlgaeNet || 0, unit: 'pieces' },
      { category: 'algae', field: 'Algae Processor', scoutedValue: scoutedAuto.algaeProcessor + scoutedTeleop.algaeProcessor, tbaValue: tba.totalAlgaeProcessor || 0, unit: 'pieces' },
      
      // Endgame
      { category: 'endgame', field: 'Deep Climb', scoutedValue: scoutedEndgame.deep, tbaValue: tba.deepClimbCount || 0, unit: 'robots' },
      { category: 'endgame', field: 'Shallow Climb', scoutedValue: scoutedEndgame.shallow, tbaValue: tba.shallowClimbCount || 0, unit: 'robots' },
      { category: 'endgame', field: 'Park', scoutedValue: scoutedEndgame.park, tbaValue: tba.parkCount || 0, unit: 'robots' },
      
      // Mobility
      { category: 'mobility', field: 'Left Starting Zone', scoutedValue: scoutedAuto.leave, tbaValue: tba.autoLeaveCount || 0, unit: 'robots' },
    ];
  },
  
  calculateAllianceScore(allianceEntries: ScoutingEntry2025[]): number {
    // Sum scores from all 3 robots
    return allianceEntries.reduce((sum, entry) => 
      sum + scoring2025.calculateTotalPoints(entry),
      0
    );
  },
  
  validateTeamsInMatch(
    allianceEntries: ScoutingEntry2025[],
    tbaMatch: TBAMatch,
    alliance: 'red' | 'blue'
  ): TeamValidationResult[] {
    const tbaTeamKeys = tbaMatch.alliances[alliance].team_keys;
    
    return allianceEntries.map(entry => {
      const teamKey = `frc${entry.teamNumber}`;
      const wasInMatch = tbaTeamKeys.includes(teamKey);
      
      if (!wasInMatch) {
        // Check if in opposite alliance
        const oppositeAlliance = alliance === 'red' ? 'blue' : 'red';
        const inOpposite = tbaMatch.alliances[oppositeAlliance].team_keys.includes(teamKey);
        
        if (inOpposite) {
          return {
            teamNumber: entry.teamNumber,
            wasInMatch: true,
            expectedAlliance: alliance,
            actualAlliance: oppositeAlliance,
            error: `Team ${entry.teamNumber} was in ${oppositeAlliance} alliance, not ${alliance}`,
          };
        } else {
          return {
            teamNumber: entry.teamNumber,
            wasInMatch: false,
            expectedAlliance: alliance,
            error: `Team ${entry.teamNumber} was not in this match`,
          };
        }
      }
      
      return {
        teamNumber: entry.teamNumber,
        wasInMatch: true,
        expectedAlliance: alliance,
        actualAlliance: alliance,
      };
    });
  },
};
```

**Framework Usage:**

The framework receives these mappings and:

1. Applies user-configured thresholds to each field comparison
2. Calculates severity (critical/warning/minor/none) based on thresholds
3. Groups discrepancies by category for organized display
4. Generates detailed validation report with color-coded warnings

This separation means:

- **Game code** stays simple: just define what to compare
- **Framework code** handles complex threshold logic and UI
- **Users** can customize thresholds without touching code

---

### 5. `StrategyAnalysis` - Robot Evaluation (Future)

How to calculate statistics and analyze robot performance.

> **Note:** Currently, the app only calculates basic averages and displays raw statistics. The strategy weighting system below is a **future enhancement** for Phase 2 or beyond. For now, games only need to provide basic stat calculations.

```typescript
/**
 * Strategy analysis and statistics
 * Games provide basic stat calculations, advanced features are optional
 */
interface StrategyAnalysis {
  /**
   * Calculate basic statistics for a team
   * @param entries - All scouting entries for a team
   * @returns Basic stats (averages, totals, etc.)
   */
  calculateBasicStats(entries: GameScoutingEntry[]): TeamBasicStats;
  
  /**
   * OPTIONAL: Calculate advanced performance metrics
   * @param entries - All scouting entries for a team
   * @returns Advanced analysis (consistency, reliability, etc.)
   */
  analyzeRobotPerformance?(entries: GameScoutingEntry[]): RobotAnalysis;
  
  /**
   * OPTIONAL: Calculate pick list priority score
   * Future enhancement for automated pick lists
   * @param entries - All scouting entries for a team
   * @param weights - Configurable strategy weights
   * @returns Priority score (0-100, higher = better)
   */
  calculatePickPriority?(
    entries: GameScoutingEntry[],
    weights: StrategyWeightsConfig
  ): number;
}

/**
 * Basic team statistics (currently implemented)
 */
interface TeamBasicStats {
  // Match counts
  totalMatches: number;
  
  // Average points per match period
  avgAutoPoints: number;
  avgTeleopPoints: number;
  avgEndgamePoints: number;
  avgTotalPoints: number;
  
  // Game-specific averages (varies by year)
  // Example for 2025: avgCoralL4Count, avgClimbSuccessRate, etc.
  [key: string]: number;
}

/**
 * Advanced robot analysis (future enhancement)
 */
interface RobotAnalysis {
  strengths: string[];        // e.g., ["High coral placement", "Consistent climber"]
  weaknesses: string[];       // e.g., ["Slow cycle time", "Unreliable auto"]
  consistency: number;        // 0-1, based on standard deviation
  reliability: number;        // 0-1, based on breakage rate
  // ... more advanced metrics
}

/**
 * Strategy weights configuration (future enhancement)
 * Allows teams to customize what they value in alliance partners
 */
interface StrategyWeightsConfig {
  // Configurable by teams (not hardcoded)
  autoWeight: number;         // 0-1, importance of auto scoring
  teleopWeight: number;       // 0-1, importance of teleop scoring
  endgameWeight: number;      // 0-1, importance of endgame
  consistencyWeight: number;  // 0-1, value consistency over peaks
  defenseWeight: number;      // 0-1, value defensive ability
  
  // Game-specific weights (varies by year)
  [key: string]: number;      // e.g., coralHighWeight, climbWeight, etc.
}
```

**Example Implementation (2025 Reefscape):**

> Currently, the 2025 implementation only provides basic stat calculations. Advanced features like pick list scoring are TODO for future versions.

```typescript
// analysis2025.ts
export const analysis2025: StrategyAnalysis = {
  calculateBasicStats(entries: ScoutingEntry2025[]): TeamBasicStats {
    if (entries.length === 0) {
      return {
        totalMatches: 0,
        avgAutoPoints: 0,
        avgTeleopPoints: 0,
        avgEndgamePoints: 0,
        avgTotalPoints: 0,
        // 2025-specific averages
        avgCoralL4Count: 0,
        avgAlgaeNetCount: 0,
        avgClimbSuccessRate: 0,
      };
    }
    
    // Calculate averages across all matches
    const avgAutoPoints = entries.reduce((sum, e) => 
      sum + scoring2025.calculateAutoPoints(e), 0) / entries.length;
    const avgTeleopPoints = entries.reduce((sum, e) => 
      sum + scoring2025.calculateTeleopPoints(e), 0) / entries.length;
    const avgEndgamePoints = entries.reduce((sum, e) => 
      sum + scoring2025.calculateEndgamePoints(e), 0) / entries.length;
    
    // 2025-specific stats
    const avgCoralL4Count = entries.reduce((sum, e) => 
      sum + e.gameData.autoCoralPlaceL4Count + e.gameData.teleopCoralPlaceL4Count, 0) / entries.length;
    const avgAlgaeNetCount = entries.reduce((sum, e) => 
      sum + e.gameData.autoAlgaeNetCount + e.gameData.teleopAlgaeNetCount, 0) / entries.length;
    const climbSuccessRate = entries.filter(e => 
      e.gameData.endgameSuccess && e.gameData.endgameAttempt !== 'none'
    ).length / entries.length;
    
    return {
      totalMatches: entries.length,
      avgAutoPoints,
      avgTeleopPoints,
      avgEndgamePoints,
      avgTotalPoints: avgAutoPoints + avgTeleopPoints + avgEndgamePoints,
      // 2025-specific
      avgCoralL4Count,
      avgAlgaeNetCount,
      avgClimbSuccessRate: climbSuccessRate,
    };
  },
  
  // Advanced features not yet implemented
  // analyzeRobotPerformance: undefined,
  // calculatePickPriority: undefined,
};
```

**Future Enhancement Example (not yet implemented):**

```typescript
// This is what advanced analysis COULD look like in the future
export const advancedAnalysis2025: StrategyAnalysis = {
  calculateBasicStats(entries: ScoutingEntry2025[]): TeamBasicStats {
    // ... same as above
  },
  
  analyzeRobotPerformance(entries: ScoutingEntry2025[]): RobotAnalysis {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const stats = this.calculateBasicStats(entries);
    
    // Identify strengths based on stats
    if (stats.avgAutoPoints > 15) strengths.push("Strong autonomous");
    if (stats.avgCoralL4Count > 2) strengths.push("High coral placement");
    if (stats.avgClimbSuccessRate > 0.8) strengths.push("Consistent climber");
    
    // Identify weaknesses
    const breakageRate = entries.filter(e => e.gameData.robotBroke).length / entries.length;
    if (breakageRate > 0.2) weaknesses.push("Reliability concerns");
    if (stats.avgAutoPoints < 5) weaknesses.push("Weak autonomous");
    
    return {
      strengths,
      weaknesses,
      consistency: calculateConsistency(entries),
      reliability: 1 - breakageRate,
    };
  },
  
  calculatePickPriority(
    entries: ScoutingEntry2025[],
    weights: StrategyWeightsConfig
  ): number {
    // Weighted scoring algorithm
    // This would allow teams to customize what they value
    // For now, just use simple average points
    const stats = this.calculateBasicStats(entries);
    return stats.avgTotalPoints;
  },
};

function calculateConsistency(entries: ScoutingEntry2025[]): number {
  const scores = entries.map(e => scoring2025.calculateTotalPoints(e));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to 0-1 score (lower stdDev = more consistent)
  return Math.max(0, 1 - (stdDev / avg));
}
```

---

### 6. `UIComponents` - Game-Specific Screens

Game-specific UI components that plug into the framework's routing.

```typescript
/**
 * UI components that the game provides
 * Framework renders these at specific routes
 */
interface GameUIComponents {
  /**
   * Match setup screen (team number, match number, alliance color)
   * Shown at start of scouting flow
   */
  GameStartScreen: React.ComponentType<GameStartScreenProps>;
  
  /**
   * Starting position selection screen (OPTIONAL)
   * Shown before autonomous period scouting if team wants to track starting positions
   */
  AutoStartScreen?: React.ComponentType<AutoStartScreenProps>;
  
  /**
   * Autonomous period scouting screen
   */
  AutoScoringScreen: React.ComponentType<ScoringScreenProps>;
  
  /**
   * Teleop period scouting screen
   */
  TeleopScoringScreen: React.ComponentType<ScoringScreenProps>;
  
  /**
   * Endgame scouting screen (OPTIONAL)
   * Some teams get endgame data from TBA API instead of scouting it
   */
  EndgameScreen?: React.ComponentType<ScoringScreenProps>;
}

// Props interfaces (framework provides these)
interface GameStartScreenProps {
  entry: GameScoutingEntry;
  onUpdate: (entry: Partial<GameScoutingEntry>) => void;
  onNext: () => void;
  onCancel?: () => void;
}

interface AutoStartScreenProps {
  entry: GameScoutingEntry;
  onUpdate: (entry: Partial<GameScoutingEntry>) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel?: () => void;
}

interface ScoringScreenProps {
  entry: GameScoutingEntry;
  onUpdate: (entry: Partial<GameScoutingEntry>) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel?: () => void;
}
    analysis: RobotAnalysis;
  }>;
}
```

---

## 🔌 Game Package Structure

Each game implementation is a **self-contained package**:

```text
maneuver-2025/
├── src/
│   ├── game/
│   │   ├── index.ts                 # Main export - registers game with framework
│   │   ├── config.ts                # GameConfig implementation
│   │   ├── types.ts                 # ScoutingEntry2025 interface
│   │   ├── scoring.ts               # ScoringCalculations implementation
│   │   ├── validation.ts            # ValidationRules implementation
│   │   ├── analysis.ts              # StrategyAnalysis implementation (basic stats)
│   │   └── components/              # UI components
│   │       ├── GameStartScreen.tsx
│   │       ├── AutoStartScreen.tsx (optional)
│   │       ├── AutoScoringScreen.tsx
│   │       ├── TeleopScoringScreen.tsx
│   │       └── EndgameScreen.tsx (optional)
│   └── ... (other app-specific code)
└── package.json
```

**Main Export (`index.ts`):**

```typescript
// src/game/index.ts
import { gameConfig2025 } from './config';
import { ScoutingEntry2025 } from './types';
import { scoring2025 } from './scoring';
import { validation2025 } from './validation';
import { analysis2025 } from './analysis';  // Renamed from strategy2025
import * as components from './components';

export const game2025 = {
  config: gameConfig2025,
  scoring: scoring2025,
  validation: validation2025,
  analysis: analysis2025,  // Basic stats only for now
  components,
  
  // Helper: create empty scouting entry
  createEntry: (partial: Partial<ScoutingEntry2025>): ScoutingEntry2025 => ({
    // Base fields (framework-defined)
    id: `${partial.eventKey || ''}::${partial.matchKey || 'qm0'}::${partial.teamNumber || 0}::${partial.allianceColor || 'blue'}`,
    scoutName: '',
    teamNumber: 0,
    matchNumber: 0,
    eventKey: '',
    matchKey: '',
    allianceColor: 'blue',
    timestamp: Date.now(),
    
    // Game-specific data (2025 defaults)
    gameData: {
      startingPosition: 0,
      preloadedPiece: 'none',
      autoLeave: false,
      autoCoralPlaceL1Count: 0,
      autoCoralPlaceL2Count: 0,
      // ... all other 2025 fields with defaults
      ...partial.gameData,
    },
    
    // Merge partial base fields
    ...partial,
  }),
};

export type { ScoutingEntry2025 };
```

---

## 🔄 Framework Integration

The core framework doesn't import game code directly. Instead, games are **injected** at runtime.

**Framework Side (`maneuver-core`):**

```typescript
// src/core/GameProvider.tsx
import React, { createContext, useContext } from 'react';

interface GameContext {
  config: GameConfig;
  scoring: ScoringCalculations;
  validation: ValidationRules;
  analysis: StrategyAnalysis;  // Renamed from strategy
  components: GameUIComponents;
}

const GameContext = createContext<GameContext | null>(null);

export function GameProvider({ 
  game, 
  children 
}: { 
  game: GameContext; 
  children: React.ReactNode;
}) {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
```

**App Side (`maneuver-2025`):**

```typescript
// src/main.tsx
import { GameProvider } from '@maneuver/core';
import { game2025 } from './game';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GameProvider game={game2025}>
    <App />
  </GameProvider>
);
```

**Usage in Core Components:**

```typescript
// Example: Dashboard displays total points
import { useGame } from '@maneuver/core';

function MatchCard({ entry }: { entry: GameScoutingEntry }) {
  const { scoring } = useGame();
  
  const totalPoints = scoring.calculateTotalPoints(entry);
  
  return (
    <div>
      <h3>Match {entry.matchNumber}</h3>
      <p>Predicted Score: {totalPoints}</p>
    </div>
  );
}
```

---

## 📦 Database Schema (Core)

The core framework defines the database schema, but uses generic types:

```typescript
// maneuver-core/src/db/schema.ts
import Dexie from 'dexie';

export class ManeuverDatabase extends Dexie {
  // Scouting entries (game-agnostic storage)
  scoutingEntries!: Dexie.Table<ScoutingEntryBase, string>;
  
  // Scouts (gamification)
  scouts!: Dexie.Table<Scout, string>;
  
  // Match predictions
  matchPredictions!: Dexie.Table<MatchPrediction, string>;
  
  // Pit scouting (generic)
  pitScoutingEntries!: Dexie.Table<PitScoutingEntryBase, string>;
  
  constructor() {
    super('ManeuverDB');
    
    this.version(1).stores({
      scoutingEntries: 'id, teamNumber, matchNumber, eventKey, timestamp, scoutName',
      scouts: 'name, totalMatches, totalPoints',
      matchPredictions: 'id, matchKey, eventKey',
      pitScoutingEntries: 'id, teamNumber, eventKey, scoutName',
    });
  }
}
```

Game implementations can extend the database with game-specific indices, but the core schema works with any game.

---

## ✅ Implementation Checklist

When creating a new game year:

- [ ] Create `config.ts` implementing `GameConfig`
- [ ] Create `types.ts` defining `GameScoutingEntry extends ScoutingEntryBase`
- [ ] Create `scoring.ts` implementing `ScoringCalculations`
- [ ] Create `validation.ts` implementing `ValidationRules`
- [ ] Create `analysis.ts` implementing `StrategyAnalysis` (at minimum: `calculateBasicStats`)
- [ ] Create UI components implementing `GameUIComponents`
- [ ] Create `index.ts` that exports complete game package
- [ ] Write tests for scoring calculations
- [ ] Write tests for validation logic
- [ ] Document game-specific statistics available
- [ ] (Optional) Implement advanced analysis features like pick list scoring

---

## 🎯 Success Criteria

This framework design succeeds if:

1. ✅ **Any team can create 2026 implementation** without touching core
2. ✅ **Core framework never imports game-specific code**
3. ✅ **All game logic is in game package** (no leaks into core)
4. ✅ **Multiple games can coexist** (if we wanted 2025 + 2026 in one app)
5. ✅ **Framework improvements benefit all games** automatically
6. ✅ **Teams can customize strategy** without forking core code

---

## 📚 Next Steps

1. **Validate these interfaces** against current 2025 implementation
2. **Create core framework** with generic components
3. **Extract 2025 logic** into game package following these interfaces
4. **Test integration** - does 2025 game work with core?
5. **Document migration guide** for creating 2026 game

---

## 🤔 Open Questions & Future Considerations

### Pit Scouting Interface

**Status:** ✅ **Implemented** - pit scouting uses the same `gameData` pattern as match scouting

**Core pit scouting fields** (year-agnostic):

- Robot dimensions (width, length, height)
- Weight
- Drive train type (e.g., swerve, tank, mecanum)
- Programming language (Java, C++, Python, LabVIEW)
- Team organization info
- Photos

**Game-specific pit scouting** (varies by year):

- 2025: "Can you score coral on L4?", "Algae capability?", "Climbing strategy?"
- 2026: Different game pieces, different mechanisms

**Proposed approach:**

```typescript
interface PitScoutingBase {
  // Core fields (framework provides form)
  teamNumber: number;
  eventKey: string;
  scoutName: string;
  timestamp: number;
  
  // Universal pit scouting fields (year-agnostic)
  robotPhoto?: string;              // Base64 or URL
  weight?: number;                  // Robot weight in pounds
  drivetrain?: DrivetrainType;      // 'swerve' | 'tank' | 'mecanum' | 'other'
  programmingLanguage?: ProgrammingLanguage; // 'Java' | 'C++' | 'Python' | 'LabVIEW' | 'other'
  notes?: string;                   // General observations
  
  // Game-specific fields
  gameData?: Record<string, unknown>;
}

interface PitScoutingRules {
  // Game provides additional questions
  getGameSpecificQuestions(): PitScoutingQuestion[];
}

interface PitScoutingQuestion {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'number' | 'select' | 'multiselect';
  options?: string[];  // For select/multiselect
  required?: boolean;
}
```

**Example 2025 implementation:**

```typescript
export const pitScouting2025: PitScoutingRules = {
  getGameSpecificQuestions() {
    return [
      { id: 'canScoreCoralL4', label: 'Can score coral on Level 4?', type: 'boolean', required: true },
      { id: 'algaeCapability', label: 'Algae capability', type: 'select', options: ['None', 'Net only', 'Processor only', 'Both'] },
      { id: 'climbType', label: 'Climbing capability', type: 'select', options: ['None', 'Park', 'Shallow', 'Deep'] },
      { id: 'autoStrategy', label: 'Autonomous strategy', type: 'text' },
    ];
  },
};
```

This way:

- Framework provides standard pit scouting form for universal fields
- Game adds custom questions dynamically
- 2026 game defines completely different questions

---

### QR Code Compression

**Status:** 🔮 **Future Enhancement** (Phase 2) - Currently 2025-specific implementation

**Challenge:** QR codes have size limits (~2,953 bytes). We use compression to fit match data.

**Current approach (2025-specific):**

- Custom bit-packing for known fields
- Maps field names to short codes
- Example: `autoCoralPlaceL4Count` → `aL4` → 3 bits

**Future framework approach:**

```typescript
interface DataCompressionRules {
  /**
   * Compress scouting entry for QR code transfer
   * @param entry - Full scouting entry
   * @returns Compressed string (base64 or similar)
   */
  compressEntry(entry: GameScoutingEntry): string;
  
  /**
   * Decompress QR code data back to scouting entry
   * @param compressed - Compressed string from QR
   * @returns Full scouting entry
   */
  decompressEntry(compressed: string): GameScoutingEntry;
  
  /**
   * Get estimated compressed size (for UI warnings)
   * @param entry - Scouting entry
   * @returns Estimated bytes
   */
  getCompressedSize(entry: GameScoutingEntry): number;
}
```

Game implementations provide field mappings optimized for their data structure.

---

### TBA Score Breakdown

**Status:** ✅ Already handled by `mapFieldsForValidation()`

**Challenge:** TBA's `score_breakdown` structure varies significantly by year.

**2025 example:**

```json
{
  "red": {
    "autoCoralL1": 4,
    "autoCoralL2": 3,
    "teleopCoralL3": 8,
    "deepClimbCount": 2
  }
}
```

**2026 might be completely different:**

```json
{
  "red": {
    "autoNotesScored": 12,
    "speakerPoints": 45,
    "trapCount": 1
  }
}
```

**Solution:** Already solved! Games implement `mapFieldsForValidation()` which handles year-specific TBA field names. No additional interface needed.

---

**Remember:** These interfaces are the **contract** between framework and game. They should be stable, well-documented, and easy to implement. If creating a 2026 game feels hard, we've failed - it should be straightforward.

🤖 **Built for extensibility, designed for simplicity.**
