# PWA Infrastructure

The PWA (Progressive Web App) infrastructure makes your scouting app installable on mobile devices and provides offline-first functionality.

## Overview

Three main components:

1. **InstallPrompt** - Handles app installation prompts
2. **PWAUpdatePrompt** - Notifies users when updates are available
3. **usePWA** hook - Detects if running as installed PWA

## InstallPrompt Component

Displays installation banner to users on supported platforms.

### Features

- **Platform-specific instructions**: iOS Safari, Android Chrome, Desktop browsers
- **Smart timing**: Shows 5 seconds after page load (not immediately)
- **Dismissal persistence**: 7-day cooldown after user dismisses
- **beforeinstallprompt handling**: Automatic prompt on Android/Desktop

### Usage

```tsx
import { InstallPrompt } from '@/core/components/pwa/InstallPrompt';

function App() {
  return (
    <div>
      {/* Your app content */}
      <InstallPrompt />
    </div>
  );
}
```

### Behavior

**Android/Desktop (Chrome, Edge, etc.):**
- Captures `beforeinstallprompt` event
- Shows custom banner after 5 seconds
- Triggers native install dialog on button click

**iOS Safari:**
- Shows manual instructions (no native API support)
- Guides user to Share button → "Add to Home Screen"

**Dismissal Logic:**
```typescript
// User dismisses prompt
localStorage.setItem('install-prompt-dismissed', Date.now().toString());

// Check if 7 days have passed
const daysSinceLastDismiss = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
if (daysSinceLastDismiss >= 7) {
  // Show prompt again
}
```

### Testing

Set `FORCE_SHOW_INSTALL_PROMPT = true` to test prompt display:

```typescript
const FORCE_SHOW_INSTALL_PROMPT = true; // Enable for testing
```

This shows the prompt after 2 seconds regardless of dismissal state.

## PWAUpdatePrompt Component

Notifies users when a new service worker version is available.

### Features

- **Auto-detection**: Listens for service worker updates
- **Custom events**: Responds to `sw-update-available` event
- **Immediate update**: Sends `SKIP_WAITING` message to service worker
- **Auto-reload**: Refreshes page after update

### Usage

```tsx
import { PWAUpdatePrompt } from '@/core/components/pwa/PWAUpdatePrompt';

function App() {
  return (
    <div>
      {/* Your app content */}
      <PWAUpdatePrompt />
    </div>
  );
}
```

### How it Works

**1. Service Worker Registration (main.tsx):**
```typescript
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('sw-update-available', {
                  detail: { waiting: newWorker }
                }));
              }
            });
          }
        });
      });
  });
}
```

**2. Update Prompt Listens:**
```typescript
window.addEventListener('sw-update-available', (event) => {
  setWaitingWorker(event.detail.waiting);
  setShowPrompt(true);
});
```

**3. User Clicks "Update Now":**
```typescript
waitingWorker.postMessage({ type: 'SKIP_WAITING' });
window.location.reload();
```

**4. Service Worker Activates:**
```javascript
// In service worker (sw.js)
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### Update Flow

```
User opens app
    ↓
Service worker checks for update
    ↓
New version available
    ↓
Download new service worker
    ↓
New SW enters "installed" state
    ↓
Dispatch 'sw-update-available' event
    ↓
Show update prompt to user
    ↓
User clicks "Update Now"
    ↓
Send SKIP_WAITING message
    ↓
New SW activates immediately
    ↓
Page reloads with new version
```

## usePWA Hook

Detects if the app is running as an installed PWA.

### Features

- **Cross-platform detection**: Works on iOS and Android
- **Reactive**: Updates if display mode changes
- **Lightweight**: No external dependencies

### Usage

```typescript
import { usePWA } from '@/core/hooks/usePWA';

function MyComponent() {
  const isPWA = usePWA();
  
  return (
    <div>
      {isPWA ? (
        <p>Running as installed app</p>
      ) : (
        <p>Running in browser</p>
      )}
    </div>
  );
}
```

### Detection Logic

```typescript
// Standard browsers (Android, Desktop)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// iOS Safari
const isIOSPWA = 'standalone' in window.navigator && window.navigator.standalone === true;

// Combined check
const isPWA = isStandalone || isIOSPWA;
```

### Common Use Cases

**1. Conditional Bottom Navigation:**
```typescript
function BottomNav() {
  const isPWA = usePWA();
  const isMobile = useIsMobile();
  
  // Only show on mobile when installed as PWA
  if (!isMobile || !isPWA) return null;
  
  return <nav>{/* Navigation items */}</nav>;
}
```

**2. Feature Toggles:**
```typescript
function Settings() {
  const isPWA = usePWA();
  
  return (
    <div>
      {isPWA && <PushNotificationToggle />}
      {!isPWA && <InstallAppBanner />}
    </div>
  );
}
```

**3. Analytics:**
```typescript
function App() {
  const isPWA = usePWA();
  
  useEffect(() => {
    if (isPWA) {
      analytics.track('pwa_launched');
    }
  }, [isPWA]);
  
  return <div>{/* App content */}</div>;
}
```

## Service Worker Setup

The service worker is generated by `vite-plugin-pwa`. Here's the Vite config:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Enable for testing in dev
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
            },
          },
          // Add more caching strategies as needed
        ],
      },
      manifest: {
        name: 'Your Scouting App',
        short_name: 'ScoutApp',
        description: 'FRC Scouting Application',
        theme_color: '#000000',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

## HTML Meta Tags

Add these to your `index.html`:

```html
<!-- PWA Support -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="application-name" content="Your Scouting App">

<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Your Scouting App" />

<!-- Microsoft Tiles -->
<meta name="msapplication-TileColor" content="#000000" />
<meta name="msapplication-TileImage" content="/android-chrome-192x192.png" />

<!-- Theme Color -->
<meta name="theme-color" content="#000000" />
```

## Testing PWA Features

### Testing Install Prompt

1. **Development Mode:**
   - Set `FORCE_SHOW_INSTALL_PROMPT = true`
   - Prompt appears after 2 seconds

2. **Production Testing (Chrome):**
   - Open DevTools → Application → Manifest
   - Click "Update" to refresh manifest
   - Look for errors
   - Chrome will show install prompt if criteria met

3. **Dismissal Testing:**
   - Dismiss prompt
   - Check localStorage: `install-prompt-dismissed`
   - Change system time forward 7 days
   - Prompt should reappear

### Testing Service Worker Updates

1. **Manual Update Test:**
   - Build app: `npm run build`
   - Deploy to hosting
   - Open app in browser
   - Make code change
   - Build again: `npm run build`
   - Deploy new version
   - Reload page (not hard refresh)
   - Update prompt should appear

2. **Skip Waiting Test:**
   - When update prompt appears
   - Click "Update Now"
   - Page should reload with new version
   - Check DevTools → Application → Service Workers
   - Should show new version as activated

3. **Development Testing:**
   - Set `devOptions: { enabled: true }` in Vite config
   - Service worker runs in development mode
   - Updates work like production

### Testing PWA Detection

1. **Browser Mode:**
   ```typescript
   const isPWA = usePWA(); // Should be false
   ```

2. **Installed PWA:**
   - Install app via prompt
   - Launch from home screen
   ```typescript
   const isPWA = usePWA(); // Should be true
   ```

3. **iOS Testing:**
   - Open Safari
   - Share button → "Add to Home Screen"
   - Launch from home screen
   ```typescript
   const isPWA = usePWA(); // Should be true
   ```

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari | Safari iOS |
|---------|--------|------|---------|--------|------------|
| Install Prompt | ✅ | ✅ | ❌ | ❌ | ❌ |
| Service Worker | ✅ | ✅ | ✅ | ✅ | ✅ |
| PWA Detection | ✅ | ✅ | ✅ | ✅ | ✅ |
| beforeinstallprompt | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add to Home Screen | ✅ | ✅ | ❌ | ✅ | ✅ |

### Browser-Specific Notes

**Chrome/Edge:**
- Full PWA support
- Native install prompts
- Service worker updates work perfectly

**Firefox:**
- Service workers work
- No native install prompt (manual instructions only)
- Updates work but no beforeinstallprompt

**Safari (macOS):**
- Service workers work
- Can add to Dock manually
- No beforeinstallprompt event

**Safari (iOS):**
- Limited PWA support
- Must use Share → "Add to Home Screen"
- Service workers work
- No beforeinstallprompt

## Troubleshooting

### Install Prompt Not Showing

**Possible causes:**
1. App doesn't meet PWA criteria
2. User already dismissed (check localStorage)
3. App already installed
4. HTTPS not enabled (required for PWA)
5. Manifest file missing or invalid

**Solutions:**
```typescript
// Check PWA criteria in Chrome DevTools
// Application → Manifest → "Installability"

// Clear dismissal
localStorage.removeItem('install-prompt-dismissed');

// Force show for testing
const FORCE_SHOW_INSTALL_PROMPT = true;
```

### Update Prompt Not Working

**Possible causes:**
1. Service worker not registered
2. No actual code changes
3. Cache-Control headers preventing updates
4. Service worker not in "installed" state

**Solutions:**
```typescript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active SWs:', registrations);
});

// Force update check
navigator.serviceWorker.ready.then(registration => {
  registration.update();
});

// Check for waiting worker
navigator.serviceWorker.ready.then(registration => {
  console.log('Waiting:', registration.waiting);
  console.log('Active:', registration.active);
});
```

### iOS Issues

**Add to Home Screen not working:**
- Must use Safari (not Chrome/Firefox on iOS)
- Requires HTTPS
- Manifest must be valid

**PWA not launching:**
- Check `apple-mobile-web-app-capable` meta tag
- Verify `apple-touch-icon` exists
- Test with `usePWA()` hook

## Best Practices

1. **Always include all three PWA components** in your app root
2. **Test on real devices** - iOS and Android behave differently
3. **Use HTTPS in production** - Required for service workers
4. **Provide offline fallback** - Service worker should cache critical assets
5. **Clear localStorage on major updates** - Prevents stale dismissal state
6. **Monitor service worker lifecycle** - Log states for debugging
7. **Test update flow** - Deploy updates regularly to test

## Example: Complete PWA Setup

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('sw-update-available', {
                  detail: { waiting: newWorker }
                }));
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

```tsx
// App.tsx
import { InstallPrompt } from '@/core/components/pwa/InstallPrompt';
import { PWAUpdatePrompt } from '@/core/components/pwa/PWAUpdatePrompt';
import { usePWA } from '@/core/hooks/usePWA';

function App() {
  const isPWA = usePWA();
  
  return (
    <div>
      <h1>My Scouting App</h1>
      {isPWA && <p>Running as installed app!</p>}
      
      {/* Your app content */}
      
      <InstallPrompt />
      <PWAUpdatePrompt />
    </div>
  );
}

export default App;
```

## Further Reading

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
