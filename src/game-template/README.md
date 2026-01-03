# Game Template

This directory contains all **Game-Specific Implementation** code. When setting up for a new FRC season, this is the directory where almost all customization will happen. The `core` directory is the framework and should ideally remain untouched.

## Directory Structure

```
game-template/
├── components/          # UI Components customized for the game (e.g., specific selectors, charts)
├── analysis.ts          # Logic for defining stats, rates, and badges
├── constants.ts         # Scoring constants (point values)
├── scoring.ts           # Scoring calculation logic (functions to compute points)
├── transformation.ts    # Logic to transform raw match data into db-ready counters
```

## Key Files to Customize

### 1. Scoring Logic (`constants.ts` & `scoring.ts`)
Define the point values for Auto, Teleop, and Endgame in `constants.ts`. Implement the calculation functions in `scoring.ts` to determine the total points for a match entry.

### 2. Data Transformation (`transformation.ts`)
Maneuver uses a generic `ScoutingEntry`. This file defines how to take the raw array of actions (e.g., "Scored coral") recorded in the UI and turn them into counts in the database (e.g., `auto.coralCount = 5`).

### 3. Analysis & Display (`analysis.ts`)
Defines "Stat Cards" and "Rate Cards" for the Team Stats page. You define the *metadata* here (titles, labels, colors), and the UI will render them.

### 4. Components (`components/`)
Contains the React components that need to change year-over-year, such as:
*   **Field Selector**: For choosing auto start positions.
*   **Pit Questions**: For the specific pit scouting form.
*   **Scoring UI**: The buttons scout press during a match.
*   **Team Stats Tabs**: The graphs and charts shown on the analysis page.

See [components/README.md](./components/README.md) for details on customizing components.
