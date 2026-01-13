import React from 'react';
import { Progress } from "@/core/components/ui/progress";
import type { PitAssignment } from '@/core/lib/pitAssignmentTypes';

interface AssignmentProgressBarProps {
  assignments: PitAssignment[];
  className?: string;
}

export const AssignmentProgressBar: React.FC<AssignmentProgressBarProps> = ({
  assignments,
  className = ""
}) => {
  const completedCount = assignments.filter(a => a.completed).length;
  const totalCount = assignments.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">Progress:</span>
        <span>{completedCount} of {totalCount} completed ({percentage}%)</span>
      </div>
      <Progress 
        value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
        className="w-full"
      />
    </div>
  );
};
