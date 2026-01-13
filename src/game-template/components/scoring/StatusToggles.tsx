/**
 * Game-Specific Status Toggles Component
 * 
 * This component provides phase-specific toggle buttons for tracking robot status
 * during autonomous, teleop, and endgame. Teams customize this to match their
 * game's boolean/toggle-based tracking needs.
 * 
 * IMPORTANT: Field names here MUST match transformation.ts!
 * When you customize the toggles, update transformation.ts to handle them.
 * 
 * PLACEHOLDER FIELD MAPPING (current → saved to database):
 * =========================================================
 * 
 * Auto Phase:
 *   - autoToggle → gameData.auto.autoToggle
 * 
 * Teleop Phase:
 *   - teleopToggle → gameData.teleop.teleopToggle
 * 
 * Endgame Phase:
 *   - option1, option2, option3 → gameData.endgame.option1/2/3 (single selection)
 *   - toggle1, toggle2 → gameData.endgame.toggle1/2 (multiple selection)
 * 
 * HOW TO CUSTOMIZE FOR YOUR GAME YEAR:
 * ====================================
 * 
 * 1. Define phase-specific toggles (line crossing, defense, climbing, issues)
 * 2. Create toggle buttons for each status option
 * 3. Update status via onStatusUpdate callback with consistent field names
 * 4. UPDATE transformation.ts to initialize defaults for your field names
 * 5. Group related toggles (e.g., "Climbing" and "Issues" sections)
 * 
 * EXAMPLE: 2025 Reefscape Implementation
 * 
 * StatusToggles fields:
 *   - Auto: leftStartingZone
 *   - Teleop: playedDefense
 *   - Endgame: shallowClimbAttempted, deepClimbAttempted, parkAttempted, climbFailed, brokeDown
 * 
 * transformation.ts matching defaults:
 *   - auto: { leftStartingZone: false }
 *   - teleop: { playedDefense: false }
 *   - endgame: { shallowClimbAttempted: false, deepClimbAttempted: false, ... }
 */

import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface StatusTogglesProps {
  phase: 'auto' | 'teleop' | 'endgame';
  status: any;
  onStatusUpdate: (updates: Partial<any>) => void;
}

/**
 * Default/Placeholder Status Toggles Component
 * 
 * This is a simple placeholder that shows teams where to implement their
 * year-specific status toggles.
 * 
 * Replace this entire component with your game-specific implementation.
 */
export function StatusToggles({
  phase,
  status,
  onStatusUpdate,
}: StatusTogglesProps) {
  return (
    <div className="space-y-4">
      {/* Placeholder Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <h3 className="font-semibold text-sm">Game-Specific Implementation Needed</h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Replace this component with your game year's status toggles.
              See the JSDoc comments in this file for implementation guidance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Autonomous Phase */}
      {phase === 'auto' && (
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm mb-1">Autonomous Status</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Example: Line crossing, taxi points, auto-specific bonuses
            </p>
          </div>
          <Button
            onClick={() => onStatusUpdate({
              autoToggle: !status?.autoToggle
            })}
            variant={status?.autoToggle ? "default" : "outline"}
            className="w-full"
          >
            {status?.autoToggle ? "✓ " : ""}Auto Toggle (e.g., Left Zone, Taxi)
          </Button>
        </div>
      )}

      {/* Teleop Phase */}
      {phase === 'teleop' && (
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm mb-1">Teleop Status</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Example: Defense, positioning, special abilities
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => onStatusUpdate({
                teleopToggle: !status?.teleopToggle
              })}
              variant={status?.teleopToggle ? "default" : "outline"}
              className="w-full"
            >
              {status?.teleopToggle ? "✓ " : ""}Teleop Toggle (e.g., Played Defense)
            </Button>
          </div>
        </div>
      )}

      {/* Endgame Phase */}
      {phase === 'endgame' && (
        <div className="space-y-4">
          {/* Example 1: Radio Button Group (Single Selection) */}
          <div>
            <h3 className="font-medium text-sm mb-1">Section 1: Single Selection</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Example: Climbing levels (2025: Shallow/Deep/Park) or positioning (2024: Stage zones)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'option1', label: 'Option 1 (e.g., Shallow Climb)' },
                { key: 'option2', label: 'Option 2 (e.g., Deep Climb)' },
                { key: 'option3', label: 'Option 3 (e.g., Park)' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => {
                    // Clear all options in this group, then set the selected one
                    onStatusUpdate({
                      option1: false,
                      option2: false,
                      option3: false,
                      [key]: true
                    });
                  }}
                  variant={status?.[key] ? "default" : "outline"}
                >
                  {status?.[key] ? "✓ " : ""}{label}
                </Button>
              ))}
            </div>
          </div>

          {/* Example 2: Independent Toggles (Multiple Selection) */}
          <div>
            <h3 className="font-medium text-sm mb-1">Section 2: Multiple Selection</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Example: Issues (2025: Climb Failed, Broke Down) or bonuses (2024: Harmony, Spotlit)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['toggle1', 'toggle2'].map((key) => {
                const labels = {
                  toggle1: 'Toggle 1 (e.g., Climb Failed)',
                  toggle2: 'Toggle 2 (e.g., Broke Down)'
                };
                return (
                  <Button
                    key={key}
                    onClick={() => onStatusUpdate({ [key]: !status?.[key] })}
                    variant={status?.[key] ? "default" : "outline"}
                  >
                    {status?.[key] ? "✓ " : ""}{labels[key as keyof typeof labels]}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
