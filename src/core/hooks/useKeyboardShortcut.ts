/**
 * useKeyboardShortcut Hook
 * Register keyboard shortcuts for your app
 * Framework hook - game-agnostic
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  /**
   * Key to listen for (e.g., 'k', 'Enter', 'Escape')
   */
  key: string;
  
  /**
   * Require Ctrl key (Cmd on Mac)
   */
  ctrl?: boolean;
  
  /**
   * Require Shift key
   */
  shift?: boolean;
  
  /**
   * Require Alt key (Option on Mac)
   */
  alt?: boolean;
  
  /**
   * Enable the shortcut
   * Default: true
   */
  enabled?: boolean;
  
  /**
   * Prevent default browser behavior
   * Default: true
   */
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  callback: () => void,
  options: KeyboardShortcutOptions
) {
  const {
    key,
    ctrl = false,
    shift = false,
    alt = false,
    enabled = true,
    preventDefault = true
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if shortcut is enabled
      if (!enabled) return;

      // Check if all required modifiers match
      const ctrlPressed = event.ctrlKey || event.metaKey; // metaKey for Mac Cmd
      const shiftPressed = event.shiftKey;
      const altPressed = event.altKey;

      const modifiersMatch =
        ctrlPressed === ctrl &&
        shiftPressed === shift &&
        altPressed === alt;

      // Check if key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [callback, key, ctrl, shift, alt, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Common keyboard shortcuts
 */
export const shortcuts = {
  // Navigation
  escape: { key: 'Escape' },
  enter: { key: 'Enter' },
  
  // Search
  search: { key: 'k', ctrl: true },
  
  // Actions
  save: { key: 's', ctrl: true },
  undo: { key: 'z', ctrl: true },
  redo: { key: 'z', ctrl: true, shift: true },
  
  // App navigation
  home: { key: 'h', ctrl: true },
  settings: { key: ',', ctrl: true },
  
  // Data entry
  submitForm: { key: 'Enter', ctrl: true },
} as const;
