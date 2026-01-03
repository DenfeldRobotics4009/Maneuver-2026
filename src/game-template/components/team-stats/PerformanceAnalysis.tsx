import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { ProgressCard } from "@/core/components/team-stats/ProgressCard";
import type { TeamStats } from "@/types/game-interfaces";
import type { RateSectionDefinition, MatchBadgeDefinition } from "@/types/team-stats-display";

interface PerformanceAnalysisProps {
    teamStats: TeamStats;
    compareStats: TeamStats | null;
    rateSections: RateSectionDefinition[];
    matchBadges: MatchBadgeDefinition[];
}

export function PerformanceAnalysis({
    teamStats,
    compareStats,
    rateSections,
    matchBadges
}: PerformanceAnalysisProps) {
    if (teamStats.matchesPlayed === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No performance data available</p>
                </CardContent>
            </Card>
        );
    }

    const sections = rateSections.filter(s => s.tab === 'performance');

    const getStatValue = (stats: TeamStats, key: string): number => {
        const value = (stats as Record<string, unknown>)[key];
        return typeof value === 'number' ? value : 0;
    };

    const renderMatchResults = () => {
        const matchResults = (teamStats as TeamStats & { matchResults?: Record<string, unknown>[] })?.matchResults;
        if (!matchResults || !Array.isArray(matchResults)) {
            return <p className="text-muted-foreground text-center py-4">No match data available</p>;
        }

        return (
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {matchResults.map((match, index: number) => {
                    const eventName = typeof match['eventName'] === 'string' ? match['eventName'] : null;
                    const matchNumber = String(match['matchNumber'] || '');
                    const alliance = String(match['alliance'] || '');
                    const startPos = typeof match['startPosition'] === 'number' ? match['startPosition'] : null;
                    const totalPoints = String(match['totalPoints'] || 0);
                    const autoPoints = String(match['autoPoints'] || 0);
                    const teleopPoints = String(match['teleopPoints'] || 0);
                    const endgamePoints = String(match['endgamePoints'] || 0);
                    const comment = typeof match['comment'] === 'string' ? match['comment'] : "";

                    return (
                        <Card key={index} className="overflow-hidden border-muted-foreground/10">
                            <div className="p-3 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {eventName && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-none">
                                                {eventName}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="font-mono">M{matchNumber}</Badge>
                                        <Badge
                                            variant={alliance.toLowerCase() === "red" ? "destructive" : "default"}
                                            className={alliance.toLowerCase() === "blue" ? "bg-blue-600" : ""}
                                        >
                                            {alliance.toUpperCase()}
                                        </Badge>
                                        {startPos !== null && startPos >= 0 && (
                                            <Badge variant="secondary" className="bg-secondary/50">Pos {startPos}</Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {matchBadges.map(badge => {
                                            const matchValue = match[badge.key];
                                            if (matchValue === badge.showWhen) {
                                                return (
                                                    <Badge key={badge.key} variant={badge.variant} className="text-[10px] h-5 px-1.5">
                                                        {badge.label}
                                                    </Badge>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black">{totalPoints}</span>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">pts</span>
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground flex gap-3">
                                        <span className="bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">A: {autoPoints}</span>
                                        <span className="bg-purple-500/10 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">T: {teleopPoints}</span>
                                        <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400">E: {endgamePoints}</span>
                                    </div>
                                </div>

                                {comment.trim() !== "" && (
                                    <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded border-l-2 border-muted">
                                        "{comment}"
                                    </div>
                                )}

                                <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground mt-1">
                                    View Full Match Data
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sections.map(section => (
                            <div key={section.id} className="space-y-4">
                                {section.rates.map(rate => (
                                    <ProgressCard
                                        key={rate.key}
                                        title={rate.label}
                                        value={getStatValue(teamStats, rate.key)}
                                        compareValue={compareStats ? getStatValue(compareStats, rate.key) : undefined}
                                    />
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Match-by-Match Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderMatchResults()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
