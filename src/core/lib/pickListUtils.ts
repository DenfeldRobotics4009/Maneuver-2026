/**
 * Pick List Utilities
 * 
 * Helper functions for pick list management.
 * These are year-agnostic utility functions.
 */

import type { PickList, PickListItem } from '@/core/types/pickListTypes';
import type { TeamStats } from '@/core/types/team-stats';

/**
 * Filter teams based on search text (team number)
 */
export const filterTeams = (teams: TeamStats[], searchFilter: string): TeamStats[] => {
    if (!searchFilter.trim()) return teams;
    return teams.filter(team =>
        String(team.teamNumber).toLowerCase().includes(searchFilter.toLowerCase())
    );
};

/**
 * Check if a team is already in a pick list
 */
export const isTeamInList = (teamNumber: number, pickList: PickList): boolean => {
    return pickList.teams.some(t => t.teamNumber === teamNumber);
};

/**
 * Create a new pick list item from a team
 */
export const createPickListItem = (teamNumber: number): PickListItem => {
    return {
        id: Date.now() + Math.random(),
        text: `Team ${teamNumber}`,
        teamNumber,
        checked: false,
    };
};

/**
 * Create default alliances (8 alliances with empty slots)
 */
export const createDefaultAlliances = () => {
    return Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        allianceNumber: i + 1,
        captain: null as number | null,
        pick1: null as number | null,
        pick2: null as number | null,
        pick3: null as number | null,
    }));
};

/**
 * Create a default pick list
 */
export const createDefaultPickList = (): PickList => ({
    id: 1,
    name: "Primary Pick List",
    description: "Main alliance selection priority",
    teams: [],
});
