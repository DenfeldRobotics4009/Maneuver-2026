import React from 'react';
import { Button } from "@/core/components/ui/button";
import { CheckCircle, Users } from 'lucide-react';

interface AssignmentActionButtonsProps {
  assignmentMode: 'sequential' | 'spatial' | 'manual';
  assignmentsConfirmed: boolean;
  assignmentsLength: number;
  onClearAllAssignments?: () => void;
  onConfirmAssignments?: () => void;
  isMobile?: boolean;
}

export const AssignmentActionButtons: React.FC<AssignmentActionButtonsProps> = ({
  assignmentMode,
  assignmentsConfirmed,
  assignmentsLength,
  onClearAllAssignments,
  onConfirmAssignments,
  isMobile = false
}) => {
  const containerClass = isMobile 
    ? "flex flex-col items-center justify-center gap-4"
    : "flex items-center justify-center gap-2";

  const buttonClass = isMobile 
    ? "text-sm w-full p-4 max-w-sm"
    : "text-sm w-full p-4";

  return (
    <div className={containerClass}>
      {/* Clear/Reset Button */}
      <div className="flex w-full items-center justify-center">
        <Button
          variant="outline"
          onClick={() => {
            if (onClearAllAssignments) {
              onClearAllAssignments();
            }
          }}
          disabled={assignmentsLength === 0 && !assignmentsConfirmed}
          className={buttonClass}
        >
          {assignmentsLength > 0 ? 'Clear All Assignments' : assignmentsConfirmed ? 'Reset Assignments' : 'Clear Selection'}
        </Button>
      </div>

      {/* Confirm Button - only for manual mode when not confirmed */}
      {assignmentMode === 'manual' && onConfirmAssignments && !assignmentsConfirmed && (
        <div className="flex justify-center w-full">
          <Button
            onClick={onConfirmAssignments}
            className={`flex items-center gap-2 ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-sm'}`}
            variant="default"
          >
            {isMobile ? <Users className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            Confirm Assignments ({assignmentsLength} teams)
          </Button>
        </div>
      )}
    </div>
  );
};
