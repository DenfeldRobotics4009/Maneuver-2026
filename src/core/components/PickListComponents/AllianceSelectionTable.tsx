/**
 * Alliance Selection Table Component
 * 
 * Combines AllianceInitializer, AllianceTable, and BackupTeamsSection.
 * Matches 2025 styling.
 */

import { toast } from "sonner";
import { AllianceInitializer } from "./AllianceInitializer";
import { AllianceTable } from "./AllianceTable";
import { BackupTeamsSection } from "./BackupTeamsSection";
import type { Alliance, BackupTeam } from "@/core/lib/allianceTypes";
import type { TeamStats } from "@/core/types/team-stats";

interface AllianceSelectionTableProps {
    alliances: Alliance[];
    backups: BackupTeam[];
    availableTeams: TeamStats[];
    onUpdateAlliances: (alliances: Alliance[]) => void;
    onUpdateBackups: (backups: BackupTeam[]) => void;
}

export const AllianceSelectionTable = ({
    alliances,
    backups,
    availableTeams,
    onUpdateAlliances,
    onUpdateBackups
}: AllianceSelectionTableProps) => {
    // Get all teams that are already selected
    const getSelectedTeams = (): number[] => {
        const selectedTeams: number[] = [];
        alliances.forEach(alliance => {
            if (alliance.captain) selectedTeams.push(alliance.captain);
            if (alliance.pick1) selectedTeams.push(alliance.pick1);
            if (alliance.pick2) selectedTeams.push(alliance.pick2);
            if (alliance.pick3) selectedTeams.push(alliance.pick3);
        });
        backups.forEach(backup => {
            if (backup.teamNumber) selectedTeams.push(backup.teamNumber);
        });
        return selectedTeams;
    };

    // Update a team in an alliance
    const updateAllianceTeam = (allianceId: number, position: 'captain' | 'pick1' | 'pick2' | 'pick3', teamNumber: number | null) => {
        const updatedAlliances = alliances.map(alliance => {
            if (alliance.id === allianceId) {
                return { ...alliance, [position]: teamNumber };
            }
            return alliance;
        });
        onUpdateAlliances(updatedAlliances);
    };

    // Remove a team from an alliance
    const removeAllianceTeam = (allianceId: number, position: 'captain' | 'pick1' | 'pick2' | 'pick3') => {
        updateAllianceTeam(allianceId, position, null);
    };

    // Add a new alliance
    const addAlliance = () => {
        const newAlliance: Alliance = {
            id: Date.now(),
            allianceNumber: alliances.length + 1,
            captain: null,
            pick1: null,
            pick2: null,
            pick3: null
        };
        onUpdateAlliances([...alliances, newAlliance]);
    };

    // Remove an alliance
    const removeAlliance = (allianceId: number) => {
        if (alliances.length <= 1) {
            toast.error("Must have at least one alliance");
            return;
        }
        const updatedAlliances = alliances.filter(a => a.id !== allianceId);
        // Renumber alliances
        const renumberedAlliances = updatedAlliances.map((alliance, index) => ({
            ...alliance,
            allianceNumber: index + 1
        }));
        onUpdateAlliances(renumberedAlliances);
    };

    // Initialize alliances
    const initializeAlliances = (count: number) => {
        const newAlliances: Alliance[] = [];
        for (let i = 1; i <= count; i++) {
            newAlliances.push({
                id: Date.now() + i,
                allianceNumber: i,
                captain: null,
                pick1: null,
                pick2: null,
                pick3: null
            });
        }
        onUpdateAlliances(newAlliances);
    };

    // Confirm alliances - save to localStorage for use in other parts of the app
    const confirmAlliances = () => {
        const completedAlliances = alliances.filter(alliance => {
            // Minimum requirement: Captain and Pick 1 must be filled
            // Pick 2 and Pick 3 are optional (for district/regional vs championship events)
            return alliance.captain && alliance.pick1;
        });

        if (completedAlliances.length === 0) {
            toast.error("No completed alliances to confirm (need at least Captain and Pick 1)");
            return;
        }

        // Save to localStorage with a different key for confirmed alliances
        localStorage.setItem("confirmedAlliances", JSON.stringify(completedAlliances));

        toast.success(`${completedAlliances.length} alliance${completedAlliances.length === 1 ? '' : 's'} confirmed and saved`);
    };

    const selectedTeams = getSelectedTeams();

    if (alliances.length === 0) {
        return <AllianceInitializer onInitialize={initializeAlliances} />;
    }

    return (
        <div className="space-y-6">
            <AllianceTable
                alliances={alliances}
                availableTeams={availableTeams}
                selectedTeams={selectedTeams}
                onUpdateTeam={updateAllianceTeam}
                onRemoveTeam={removeAllianceTeam}
                onRemoveAlliance={removeAlliance}
                onAddAlliance={addAlliance}
                onConfirmAlliances={confirmAlliances}
            />

            <BackupTeamsSection
                backups={backups}
                availableTeams={availableTeams}
                selectedTeams={selectedTeams}
                onUpdateBackups={onUpdateBackups}
            />
        </div>
    );
};
