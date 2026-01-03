/**
 * EXAMPLE: Game-Specific Pit Scouting Implementation
 * 
 * This is an example of how to implement game-specific pit scouting questions
 * for your FRC game. Copy this pattern to your game implementation repository.
 * 
 * FILE STRUCTURE:
 * src/game/
 * ├── pitScoutingRules.ts              (Define your questions)
 * └── components/
 *     └── GamePitScoutingQuestions.tsx  (Render your questions)
 */

import type { PitScoutingRules, PitScoutingQuestion } from '@/types/game-interfaces';

// =============================================================================
// STEP 1: Define your game-specific pit scouting questions
// =============================================================================

export const examplePitScoutingRules: PitScoutingRules = {
  getGameSpecificQuestions: (): PitScoutingQuestion[] => [
    // Boolean question example
    {
      id: 'canPickupFromGround',
      label: 'Can pick up game pieces from ground?',
      type: 'boolean',
      required: false,
      helperText: 'Does the robot have ground pickup capabilities?'
    },
    
    // Number question example
    {
      id: 'maxAutoPieces',
      label: 'Maximum pieces scored in auto',
      type: 'number',
      placeholder: 'e.g., 3',
      required: false,
      helperText: 'As reported by the team'
    },
    
    // Select question example
    {
      id: 'preferredStartPosition',
      label: 'Preferred starting position',
      type: 'select',
      options: ['Left', 'Center', 'Right', 'Flexible'],
      required: true,
      helperText: 'Where does the team prefer to start?'
    },
    
    // Text question example
    {
      id: 'specialCapabilities',
      label: 'Special capabilities or notes',
      type: 'text',
      placeholder: 'Any unique features...',
      required: false
    },
    
    // Multi-select question example (teams need to implement UI for this)
    {
      id: 'scoringZones',
      label: 'Which scoring zones can they reach?',
      type: 'multiselect',
      options: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
      required: false
    }
  ]
};

// =============================================================================
// STEP 2: Create a component to render your questions
// =============================================================================

/*
// Example implementation (create this in your game repo):
// File: src/game/components/GamePitScoutingQuestions.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Label } from '@/core/components/ui/label';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select';
import { examplePitScoutingRules } from '../pitScoutingRules';

interface GamePitScoutingQuestionsProps {
  gameData: Record<string, unknown> | undefined;
  onGameDataChange: (data: Record<string, unknown>) => void;
}

export function GamePitScoutingQuestions({
  gameData = {},
  onGameDataChange
}: GamePitScoutingQuestionsProps) {
  const questions = examplePitScoutingRules.getGameSpecificQuestions();

  const updateField = (id: string, value: unknown) => {
    onGameDataChange({ ...gameData, [id]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2025 Game-Specific Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {question.label}
              {question.required && <span className="text-destructive"> *</span>}
            </Label>

            {question.type === 'boolean' && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={question.id}
                  checked={gameData[question.id] as boolean ?? false}
                  onCheckedChange={(checked) => updateField(question.id, checked)}
                />
                <label htmlFor={question.id} className="text-sm text-muted-foreground">
                  {question.helperText}
                </label>
              </div>
            )}

            {question.type === 'number' && (
              <>
                <Input
                  id={question.id}
                  type="number"
                  value={(gameData[question.id] as number) ?? ''}
                  onChange={(e) => updateField(question.id, parseInt(e.target.value) || undefined)}
                  placeholder={question.placeholder}
                  required={question.required}
                />
                {question.helperText && (
                  <p className="text-sm text-muted-foreground">{question.helperText}</p>
                )}
              </>
            )}

            {question.type === 'text' && (
              <>
                <Textarea
                  id={question.id}
                  value={(gameData[question.id] as string) ?? ''}
                  onChange={(e) => updateField(question.id, e.target.value || undefined)}
                  placeholder={question.placeholder}
                  required={question.required}
                  rows={3}
                />
                {question.helperText && (
                  <p className="text-sm text-muted-foreground">{question.helperText}</p>
                )}
              </>
            )}

            {question.type === 'select' && (
              <>
                <Select
                  value={(gameData[question.id] as string) ?? 'unspecified'}
                  onValueChange={(value) => 
                    updateField(question.id, value === 'unspecified' ? undefined : value)
                  }
                >
                  <SelectTrigger id={question.id}>
                    <SelectValue placeholder={question.placeholder || 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {!question.required && (
                      <SelectItem value="unspecified">Not specified</SelectItem>
                    )}
                    {question.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {question.helperText && (
                  <p className="text-sm text-muted-foreground">{question.helperText}</p>
                )}
              </>
            )}

            {question.type === 'multiselect' && (
              <>
                <div className="space-y-2">
                  {question.options?.map((option) => {
                    const selectedOptions = (gameData[question.id] as string[]) ?? [];
                    const isChecked = selectedOptions.includes(option);
                    
                    return (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={`${question.id}-${option}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateField(question.id, [...selectedOptions, option]);
                            } else {
                              updateField(
                                question.id,
                                selectedOptions.filter((o) => o !== option)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`${question.id}-${option}`}
                          className="text-sm font-medium"
                        >
                          {option}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {question.helperText && (
                  <p className="text-sm text-muted-foreground">{question.helperText}</p>
                )}
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
*/

// =============================================================================
// STEP 3: Use your component in the pit scouting page
// =============================================================================

/*
// In your App.tsx or custom pit scouting page wrapper:

import { PitScoutingPage } from '@/core/pages/PitScoutingPage';
import { usePitScoutingForm } from '@/core/hooks/usePitScoutingForm';
import { GamePitScoutingQuestions } from './game/components/GamePitScoutingQuestions';

function CustomPitScoutingPage() {
  const { formState, setGameData } = usePitScoutingForm();

  return (
    <PitScoutingPage>
      <GamePitScoutingQuestions
        gameData={formState.gameData}
        onGameDataChange={setGameData}
      />
    </PitScoutingPage>
  );
}

// Then in your routes:
<Route path="/pit-scouting" element={<CustomPitScoutingPage />} />
*/

// =============================================================================
// DATA STORAGE EXAMPLE
// =============================================================================

/*
When saved, the database entry will look like:
{
  id: "pit-3314-2025mrcmp-1234567890-abc123",
  teamNumber: 3314,
  eventKey: "2025mrcmp",
  scoutName: "John Doe",
  timestamp: 1234567890000,
  
  // Universal fields
  robotPhoto: "data:image/jpeg;base64,...",
  weight: 125,
  drivetrain: "swerve",
  programmingLanguage: "Java",
  notes: "Very well-built robot",
  
  // Your game-specific data
  gameData: {
    canPickupFromGround: true,
    maxAutoPieces: 4,
    preferredStartPosition: "Center",
    specialCapabilities: "Can score from any angle",
    scoringZones: ["Zone A", "Zone B", "Zone D"]
  }
}
*/
