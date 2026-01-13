import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { TrendingUp, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { MatchListItem } from '@/core/lib/matchValidationTypes';

interface ValidationSummaryCardProps {
  results: MatchListItem[];
}

export const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({ results }) => {
  // Extract validation results from match list items
  const validatedResults = results
    .map(m => m.validationResult)
    .filter((r): r is NonNullable<typeof r> => r !== null && r !== undefined);

  const totalMatches = validatedResults.length;
  const passedMatches = validatedResults.filter(r => r.status === 'passed').length;
  const flaggedMatches = validatedResults.filter(r => r.status === 'flagged').length;
  const failedMatches = validatedResults.filter(r => r.status === 'failed').length;

  const totalCritical = validatedResults.reduce((sum, r) => sum + r.criticalDiscrepancies, 0);
  const totalWarnings = validatedResults.reduce((sum, r) => sum + r.warningDiscrepancies, 0);

  const avgConfidence = validatedResults.length > 0
    ? validatedResults.filter(r => r.confidence === 'high').length / validatedResults.length
    : 0;

  const confidenceLabel = avgConfidence >= 0.8 ? 'High' : avgConfidence >= 0.5 ? 'Medium' : 'Low';

  const stats = [
    {
      label: 'Total Validated',
      value: totalMatches,
      icon: TrendingUp,
      className: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Passed',
      value: passedMatches,
      icon: CheckCircle2,
      className: 'text-green-600 dark:text-green-400',
      percentage: totalMatches > 0 ? Math.round((passedMatches / totalMatches) * 100) : 0,
    },
    {
      label: 'Flagged',
      value: flaggedMatches,
      icon: AlertTriangle,
      className: 'text-yellow-600 dark:text-yellow-400',
      percentage: totalMatches > 0 ? Math.round((flaggedMatches / totalMatches) * 100) : 0,
    },
    {
      label: 'Failed',
      value: failedMatches,
      icon: XCircle,
      className: 'text-red-600 dark:text-red-400',
      percentage: totalMatches > 0 ? Math.round((failedMatches / totalMatches) * 100) : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Validation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span>{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${stat.className}`}>
                    {stat.value}
                  </div>
                  {stat.percentage !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      ({stat.percentage}%)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Discrepancies</div>
            <div className="text-2xl font-semibold">{totalCritical + totalWarnings}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {totalCritical}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
            <div className={`text-2xl font-semibold ${confidenceLabel === 'High' ? 'text-green-600 dark:text-green-400' :
              confidenceLabel === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
              {confidenceLabel}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
