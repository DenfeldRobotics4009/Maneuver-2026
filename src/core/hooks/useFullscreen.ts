import { useContext } from 'react';
import { FullscreenContext } from '@/core/lib/fullscreenContext';

export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}
