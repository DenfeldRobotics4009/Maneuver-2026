import { useEffect, useState } from 'react';
import { cn } from '@/core/lib/utils';
import ManeuverVerticalLogo from '@/assets/Maneuver Wordmark Vertical.png'; // Fix this import

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background flex items-center justify-center transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <img
          src={ManeuverVerticalLogo}
          width="200"
          height="80"
          alt="Maneuver Logo"
          className="dark:invert"
        />
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}