import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatCard } from "@/core/components/team-stats/StatCard";
import type { TeamStats } from "@/types/game-interfaces";
import type { StartPositionConfig } from "@/types/team-stats-display";

interface AutoAnalysisProps {
    teamStats: TeamStats;
    compareStats: TeamStats | null;
    startPositionConfig: StartPositionConfig;
}

export function AutoAnalysis({
    teamStats,
    compareStats,
    startPositionConfig
}: AutoAnalysisProps) {
    if (teamStats.matchesPlayed === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No autonomous data available</p>
                </CardContent>
            </Card>
        );
    }

    const startPositions = (teamStats as TeamStats & { startPositions?: Record<string, number> })?.startPositions;

    const renderStartPositions = () => {
        if (!startPositions) {
            return <p className="text-muted-foreground text-center py-4">No position data available</p>;
        }

        return (
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: startPositionConfig.positionCount }).map((_, index) => {
                    const label = startPositionConfig.positionLabels?.[index] || `Position ${index}`;
                    const color = startPositionConfig.positionColors?.[index] || 'blue';
                    const value = startPositions[`position${index}`] || 0;
                    const compareValue = (compareStats as TeamStats & { startPositions?: Record<string, number> })?.startPositions?.[`position${index}`];

                    return (
                        <StatCard
                            key={index}
                            title={label}
                            value={value}
                            subtitle="% of matches"
                            color={color as 'default' | 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow'}
                            compareValue={compareValue}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Field visualization placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Starting Position Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {startPositionConfig.fieldImage ? (
                            <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img
                                    src={startPositionConfig.fieldImage}
                                    alt="Field"
                                    className="w-full h-full object-contain"
                                />
                                {/* Position markers could be overlaid here in a future update */}
                            </div>
                        ) : (
                            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Field visualization placeholder</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Position Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderStartPositions()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
