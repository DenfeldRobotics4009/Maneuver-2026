export interface Alliance {
    id: number;
    allianceNumber: number;
    captain: number | null;
    pick1: number | null;
    pick2: number | null;
    pick3: number | null;
}

export interface BackupTeam {
    teamNumber: number;
    rank: number;
}
