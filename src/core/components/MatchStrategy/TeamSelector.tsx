import { GenericSelector } from "@/core/components/ui/generic-selector";

interface TeamSelectorProps {
    index: number;
    label: string;
    labelColor: string;
    value: number | null;
    availableTeams: number[];
    onValueChange: (value: number | null) => void;
}

export const TeamSelector = ({
    label,
    value,
    availableTeams,
    onValueChange
}: TeamSelectorProps) => {
    // Add "none" option to the beginning of the available teams
    const options = ["none", ...availableTeams.map(String)];

    const displayFormat = (val: string) => {
        if (val === "none") return "No team";
        return val ? `Team ${val}` : "Select team";
    };

    return (
        <GenericSelector
            label={label}
            value={value === null ? "none" : String(value)}
            availableOptions={options}
            onValueChange={(newVal) => {
                if (newVal === "none") {
                    onValueChange(null);
                } else {
                    onValueChange(Number(newVal));
                }
            }}
            placeholder="Select team"
            displayFormat={displayFormat}
        />
    );
};
