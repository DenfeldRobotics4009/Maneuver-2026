import { createContext } from 'react';

export interface FullscreenContextType {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);
