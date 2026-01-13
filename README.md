# maneuver-core

**A year-agnostic framework template for building FRC scouting apps**

`maneuver-core` is the foundational framework that powers multi-year FRC scouting applications. It provides all the infrastructure you need—offline-first PWA capabilities, data transfer, match validation, and more—while remaining completely game-agnostic.

## 🔗 Related Repositories

| Repository | Description | Status |
|------------|-------------|--------|
| **maneuver-core** | Framework template (this repo) | Template |
| **Maneuver-2025** | 2025 Reefscape implementation (pre-creation of this template) | [Live App](https://github.com/ShinyShips/Maneuver-2025) |

> **Note:** The `Maneuver` repo will be renamed to `maneuver-2025` to follow the year-based naming convention.

## 🎯 What is this?

Every year, FRC teams face the same problem: rebuilding their scouting app from scratch for the new game. `maneuver-core` solves this by separating the **framework** (year-agnostic) from the **game logic** (year-specific).

**You build once, adapt annually.**

## 💡 Design Philosophy

Maneuver is **not** just another scouting app with basic counters and text inputs. The official Maneuver branches are designed with a focus on creating the **best possible UI/UX for scouting**.

### What sets Maneuver apart:

- **Field-Centric Interfaces** — Scoring screens mirror the game field, making data collection intuitive and fast
- **Contextual Actions** — UI elements adapt to game phases (auto/teleop/endgame) rather than showing everything at once
- **Visual Feedback** — Animations, color coding, and haptic responses confirm every action
- **Scout-First Design** — Optimized for the chaos of competition: large touch targets, minimal scrolling, one-handed operation
- **Data Visualization** — Statistics presented through charts, heat maps, and comparisons—not just tables of numbers

> **For teams forking this template:** We encourage you to maintain this commitment to quality UX. Your scouts will thank you, and your data quality will improve.

## 🏗️ Repository Structure

```
maneuver-core/
├── src/
│   ├── core/                    # 📦 Framework (year-agnostic)
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Game, Theme, etc.)
│   │   ├── db/                  # Dexie database setup
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Page layouts
│   │   ├── lib/                 # Utilities and helpers
│   │   ├── pages/               # Application pages/routes
│   │   └── types/               # TypeScript type definitions
│   │
│   ├── game-template/           # 🎮 Example game implementation
│   │   ├── components/          # Game scoring screen examples
│   │   ├── gamification/        # Achievements system
│   │   ├── game-schema.ts       # Single source of truth for game config
│   │   ├── scoring.ts           # Point calculations
│   │   ├── transformation.ts    # Data transformation logic
│   │   └── ...config files
│   │
│   ├── App.tsx                  # Main application entry
│   └── main.tsx                 # React DOM render
│
├── docs/                        # 📚 Documentation
└── public/                      # Static assets
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/core/` | Year-agnostic framework code — **do not add game-specific logic here** |
| `src/game-template/` | Example implementation — **copy and customize for your game year** |
| `docs/` | Comprehensive documentation for framework features |

## ✨ Features

- **Offline-First PWA**: Works without internet, installs like a native app
- **Match Scouting**: Pre-match setup, auto, teleop, endgame screens
- **Pit Scouting**: Robot specifications and capabilities
- **Data Transfer**: QR codes (fountain codes), JSON import/export, and WiFi transfer using WebRTC
- **Match Validation**: Compare scouted data against TBA official results
- **Team Statistics**: Averages, totals, performance analysis
- **Match Strategy**: Pre-match planning with field annotations
- **Pick Lists**: Alliance selection with drag-and-drop ordering
- **Scout Gamification**: Achievements, leaderboards, and profile tracking
- **Dark/Light Themes**: Full theme support
- **Responsive Design**: Works on tablets and phones

## 🚀 Quick Start

### Using this Template

1. **Fork or clone** this repository
2. **Rename** to `maneuver-YYYY` (e.g., `maneuver-2026`)
3. **Customize** `src/game-template/` for your game year
4. **Deploy** to Netlify/Vercel

### Development

```bash
# Clone the template
git clone https://github.com/ShinyShips/maneuver-core.git maneuver-2026
cd maneuver-2026

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

Copy `.env.example` to `.env` and add your API keys:

```env
# The Blue Alliance API Key
# Get your key at: https://www.thebluealliance.com/account
VITE_TBA_API_KEY=your_tba_api_key_here

# Nexus Stats API Key (optional, for additional match data)
# Get your key at: https://frc.nexus/
VITE_NEXUS_API_KEY=your_nexus_api_key_here
```

## 📚 Documentation

### Getting Started
- [docs/README.md](docs/README.md) - Documentation index

### Architecture
| Topic | Link |
|-------|------|
| Framework Design | [docs/FRAMEWORK_DESIGN.md](docs/FRAMEWORK_DESIGN.md) |
| Architecture Strategy | [docs/ARCHITECTURE_STRATEGY.md](docs/ARCHITECTURE_STRATEGY.md) |
| Game Components | [docs/GAME_COMPONENTS.md](docs/GAME_COMPONENTS.md) |

### Feature Guides
| Feature | Link |
|---------|------|
| Database | [docs/DATABASE.md](docs/DATABASE.md) |
| PWA Setup | [docs/PWA.md](docs/PWA.md) |
| QR Data Transfer | [docs/QR_DATA_TRANSFER.md](docs/QR_DATA_TRANSFER.md) |
| JSON Transfer | [docs/JSON_DATA_TRANSFER.md](docs/JSON_DATA_TRANSFER.md) |
| Peer Transfer (WebRTC) | [docs/PEER_TRANSFER.md](docs/PEER_TRANSFER.md) |
| Data Transformation | [docs/DATA_TRANSFORMATION.md](docs/DATA_TRANSFORMATION.md) |

### Page Documentation
| Page | Link |
|------|------|
| Scouting Workflow | [docs/SCOUTING_WORKFLOW.md](docs/SCOUTING_WORKFLOW.md) |
| Strategy Overview | [docs/STRATEGY_OVERVIEW.md](docs/STRATEGY_OVERVIEW.md) |
| Match Strategy | [docs/MATCH_STRATEGY.md](docs/MATCH_STRATEGY.md) |
| Match Validation | [docs/MATCH_VALIDATION.md](docs/MATCH_VALIDATION.md) |
| Team Stats | [docs/TEAM_STATS.md](docs/TEAM_STATS.md) |
| Pick Lists | [docs/PICK_LISTS.md](docs/PICK_LISTS.md) |
| Pit Scouting | [docs/PIT_SCOUTING.md](docs/PIT_SCOUTING.md) |
| Scout Management | [docs/SCOUT_MANAGEMENT.md](docs/SCOUT_MANAGEMENT.md) |
| Achievements | [docs/ACHIEVEMENTS.md](docs/ACHIEVEMENTS.md) |

### Developer Guides
| Topic | Link |
|-------|------|
| React Contexts | [docs/CONTEXTS_GUIDE.md](docs/CONTEXTS_GUIDE.md) |
| Hooks Reference | [docs/HOOKS_REFERENCE.md](docs/HOOKS_REFERENCE.md) |
| Utility Hooks | [docs/UTILITY_HOOKS.md](docs/UTILITY_HOOKS.md) |
| Navigation | [docs/NAVIGATION_SETUP.md](docs/NAVIGATION_SETUP.md) |

## 🎮 Customizing for Your Game Year

The `game-schema.ts` file is the **single source of truth** for your game configuration:

```typescript
// src/game-template/game-schema.ts
export const gameSchema = {
  year: 2025,
  gameName: "Reefscape",
  actions: {
    // Define counters for scoring actions
    autoCoralL4: { phase: "auto", points: 7 },
    teleopAlgaeNet: { phase: "teleop", points: 4 },
    // ...
  },
  toggles: {
    // Define boolean states
    leftStartingZone: { phase: "auto", points: 3 },
    // ...
  },
};
```

From this schema, the framework derives:
- Default data values
- Point calculations
- Strategy column configurations
- Validation logic

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Dexie.js (IndexedDB) |
| PWA | Vite PWA plugin |
| Data Transfer | QR fountain codes + JSON |
| API | The Blue Alliance (TBA) |
| Deployment | Netlify / Vercel |

## 🤝 Contributing

Contributions are welcome! Please:

1. Keep framework changes **game-agnostic** in `src/core/`
2. Document any new interfaces or hooks
3. Run `npm run build` to verify no type errors
4. Test changes manually before submitting

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

Developed by **Andy Nguyen (ShinyShips) - FRC Team 3314 Alumni and Strategy Mentor** for the FRC community.

Special thanks to:
- [The Blue Alliance](https://www.thebluealliance.com/) for their excellent API
- [VScout](https://github.com/VihaanChhabria/VScout) by VihaanChhabria for initial inspiration
- All the open-source libraries that make this possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ShinyShips/maneuver-core/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ShinyShips/maneuver-core/discussions)

---