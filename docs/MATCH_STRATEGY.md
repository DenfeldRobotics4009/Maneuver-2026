# Field Canvas Configuration System

## Overview

The Field Canvas system provides a multi-layer canvas for drawing match strategies on top of the FRC field image. It supports dynamic image scaling, configurable team number overlays, and works across all screen sizes.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Implementation Details](#implementation-details)
- [Updating for New Game Years](#updating-for-new-game-years)
- [Common Use Cases](#common-use-cases)
- [Best Practices](#best-practices)

---

## Core Concepts

### What Problem Does This Solve?

During match strategy sessions, teams need to:

1. **Visualize Plays**: Draw robot paths and strategies on the field
2. **Identify Positions**: See which robots start where
3. **Plan Phases**: Separate strategies for autonomous, teleop, and endgame

### The Three-Layer Canvas Architecture

| Layer | Purpose | Updated When |
|-------|---------|--------------|
| **Background** | Field image (static artwork) | Image loads |
| **Overlay** | Team numbers positioned on field | Teams change |
| **Drawing** | User's pen strokes and annotations | User draws |

**Why layers?**
- Erasing only affects drawings (not the field or team numbers)
- Team numbers update without redrawing the field
- Each layer can be saved/restored independently

---

## Architecture

### File Structure

```
src/
├── game-template/
│   ├── assets/
│   │   └── field.png                      # Field image for current game
│   │
│   └── match-strategy-config.ts           # Configuration (team positions)
│
├── core/
│   ├── components/
│   │   └── MatchStrategy/
│   │       ├── FieldCanvas.tsx            # Main canvas component
│   │       ├── FieldStrategy.tsx          # Wrapper with phase tabs
│   │       ├── FieldCanvasHeader.tsx      # Header with controls
│   │       └── DrawingControls.tsx        # Brush/eraser controls
│   │
│   ├── hooks/
│   │   ├── useCanvasSetup.ts              # Canvas initialization
│   │   └── useCanvasDrawing.ts            # Drawing logic + undo
│   │
│   └── lib/
│       ├── canvasConstants.ts             # Reads config, provides constants
│       └── canvasUtils.ts                 # Drawing utilities
```

### Component Hierarchy

```
MatchStrategyPage
│
└─ FieldStrategy
   │
   ├─ TabsList (Autonomous / Teleop / Endgame)
   │
   └─ FieldCanvas (one per tab)
      ├─ DrawingControls (brush, eraser, color, undo)
      │
      └─ Canvas Stack
         ├─ backgroundCanvas (field.png)
         ├─ overlayCanvas (team numbers)
         └─ drawingCanvas (user strokes)
```

### Data Flow

#### Canvas Initialization
```
Component Mounts
     ↓
useCanvasSetup Hook Called
     ↓
Load field.png from Assets
     ↓
Calculate Aspect Ratio (img.width / img.height)
     ↓
Fit Canvas to Container (preserve ratio)
     ↓
Set All 3 Canvas Layers to Same Dimensions
     ↓
Draw Field Image on Background Layer
     ↓
Draw Team Numbers on Overlay Layer
     ↓
Load Saved Drawings (if any) on Drawing Layer
     ↓
Notify Parent: Canvas Ready!
```

#### Drawing Flow
```
User Starts Drawing (mousedown/pointerdown)
     ↓
Capture Pointer (prevents scrolling)
     ↓
Track Points (mousemove/pointermove)
     ↓
Draw Lines on Drawing Canvas
     ↓
User Stops Drawing (mouseup/pointerup)
     ↓
Save State to History (for undo)
     ↓
Auto-Save to localStorage
```

---

## Configuration

### Where to Configure: `match-strategy-config.ts`

All field layout settings live in one place:

```typescript
// src/game-template/match-strategy-config.ts

export const matchStrategyConfig: {
    phases: MatchStrategyPhaseConfig[];
    fieldLayout?: {
        TEAM_LABEL_FONT_SIZE_RATIO: number;
        BLUE_ALLIANCE_X_POSITION: number;
        RED_ALLIANCE_X_POSITION: number;
        TEAM_POSITION_TOP_Y: number;
        TEAM_POSITION_MIDDLE_Y: number;
        TEAM_POSITION_BOTTOM_Y: number;
    };
} = {
    phases: [/* ... phase config ... */],
    
    fieldLayout: {
        TEAM_LABEL_FONT_SIZE_RATIO: 0.02,
        BLUE_ALLIANCE_X_POSITION: 0.03,
        RED_ALLIANCE_X_POSITION: 0.97,
        TEAM_POSITION_TOP_Y: 0.275,
        TEAM_POSITION_MIDDLE_Y: 0.505,
        TEAM_POSITION_BOTTOM_Y: 0.735,
    }
};
```

### Configuration Options Explained

| Setting | Type | Description | Example |
|---------|------|-------------|---------|
| `TEAM_LABEL_FONT_SIZE_RATIO` | `number` | Font size as percentage of canvas width | `0.02` = 2% of width |
| `BLUE_ALLIANCE_X_POSITION` | `number` | Horizontal position of blue team labels (0 = left, 1 = right) | `0.03` = 3% from left |
| `RED_ALLIANCE_X_POSITION` | `number` | Horizontal position of red team labels | `0.97` = 97% from left |
| `TEAM_POSITION_TOP_Y` | `number` | Vertical position of first robot | `0.275` = 27.5% from top |
| `TEAM_POSITION_MIDDLE_Y` | `number` | Vertical position of second robot | `0.505` = center |
| `TEAM_POSITION_BOTTOM_Y` | `number` | Vertical position of third robot | `0.735` = 73.5% from top |

### Why Percentages (0 to 1)?

**Problem:** Different devices have different screen sizes. Fixed pixel positions would be wrong on most screens.

**Solution:** Use relative percentages that work at any size.

```typescript
// Example: 0.03 means "3% from the left edge"
const blueX = canvasWidth * 0.03;  // Works on 400px canvas → 12px
                                    // Works on 1200px canvas → 36px
                                    // Always proportionally correct!
```

### How Constants Are Read

```typescript
// src/core/lib/canvasConstants.ts

import { matchStrategyConfig } from "@/game-template/match-strategy-config";

export const CANVAS_CONSTANTS = {
    // Read from config with fallback defaults
    TEAM_LABEL_FONT_SIZE_RATIO: 
        matchStrategyConfig.fieldLayout?.TEAM_LABEL_FONT_SIZE_RATIO ?? 0.02,
    
    BLUE_ALLIANCE_X_POSITION: 
        matchStrategyConfig.fieldLayout?.BLUE_ALLIANCE_X_POSITION ?? 0.03,
    
    // ... etc
    
    // UI constants (not game-specific)
    MOBILE_RESERVED_WIDTH_FOR_CONTROLS: 160,
    DESKTOP_RESERVED_HEIGHT_BASE: 180,
};
```

**Why the `?? 0.02` fallback?**
- If `fieldLayout` is missing, use sensible defaults
- Prevents crashes if config is incomplete
- Makes configuration optional (works out of the box)

---

## Implementation Details

### Dynamic Image Scaling Algorithm

**Problem:** Field images come in different sizes (800x400, 4000x2000, etc.). How do we fit them to any screen?

**Solution:** Calculate aspect ratio and fit to container.

```typescript
// src/core/hooks/useCanvasSetup.ts

const img = new Image();
img.onload = () => {
    // Step 1: Get image's natural dimensions
    const imgAspectRatio = img.width / img.height;
    // Example: 1200x600 image → ratio = 2.0 (twice as wide as tall)
    
    // Step 2: Get container dimensions
    const containerAspectRatio = containerWidth / containerHeight;
    // Example: 800x500 container → ratio = 1.6
    
    // Step 3: Compare ratios to determine limiting dimension
    let canvasWidth, canvasHeight;
    
    if (imgAspectRatio > containerAspectRatio) {
        // Image is "wider" than container
        // Limit by width, calculate height
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imgAspectRatio;
    } else {
        // Image is "taller" than container
        // Limit by height, calculate width
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imgAspectRatio;
    }
    
    // Step 4: Apply to all canvas layers
    [bgCanvas, overlayCanvas, drawingCanvas].forEach(canvas => {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });
};
```

**Time Complexity:** O(1) - simple math operations
**Space Complexity:** O(1) - no additional data structures

### Team Number Drawing Algorithm

```typescript
// src/core/lib/canvasUtils.ts

export const drawTeamNumbers = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    selectedTeams: string[]
) => {
    // Need exactly 6 teams (3 red + 3 blue)
    if (!selectedTeams || selectedTeams.length !== 6) return;
    
    const {
        TEAM_LABEL_FONT_SIZE_RATIO,
        BLUE_ALLIANCE_X_POSITION,
        RED_ALLIANCE_X_POSITION,
        TEAM_POSITION_TOP_Y,
        TEAM_POSITION_MIDDLE_Y,
        TEAM_POSITION_BOTTOM_Y
    } = CANVAS_CONSTANTS;
    
    // Calculate font size based on canvas width
    const fontSize = Math.floor(width * TEAM_LABEL_FONT_SIZE_RATIO);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Blue alliance (left side) - teams at indices 3, 4, 5
    const blueX = width * BLUE_ALLIANCE_X_POSITION;
    const blueTeams = [
        { team: selectedTeams[3], y: height * TEAM_POSITION_TOP_Y },
        { team: selectedTeams[4], y: height * TEAM_POSITION_MIDDLE_Y },
        { team: selectedTeams[5], y: height * TEAM_POSITION_BOTTOM_Y },
    ];
    
    blueTeams.forEach(({ team, y }) => {
        if (team && team !== 'none') {
            ctx.save();
            ctx.translate(blueX, y);
            ctx.rotate(Math.PI / 2);  // Rotate 90° for readability
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.strokeText(team, 0, 0);  // Black outline
            ctx.fillText(team, 0, 0);    // White fill
            ctx.restore();
        }
    });
    
    // Red alliance (right side) - similar logic, opposite rotation
    // ... (mirrored for red teams at indices 0, 1, 2)
};
```

### Undo System

**Problem:** Users make mistakes and need to undo strokes.

**Solution:** History stack with canvas snapshots.

```typescript
// src/core/hooks/useCanvasDrawing.ts

// History stores canvas states AFTER each stroke
const historyRef = useRef<string[]>([]);
const historyIndexRef = useRef(0);

// Save state after stroke completes
const saveToHistory = useCallback(() => {
    const dataURL = canvas.toDataURL();  // Snapshot as PNG
    
    // Truncate any "redo" states if we're not at the end
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new state
    historyRef.current.push(dataURL);
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history to prevent memory issues
    if (historyRef.current.length > 20) {
        historyRef.current.shift();  // Remove oldest
        historyIndexRef.current--;
    }
}, [canvasRef]);

// Undo: go back to previous state
const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;  // Nothing to undo
    
    historyIndexRef.current--;
    const previousState = historyRef.current[historyIndexRef.current];
    
    // Load previous snapshot
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = previousState;
}, [canvasRef]);
```

**Memory Management:**
- Maximum 20 history states (configurable)
- Each state is a data URL (~KB to ~MB depending on content)
- Old states automatically dropped

---

## Updating for New Game Years

### Step 1: Replace the Field Image

**Location:** `src/game-template/assets/field.png`

**Requirements:**
- Any resolution works (system auto-scales)
- PNG format recommended (transparency supported)
- Higher resolution = sharper on large screens

**Action:**
```bash
# Simply replace the file
cp ~/Downloads/2027-field.png src/game-template/assets/field.png
```

### Step 2: Adjust Team Positions (If Needed)

**When to adjust:**
- Driver stations move (different edges of field)
- Starting positions change
- Field orientation differs

**Example: Vertical Field Layout**
```typescript
// Driver stations on top and bottom instead of left and right
fieldLayout: {
    TEAM_LABEL_FONT_SIZE_RATIO: 0.02,
    
    // Both alliances on same X positions (spread horizontally)
    BLUE_ALLIANCE_X_POSITION: 0.25,  // Left third
    RED_ALLIANCE_X_POSITION: 0.75,   // Right third
    
    // Blue at top, red at bottom
    TEAM_POSITION_TOP_Y: 0.1,    // Near top edge
    TEAM_POSITION_MIDDLE_Y: 0.5,
    TEAM_POSITION_BOTTOM_Y: 0.9, // Near bottom edge
}
```

### Step 3: Test

1. Run the app: `npm run dev`
2. Navigate to Match Strategy page
3. Select 6 teams (any teams work for testing)
4. Verify team numbers appear in correct positions
5. Test on different screen sizes (resize browser)
6. Test fullscreen mode

---

## Common Use Cases

### Use Case 1: Pre-Match Strategy Planning

**Scenario:** Drive team wants to plan autonomous routes

**Workflow:**
1. Open Match Strategy page
2. Enter match number to auto-populate teams
3. Switch to "Autonomous" tab
4. Draw planned robot paths on field
5. Switch to "Teleop" tab for next phase
6. Save screenshot for reference

**Why it works:**
- Three separate canvases for three phases
- Team numbers show starting positions
- Drawings persist in localStorage

### Use Case 2: Alliance Strategy Meeting

**Scenario:** Team captains planning playoff strategy

**Workflow:**
1. Use fullscreen mode for bigger view
2. All three teams discuss while drawing
3. Use different colors for different robots
4. Save combined strategy image
5. Share via airdrop/messages

**Why fullscreen?**
- Maximum canvas size for detailed drawings
- Stage switching with keyboard arrows (←→)
- Less distraction from UI elements

### Use Case 3: New Season Setup

**Scenario:** FIRST releases new game in January

**Workflow:**
1. Download official field image
2. Replace `field.png` in assets folder
3. Check if driver stations moved
4. If yes: update `fieldLayout` in config
5. Test with sample teams
6. Ship update to team

**Time required:** 5-15 minutes

---

## Best Practices

### For Users

**DO:**
- ✅ Use different colors for different robots
- ✅ Use the eraser brush (set to large) for major corrections
- ✅ Use undo (Ctrl+Z) for quick fixes
- ✅ Save images before clearing
- ✅ Use fullscreen on tablets for maximum drawing space

**DON'T:**
- ❌ Draw outside the field (strokes will be cut off)
- ❌ Rely on localStorage forever (export important strategies)
- ❌ Forget to test on target devices before competition

### For Developers

**DO:**
- ✅ Test configuration changes visually before committing
- ✅ Use percentage-based positions (not pixels)
- ✅ Keep fallback defaults in `canvasConstants.ts`
- ✅ Test with extreme aspect ratio images

**DON'T:**
- ❌ Hardcode positions in component code
- ❌ Assume specific image dimensions
- ❌ Skip mobile testing (touch events differ)

### For Contributors

**Key files to understand:**
1. `match-strategy-config.ts` - Configuration
2. `useCanvasSetup.ts` - Initialization logic
3. `useCanvasDrawing.ts` - Drawing and undo logic
4. `canvasUtils.ts` - Team number overlays

**Common gotchas:**
1. Canvas coordinates use top-left as origin (0,0)
2. Drawing layer uses `globalCompositeOperation` for erasing
3. History is stored as data URLs (can be large)
4. Pointer capture is essential for mobile drawing
