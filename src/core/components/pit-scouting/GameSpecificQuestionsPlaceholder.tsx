import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Info, Code } from "lucide-react";

/**
 * Placeholder component for game-specific pit scouting questions
 * This was created so developers can easily create questions, but this does not have to be used.
 * 
 * HOW TO EXTEND PIT SCOUTING FOR YOUR GAME:
 * ========================================
 * 
 * 1. In your game implementation (e.g., maneuver-2025), create a PitScoutingRules implementation:
 * 
 *    ```typescript
 *    // src/game/pitScoutingRules.ts
 *    import type { PitScoutingRules, PitScoutingQuestion } from '@/types/game-interfaces';
 *    
 *    export const pitScoutingRules: PitScoutingRules = {
 *      getGameSpecificQuestions: () => [
 *        {
 *          id: 'canPickupCoral',
 *          label: 'Can pick up coral from ground?',
 *          type: 'boolean',
 *          required: false
 *        },
 *        {
 *          id: 'maxAutoL4',
 *          label: 'How many L4 pieces in auto?',
 *          type: 'number',
 *          placeholder: 'e.g., 3'
 *        },
 *        {
 *          id: 'preferredStartingPosition',
 *          label: 'Preferred starting position',
 *          type: 'select',
 *          options: ['Left', 'Center', 'Right'],
 *          required: true
 *        }
 *      ]
 *    };
 *    ```
 * 
 * 2. Create a component to render your questions:
 * 
 *    ```typescript
 *    // src/game/components/GamePitScoutingQuestions.tsx
 *    import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
 *    import { Label } from '@/core/components/ui/label';
 *    import { Checkbox } from '@/core/components/ui/checkbox';
 *    import { Input } from '@/core/components/ui/input';
 *    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
 *    import { pitScoutingRules } from '../pitScoutingRules';
 *    
 *    interface Props {
 *      gameData: Record<string, unknown> | undefined;
 *      onGameDataChange: (data: Record<string, unknown>) => void;
 *    }
 *    
 *    export function GamePitScoutingQuestions({ gameData = {}, onGameDataChange }: Props) {
 *      const questions = pitScoutingRules.getGameSpecificQuestions();
 *      
 *      const updateField = (id: string, value: unknown) => {
 *        onGameDataChange({ ...gameData, [id]: value });
 *      };
 *      
 *      return (
 *        <Card>
 *          <CardHeader>
 *            <CardTitle>2025 Game-Specific Questions</CardTitle>
 *          </CardHeader>
 *          <CardContent className="space-y-4">
 *            {questions.map((q) => (
 *              <div key={q.id} className="space-y-2">
 *                <Label>{q.label} {q.required && '*'}</Label>
 *                {q.type === 'boolean' && (
 *                  <Checkbox
 *                    checked={gameData[q.id] as boolean}
 *                    onCheckedChange={(checked) => updateField(q.id, checked)}
 *                  />
 *                )}
 *                {q.type === 'number' && (
 *                  <Input
 *                    type="number"
 *                    value={gameData[q.id] as number ?? ''}
 *                    onChange={(e) => updateField(q.id, parseInt(e.target.value))}
 *                    placeholder={q.placeholder}
 *                  />
 *                )}
 *                {q.type === 'select' && (
 *                  <Select
 *                    value={gameData[q.id] as string}
 *                    onValueChange={(value) => updateField(q.id, value)}
 *                  >
 *                    <SelectTrigger>
 *                      <SelectValue placeholder={q.placeholder || 'Select...'} />
 *                    </SelectTrigger>
 *                    <SelectContent>
 *                      {q.options?.map((opt) => (
 *                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
 *                      ))}
 *                    </SelectContent>
 *                  </Select>
 *                )}
 *              </div>
 *            ))}
 *          </CardContent>
 *        </Card>
 *      );
 *    }
 *    ```
 * 
 * 3. Use your component in PitScoutingPage:
 * 
 *    ```typescript
 *    // src/App.tsx or wherever you define the pit scouting route
 *    import { PitScoutingPage } from '@/core/pages/PitScoutingPage';
 *    import { GamePitScoutingQuestions } from './game/components/GamePitScoutingQuestions';
 *    import { usePitScoutingForm } from '@/core/hooks/usePitScoutingForm';
 *    
 *    function PitScoutingPageWithGame() {
 *      const { formState, setGameData } = usePitScoutingForm();
 *      
 *      return (
 *        <PitScoutingPage>
 *          <GamePitScoutingQuestions
 *            gameData={formState.gameData}
 *            onGameDataChange={setGameData}
 *          />
 *        </PitScoutingPage>
 *      );
 *    }
 *    ```
 * 
 * 4. Your game-specific data is automatically saved to the `gameData` field in the database!
 * 
 * AVAILABLE QUESTION TYPES:
 * - 'boolean' - Checkbox
 * - 'text' - Text input
 * - 'number' - Number input
 * - 'select' - Dropdown with options
 * - 'multiselect' - Multiple selections (you'll need to implement the UI)
 * 
 * DATA STORAGE:
 * All game-specific questions are stored in the `gameData` object:
 * {
 *   id: "pit-3314-2025mrcmp-...",
 *   teamNumber: 3314,
 *   eventKey: "2025mrcmp",
 *   // ... universal fields ...
 *   gameData: {
 *     canPickupCoral: true,
 *     maxAutoL4: 3,
 *     preferredStartingPosition: "Center"
 *   }
 * }
 */

export function GameSpecificQuestionsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Game-Specific Questions (Placeholder)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>For game implementers:</strong> This is a placeholder component.
            Replace this with your own game-specific pit scouting questions by:
            <ol className="mt-2 ml-4 space-y-1 list-decimal">
              <li>Creating a <code className="text-xs bg-muted px-1 py-0.5 rounded">PitScoutingRules</code> implementation or build your own custom solution</li>
              <li>Building a component to render your questions</li>
              <li>Passing it as children to <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;PitScoutingPage&gt;</code></li>
            </ol>
            <p className="mt-2 text-sm text-muted-foreground">
              See the JSDoc comments in this file for a complete implementation guide.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
