import { useState } from 'react';
import type { ReactNode } from 'react';
import { FullscreenContext } from '../lib/fullscreenContext';

export function FullscreenProvider({ children }: { children: ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
}
