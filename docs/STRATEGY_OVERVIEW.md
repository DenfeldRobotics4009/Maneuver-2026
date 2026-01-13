# Strategy Overview Feature

## Overview

The **Strategy Overview** page is a data analytics dashboard for FRC scouting that allows coaches and strategy leads to analyze team performance data across multiple metrics. It combines a powerful filterable data table with interactive charts to answer questions like:

- "Which teams score the most auto points?"
- "Is there a correlation between teleop scoring and total points?"
- "What's the distribution of endgame climb success rates across all teams?"

**Key Features:**
- Sortable, filterable team statistics table
- Multiple chart types (bar, scatter, box plot, stacked bar)
- Column visibility presets (essential, auto-focused, teleop-focused, etc.)
- Numeric filtering (>, <, =, between)
- Year-agnostic design - adapts to any FRC game through configuration

## Architecture

### Year-Agnostic Design Pattern

The Strategy Overview feature is **completely year-agnostic**. The same core code works for any FRC season (2024 Crescendo, 2025 Reefscape, future games) without modifications.

```
game-template/
└── strategy-config.ts    ← YEAR-SPECIFIC: Edit this for new seasons

core/
├── pages/
│   └── StrategyOverviewPage.tsx      ← YEAR-AGNOSTIC: Never changes
├── hooks/
│   ├── useTeamStatistics.ts          ← YEAR-AGNOSTIC: Generic aggregation
│   └── useChartData.ts               ← YEAR-AGNOSTIC: Generic chart transformation
└── components/Strategy/
    ├── StrategyChart.tsx             ← YEAR-AGNOSTIC: Renders any chart type
    ├── TeamStatsTableEnhanced.tsx    ← YEAR-AGNOSTIC: Renders any columns
    ├── ColumnSettingsSheet.tsx       ← YEAR-AGNOSTIC: Generic column toggles
    ├── ColumnFilterPopover.tsx       ← YEAR-AGNOSTIC: Generic numeric filters
    └── columns.tsx                   ← YEAR-AGNOSTIC: Dynamic column generator
```

**When a new FRC game is released**, you only edit `src/game-template/strategy-config.ts`. The entire UI automatically adapts to display the new game's metrics.

## Core Components

### 1. Configuration (`strategy-config.ts`)

The single source of truth for game-specific data structure.

#### Columns
Defines what data to display in the table:

```typescript
{
  key: "auto.coralL4Count",      // Path to data in TeamData object
  label: "Auto L4 Coral",        // Display name in table header
  category: "Auto",              // Grouping in settings sheet
  visible: true,                 // Show by default?
  numeric: true,                 // Enable filtering/sorting?
  percentage: false              // Display as percentage?
}
```

**Column Types:**
- **Numeric**: Regular counts/points (e.g., `auto.coralL4Count`)
- **Percentage**: Boolean fields shown as % (e.g., `endgame.climbSuccess`)
- **String**: Text data (e.g., `teamNumber`, `eventName`)

#### Presets
Named collections of columns for quick switching:

```typescript
presets: {
  essential: ["teamNumber", "matchCount", "totalPoints", "auto.coralL4Count"],
  auto: ["teamNumber", "matchCount", "autoPoints", "auto.coralL4Count", "auto.coralL3Count"],
  endgame: ["teamNumber", "matchCount", "endgamePoints", "endgame.climbSuccess"]
}
```

#### Aggregates
Custom calculation functions for derived metrics:

```typescript
aggregates: {
  totalPoints: (match) => scoringCalculations.calculateTotalPoints({ gameData: match }),
  avgCycleTime: (match) => {
    const cycles = match.teleopCoralCount || 0;
    const time = match.teleopDuration || 1;
    return cycles / time;
  }
}
```

### 2. Data Processing (`useTeamStatistics` Hook)

**Purpose**: Fetch all match data and aggregate it by team.

**Process:**
1. Fetches all matches from IndexedDB
2. Filters by event (if selected)
3. Groups matches by team number
4. For each team, calculates:
   - **Averages** for numeric fields
   - **Percentages** for boolean fields
   - **Custom aggregates** from config
5. Returns array of `TeamData` objects

**Usage:**
```typescript
const { teamStats, filteredTeamStats } = useTeamStatistics(strategyConfig, selectedEvent);
```

**Output Example:**
```typescript
[
  {
    teamNumber: "3314",
    eventName: "District Event",
    matchCount: 12,
    totalPoints: 87.3,        // Average across 12 matches
    autoPoints: 24.5,
    auto.coralL4Count: 3.8,
    endgame.climbSuccess: 0.83 // 83% climb success rate
  },
  // ... more teams
]
```

### 3. Chart Data Transformation (`useChartData` Hook)

**Purpose**: Transform team statistics into chart-specific formats.

**Chart Type Formats:**

**Bar Chart:**
```typescript
{ team: "3314", value: 42.5, eventName: "District" }
```

**Scatter Plot:**
```typescript
{ team: "3314", x: 25.3, y: 67.8, eventName: "District" }
```

**Box Plot:**
```typescript
{ team: "3314", values: [20, 22, 25, 23, 24], eventName: "District" }
```

**Stacked Bar:**
```typescript
{ team: "3314", autoPoints: 24, teleopPoints: 45, endgamePoints: 18 }
```

**Usage:**
```typescript
const chartData = useChartData(
  filteredTeamStats,
  chartType,
  chartMetric,
  scatterXMetric,
  scatterYMetric,
  allMatches
);
```

### 4. Visualization (`StrategyChart.tsx`)

**Purpose**: Render interactive charts using Recharts.

**Features:**
- 4 chart types: Bar, Scatter, Box Plot, Stacked Bar
- Dynamic metric selection
- Custom tooltips with team info
- Responsive to container size

**Props:**
```typescript
interface StrategyChartProps {
  chartType: "bar" | "scatter" | "box" | "stacked";
  chartMetric: string;              // For bar/box charts
  scatterXMetric: string;           // For scatter plots
  scatterYMetric: string;
  chartData: ChartData[];
  columnConfig: StrategyColumnConfig[];
  chartConfig: ChartConfig;         // Labels and colors
  onChartTypeChange: (type) => void;
  onChartMetricChange: (metric) => void;
  onScatterXMetricChange: (metric) => void;
  onScatterYMetricChange: (metric) => void;
}
```

**Technical Note - ResponsiveContainer Issue:**

Recharts' `ResponsiveContainer` doesn't work correctly with React's `Suspense` (see [issue #2736](https://github.com/recharts/recharts/issues/2736)). We solved this with a custom hook:

```typescript
function useContainerDimensions() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, width, height };
}
```

Then we pass explicit dimensions to Recharts components:
```typescript
<BarChart width={width} height={height} data={chartData}>
```

### 5. Data Table (`TeamStatsTableEnhanced.tsx`)

**Purpose**: Display team statistics in a sortable, filterable table.

**Features:**
- **Sorting**: Click column headers to sort ascending/descending
- **Filtering**: 
  - Text search by team number
  - Numeric filters (>, <, =, between) via popover
- **Column Visibility**: Toggle individual columns or apply presets
- **Responsive**: Adapts to mobile/tablet/desktop

**Built with TanStack Table v8**

**Key Implementation Detail - Nested Data Access:**

TanStack Table's `accessorKey` doesn't support dotted paths like `"auto.coralL4Count"`. We use `accessorFn` instead:

```typescript
// ❌ This doesn't work:
{ accessorKey: "auto.coralL4Count" }

// ✅ This works:
{
  accessorFn: (row) => {
    const parts = "auto.coralL4Count".split('.');
    return parts.reduce((obj, key) => obj?.[key], row);
  }
}
```

### 6. Column Management Components

**ColumnSettingsSheet.tsx:**
- Sheet (sidebar) UI for toggling column visibility
- Grouped by category (Auto, Teleop, Endgame, etc.)
- Preset buttons for quick layouts

**ColumnFilterPopover.tsx:**
- Popover UI attached to column headers
- Numeric filter operators: `>`, `<`, `=`, `between`
- Shows active filter badge
- Clear filter button

## Data Flow

```
┌─────────────────┐
│  IndexedDB      │
│  (matches)      │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  useTeamStatistics Hook     │
│  - Groups by team           │
│  - Aggregates using config  │
│  - Applies filters          │
└────────┬────────────────────┘
         │
         ↓
  TeamData[] array
         │
    ┌────┴─────────────────┐
    ↓                      ↓
┌───────────────┐   ┌──────────────────┐
│ TeamStatsTable│   │ useChartData Hook│
│ (renders)     │   │ (transforms)     │
└───────────────┘   └────────┬─────────┘
                             ↓
                    ┌─────────────────┐
                    │ StrategyChart   │
                    │ (visualizes)    │
                    └─────────────────┘
```

## State Management

The `StrategyOverviewPage` manages all state:

```typescript
// Event selection
const [selectedEvent, setSelectedEvent] = useState<string | undefined>();

// Chart configuration
const [chartType, setChartType] = useState<ChartType>("bar");
const [chartMetric, setChartMetric] = useState("totalPoints");
const [scatterXMetric, setScatterXMetric] = useState("autoPoints");
const [scatterYMetric, setScatterYMetric] = useState("teleopPoints");

// Column configuration
const [columnConfig, setColumnConfig] = useState(strategyConfig.columns);
const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilter>>({});

// UI state
const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
```

All state is passed down as props (no global state management needed - it's a single page feature).

## Type Definitions

**Key Types** (from `src/core/types/strategy.ts`):

```typescript
interface StrategyColumnConfig {
  key: string;          // Data path
  label: string;        // Display name
  category: string;     // Grouping
  visible: boolean;     // Default visibility
  numeric: boolean;     // Is numeric data
  percentage?: boolean; // Display as percentage
}

interface StrategyConfig {
  columns: StrategyColumnConfig[];
  presets: Record<string, string[]>;
  aggregates: Record<string, (match: any) => number>;
}

interface TeamData {
  teamNumber: string;
  eventName: string;
  matchCount: number;
  [key: string]: any;  // Dynamic data from config
}

interface ColumnFilter {
  operator: FilterOperator;  // '>' | '<' | '=' | 'between'
  value: number;
  value2?: number;            // For 'between'
}
```

## How to Customize for a New Season

### 1. Update `strategy-config.ts`

**Add game-specific columns:**
```typescript
// Example: 2025 Reefscape
{ key: "auto.coralL4Count", label: "Auto L4", category: "Auto Coral", visible: true, numeric: true },
{ key: "teleop.algaeCount", label: "Teleop Algae", category: "Teleop", visible: true, numeric: true },
{ key: "endgame.climbSuccess", label: "Climb Success", category: "Endgame", visible: true, numeric: false, percentage: true },
```

**Update presets:**
```typescript
presets: {
  essential: ["teamNumber", "matchCount", "totalPoints", "auto.coralL4Count", "endgame.climbSuccess"],
  coral: ["teamNumber", "auto.coralL4Count", "auto.coralL3Count", "teleop.coralL4Count", "teleop.coralL3Count"],
}
```

**Add custom aggregates:**
```typescript
aggregates: {
  totalPieces: (match) => {
    return (match.auto?.coralL4Count || 0) +
           (match.teleop?.coralL4Count || 0) +
           (match.teleop?.algaeCount || 0);
  }
}
```

### 2. That's It!

The entire UI automatically updates to display your new columns, presets, and aggregates. No changes needed in `core/`.

## Common Gotchas & Solutions

### 1. TanStack Table with Dotted Keys
**Problem**: `accessorKey: "auto.coralCount"` doesn't work  
**Solution**: Use `accessorFn` with manual path traversal (already implemented in `columns.tsx`)

### 2. ResponsiveContainer with Suspense
**Problem**: Recharts shows "width(0) and height(0)" warning  
**Solution**: Use custom `useContainerDimensions` hook (already implemented in `StrategyChart.tsx`)

### 3. Type Safety with Dynamic Config
**Problem**: TypeScript can't validate dynamic column keys  
**Solution**: Use runtime checks:
```typescript
const value = row[columnKey];
if (typeof value !== 'number') return 'N/A';
return value.toFixed(1);
```

### 4. IndexedDB Async Operations
**Problem**: Can't access DB directly in render  
**Solution**: Always use hooks like `useAllMatches()`, `useTeamStatistics()`

## Extending the Feature

### Adding a New Chart Type

1. **Add to chart type options:**
```typescript
// StrategyChart.tsx
const chartTypes = ["bar", "scatter", "box", "stacked", "newType"];
```

2. **Add rendering logic:**
```typescript
// StrategyChart.tsx
{chartType === "newType" ? (
  <NewChart data={chartData} width={width} height={height} />
) : // ... other types
}
```

3. **Add data transformation** (if needed):
```typescript
// useChartData.ts
if (chartType === "newType") {
  return transformForNewChart(teamStats);
}
```

### Adding a New Column

1. **Add to `strategy-config.ts`:**
```typescript
{ key: "custom.metric", label: "Custom Metric", category: "Custom", visible: true, numeric: true }
```

2. **(Optional) Add custom aggregate:**
```typescript
aggregates: {
  customMetric: (match) => calculateCustomValue(match)
}
```

That's it! The column appears in the table, can be filtered/sorted, and is available in charts.

### Adding a New Preset

1. **Add to `strategy-config.ts`:**
```typescript
presets: {
  myPreset: ["teamNumber", "totalPoints", "custom.metric"]
}
```

2. **Add button to `ColumnSettingsSheet.tsx`:**
```typescript
<Button onClick={() => onApplyPreset("myPreset")}>
  My Preset
</Button>
```

## Performance Considerations

- **Data Aggregation**: Runs once per event change, not on every render
- **Memoization**: Chart data transformation is memoized with `useMemo`
- **Virtual Scrolling**: Not currently implemented - may be needed for 100+ teams
- **IndexedDB Queries**: Matches are fetched once and cached by React Query

## Testing

**Manual Testing Checklist:**
- [ ] Table sorts correctly on all numeric columns
- [ ] Numeric filters work (>, <, =, between)
- [ ] Column visibility toggles work
- [ ] Presets apply correct column sets
- [ ] All 4 chart types render with data
- [ ] Chart updates when changing metrics
- [ ] Event filter affects both table and charts
- [ ] Responsive layout works on mobile

**Edge Cases to Test:**
- [ ] No data (0 matches)
- [ ] Single team
- [ ] 100+ teams
- [ ] All filters active simultaneously
- [ ] Rapid chart type switching

## Future Improvements

- **Export to CSV**: Download filtered table data
- **Chart Export**: Save charts as PNG
- **Comparison Mode**: Select 2-3 teams to compare side-by-side
- **Historical Trends**: Multi-event line charts
- **Virtual Scrolling**: For large team lists
- **Column Resizing**: Drag column borders to resize
- **Advanced Filters**: AND/OR logic, multiple filters per column

---

**Questions?** Contact the Maneuver development team or open an issue on GitHub.
