import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { FileText } from "lucide-react";

interface AdditionalNotesProps {
  notes?: string;
  onNotesChange: (value: string | undefined) => void;
}

export function AdditionalNotes({
  notes,
  onNotesChange,
}: AdditionalNotesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Additional Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="notes">
          General Observations
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional observations about the robot, team, or strategy..."
          value={notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value || undefined)}
          rows={6}
          className="text-lg resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Optional: Any notable observations, capabilities, or concerns about the robot
        </p>
      </CardContent>
    </Card>
  );
}
