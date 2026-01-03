# TeamStatsPage UI/UX Refinement Walkthrough

I have refined the `TeamStatsPage` in `maneuver-core` to match the professional UI/UX of the 2025 `Maneuver` implementation.

## Key Improvements

### 1. Modern Selector Layout
Replaced native `<select>` elements with `GenericSelector` components. The layout now aligns labels and selectors in a clean, responsive row, matching the 2025 design perfectly.

### 2. Animate-UI Integration
Switched to the fancy `Tabs` component from `animate-ui/radix/tabs`, which includes smooth transitions and a more premium feel.

### 3. Polished Match Results
Match results are now rendered as high-density cards with:
- Color-coded alliance badges.
- Enhanced typography for point totals.
- Sub-point breakdowns (Auto, Teleop, Endgame) with subtle backgrounds.
- Improved comment display.
- Integrated configurable badges from the game implementation.

### 4. Professional Team Header
The team header card now displays:
- The primary team number.
- The comparison team number (if selected).
- Key metrics (matches played, avg points) as distinct badges for both primary and comparison teams.

## Centralized Scoring Architecture
Point values are now stored in `constants.ts` and used via `scoring.ts`.

## Comparison Functionality
The compare functionality has been fully maintained and integrated into the new UI:
- **Header**: Shows `vs Team X` and its summary stats.
- **Stats**: `StatCard` and `ProgressCard` continue to show +/- differences between teams.
- **Layout**: The "Compare to:" selector is prominently placed next to the team selector.

### 10. [NEW] Decoupled Transformation Logic
Following your feedback on `game-template` being for stubs, I've:
- Added `transformation` to `GameContext`.
- Refactored `EndgamePage` to use the transformation from context instead of a direct import.
- Moved the default transformation logic to `src/core/scoring/transformation.ts`.
- Converted `src/game-template/transformation.ts` into a clean stub.

This means you can now create a new game implementation without ever touching the `core` files, simply by updating the provider in `App.tsx`.

This also makes it trivial to update points if the game manual changes during the season.

## Verification
- Verified that all imports are correctly sourced from `core`.
- Performed a TypeScript build check (clean for this file).
- Ensured the component remains year-agnostic by using the `StrategyAnalysis` interface for all data and display configuration.

render_diffs(file:///d:/Scouting_App/maneuver-core/src/core/pages/TeamStatsPage.tsx)
