import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Separator } from '@/core/components/ui/separator';
import { StatusBadge } from './StatusBadge';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import type { AllianceValidation, Discrepancy } from '@/core/lib/matchValidationTypes';

interface AllianceCardProps {
  allianceValidation: AllianceValidation;
  onRescoutAlliance: (alliance: 'red' | 'blue') => void;
}

export const AllianceCard: React.FC<AllianceCardProps> = ({
  allianceValidation,
  onRescoutAlliance,
}) => {
  const isRed = allianceValidation.alliance === 'red';
  const allianceColor = isRed ? 'bg-red-100 dark:bg-red-950' : 'bg-blue-100 dark:bg-blue-950';
  const allianceBorder = isRed ? 'border-red-300 dark:border-red-800' : 'border-blue-300 dark:border-blue-800';
  const allianceText = isRed ? 'text-red-900 dark:text-red-100' : 'text-blue-900 dark:text-blue-100';

  // Get severity badge variant
  const getSeverityVariant = (severity: Discrepancy['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'minor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`${allianceBorder} border-2`}>
      <CardHeader className={allianceColor}>
        <CardTitle className={`flex items-center justify-between ${allianceText} pt-1`}>
          <span className="capitalize">{allianceValidation.alliance} Alliance</span>
          <div className="flex items-center gap-2">
            <StatusBadge status={allianceValidation.status} size="sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRescoutAlliance(allianceValidation.alliance)}
              className="bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Re-Scout Alliance
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Score Comparison */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Scouted Score:</span>
            <span className="font-bold text-lg">{allianceValidation.totalScoutedPoints}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">TBA Score:</span>
            <span className="font-bold text-lg">{allianceValidation.totalTBAPoints}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Difference:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${Math.abs(allianceValidation.scoreDifference) > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {allianceValidation.scoreDifference > 0 ? '+' : ''}{allianceValidation.scoreDifference}
              </span>
              <span className="text-xs text-muted-foreground">
                ({allianceValidation.scorePercentDiff.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <Badge variant={
            allianceValidation.confidence === 'high' ? 'default' :
              allianceValidation.confidence === 'medium' ? 'secondary' : 'destructive'
          }>
            {allianceValidation.confidence.toUpperCase()}
          </Badge>
        </div>

        {/* Discrepancies Summary */}
        <div className="space-y-1">
          <span className="text-sm font-medium">Discrepancies:</span>
          {allianceValidation.discrepancies.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>No discrepancies found</span>
            </div>
          ) : (
            <div className="space-y-1">
              {['critical', 'warning', 'minor'].map(severity => {
                const count = allianceValidation.discrepancies.filter(d => d.severity === severity).length;
                if (count === 0) return null;
                return (
                  <div key={severity} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{severity}:</span>
                    <Badge variant={getSeverityVariant(severity as Discrepancy['severity'])} className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
