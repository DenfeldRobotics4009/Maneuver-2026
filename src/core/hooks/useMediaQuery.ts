/**
 * useMediaQuery Hook
 * Generic media query hook for responsive design
 * Framework hook - game-agnostic
 * 
 * Note: useIsMobile is a specialized version of this hook.
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Common media query presets
 */
export const mediaQueries = {
  // Tailwind breakpoints
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  
  // Device types
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  
  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Display modes
  standalone: '(display-mode: standalone)',
  fullscreen: '(display-mode: fullscreen)',
  
  // Preferences
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // High DPI
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
} as const;

/**
 * Convenience hooks for common queries
 */
export function useIsDarkMode(): boolean {
  return useMediaQuery(mediaQueries.darkMode);
}

export function useIsPortrait(): boolean {
  return useMediaQuery(mediaQueries.portrait);
}

export function useIsRetina(): boolean {
  return useMediaQuery(mediaQueries.retina);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(mediaQueries.reducedMotion);
}
