/**
 * Match List Card Component
 * 
 * Displays a list of matches with their validation status.
 * Works with MatchListItem which includes TBA data + optional validation results.
 * Shows scouting status for matches without validation.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { MatchListItem } from '@/core/lib/matchValidationTypes';

interface MatchListCardProps {
  results: MatchListItem[];
  filteredResults: MatchListItem[];
  onMatchClick: (match: MatchListItem) => void;
}

export const MatchListCard: React.FC<MatchListCardProps> = ({
  results,
  filteredResults,
  onMatchClick
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Matches ({filteredResults.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No matches loaded yet.</p>
            <p className="text-sm mt-2">Select an event to load matches.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No matches found with the current filters.</p>
            <p className="text-sm mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((match) => {
              const result = match.validationResult;
              const status = result?.status ?? (match.hasScouting ? 'pending' : 'no-scouting');

              return (
                <div
                  key={match.matchKey}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onMatchClick(match)}
                >
                  {/* Match Info */}
                  <div className="flex items-center gap-3 justify-between lg:justify-normal">
                    <span className="font-medium text-lg min-w-[100px]">
                      {match.displayName}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  {/* Discrepancies and Confidence Container */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    {result ? (
                      <>
                        {/* Discrepancies */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.criticalDiscrepancies > 0 && (
                            <Badge variant="destructive">
                              {result.criticalDiscrepancies} critical
                            </Badge>
                          )}
                          {result.warningDiscrepancies > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 border-0">
                              {result.warningDiscrepancies} warnings
                            </Badge>
                          )}
                          {result.criticalDiscrepancies === 0 && result.warningDiscrepancies === 0 && (
                            <span className="text-sm text-muted-foreground">
                              No issues
                            </span>
                          )}
                        </div>

                        {/* Confidence */}
                        <div className="flex items-center gap-2 sm:text-right">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <span className={`font-medium ${result.confidence === 'high' ? 'text-green-600 dark:text-green-400' :
                            result.confidence === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                            {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Scouting Status for unvalidated matches */
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {match.hasScouting
                            ? `Scouted: ${match.redTeamsScouted + match.blueTeamsScouted}/6 teams`
                            : 'Not scouted'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
