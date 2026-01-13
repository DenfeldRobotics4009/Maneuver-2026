/**
 * Sort Selector Component
 * 
 * Dropdown for selecting team sort order.
 * Uses GenericSelector matching 2025 styling.
 */

import { GenericSelector } from "@/core/components/ui/generic-selector";
import { sortOptions, type PickListSortOption } from "@/game-template/pick-list-config";

interface SortSelectorProps {
    sortBy: PickListSortOption;
    onSortChange: (value: PickListSortOption) => void;
}

export const SortSelector = ({ sortBy, onSortChange }: SortSelectorProps) => {
    const sortValues = sortOptions.map(option => option.value);

    const displayFormat = (value: string) => {
        const option = sortOptions.find(opt => opt.value === value);
        return option?.label || value;
    };

    const handleValueChange = (value: string) => {
        onSortChange(value as PickListSortOption);
    };

    return (
        <GenericSelector
            label="Sort Teams By"
            value={sortBy}
            availableOptions={sortValues}
            onValueChange={handleValueChange}
            placeholder="Sort by..."
            displayFormat={displayFormat}
            buttonDisplayFormat={(value) => `Sort By: ${displayFormat(value)}`}
        />
    );
};
