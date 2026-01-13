/**
 * Team Stats Headers Component
 * 
 * Displays aggregate stats summary for an alliance (sum of all 3 teams).
 * Used in the AllianceCard header.
 */

import type { TeamStats } from "@/core/types/team-stats";

interface TeamStatsHeadersProps {
    alliance: 'red' | 'blue';
    activeStatsTab: string;
    selectedTeams: (number | null)[];
    getTeamStats: (teamNumber: number | null) => TeamStats | null;
}

export const TeamStatsHeaders = ({
    alliance,
    activeStatsTab,
    selectedTeams,
    getTeamStats
}: TeamStatsHeadersProps) => {
    const isBlue = alliance === 'blue';
    const startIndex = isBlue ? 3 : 0;

    // Get stats for all 3 teams in this alliance
    const team1Stats = getTeamStats(selectedTeams[startIndex] ?? null);
    const team2Stats = getTeamStats(selectedTeams[startIndex + 1] ?? null);
    const team3Stats = getTeamStats(selectedTeams[startIndex + 2] ?? null);

    // Calculate alliance totals based on active tab
    let totalValue = 0;
    let label = "";

    if (activeStatsTab === 'overall') {
        totalValue = (team1Stats?.overall.avgTotalPoints || 0) +
            (team2Stats?.overall.avgTotalPoints || 0) +
            (team3Stats?.overall.avgTotalPoints || 0);
        label = "Total Points";
    } else if (activeStatsTab === 'auto') {
        totalValue = (team1Stats?.auto.avgPoints || 0) +
            (team2Stats?.auto.avgPoints || 0) +
            (team3Stats?.auto.avgPoints || 0);
        label = "Auto Points";
    } else if (activeStatsTab === 'teleop') {
        totalValue = (team1Stats?.teleop.avgPoints || 0) +
            (team2Stats?.teleop.avgPoints || 0) +
            (team3Stats?.teleop.avgPoints || 0);
        label = "Teleop Points";
    } else if (activeStatsTab === 'endgame') {
        totalValue = (team1Stats?.endgame.avgPoints || 0) +
            (team2Stats?.endgame.avgPoints || 0) +
            (team3Stats?.endgame.avgPoints || 0);
        label = "Endgame Points";
    }

    const roundedValue = Math.round(totalValue * 10) / 10;

    return (
        <div className="text-sm text-muted-foreground">
            <span className="font-medium">{label}:</span> {roundedValue}
        </div>
    );
};
