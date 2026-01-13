/**
 * Game-Specific Auto Start Position Selector Component
 * 
 * This component displays the field map with clickable zones for scouts
 * to select starting positions during autonomous mode scouting.
 * 
 * SINGLE SOURCE OF TRUTH: Uses zones and field images from analysis.ts
 * via getStartPositionConfig().
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { InteractiveFieldMap } from "@/game-template/components/shared/InteractiveFieldMap";
import { strategyAnalysis } from "@/game-template/analysis";

interface AutoStartFieldSelectorProps {
  startPosition: (boolean | null)[];
  setStartPosition: ((value: boolean | null) => void)[];
  alliance?: string;
}

/**
 * Auto Start Field Selector
 * 
 * Uses the shared InteractiveFieldMap component with configuration from
 * strategyAnalysis.getStartPositionConfig() for consistent zones and images.
 */
export function AutoStartFieldSelector({
  startPosition,
  setStartPosition,
  alliance,
}: AutoStartFieldSelectorProps) {
  const selectedPosition = startPosition.findIndex(pos => pos === true);
  const hasSelection = startPosition.some(pos => pos === true);

  // Get configuration from the single source of truth
  const config = strategyAnalysis.getStartPositionConfig();

  // Convert setStartPosition to the expected type
  const setStartPoses = setStartPosition.map(setter =>
    (value: boolean) => setter(value)
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 lg:pb-4">
        <CardTitle className="text-xl xl:text-2xl">Starting Position</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click where your robot starts on the field
        </p>
        {hasSelection && (
          <Badge className="w-fit bg-green-600">
            Position {selectedPosition} Selected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="w-full min-h-80 h-80 lg:h-96 xl:h-112 2xl:h-128 border rounded-lg overflow-hidden bg-green-50 dark:bg-green-950/20">
          <InteractiveFieldMap
            startPositions={startPosition}
            setStartPositions={setStartPoses}
            alliance={alliance}
            fieldImageRed={config.fieldImageRed ?? ''}
            fieldImageBlue={config.fieldImageBlue}
            zones={config.zones ?? []}
          />
        </div>
      </CardContent>
    </Card>
  );
}
