import { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent } from '@/core/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// TEST CONTROL - Set to true to force show the prompt for testing
const FORCE_SHOW_INSTALL_PROMPT = false;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      
      // Check if user previously dismissed and if enough time has passed
      const lastDismissed = localStorage.getItem('install-prompt-dismissed');
      const now = Date.now();
      const daysSinceLastDismiss = lastDismissed ? 
        (now - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) : 999;
      
      // Show prompt if never dismissed OR it's been 7 days since last dismissal
      if (!lastDismissed || daysSinceLastDismiss >= 7) {
        setTimeout(() => setShowPrompt(true), 5000);
      } else {
        console.log(`Install prompt suppressed. ${Math.ceil(7 - daysSinceLastDismiss)} days remaining.`);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Force show for testing - trigger the real install prompt
    if (FORCE_SHOW_INSTALL_PROMPT) {
      console.log('🧪 FORCE SHOWING INSTALL PROMPT FOR TESTING');
      
      // Simple approach - just show the prompt after 2 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {      
      // Platform-aware install instructions
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      let instructions = '';
      if (isIOS) {
        instructions = 'To install this app on iOS:\n\n1. Tap the Share button (□↗) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install';
      } else if (isMobile) {
        instructions = 'To install this app:\n\n1. Tap the menu (⋮) in your browser\n2. Look for "Install app" or "Add to Home screen"\n3. Tap it to install';
      } else {
        instructions = 'To install this app:\n\n1. Look for the install icon (⊕) in your browser\'s address bar\n2. Click it to install\n3. Or use your browser menu: Settings > Install App';
      }
      
      alert(instructions + '\n\nEnjoy offline access!');
      
      setShowPrompt(false);
      return;
    }

    // Clear any previous dismissal since user is now installing
    localStorage.removeItem('install-prompt-dismissed');
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installation accepted');
      } else {
        // User dismissed the browser's install dialog
        localStorage.setItem('install-prompt-dismissed', Date.now().toString());
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Store dismissal timestamp
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    
    setShowPrompt(false);
  };

  // Show if we have showPrompt true AND (we're in force mode OR we have a real prompt)
  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg">
      <CardContent>
        <div className="relative">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
            className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex-1 justify-center items-center">
              <div className='flex items-center justify-center gap-2 py-1'>
                <Download className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                <p className="font-semibold text-sm">Install App</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center py-1">
                Install this app for faster access and offline use
              </p>
              {FORCE_SHOW_INSTALL_PROMPT && !deferredPrompt && (
                <p className="text-xs text-yellow-600 mt-1 font-mono text-center">
                  🧪 TEST MODE - Will guide to manual install
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  Install
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
