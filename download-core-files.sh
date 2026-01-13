#!/bin/bash
# Batch download all remaining core files from Maneuver 2025

set -e  # Exit on error

REPO_URL="https://raw.githubusercontent.com/ShinyShips/Maneuver/refs/heads/main"
BASE_DIR="d:/Scouting_App/maneuver-core"

echo "🚀 Starting batch download of core files..."

# UI Components
echo "📦 Downloading UI components..."
UI_COMPONENTS=(
    "sonner"
    "sidebar"
    "collapsible"
    "dialog"
    "input"
    "table"
    "chart"
    "progress"
    "tooltip"
    "separator"
    "alert"
    "select"
    "badge"
    "card"
    "checkbox"
    "dropdown-menu"
    "popover"
    "generic-selector"
)

cd "$BASE_DIR/src/core/components/ui"
for component in "${UI_COMPONENTS[@]}"; do
    if [ ! -f "$component.tsx" ]; then
        echo "  Downloading $component.tsx..."
        curl -s -o "$component.tsx" "$REPO_URL/src/components/ui/$component.tsx" || echo "  ⚠️  $component.tsx not found"
    else
        echo "  ✓ $component.tsx already exists"
    fi
done

# Animate-UI Effects
echo "📦 Downloading animate-ui effects..."
mkdir -p "$BASE_DIR/src/core/components/animate-ui/effects"
cd "$BASE_DIR/src/core/components/animate-ui/effects"
curl -s -o motion-highlight.tsx "$REPO_URL/src/components/animate-ui/effects/motion-highlight.tsx" || echo "  ⚠️  motion-highlight.tsx not found"

# PWA Component
echo "📦 Downloading PWA components..."
cd "$BASE_DIR/src/core/components"
if [ ! -f "PWAUpdatePrompt.tsx" ]; then
    curl -s -o PWAUpdatePrompt.tsx "$REPO_URL/src/components/PWAUpdatePrompt.tsx" || echo "  ⚠️  PWAUpdatePrompt.tsx not found"
fi

# Theme Provider
echo "📦 Downloading theme provider..."
if [ ! -f "theme-provider.tsx" ]; then
    curl -s -o theme-provider.tsx "$REPO_URL/src/components/theme-provider.tsx" || echo "  ⚠️  theme-provider.tsx not found"
fi

# Library Files
echo "📦 Downloading library utilities..."
cd "$BASE_DIR/src/core/lib"
LIB_FILES=(
    "tbaUtils"
    "tbaCache"
    "nexusUtils"
    "spatialClustering"
    "pitAssignmentTypes"
    "scoutGameUtils"
    "pageHelpConfig"
)

for lib in "${LIB_FILES[@]}"; do
    if [ ! -f "$lib.ts" ]; then
        echo "  Downloading $lib.ts..."
        curl -s -o "$lib.ts" "$REPO_URL/src/lib/$lib.ts" || echo "  ⚠️  $lib.ts not found"
    else
        echo "  ✓ $lib.ts already exists"
    fi
done

# Hooks
echo "📦 Downloading hooks..."
cd "$BASE_DIR/src/core/hooks"
HOOK_FILES=(
    "useScoutDashboard"
)

for hook in "${HOOK_FILES[@]}"; do
    if [ ! -f "$hook.ts" ]; then
        echo "  Downloading $hook.ts..."
        curl -s -o "$hook.ts" "$REPO_URL/src/hooks/$hook.ts" || echo "  ⚠️  $hook.ts not found"
    else
        echo "  ✓ $hook.ts already exists"
    fi
done

# Fix all import paths
echo "🔧 Fixing import paths..."
cd "$BASE_DIR"
find src/core -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's|from \x27@/components/|from \x27@/core/components/|g; s|from \x27@/lib/|from \x27@/core/lib/|g; s|from \x27@/hooks/|from \x27@/core/hooks/|g; s|from \x27@/contexts/|from \x27@/core/contexts/|g' {} +

echo "✅ Batch download complete!"
echo "📊 Summary of downloaded files:"
echo "  - UI Components: ${#UI_COMPONENTS[@]}"
echo "  - Library Files: ${#LIB_FILES[@]}"
echo "  - Hooks: ${#HOOK_FILES[@]}"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Check for any remaining errors"
echo "  3. Install missing npm packages if needed"
