/**
 * Team Statistics Hook for Strategy Overview Page
 * 
 * This hook wraps useAllTeamStats and applies Strategy Overview-specific
 * filtering and column visibility logic.
 * 
 * NOTE: This hook NO LONGER calculates stats directly. All calculations
 * are done in game-template/calculations.ts via useAllTeamStats.
 */

import { useMemo } from "react";
import { useAllTeamStats } from "./useAllTeamStats";
import { StrategyConfig, ColumnFilter, TeamData } from "@/core/types/strategy";

export interface UseTeamStatisticsResult {
    teamStats: TeamData[];
    filteredTeamStats: TeamData[];
    isLoading: boolean;
    error: Error | null;
}

export const useTeamStatistics = (
    eventKey: string | undefined,
    config: StrategyConfig,
    columnFilters: Record<string, ColumnFilter>
): UseTeamStatisticsResult => {
    // Get centralized team stats
    const { teamStats: allTeamStats, isLoading, error } = useAllTeamStats(eventKey);

    // Convert TeamStats to TeamData format (for backwards compatibility)
    const teamStats = useMemo(() => {
        return allTeamStats.map(stats => {
            const teamData: TeamData = {
                teamNumber: stats.teamNumber,
                eventKey: stats.eventKey,
                matchCount: stats.matchCount,
            };

            // Map all stats to the TeamData object
            // This allows the existing table/chart code to work without changes
            config.columns.forEach(col => {
                if (["teamNumber", "eventKey", "matchCount"].includes(col.key)) return;

                // Get value from stats using dot notation
                const value = getValueByPath(stats, col.key);
                if (value !== undefined) {
                    teamData[col.key] = value;
                }
            });

            return teamData;
        });
    }, [allTeamStats, config.columns]);

    // Apply column filters
    const filteredTeamStats = useMemo(() => {
        if (Object.keys(columnFilters).length === 0) return teamStats;

        return teamStats.filter(team => {
            return Object.entries(columnFilters).every(([key, filter]) => {
                const val = team[key];
                if (typeof val !== 'number') return true;

                switch (filter.operator) {
                    case ">": return val > filter.value;
                    case ">=": return val >= filter.value;
                    case "<": return val < filter.value;
                    case "<=": return val <= filter.value;
                    case "=": return Math.abs(val - filter.value) < 0.001;
                    case "!=": return Math.abs(val - filter.value) >= 0.001;
                    case "between":
                        return filter.value2 !== undefined
                            ? val >= filter.value && val <= filter.value2
                            : true;
                    default: return true;
                }
            });
        });
    }, [teamStats, columnFilters]);

    return { teamStats, filteredTeamStats, isLoading, error };
};

/**
 * Helper to get nested value from object using dot notation
 */
function getValueByPath(obj: any, path: string): any {
    if (!obj) return undefined;

    // Direct match
    if (obj[path] !== undefined) return obj[path];

    // Dot notation
    if (path.includes('.')) {
        return path.split('.').reduce((o, key) => o?.[key], obj);
    }

    return undefined;
}
