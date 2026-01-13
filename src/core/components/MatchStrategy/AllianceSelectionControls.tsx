import { GenericSelector } from "@/core/components/ui/generic-selector";
import type { Alliance } from "@/core/lib/allianceTypes";

interface AllianceSelectionControlsProps {
    confirmedAlliances: Alliance[];
    selectedBlueAlliance: string;
    selectedRedAlliance: string;
    onBlueAllianceChange: (allianceId: string) => void;
    onRedAllianceChange: (allianceId: string) => void;
}

export const AllianceSelectionControls = ({
    confirmedAlliances,
    selectedBlueAlliance,
    selectedRedAlliance,
    onBlueAllianceChange,
    onRedAllianceChange
}: AllianceSelectionControlsProps) => {
    if (confirmedAlliances.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-sm font-medium">Elimination Alliances:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                    <GenericSelector
                        label="Blue Alliance"
                        value={selectedBlueAlliance || "none"}
                        availableOptions={["none", ...confirmedAlliances.map(alliance => alliance.id.toString())]}
                        onValueChange={onBlueAllianceChange}
                        placeholder="Blue Alliance"
                        displayFormat={(value) => {
                            if (value === "none") return "Blue Alliance";
                            const alliance = confirmedAlliances.find(a => a.id.toString() === value);
                            return alliance ? `Alliance ${alliance.allianceNumber}` : `Alliance ${value}`;
                        }}
                        buttonDisplayFormat={(value) => {
                            if (value === "none") return "Blue Alliance";
                            const alliance = confirmedAlliances.find(a => a.id.toString() === value);
                            return alliance ? `Blue Alliance: Alliance ${alliance.allianceNumber}` : `Blue Alliance: Alliance ${value}`;
                        }}
                        className="w-full sm:w-40"
                    />

                    <GenericSelector
                        label="Red Alliance"
                        value={selectedRedAlliance || "none"}
                        availableOptions={["none", ...confirmedAlliances.map(alliance => alliance.id.toString())]}
                        onValueChange={onRedAllianceChange}
                        placeholder="Red Alliance"
                        displayFormat={(value) => {
                            if (value === "none") return "Red Alliance";
                            const alliance = confirmedAlliances.find(a => a.id.toString() === value);
                            return alliance ? `Alliance ${alliance.allianceNumber}` : `Alliance ${value}`;
                        }}
                        buttonDisplayFormat={(value) => {
                            if (value === "none") return "Red Alliance";
                            const alliance = confirmedAlliances.find(a => a.id.toString() === value);
                            return alliance ? `Red Alliance: Alliance ${alliance.allianceNumber}` : `Red Alliance: Alliance ${value}`;
                        }}
                        className="w-full sm:w-40"
                    />
                </div>
            </div>
        </div>
    );
};
