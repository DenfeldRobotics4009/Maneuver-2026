# Maneuver Architecture Strategy

**Version:** 1.0  
**Date:** December 15, 2025  
**Status:** Living Document - Reference for all architectural decisions

---

## 🎯 Vision

Transform Maneuver from a single-year scouting app into a **production-ready FRC scouting framework** that:

1. Supports multiple game years with minimal code duplication
2. Enables community-driven innovation through plugins
3. Provides reference implementations for teams to learn from
4. Maintains offline-first, lightweight bundle sizes

---

## 📋 Core Principles

### 1. **Offline-First Performance**

- Each deployment serves only the code needed for that year
- No bundle bloat from unused years or features
- Aggressive code splitting and lazy loading
- Service worker caching optimized per deployment

### 2. **Separation of Concerns**

```text
Core Framework (year-agnostic)
├── Database layer
├── PWA infrastructure
├── Routing & navigation
├── Data transfer (QR, WebRTC)
└── UI component library

Game Logic (year-specific)
├── Scoring constants
├── Game piece types
├── Match validation rules
├── Strategy calculations
└── UI specific to game mechanics

Team Customization (team-specific)
├── Branding & colors
├── Strategy weights/preferences
├── Custom analysis tools
└── Private configuration
```

### 3. **Public by Design**

- All repositories are public (core, plugins, game packs, reference implementations)
- Your year-specific repos serve as reference implementations
- Other teams can fork, learn from, or build upon your work
- Community can contribute improvements back

---

## 🏗️ Multi-Year Architecture

### **Chosen Approach: Template Repo Pattern (Option 2)**

#### Repository Structure

```text
ShinyShips/maneuver-core (public template)
├── Core framework code
├── Abstract game interfaces
├── Example/starter game folder
└── Documentation

ShinyShips/maneuver-2025 (public reference implementation)
├── Forked from maneuver-core
├── 2025 Reefscape game implementation
├── Your team's customizations
└── Deployed to: 2025.maneuver-app.com

ShinyShips/maneuver-2026 (public reference implementation)
├── Forked from maneuver-core
├── 2026 game implementation
├── Your team's customizations
└── Deployed to: maneuver-app.com (current year)

Other Teams
├── Can use maneuver-core as template
├── Can fork your reference implementations
├── Can contribute improvements back to core
└── Build their own variants
```

#### Why This Approach?

**✅ Pros:**

- Separate bundles per year (optimal for offline-first)
- Natural git workflow (fork, upstream/downstream)
- Reference implementations ARE the documentation
- Easy for teams to get started (fork or use template)
- Historical preservation (each year is its own repo)
- Community ecosystem forms naturally

**⚠️ Considerations:**

- Multiple repos to maintain
- Need to backport critical fixes
- Requires good git hygiene to keep core/game separation clean

**❌ Rejected Alternatives:**

- Single repo with branches → Hard to create framework
- Build-time selection → Risk of bundle bloat
- Separate repos without template → Duplication of effort

---

## 🔌 Plugin Architecture (Future Vision)

### **Phase 1: Foundation (Now - January 2026)**

**Goal:** Establish clean separation of core vs. game logic

**Actions:**

- Restructure current codebase with clear boundaries
- Design interfaces for what a "game" must implement
- No plugin system yet, just good architecture
- Document future plugin intentions

**Deliverables:**

- `maneuver-core` repository with framework code
- `maneuver-2025` repository as reference implementation
- Clear architectural boundaries in code

### **Phase 2: Plugin System (Mid-2026, if demand exists)**

**Goal:** Enable modular feature selection

**Structure:**

```text
maneuver-core
├── Plugin runtime & loader
└── Core app shell

maneuver-plugins (monorepo)
├── @maneuver/qr-transfer
├── @maneuver/webrtc-transfer
├── @maneuver/pit-scouting
├── @maneuver/match-strategy
├── @maneuver/pick-list
└── @maneuver/tba-integration

maneuver-game-2025 (extracted)
maneuver-game-2026 (extracted)

Reference implementations use plugins:
maneuver-2025 → installs selected plugins
maneuver-2026 → installs selected plugins
```

**Benefits:**

- Teams can opt-out of features they don't need
- Smaller bundles (better offline performance)
- Community can publish custom plugins
- Easier to test features in isolation

**Example Usage:**

```json
// maneuver.config.json
{
  "team": 1234,
  "year": 2026,
  "plugins": [
    "@maneuver/qr-transfer",
    "@maneuver/webrtc-transfer",
    "@maneuver/match-strategy",
    "@team254/auto-scouting"  // Community plugin
  ]
}
```

### **Phase 3: CLI Tool (2027+, if ecosystem grows)**

**Goal:** Streamline app generation for teams

**Command:**

```bash
npx create-frc-scout my-scouting-app

✨ Creating your FRC scouting app...

? Team number? 1234
? Game year? 2026
? Select features:
  ☑ QR Code sharing
  ☑ WebRTC peer transfer
  ☐ Bluetooth sync
  ☑ Match strategy planner
  ☑ Pick list generator
  ☐ 3D field visualization

? Starting point:
  › Use ShinyShips reference implementation
    Start from minimal template
    Use custom template

🎉 Generated my-scouting-app/
   Bundle size: 1.2 MB
```

**Benefits:**

- Easy onboarding for new teams
- Automatic dependency resolution
- Best practices baked in
- Reduces decision fatigue

---

## 🚀 Implementation Phases

### **Phase 1: Template Foundation (December 2025 - January 2026)**

**Priority:** HIGH - Must complete before 2026 kickoff

**Tasks:**

1. ✅ Audit codebase for core vs. game-specific code
2. ✅ Design core framework interfaces (game abstraction)
3. ✅ Create `maneuver-core` repository
4. ✅ Extract core infrastructure (DB, PWA, WebRTC, etc.)
5. ✅ Create `maneuver-2025` from template
6. ✅ Set up upstream/downstream git workflow
7. ✅ Deploy both repos and validate
8. ✅ Write comprehensive documentation

**Success Criteria:**

- [ ] Teams can fork `maneuver-core` and build 2026 app
- [ ] `maneuver-2025` deployed and functional
- [ ] Documentation clear enough for outside teams
- [ ] Bundle size ≤ 2.1 MB for full-featured app

### **Phase 2: Plugin System (Mid-2026)**

**Priority:** MEDIUM - Only if demand exists

**Decision Point:** After 2-3 months of 2026 season

- Are teams asking for specific features?
- Do teams want to remove features for performance?
- Is community contributing improvements?

**If YES → Proceed with plugins:**

1. Design plugin API and interfaces
2. Extract features into plugin packages
3. Create plugin loader system
4. Update reference implementations
5. Document plugin development

**If NO → Defer:**

- Keep current architecture
- Revisit after 2026 season
- Focus on core improvements

### **Phase 3: CLI & Marketplace (2027+)**

**Priority:** LOW - Only if ecosystem thrives

**Decision Point:** End of 2026 season

- Are 10+ teams using the framework?
- Are community plugins being created?
- Is plugin management becoming painful?

**If YES → Build CLI:**

1. Create `create-frc-scout` package
2. Interactive app generation
3. Template selection system
4. Plugin marketplace website

**If NO → Continue without CLI:**

- Manual fork/configuration works fine
- Focus on improving core and plugins

---

## 📊 Decision Framework

Use this when making architectural decisions:

### **Question 1: Does this impact bundle size?**

- ✅ YES → Must be optional or lazy-loaded
- ❌ NO → Can be in core

### **Question 2: Is this year-specific?**

- ✅ YES → Goes in game pack
- ❌ NO → Goes in core

### **Question 3: Is this used by all teams?**

- ✅ YES → Should be in core
- ❌ NO → Should be a plugin (eventually)

### **Question 4: Does this affect offline-first?**

- ✅ YES → Requires careful review
- ❌ NO → Lower priority concern

### **Question 5: Can other teams customize this?**

- ✅ YES → Make it configurable
- ❌ NO → Can be hardcoded

---

## 🎯 Success Metrics

### **Phase 1 (Template) - Target: January 2026**

- [ ] 3+ teams fork `maneuver-core` for 2026
- [ ] Bundle size ≤ 2.1 MB for full-featured app
- [ ] Documentation rated 4+ stars on GitHub
- [ ] Zero critical bugs in core framework

### **Phase 2 (Plugins) - Target: Mid-2026**

- [ ] 5+ official plugins published
- [ ] 2+ community plugins created
- [ ] Average bundle reduction of 30% with plugin selection
- [ ] Plugin API stable (no breaking changes)

### **Phase 3 (CLI) - Target: 2027**

- [ ] 10+ teams using framework
- [ ] CLI has 100+ downloads
- [ ] 5+ community plugins in marketplace
- [ ] Active Discord/forum community

---

## 🔄 Yearly Workflow

### **Pre-Kickoff (December)**

1. Review and improve `maneuver-core` based on previous season
2. Document lessons learned from past year
3. Plan any breaking changes to core
4. Update dependencies

### **Kickoff Day (January)**

1. Create `maneuver-YYYY` repository from `maneuver-core` template
2. Set up deployment to `maneuver-app.com`
3. Begin implementing game rules as revealed

### **During Season (January - April)**

1. Implement game-specific features in `maneuver-YYYY`
2. Extract common improvements to `maneuver-core`
3. Help community teams with issues
4. Iterate on reference implementation

### **Post-Season (May - November)**

1. Lock `maneuver-YYYY` branch (only critical fixes)
2. Deploy frozen version to `YYYY.maneuver-app.com`
3. Extract successful patterns to core
4. Plan next year's improvements

---

## 🛡️ Privacy & Security

### **What Should Be Public**

- ✅ Core framework code
- ✅ Plugin implementations
- ✅ Game pack logic
- ✅ Reference implementation structure
- ✅ Documentation and guides

### **What Should Be Configurable (Not Hardcoded)**

- ⚙️ Strategy weights and priorities
- ⚙️ Team-specific thresholds
- ⚙️ Pick list algorithms
- ⚙️ Custom analysis formulas
- ⚙️ Branding and colors

### **What Should Be in `.gitignore`**

- 🔒 `.env.local` (API keys, secrets)
- 🔒 `config/team-secrets.json`
- 🔒 `notes/strategy-private.md`
- 🔒 `data/opponent-analysis.json`
- 🔒 Team-specific notes and observations

### **Security Considerations**

- Don't commit API keys or tokens
- Keep opponent analysis in local files
- Document what teams should customize
- Provide example configs with sensible defaults

---

## 📚 Documentation Strategy

### **For Framework Users (Other Teams)**

- `README.md` - Quick start and overview
- `GETTING_STARTED.md` - Step-by-step setup guide
- `CUSTOMIZATION.md` - What to change for your team
- `ARCHITECTURE.md` - Technical deep dive
- `CONTRIBUTING.md` - How to contribute back

### **For Framework Maintainers (Us)**

- `ARCHITECTURE_STRATEGY.md` - This document
- `FRAMEWORK_DESIGN.md` - Interface definitions
- `SEASON_MIGRATION.md` - Year-to-year checklist
- `PLUGIN_API.md` - Plugin development guide (Phase 2)

### **For Community**

- GitHub Discussions for Q&A
- GitHub Issues for bugs/features
- Example apps and tutorials
- Video walkthroughs (optional)

---

## 🤝 Community Guidelines

### **What We Want**

- Teams sharing improvements back to core
- Community plugins that extend functionality
- Documentation improvements and translations
- Bug reports and feature requests

### **What We'll Support**

- Bug fixes in core framework
- Feature requests aligned with vision
- Community plugin reviews/recommendations
- Help with setup and customization

### **What We Won't Support**

- Team-specific custom features in core
- Closed-source forks (defeats the purpose)
- Breaking changes without migration guide
- Features that bloat bundle size

---

## 💡 Future Possibilities

### **Potential Features (Post-2026)**

- 📱 Native mobile apps (iOS/Android via Capacitor)
- 🎨 Theme marketplace
- 📊 Integration with Tableau/PowerBI
- 🤖 Machine learning for predictions
- 🎥 Video analysis integration
- 🌐 Multi-language support
- 🔗 Integration with other scouting systems

### **Potential Plugins (Community Ideas)**

- Auto scouting via computer vision
- Voice input for hands-free scouting
- Bluetooth device-to-device sync
- 3D field visualization
- Alliance selection simulator
- Drive team dashboard
- Live match commentary

---

## 📖 References

### **Key Decisions**

- [2025-12-15] Chose Template Repo Pattern (Option 2) over branch-based
- [2025-12-15] Decided plugin system is Phase 2, not Phase 1
- [2025-12-15] Committed to public repositories for community benefit
- [2025-12-15] Prioritized offline-first over feature richness

### **Related Documents**

- `docs/FRAMEWORK_DESIGN.md` - Technical interfaces (to be created)
- `docs/SEASON_MIGRATION.md` - Year-to-year process (to be created)
- `docs/GAME_CONSTANTS_2025.md` - Example game implementation
- `docs/OFFLINE_FIRST_CACHING.md` - PWA strategy

### **External Resources**

- FRC Game Manuals: https://www.firstinspires.org/resource-library/frc/game-and-season-info
- The Blue Alliance API: https://www.thebluealliance.com/apidocs
- PWA Best Practices: https://web.dev/progressive-web-apps/
- Vite Plugin Development: https://vitejs.dev/guide/api-plugin.html

---

## 🔄 Document Maintenance

**This document should be updated when:**

- Major architectural decisions are made
- Phase milestones are completed
- Success metrics are hit (or missed)
- Community feedback suggests changes
- New possibilities emerge

**Review Schedule:**

- After each season (May)
- Before each kickoff (December)
- When considering major changes (ad-hoc)

**Owners:**

- Primary: ShinyShips development team
- Contributors: Community via PRs

---

## ✅ Next Steps

**Immediate (Next 2 Weeks):**

1. ✅ Complete this strategy document
2. ✅ Begin codebase audit (Task 1 in todo list)
3. ⬜ Design framework interfaces (Task 2)
4. ⬜ Create `maneuver-core` repo (Task 3)

**Short-term (Before 2026 Kickoff):**

- Complete Phase 1 implementation
- Deploy `maneuver-2025` as reference
- Write all framework documentation
- Announce to FRC community

**Long-term (2026 Season):**

- Monitor community adoption
- Gather feedback on architecture
- Evaluate need for plugin system
- Improve based on real usage

---

**Remember:** This is a living document. As we learn and the community grows, our strategy will evolve. The goal is to build something that serves the FRC community for years to come while maintaining the performance and reliability that competitive scouting demands.

🤖 **Built for FRC teams, by FRC teams.**
