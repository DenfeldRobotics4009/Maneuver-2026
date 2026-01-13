# Hooks Reference

Quick reference for all custom React hooks in maneuver-core.

## Quick Reference Table

| Hook | Category | Documentation |
|------|----------|---------------|
| **Utility Hooks** |||
| `useIsMobile` | Responsive | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#useismobile) |
| `usePWA` | Responsive | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#usepwa) |
| `useMediaQuery` | Responsive | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#usemediaquery) |
| `useLocalStorage` | State | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#uselocalstorage) |
| `useDebounce` | State | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#usedebounce) |
| `useNavigationConfirm` | Navigation | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#usenavigationconfirm) |
| `useOnlineStatus` | Network | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#useonlinestatus) |
| `useKeyboardShortcut` | Keyboard | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md#usekeyboardshortcut) |
| `useFullscreen` | UI | [UTILITY_HOOKS.md](./UTILITY_HOOKS.md) |
| **Data Transfer Hooks** |||
| `useConflictResolution` | Conflict | [JSON_DATA_TRANSFER.md](./JSON_DATA_TRANSFER.md) |
| `usePeerTransferPush` | WebRTC | [PEER_TRANSFER.md](./PEER_TRANSFER.md) |
| `usePeerTransferImport` | WebRTC | [PEER_TRANSFER.md](./PEER_TRANSFER.md) |
| `useWebRTCSignaling` | WebRTC | [PEER_TRANSFER.md](./PEER_TRANSFER.md) |
| `useWebRTCQRTransfer` | WebRTC | [PEER_TRANSFER.md](./PEER_TRANSFER.md) |
| **TBA/API Hooks** |||
| `useTBAData` | API | [DATABASE.md](./DATABASE.md) |
| `useTBAMatchData` | API | [DATABASE.md](./DATABASE.md) |
| **Scout Management Hooks** |||
| `useScoutManagement` | Scouts | [SCOUT_MANAGEMENT.md](./SCOUT_MANAGEMENT.md) |
| `useCurrentScout` | Scouts | [SCOUT_MANAGEMENT.md](./SCOUT_MANAGEMENT.md) |
| `useScoutDashboard` | Scouts | [SCOUT_MANAGEMENT.md](./SCOUT_MANAGEMENT.md) |
| **Scouting Session Hooks** |||
| `useScoutingSession` | Scouting | [FRAMEWORK_DESIGN.md](./FRAMEWORK_DESIGN.md) |
| `usePitScoutingForm` | Pit Scouting | [PIT_SCOUTING.md](./PIT_SCOUTING.md) |
| **Match & Strategy Hooks** |||
| `useMatchValidation` | Validation | [MATCH_VALIDATION.md](./MATCH_VALIDATION.md) |
| `useMatchStrategy` | Strategy | [MATCH_STRATEGY.md](./MATCH_STRATEGY.md) |
| `useAllMatches` | Matches | [DATABASE.md](./DATABASE.md) |
| **Team Stats Hooks** |||
| `useTeamStats` | Stats | [TEAM_STATS.md](./TEAM_STATS.md) |
| `useTeamStatistics` | Stats | [TEAM_STATS.md](./TEAM_STATS.md) |
| `useAllTeamStats` | Stats | [TEAM_STATS.md](./TEAM_STATS.md) |
| `useChartData` | Stats | [STRATEGY_OVERVIEW.md](./STRATEGY_OVERVIEW.md) |
| **Pick List Hooks** |||
| `usePickList` | Pick Lists | [PICK_LISTS.md](./PICK_LISTS.md) |
| **Canvas Hooks** |||
| `useCanvasDrawing` | Drawing | Internal use |
| `useCanvasSetup` | Drawing | Internal use |
| **Data Management Hooks** |||
| `useDataCleaning` | Data | [CLEAR_DATA.md](./CLEAR_DATA.md) |
| `useDataStats` | Data | [DEV_UTILITIES.md](./DEV_UTILITIES.md) |

## Hook Categories

### Utility Hooks
General-purpose hooks for responsive design, state management, and keyboard shortcuts. See [UTILITY_HOOKS.md](./UTILITY_HOOKS.md).

### Data Transfer Hooks
Hooks for transferring data between devices via JSON, QR codes, or WebRTC. See:
- [JSON_DATA_TRANSFER.md](./JSON_DATA_TRANSFER.md)
- [QR_DATA_TRANSFER.md](./QR_DATA_TRANSFER.md)
- [PEER_TRANSFER.md](./PEER_TRANSFER.md)

### Scout Management Hooks
Hooks for managing scout profiles and the current scout. See [SCOUT_MANAGEMENT.md](./SCOUT_MANAGEMENT.md).

### Match & Strategy Hooks
Hooks for match validation, strategy analysis, and alliance selection. See:
- [MATCH_VALIDATION.md](./MATCH_VALIDATION.md)
- [MATCH_STRATEGY.md](./MATCH_STRATEGY.md)
- [STRATEGY_OVERVIEW.md](./STRATEGY_OVERVIEW.md)

### Team Stats Hooks
Hooks for computing and displaying team statistics. See [TEAM_STATS.md](./TEAM_STATS.md).

---

**File Locations:** All hooks are in `src/core/hooks/`
