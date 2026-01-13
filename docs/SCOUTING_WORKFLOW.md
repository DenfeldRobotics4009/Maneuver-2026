# Scouting Workflow

## Overview

The match scouting workflow guides scouts through a structured 5-step process for collecting robot performance data during FRC matches. Each step builds upon the previous, carrying data forward until final submission.

## Workflow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Game Start  │ ──▶ │  2. Auto Start  │ ──▶ │  3. Auto Score  │
│  Match setup    │     │  Starting pos   │     │  Auto actions   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌─────────────────┐     ┌───────▼─────────┐
                        │   5. Endgame    │ ◀── │ 4. Teleop Score │
                        │  Submit + save  │     │ Teleop actions  │
                        └─────────────────┘     └─────────────────┘
```

## Workflow Configuration

Teams can customize which pages are included in the workflow by editing `src/game-template/game-schema.ts`:

```typescript
export const workflowConfig: WorkflowConfig = {
  pages: {
    autoStart: true,      // Set false to skip starting position
    autoScoring: true,    // Auto period scoring
    teleopScoring: true,  // Teleop period scoring
    endgame: true,        // Set false to skip endgame (teleop becomes submit)
  },
};
```

**Example flows:**
| Configuration | Flow |
|--------------|------|
| All enabled (default) | Game Start → Auto Start → Auto → Teleop → Endgame (submit) |
| `autoStart: false` | Game Start → Auto → Teleop → Endgame (submit) |
| `endgame: false` | Game Start → Auto Start → Auto → Teleop (submit) |
| `autoStart: false, endgame: false` | Game Start → Auto → Teleop (submit) |
| `autoStart: true` only | Game Start → Auto Start (submit) |
| `autoScoring: true` only | Game Start → Auto (submit) |
| `teleopScoring: true` only | Game Start → Teleop (submit) |

> [!NOTE]
> At least one page must be enabled. Any page can be the "submit" page—the last enabled page automatically shows "Submit Match Data" with green styling.

The navigation automatically adjusts, and whichever page is last in the enabled flow handles submission.

## Pages

### 1. Game Start Page

**File:** `src/core/pages/GameStartPage.tsx`

**Purpose:** Collect match context before scouting begins.

**Fields:**
| Field | Description | Source |
|-------|-------------|--------|
| Event Key | TBA event identifier (e.g., `2025mrcmp`) | EventNameSelector component |
| Match Number | Match number with type (Qual/Semi/Final) | Manual input |
| Alliance | Red or Blue | Button selection |
| Team Number | Team being scouted | Auto-filled from TBA or manual |
| Alliance Prediction | Optional gamification feature | Button selection |

**Features:**
- Scout name displayed from sidebar selection
- Re-scout mode support (pre-fills fields for corrections)
- Auto-increment match number after each submission
- Team selection auto-populates from TBA match schedule

**Data Passed Forward:**
```typescript
{
  inputs: {
    eventKey: string,
    matchNumber: string,
    matchType: "qm" | "sf" | "f",
    alliance: "red" | "blue",
    selectTeam: string,
    scoutName: string
  }
}
```

---

### 2. Auto Start Page

**File:** `src/core/pages/AutoStartPage.tsx`

**Purpose:** Select starting position for autonomous period.

**Game-Specific Component:** `AutoStartFieldSelector` from `@/game-template/components`

**Features:**
- Interactive field map with clickable zones
- Alliance-specific field orientation (red/blue views)
- Single selection (one position at a time)
- Match details displayed in sidebar

**Data Passed Forward:**
```typescript
{
  inputs: { ...previousInputs },
  startPosition: [boolean, boolean, boolean, boolean, boolean, boolean]
}
```

**Customization:**
1. Edit `src/game-template/analysis.ts` → `getStartPositionConfig()`
2. Add field images to `src/game-template/assets/`
3. Define clickable zones with x, y, width, height coordinates

---

### 3. Auto Scoring Page

**File:** `src/core/pages/AutoScoringPage.tsx`

**Purpose:** Record scoring actions during autonomous period.

**Game-Specific Components:**
- `ScoringSections` – Scoring buttons for game pieces
- `StatusToggles` – Phase-specific toggles (e.g., left starting zone)

**Features:**
- Action array with timestamps (not counters)
- Recent actions list with undo support
- Robot status toggles
- State persisted to localStorage for crash recovery

**Data Flow:**
```typescript
// Actions stored as array
scoringActions: [
  { actionType: "score", pieceType: "coral", level: "L4", timestamp: 1234567890 },
  { actionType: "pickup", location: "ground", timestamp: 1234567891 },
  // ...
]
```

**Data Passed Forward:**
```typescript
{
  inputs: { ...previousInputs },
  autoStateStack: Action[],
  autoRobotStatus: Record<string, boolean>
}
```

---

### 4. Teleop Scoring Page

**File:** `src/core/pages/TeleopScoringPage.tsx`

**Purpose:** Record scoring actions during teleoperated period.

Uses the same `ScoringSections` and `StatusToggles` components with `phase="teleop"`.

**Features:**
- Identical structure to Auto Scoring
- Separate localStorage keys (`teleopStateStack`, `teleopRobotStatus`)
- Undo functionality for both actions and status changes

**Data Passed Forward:**
```typescript
{
  inputs: { ...previousInputs },
  autoStateStack: Action[],
  autoRobotStatus: Record<string, boolean>,
  teleopStateStack: Action[],
  teleopRobotStatus: Record<string, boolean>
}
```

---

### 5. Endgame Page

**File:** `src/core/pages/EndgamePage.tsx`

**Purpose:** Record endgame status, add comments, and submit match data.

**Game-Specific Component:** `StatusToggles` with `phase="endgame"`

**Features:**
- Endgame status selection (climb type, success/failure)
- Match summary showing all collected data
- Comments text area for additional observations
- Final submission to database

**Data Transformation:**
Before saving, the page transforms action arrays into counter fields using `transformation.transformActionsToCounters()`:

```typescript
// Input: Action arrays
{ autoActions: [...], teleopActions: [...], robotStatus: {...} }

// Output: Counter fields (stored in database)
{
  autoCoralPlaceL4Count: 2,
  teleopAlgaeNetCount: 5,
  endgameClimbType: "deep",
  leftStartingZone: true,
  // ...
}
```

**Database Entry Structure:**
```typescript
{
  id: "2025mrcmp::qm24::3314::red",
  scoutName: "Alice",
  teamNumber: 3314,
  matchNumber: 24,
  eventKey: "2025mrcmp",
  matchKey: "qm24",
  allianceColor: "red",
  timestamp: 1704153600000,
  gameData: { /* transformed counter fields */ },
  comments: "Fast intake, good at L4"
}
```

---

## State Management

### Navigation State
Data flows through React Router's `location.state` between pages. Each page receives previous data and adds its own before navigating forward.

### localStorage Persistence
Critical data is also saved to localStorage for crash recovery:

| Key | Purpose |
|-----|---------|
| `currentMatchNumber` | Auto-increment after submission |
| `eventKey` | Current event context |
| `autoStateStack` | Auto period actions |
| `teleopStateStack` | Teleop period actions |
| `autoRobotStatus` | Auto status toggles |
| `teleopRobotStatus` | Teleop status toggles |
| `endgameRobotStatus` | Endgame status toggles |

### Cleanup
After successful submission, `clearScoutingLocalStorage()` removes all temporary state:
- All `*StateStack` keys
- All `*RobotStatus` keys
- Undo history keys

---

## Customization Guide

### 1. Scoring Sections
Customize `src/game-template/components/scoring/ScoringSections.tsx`:

```typescript
export function ScoringSections({ phase, onAddAction, actions }) {
  const handleScore = (level: string) => {
    onAddAction({
      actionType: "score",
      pieceType: "coral",
      level,
    });
  };

  return (
    <Card>
      <CardContent>
        {/* Your scoring buttons here */}
        <Button onClick={() => handleScore("L4")}>Score L4</Button>
      </CardContent>
    </Card>
  );
}
```

### 2. Status Toggles
Customize `src/game-template/components/scoring/StatusToggles.tsx`:

```typescript
export function StatusToggles({ phase, status, onStatusUpdate }) {
  if (phase === "auto") {
    return (
      <ToggleGroup>
        <Toggle
          pressed={status.leftZone}
          onPressedChange={(v) => onStatusUpdate({ leftZone: v })}
        >
          Left Starting Zone
        </Toggle>
      </ToggleGroup>
    );
  }

  if (phase === "endgame") {
    return (/* Endgame toggles */);
  }

  return null;
}
```

### 3. Data Transformation
Customize `src/game-template/transformation.ts`:

```typescript
export function transformActionsToCounters(data) {
  const { autoActions, teleopActions, endgameRobotStatus } = data;

  return {
    // Count actions by type
    autoCoralL4Count: countActions(autoActions, "score", "L4"),
    teleopAlgaeNetCount: countActions(teleopActions, "score", "net"),

    // Map robot status
    leftStartingZone: data.autoRobotStatus?.leftZone ?? false,
    endgameClimbType: endgameRobotStatus?.climbType ?? "none",
  };
}
```

---

## Re-Scout Mode

Scouts can re-scout a match from the Match Validation page:

1. Navigate to Match Validation
2. Select a match with data issues
3. Click "Re-scout" on a specific team
4. Game Start page loads with pre-filled fields (disabled)
5. Complete workflow as normal
6. New entry replaces existing (same composite ID)

Re-scout state structure:
```typescript
{
  rescout: {
    isRescout: true,
    matchNumber: "24",
    teamNumber: "3314",
    alliance: "red",
    eventKey: "2025mrcmp",
    teams: ["3314"],  // For batch mode
    currentTeamIndex: 0
  }
}
```

---

## Related Documentation

- [Game Components](../src/game-template/components/README.md) – Component customization
- [Data Transformation](./DATA_TRANSFORMATION.md) – Action-to-counter transformation
- [Database](./DATABASE.md) – Entry storage and retrieval
- [Framework Design](./FRAMEWORK_DESIGN.md) – Interface specifications
