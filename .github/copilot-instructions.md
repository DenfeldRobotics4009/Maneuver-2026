# GitHub Copilot Instructions - Maneuver Core

## Repository Purpose

This is **maneuver-core** - a year-agnostic FRC scouting framework. It contains:
- ✅ Core infrastructure (database, PWA, data transfer, UI components)
- ✅ Game interface definitions (TypeScript interfaces)
- ❌ NO game-specific logic (that goes in maneuver-YYYY repos)

**This is a template repository.** Teams fork this to create their yearly scouting apps.

## Architecture Reference

Always reference `docs/FRAMEWORK_DESIGN.md` when:
- Designing interfaces
- Making architectural decisions
- Suggesting implementations
- Evaluating trade-offs
- Planning features

## Critical Rules

### 1. **Framework Code Must Be Game-Agnostic**

❌ **NEVER do this:**
```typescript
// BAD: Framework knows about coral, algae, specific games
function calculateScore(entry: any) {
  return entry.autoCoralCount * 3 + entry.algaeCount * 4;
}
```

✅ **DO this instead:**
```typescript
// GOOD: Framework uses injected game logic
function calculateScore(entry: GameScoutingEntry, scoring: ScoringCalculations) {
  return scoring.calculateTotalPoints(entry);
}
```

### 2. **All Game Logic Goes Through Interfaces**

The 6 core interfaces are the **contract**:
1. `GameConfig` - Metadata & scoring constants
2. `ScoutingEntry` - Data structure
3. `ScoringCalculations` - Point calculations
4. `ValidationRules` - Match validation
5. `StrategyAnalysis` - Statistics
6. `UIComponents` - Game-specific screens

Game implementations provide these; framework consumes them via React context.

### 3. **Database Schema Must Be Generic**

Database tables use `ScoutingEntryBase` (not game-specific types):

✅ **GOOD:**
```typescript
scoutingEntries!: Dexie.Table<ScoutingEntryBase, string>;
```

❌ **BAD:**
```typescript
scoutingEntries!: Dexie.Table<ScoutingEntry2025, string>;
```

## Decision Framework

Before implementing any feature, ask:

1. **Is this year-agnostic or game-specific?**
   - Year-agnostic → Goes in `src/core/`
   - Game-specific → Goes in game implementation (not this repo)

2. **Does this impact bundle size?**
   - YES → Must be optional or lazy-loaded
   - NO → Can be in core

3. **Is this used by all teams?**
   - YES → Should be in core
   - NO → Should be customizable via interfaces

4. **Does this affect offline-first?**
   - YES → Requires careful review
   - NO → Lower priority concern

5. **Can other teams customize this?**
   - YES → Make it configurable via props/context
   - NO → Can be hardcoded in core

## Repository Structure

```
maneuver-core/
├── src/
│   ├── core/                    # Framework (modify these)
│   │   ├── db/                  # Database layer
│   │   ├── pwa/                 # PWA infrastructure
│   │   ├── transfer/            # QR, WebRTC
│   │   ├── components/          # UI components
│   │   ├── hooks/               # React hooks
│   │   ├── lib/                 # Utilities
│   │   └── types/               # Interface definitions
│   │
│   └── game-template/           # Stubs (don't modify - for users to copy)
│       ├── config.ts            # GameConfig stub
│       ├── types.ts             # ScoutingEntry stub
│       ├── scoring.ts           # ScoringCalculations stub
│       ├── validation.ts        # ValidationRules stub
│       ├── analysis.ts          # StrategyAnalysis stub
│       └── components/          # UI component stubs
│
├── docs/                        # Documentation
│   ├── FRAMEWORK_DESIGN.md      # Interface specifications
│   ├── ARCHITECTURE_STRATEGY.md # Multi-year vision
│   └── INTEGRATION_GUIDE.md     # How to implement a game
│
└── .github/
    └── copilot-instructions.md  # This file
```

## What Goes in Core vs Game Implementation

### Core Framework (this repo)

✅ Database layer (Dexie, IndexedDB)
✅ PWA infrastructure (service workers, install prompts, caching)
✅ Data transfer (QR codes, WebRTC peer sync)
✅ UI component library (shadcn/ui, base components)
✅ Routing & navigation (React Router setup)
✅ TBA API integration (fetching match schedules, not validation)
✅ Conflict resolution (data merge logic)
✅ Scout management (scout profiles, gamification)
✅ Generic utilities (date formatting, etc.)

### Game Implementation (maneuver-YYYY repos)

❌ Scoring constants (point values for game pieces)
❌ Game data structure (what fields to track)
❌ Point calculation logic (how to calculate scores)
❌ Match validation logic (comparing scouted data to TBA)
❌ Statistics calculations (team performance metrics)
❌ Game-specific UI (scouting screens, game piece buttons)
❌ Field mappings (for QR compression, TBA validation)

## Coding Principles

### Offline-First
Core features must work without internet:
- **Database**: IndexedDB (Dexie) - fully offline
- **Caching**: Service Worker - works offline after first load
- **Data Transfer**: 
  - QR codes - fully offline (no internet needed)
  - WebRTC - requires internet connection (but has offline QR alternative)

### Performance
- Code-splitting for large features
- Lazy loading for routes
- Target: ≤ 2.1 MB total bundle (including game implementation)

### Type Safety
- Use TypeScript for everything
- Define interfaces in `src/core/types/`
- Never use `any` without good reason

### Modularity
- Each module should have single responsibility
- Easy to extract into npm package later (Phase 2/3)
- Clear boundaries between core and game logic

## Common Patterns

### 1. Using Game Context

```typescript
import { useGame } from '@/core/contexts/GameContext';

function MyComponent() {
  const { config, scoring, validation } = useGame();
  
  // Use injected game logic
  const points = scoring.calculateTotalPoints(entry);
  
  return <div>Score: {points}</div>;
}
```

### 2. Generic Component Props

```typescript
interface GenericComponentProps<T extends ScoutingEntryBase> {
  entry: T;
  onUpdate: (entry: Partial<T>) => void;
}
```

### 3. Database Operations

```typescript
// Always use ScoutingEntryBase for type safety
import { db } from '@/core/db/database';

const entries = await db.scoutingEntries
  .where('teamNumber')
  .equals(3314)
  .toArray();
```

## Phase 1 Status (Current)

We are in **Phase 1: Template Foundation** (December 2025 - January 2026)

Goals:
- ✅ Separate core framework from game logic
- ✅ Design TypeScript interfaces
- ⏳ Extract core code from Maneuver repo
- ⏳ Create maneuver-2025 reference implementation
- ⏳ Test with 3+ teams

Not yet:
- ❌ Plugin system (Phase 2)
- ❌ npm package publication (Phase 2)
- ❌ Advanced customization features (Phase 3)

## Success Metrics

- Bundle size ≤ 2.1 MB (including game implementation)
- All features work offline
- Zero game-specific code in `src/core/`
- 3+ teams successfully create 2026 apps from template
- Framework improvements don't break game implementations

## Questions to Ask Before Committing

1. ❓ Does this code know about specific game pieces? → Move to game implementation
2. ❓ Is this hardcoded for 2025? → Make it an interface
3. ❓ Will other teams need to customize this? → Make it configurable
4. ❓ Does this increase bundle size significantly? → Consider lazy loading
5. ❓ Does this require internet for core functionality? → Provide offline alternative (e.g., QR as backup for WebRTC)

## Examples

See `docs/FRAMEWORK_DESIGN.md` for complete interface examples.

See maneuver-2025 repo for reference implementation once created.

---

**Remember:** This is infrastructure. Keep it generic, keep it clean, keep it documented.

🤖 **Built for extensibility, designed for simplicity.**
