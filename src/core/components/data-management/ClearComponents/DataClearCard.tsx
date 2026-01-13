import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DataClearCardProps {
  title: string;
  description: string;
  entryCount: number;
  entryLabel: string; // e.g., "entries", "matches"
  storageSize: string;
  onClear: () => Promise<void> | void;
  disabled?: boolean;
  warningMessage?: string;
}

export const DataClearCard = ({
  title,
  description,
  entryCount,
  entryLabel,
  storageSize,
  onClear,
  disabled = false,
  warningMessage
}: DataClearCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    try {
      await onClear();
      setShowConfirm(false);
    } catch (error) {
      console.error(`Error clearing ${title}:`, error);
      setShowConfirm(false);
    }
  };

  const hasData = entryCount > 0;
  const isDisabled = disabled || !hasData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={hasData ? "default" : "secondary"}>
            {entryCount} {entryLabel}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Storage size:</span> {storageSize}
        </p>

        {!showConfirm ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowConfirm(true)}
            disabled={isDisabled}
          >
            {!hasData ? `No ${title}` : `Clear ${title}`}
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-5 w-5" color="red"/>
              <AlertDescription>
                {warningMessage || `This will permanently delete ${entryCount} ${entryLabel}.`}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleClear}
              >
                Yes, Delete All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
