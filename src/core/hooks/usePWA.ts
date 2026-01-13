import { useState, useEffect } from 'react';

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      // Check if app is running in standalone mode (installed as PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check for iOS PWA (uses navigator.standalone)
      const isIOSPWA = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;
      
      setIsPWA(isStandalone || isIOSPWA);
    };

    checkPWA();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isPWA;
}
