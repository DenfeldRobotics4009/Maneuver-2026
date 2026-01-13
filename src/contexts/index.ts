/**
 * Contexts exports
 * 
 * This exports all React context providers and hooks.
 */

// Game Context
export { GameProvider, useGame } from '../core/contexts/GameContext';

// Notification Context
export {
  NotificationProvider,
  useNotifications,
  type Notification,
  type NotificationType
} from '../core/contexts/NotificationContext';

// Settings Context
export {
  SettingsProvider,
  useSettings,
  type AppSettings
} from '../core/contexts/SettingsContext';

// Data Sync Context
export {
  DataSyncProvider,
  useDataSync,
  type SyncOperation,
  type SyncStatus,
  type SyncMethod
} from '../core/contexts/DataSyncContext';
