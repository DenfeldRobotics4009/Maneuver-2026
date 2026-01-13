# Scout Management Dashboard

## Overview

The Scout Management Dashboard provides administrators with a centralized view of all scouts, their statistics, achievements, and prediction accuracy. It enables team leaders to monitor scouter engagement and performance.

## Features

### 1. Scout Overview
- List of all registered scouts
- Total stakes for each scout
- Prediction accuracy percentages
- Current and longest streaks

### 2. Statistics Summary
- Total scouts count
- Total predictions made
- Combined stakes earned
- Average accuracy across all scouts

### 3. Individual Scout Details
- Full stats breakdown
- Achievement history
- Recent activity
- Prediction history by event

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ScoutManagementDashboardPage                        │
│  - Uses useScoutDashboard hook for state                            │
│  - Displays summary stats and scout list                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     useScoutDashboard Hook                          │
│  - Loads all scouts from gamification DB                            │
│  - Calculates aggregate statistics                                  │
│  - Provides refresh functionality                                   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Gamification Database                            │
│  - Scout profiles with stakes and predictions                       │
│  - Achievement unlock records                                       │
│  - Prediction history                                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

**Location:** `src/core/components/scout-management/`

| Component | Description |
|-----------|-------------|
| `ScoutStatsSummary` | Summary cards showing totals |
| `ScoutList` | Table/grid of all scouts |
| `ScoutCard` | Individual scout display card |
| `ScoutDetailsDialog` | Detailed stats modal |

## Data Types

```typescript
interface Scout {
    name: string;              // Scout identifier
    stakes: number;            // Points earned from predictions
    totalPredictions: number;  // Total predictions made
    correctPredictions: number; // Correct predictions
    currentStreak: number;     // Current winning streak
    longestStreak: number;     // Best streak achieved
}
```

## Key Hook: useScoutDashboard

**Location:** `src/core/hooks/useScoutDashboard.ts`

```typescript
const {
    scouts,           // Array of all scouts
    isLoading,        // Loading state
    error,            // Error state
    totalStakes,      // Sum of all stakes
    totalPredictions, // Sum of all predictions
    avgAccuracy,      // Average accuracy percentage
    refreshData       // Function to reload data
} = useScoutDashboard();
```

### useScoutManagement

**Location:** `src/core/hooks/useScoutManagement.ts`

Manages the list of scouts and current scout selection.

```typescript
const {
    currentScout,       // Current scout name
    currentScoutStakes, // Stakes of current scout
    scoutsList,         // Array of all scout names
    saveScout,          // Add/switch to a scout
    removeScout,        // Remove a scout
    loadScouts          // Reload scouts from storage
} = useScoutManagement();

// Add a new scout and switch to them
saveScout("Marcus Rodriguez");

// Remove a scout
removeScout("Old Scout");
```

### useCurrentScout

**Location:** `src/core/hooks/useCurrentScout.ts`

Gets the full Scout object for the currently selected scout.

```typescript
const {
    currentScout,  // Full Scout object (or null)
    isLoading,     // Loading state
    refreshScout   // Refresh scout data from DB
} = useCurrentScout();

// Access scout properties
if (currentScout) {
    console.log(currentScout.name, currentScout.stakes);
}
```

## Calculations

### Accuracy Calculation

```typescript
import { calculateAccuracy } from '@/core/lib/scoutGamificationUtils';

const accuracy = calculateAccuracy(scout);
// Returns percentage (0-100)
// Formula: (correctPredictions / totalPredictions) * 100
```

### Stakes Calculation

Total stakes includes:
1. **Prediction Stakes**: Earned from correct predictions
2. **Achievement Stakes**: Earned from unlocking achievements

```typescript
const totalStakes = scout.stakes + achievementStakes;
```

## Dashboard Statistics

The summary shows aggregate statistics:

```typescript
// Total scouts
const scoutCount = scouts.length;

// Total predictions across all scouts
const totalPredictions = scouts.reduce(
    (sum, s) => sum + s.totalPredictions, 0
);

// Total stakes across all scouts
const totalStakes = scouts.reduce(
    (sum, s) => sum + s.stakes, 0
);

// Average accuracy
const avgAccuracy = scouts.length > 0
    ? Math.round(scouts.reduce(
        (sum, s) => sum + calculateAccuracy(s), 0
      ) / scouts.length)
    : 0;
```

## Scout Card Display

Each scout card shows:

| Metric | Description |
|--------|-------------|
| Name | Scout identifier |
| Stakes | Total points earned |
| Accuracy | Prediction accuracy % |
| Predictions | Total/Correct count |
| Current Streak | Active winning streak |
| Best Streak | Longest streak achieved |

## Filtering and Sorting

The dashboard supports:
- **Search**: Filter by scout name
- **Sort by**: Stakes, accuracy, predictions, name
- **Order**: Ascending/descending

## Actions

| Action | Description |
|--------|-------------|
| View Details | Open detailed stats modal |
| Refresh | Reload all scout data |
| Export | Export scout data as JSON |

---

**Last Updated:** January 2026
**Related Docs:**
- `docs/ACHIEVEMENTS.md` - Achievement system details
- `docs/DATABASE.md` - Gamification database schema
- `src/game-template/gamification/` - Gamification system
