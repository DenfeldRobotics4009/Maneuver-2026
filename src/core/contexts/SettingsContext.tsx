/**
 * SettingsContext - Application settings and user preferences
 * Framework context - game-agnostic
 * 
 * Manages user preferences and app configuration with localStorage persistence.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';

export interface AppSettings {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notifications
  enableNotifications: boolean;
  soundEnabled: boolean;
  
  // Data
  autoSync: boolean;
  syncInterval: number; // minutes
  confirmBeforeDelete: boolean;
  
  // UI Preferences
  compactMode: boolean;
  showDebugInfo: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  enableNotifications: true,
  soundEnabled: true,
  autoSync: true,
  syncInterval: 5,
  confirmBeforeDelete: true,
  compactMode: false,
  showDebugInfo: false
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  // Convenience getters
  isDarkMode: boolean;
  isCompactMode: boolean;
  shouldReduceMotion: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
  /**
   * localStorage key for settings
   * Default: 'app-settings'
   */
  storageKey?: string;
  
  /**
   * Default settings override
   */
  defaults?: Partial<AppSettings>;
}

export function SettingsProvider({
  children,
  storageKey = 'app-settings',
  defaults
}: SettingsProviderProps) {
  const [settings, setSettings, resetSettings] = useLocalStorage<AppSettings>(
    storageKey,
    { ...defaultSettings, ...defaults }
  );

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Convenience getters
  const isDarkMode = 
    settings.theme === 'dark' || 
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isCompactMode = settings.compactMode;
  const shouldReduceMotion = settings.reducedMotion;

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
    isDarkMode,
    isCompactMode,
    shouldReduceMotion
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
