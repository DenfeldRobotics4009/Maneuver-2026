# Utility Hooks

This guide covers the **utility** React hooks provided by maneuver-core. These are general-purpose hooks for responsive design, state management, navigation, and keyboard shortcuts.

> For a complete list of all hooks, see [HOOKS_REFERENCE.md](./HOOKS_REFERENCE.md).

## Table of Contents

- [Responsive / Device Detection](#responsive--device-detection)
  - [useIsMobile](#useismobile)
  - [usePWA](#usepwa)
  - [useMediaQuery](#usemediaquery)
- [State Management](#state-management)
  - [useLocalStorage](#uselocalstorage)
  - [useDebounce](#usedebounce)
- [Navigation](#navigation)
  - [useNavigationConfirm](#usenavigationconfirm)
- [Network](#network)
  - [useOnlineStatus](#useonlinestatus)
- [Keyboard](#keyboard)
  - [useKeyboardShortcut](#usekeyboardshortcut)

---

## Responsive / Device Detection

### useIsMobile

Detects if the viewport is below the 2xl breakpoint (1536px).

```tsx
import { useIsMobile } from '@maneuver-core/hooks';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

**Returns:** `boolean` - `true` if viewport < 1536px, `false` otherwise

---

### usePWA

Detects if the app is running as an installed PWA.

```tsx
import { usePWA } from '@maneuver-core/hooks';

function MyComponent() {
  const isPWA = usePWA();
  
  return (
    <div>
      {isPWA ? (
        <p>Running as installed PWA</p>
      ) : (
        <p>Running in browser</p>
      )}
    </div>
  );
}
```

**Returns:** `boolean` - `true` if installed as PWA, `false` otherwise

**Detection methods:**
- Checks `display-mode: standalone` media query
- Checks `display-mode: fullscreen` media query
- Checks `navigator.standalone` (iOS)

---

### useMediaQuery

Generic media query hook for responsive design.

```tsx
import { useMediaQuery, mediaQueries } from '@maneuver-core/hooks';

function MyComponent() {
  // Custom query
  const isWideScreen = useMediaQuery('(min-width: 1920px)');
  
  // Using presets
  const isDarkMode = useMediaQuery(mediaQueries.darkMode);
  const isPortrait = useMediaQuery(mediaQueries.portrait);
  const isRetina = useMediaQuery(mediaQueries.retina);
  
  return <div>Wide screen: {isWideScreen ? 'Yes' : 'No'}</div>;
}
```

**Parameters:**
- `query` (string) - CSS media query string

**Returns:** `boolean` - `true` if query matches, `false` otherwise

**Available presets:**
```typescript
mediaQueries = {
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
}
```

**Convenience hooks:**
```tsx
import { 
  useIsDarkMode, 
  useIsPortrait, 
  useIsRetina,
  usePrefersReducedMotion 
} from '@maneuver-core/hooks';

const isDark = useIsDarkMode();
const isPortrait = useIsPortrait();
const isRetina = useIsRetina();
const prefersReducedMotion = usePrefersReducedMotion();
```

---

## State Management

### useLocalStorage

Persist state to localStorage with automatic JSON serialization.

```tsx
import { useLocalStorage } from '@maneuver-core/hooks';

function MyComponent() {
  const [name, setName, removeName] = useLocalStorage('user-name', 'Anonymous');
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <button onClick={removeName}>Clear</button>
    </div>
  );
}
```

**Parameters:**
- `key` (string) - localStorage key
- `initialValue` (T) - Default value if key doesn't exist

**Returns:** `[T, (value: T | ((val: T) => T)) => void, () => void]`
- `[0]` - Current value
- `[1]` - Set value function (same API as `useState`)
- `[2]` - Remove value function

**Features:**
- Automatic JSON serialization/deserialization
- Syncs across tabs/windows via `storage` event
- SSR-safe (returns initialValue on server)
- Error handling with console warnings

---

### useDebounce

Debounce a value to prevent excessive updates.

```tsx
import { useDebounce } from '@maneuver-core/hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    // This only runs 500ms after user stops typing
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Parameters:**
- `value` (T) - Value to debounce
- `delay` (number) - Delay in milliseconds (default: 500)

**Returns:** `T` - Debounced value

**useDebouncedCallback** - Debounce a callback function:

```tsx
import { useDebouncedCallback } from '@maneuver-core/hooks';

function AutoSaveForm() {
  const debouncedSave = useDebouncedCallback((data) => {
    saveToServer(data);
  }, 1000);
  
  return (
    <textarea onChange={(e) => debouncedSave(e.target.value)} />
  );
}
```

**Use cases:**
- Search inputs
- Form validation
- Auto-save
- Window resize handlers
- API calls

---

## Navigation

### useNavigationConfirm

Prompt user before navigating away with unsaved data.

```tsx
import { useNavigationConfirm } from '@maneuver-core/hooks';

function FormPage() {
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  
  useNavigationConfirm({
    when: hasUnsavedData,
    message: 'You have unsaved changes. Are you sure you want to leave?',
    onConfirm: (message) => {
      // Custom confirmation (optional)
      return confirm(message);
    }
  });
  
  return (
    <form onChange={() => setHasUnsavedData(true)}>
      {/* form fields */}
    </form>
  );
}
```

**Parameters:**
```typescript
interface UseNavigationConfirmOptions {
  when: boolean;           // Whether to block navigation
  message?: string;        // Confirmation message
  onConfirm?: (message: string) => boolean;  // Custom confirm function
}
```

**Returns:**
```typescript
{
  shouldBlock: boolean;                    // Current blocking state
  confirmNavigation: () => boolean;        // Manually prompt user
}
```

**Blocks:**
- React Router navigation (via `useBlocker`)
- Browser navigation (via `beforeunload` event)
- Back button, refresh, closing tab

---

## Network

### useOnlineStatus

Detect online/offline network status (critical for offline-first PWAs).

```tsx
import { useOnlineStatus } from '@maneuver-core/hooks';

function NetworkIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={isOnline ? 'text-green-500' : 'text-red-500'}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

**Returns:** `boolean` - `true` if online, `false` if offline

**useOnlineStatusWithCallback** - With status change callbacks:

```tsx
import { useOnlineStatusWithCallback } from '@maneuver-core/hooks';

function MyComponent() {
  const isOnline = useOnlineStatusWithCallback(
    () => {
      console.log('Connection restored!');
      syncDataToServer();
    },
    () => {
      console.log('Connection lost!');
      showOfflineMessage();
    }
  );
  
  return <div>Status: {isOnline ? 'Online' : 'Offline'}</div>;
}
```

**Parameters:**
- `onOnline` (function) - Called when connection is restored
- `onOffline` (function) - Called when connection is lost

---

## Keyboard

### useKeyboardShortcut

Register keyboard shortcuts for your app.

```tsx
import { useKeyboardShortcut, shortcuts } from '@maneuver-core/hooks';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ctrl+K (or Cmd+K on Mac) to open search
  useKeyboardShortcut(
    () => setIsOpen(true),
    { key: 'k', ctrl: true }
  );
  
  // Escape to close
  useKeyboardShortcut(
    () => setIsOpen(false),
    { key: 'Escape', enabled: isOpen }
  );
  
  // Using presets
  useKeyboardShortcut(
    handleSave,
    shortcuts.save  // Ctrl+S
  );
  
  return <SearchModal open={isOpen} />;
}
```

**Parameters:**
```typescript
interface KeyboardShortcutOptions {
  key: string;               // Key to listen for (e.g., 'k', 'Enter')
  ctrl?: boolean;            // Require Ctrl (Cmd on Mac)
  shift?: boolean;           // Require Shift
  alt?: boolean;             // Require Alt (Option on Mac)
  enabled?: boolean;         // Enable the shortcut (default: true)
  preventDefault?: boolean;  // Prevent default (default: true)
}
```

**Available presets:**
```typescript
shortcuts = {
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
}
```

**Common shortcuts:**
- `Ctrl+K` / `Cmd+K` - Search
- `Ctrl+S` / `Cmd+S` - Save
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo
- `Escape` - Close modal/dialog

---

## Combining Hooks

Many of these hooks work great together:

```tsx
function ScoutingForm() {
  const [formData, setFormData] = useLocalStorage('scouting-form', {});
  const [isDirty, setIsDirty] = useState(false);
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();
  
  // Prompt before leaving with unsaved data
  useNavigationConfirm({
    when: isDirty && isOnline,
    message: 'You have unsaved data. Leave anyway?'
  });
  
  // Ctrl+S to save
  useKeyboardShortcut(
    () => handleSave(formData),
    { key: 's', ctrl: true, enabled: isDirty }
  );
  
  return (
    <form>
      {!isOnline && (
        <div className="bg-yellow-100 p-2">
          Offline mode - data will sync when connected
        </div>
      )}
      {/* form fields */}
    </form>
  );
}
```

---

## Best Practices

1. **useLocalStorage** - Always provide a sensible `initialValue`
2. **useDebounce** - Choose delay based on use case (search: 300-500ms, autosave: 1000-2000ms)
3. **useNavigationConfirm** - Only enable when there's actually unsaved data
4. **useOnlineStatus** - Show clear indicators to users about their connection status
5. **useKeyboardShortcut** - Document shortcuts in your UI (tooltips, help menu)
6. **useMediaQuery** - Use Tailwind CSS classes where possible; hooks for complex logic only

---

**Framework Philosophy:** Hooks should be generic, well-tested, and solve common problems. Game-specific hooks belong in your game implementation, not in the framework.
