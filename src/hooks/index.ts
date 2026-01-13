/**
 * Hooks re-exports
 * 
 * This file re-exports all hooks from the core module
 * for the public API.
 */

// Utility hooks
export { useIsMobile } from '../core/hooks/use-mobile';
export { usePWA } from '../core/hooks/usePWA';
export { useMediaQuery, mediaQueries, useIsDarkMode, useIsPortrait, useIsRetina, usePrefersReducedMotion } from '../core/hooks/useMediaQuery';
export { useLocalStorage } from '../core/hooks/useLocalStorage';
export { useDebounce, useDebouncedCallback } from '../core/hooks/useDebounce';
export { useNavigationConfirm } from '../core/hooks/useNavigationConfirm';
export { useOnlineStatus, useOnlineStatusWithCallback } from '../core/hooks/useOnlineStatus';
export { useKeyboardShortcut, shortcuts } from '../core/hooks/useKeyboardShortcut';
export { useFullscreen } from '../core/hooks/useFullscreen';

// Data hooks
export { useScoutManagement } from '../core/hooks/useScoutManagement';
export { useCurrentScout } from '../core/hooks/useCurrentScout';
export { useScoutDashboard } from '../core/hooks/useScoutDashboard';
export { useConflictResolution } from '../core/hooks/useConflictResolution';

// Match & strategy hooks
export { useMatchValidation } from '../core/hooks/useMatchValidation';
export { useMatchStrategy } from '../core/hooks/useMatchStrategy';
export { useAllMatches } from '../core/hooks/useAllMatches';

// Team stats hooks
export { useTeamStats } from '../core/hooks/useTeamStats';
export { useTeamStatistics } from '../core/hooks/useTeamStatistics';
export { useAllTeamStats } from '../core/hooks/useAllTeamStats';
export { useChartData } from '../core/hooks/useChartData';

// TBA hooks
export { useTBAData } from '../core/hooks/useTBAData';
export { useTBAMatchData } from '../core/hooks/useTBAMatchData';

// Scouting hooks
export { useScoutingSession } from '../core/hooks/useScoutingSession';
export { usePitScoutingForm } from '../core/hooks/usePitScoutingForm';

// Pick list hooks
export { usePickList } from '../core/hooks/usePickList';

// WebRTC/Transfer hooks
export { usePeerTransferPush } from '../core/hooks/usePeerTransferPush';
export { usePeerTransferImport } from '../core/hooks/usePeerTransferImport';
export { useWebRTCSignaling } from '../core/hooks/useWebRTCSignaling';
export { useWebRTCQRTransfer } from '../core/hooks/useWebRTCQRTransfer';

// Canvas hooks
export { useCanvasDrawing } from '../core/hooks/useCanvasDrawing';
export { useCanvasSetup } from '../core/hooks/useCanvasSetup';

// Data management hooks
export { useDataCleaning } from '../core/hooks/useDataCleaning';
export { useDataStats } from '../core/hooks/useDataStats';
