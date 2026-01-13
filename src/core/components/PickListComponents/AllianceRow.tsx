/**
 * Alliance Row Component
 * 
 * Single row in alliance table with team selectors.
 * Matches 2025 styling.
 */

import { Button } from "@/core/components/ui/button";
import { GenericSelector } from "@/core/components/ui/generic-selector";
import { Trash2, X } from "lucide-react";
import type { Alliance } from "@/core/lib/allianceTypes";
import type { TeamStats } from "@/core/types/team-stats";

interface AllianceRowProps {
    alliance: Alliance;
    availableTeams: TeamStats[];
    selectedTeams: number[];
    onUpdateTeam: (allianceId: number, position: 'captain' | 'pick1' | 'pick2' | 'pick3', teamNumber: number | null) => void;
    onRemoveTeam: (allianceId: number, position: 'captain' | 'pick1' | 'pick2' | 'pick3') => void;
    onRemoveAlliance: (allianceId: number) => void;
}

export const AllianceRow = ({
    alliance,
    availableTeams,
    selectedTeams,
    onUpdateTeam,
    onRemoveTeam,
    onRemoveAlliance
}: AllianceRowProps) => {


    return (
        <tr className="border-b hover:bg-muted/50">
            <td className="p-3">
                <span className="font-medium text-lg">{alliance.allianceNumber}</span>
            </td>
            {(['captain', 'pick1', 'pick2', 'pick3'] as const).map((position) => {
                const teamNumber = alliance[position];

                return (
                    <td key={position} className="p-3">
                        <div className="flex items-center gap-2">
                            <GenericSelector
                                label={`Alliance ${alliance.allianceNumber} ${position}`}
                                value={teamNumber ? String(teamNumber) : "none"}
                                availableOptions={["none", ...availableTeams.filter(t => !selectedTeams.includes(t.teamNumber) || t.teamNumber === teamNumber).map(t => String(t.teamNumber))]}
                                onValueChange={(val) => onUpdateTeam(alliance.id, position, val === "none" ? null : Number(val))}
                                placeholder="Team"
                                displayFormat={(v) => v === "none" ? "None" : v}
                                className="w-28"
                            />

                            {teamNumber && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRemoveTeam(alliance.id, position)}
                                    className="h-6 w-6 p-0 shrink-0"
                                >
                                    <X className="h-3 w-3 text-red-400" />
                                </Button>
                            )}
                        </div>
                    </td>
                );
            })}
            <td className="p-3">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveAlliance(alliance.id)}
                    className="text-red-400 hover:text-red-500"
                    title="Remove Alliance"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
};
