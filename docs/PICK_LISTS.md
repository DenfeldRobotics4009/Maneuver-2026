# Pick Lists System

## Overview

The Pick Lists system allows teams to create, manage, and organize their alliance selection pick lists during competitions. It integrates with the team statistics data to help teams make informed decisions.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PickListPage                                │
│  - Mobile layout (tabs) and Desktop layout (side-by-side)          │
│  - Uses usePickList hook for all state management                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         usePickList Hook                            │
│  - State: pickLists, alliances, backups, availableTeams            │
│  - Actions: createList, addTeam, deleteList, export/import          │
│  - Uses useAllTeamStats for centralized statistics                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                              ▼
┌─────────────────────────────┐   ┌─────────────────────────────────┐
│    pick-list-config.ts      │   │       useAllTeamStats           │
│  (Game-Specific)            │   │  (Team statistics from DB)      │
│  - Sort options             │   └─────────────────────────────────┘
│  - getSortValue()           │
│  - TeamCardStats component  │
│  - TeamStatsDialog component│
└─────────────────────────────┘
```

## Core Types

**Location:** `src/core/types/pickListTypes.ts`

```typescript
interface PickListItem {
    id: number;
    text: string;           // Display text (e.g., "Team 1234")
    teamNumber: number;     // Team number for lookups
    checked: boolean;       // Whether team has been picked
}

interface PickList {
    id: number;
    name: string;           // e.g., "Primary Pick List"
    description: string;
    teams: PickListItem[];  // Ordered list of teams
}

interface BackupTeam {
    teamNumber: number;
    rank: number;           // Order in backup pool
}
```

## Game-Specific Configuration

**Location:** `src/game-template/pick-list-config.ts`

This file configures year-specific behavior for pick lists:

### Sort Options

Sort options are derived from `strategy-config.ts` columns for consistency:

```typescript
export const sortOptions = [
    { value: "teamNumber", label: "Team Number" },
    // Auto-derived from strategy columns
    ...strategyConfig.columns
        .filter(col => col.numeric && col.key !== "matchCount")
        .map(col => ({ value: col.key, label: col.label })),
    { value: "matchCount", label: "Matches Played" },
];
```

### getSortValue Function

Handles nested paths like `auto.coralL4Count` or `endgame.climbRate`:

```typescript
export function getSortValue(team: TeamStats, sortOption: string): number {
    // Handle nested paths
    const parts = sortOption.split(".");
    let value: unknown = team;
    for (const part of parts) {
        value = value?.[part];
    }
    return typeof value === "number" ? value : 0;
}
```

### Year-Specific Components

The pick list config also exports game-specific components for displaying team data:

```typescript
// Team stats displayed on cards
export { TeamCardStats } from './components/pick-list/TeamCardStats';

// Full team stats dialog
export { TeamStatsDialog } from './components/pick-list/TeamStatsDialog';
```

## Core Components

**Location:** `src/core/components/PickListComponents/`

| Component | Description |
|-----------|-------------|
| `PickListHeader` | Export/Import buttons and alliance selection toggle |
| `AvailableTeamsPanel` | Searchable, sortable list of all teams |
| `TeamCard` | Individual team card with stats |
| `PickListCard` | A single pick list with drag-to-reorder |
| `CreatePickList` | Form to create new pick lists |
| `AllianceSelectionTable` | Grid showing alliance picks |
| `AllianceTable` | Alliance slot management |
| `BackupTeamsSection` | Backup pool management |
| `MobilePickListLayout` | Tab-based layout for mobile |
| `DesktopPickListLayout` | Side-by-side layout for desktop |

## Hook: usePickList

**Location:** `src/core/hooks/usePickList.ts`

Central hook for all pick list functionality.

### Returned State

```typescript
interface UsePickListResult {
    // Data
    pickLists: PickList[];
    alliances: Alliance[];
    backups: BackupTeam[];
    availableTeams: TeamStats[];
    filteredAndSortedTeams: TeamStats[];
    
    // UI State
    newListName: string;
    newListDescription: string;
    searchFilter: string;
    sortBy: PickListSortOption;
    activeTab: string;
    showAllianceSelection: boolean;
    
    // Actions
    createNewList: () => void;
    deleteList: (id: number) => void;
    addTeamToList: (listId: number, teamNumber: number) => void;
    updateListTeams: (listId: number, teams: PickListItem[]) => void;
    addTeamToAlliance: (teamNumber: number, allianceId: number) => void;
    assignToAllianceAndRemove: (teamNumber: number, allianceIndex: number) => void;
    exportPickLists: () => void;
    importPickLists: (file: File) => void;
    
    // Setters for UI state
    setNewListName, setNewListDescription, setSearchFilter,
    setSortBy, setActiveTab, setAlliances, setBackups,
    handleToggleAllianceSelection: () => void;
}
```

## Features

### 1. Multiple Pick Lists
- Create named lists (e.g., "Primary", "Backup Options", "Defense Bots")
- Drag-to-reorder teams within a list
- Mark teams as "picked" when selected

### 2. Available Teams Panel
- Shows all scouted teams with statistics
- Search by team number
- Sort by any numeric stat (from strategy config)
- Quick-add to any pick list

### 3. Alliance Selection Mode
- Toggle to enable alliance selection view
- 8 alliances × 3 positions grid
- Backup team pool
- Move teams from pick lists to alliances

### 4. Import/Export
- Export pick lists as JSON
- Import shared pick lists from other scouts
- Preserves list names and team order

## Customization Guide

### Adding New Sort Options

Edit `src/game-template/strategy-config.ts` to add columns - they'll automatically appear in sort options:

```typescript
// strategy-config.ts
export const strategyConfig = {
    columns: [
        { key: "auto.coralL4Count", label: "Auto Coral L4", numeric: true },
        // New columns automatically become sort options
    ],
};
```

### Customizing Team Cards

Edit `src/game-template/components/pick-list/TeamCardStats.tsx`:

```typescript
export function TeamCardStats({ teamStats }: { teamStats: TeamStats }) {
    return (
        <div className="text-xs text-muted-foreground">
            {/* Display your game-specific stats */}
            <span>Auto: {teamStats.auto?.coralL4Count ?? 0}</span>
            <span>Climb: {teamStats.endgame?.climbRate ?? 0}%</span>
        </div>
    );
}
```

### Customizing Team Stats Dialog

Edit `src/game-template/components/pick-list/TeamStatsDialog.tsx` to show detailed stats when users click on a team card.

## Database Integration

Pick lists are stored in `localStorage` (not IndexedDB) for simplicity:
- Quick access during alliance selection
- Persists across page refreshes
- Export/Import for backup and sharing

Team statistics come from `useAllTeamStats` hook which queries IndexedDB.

## Best Practices

1. **Keep sort options relevant** - Only include stats useful for pick decisions
2. **Update components each year** - TeamCardStats should show key year-specific metrics
3. **Test mobile layout** - Alliance selection is critical and must work on tablets

---

**Last Updated:** January 2026
**Related Docs:** 
- `docs/STRATEGY_OVERVIEW.md` - Strategy page configuration
- `src/game-template/strategy-config.ts` - Column definitions used by sort options
