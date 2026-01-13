import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Filter, X } from "lucide-react";
import { FilterOperator, StrategyColumnConfig, ColumnFilter } from "@/core/types/strategy";

interface ColumnFilterPopoverProps {
    column: StrategyColumnConfig;
    currentFilter?: ColumnFilter;
    onApplyFilter: (operator: FilterOperator, value: number) => void;
    onRemoveFilter: () => void;
}

export const ColumnFilterPopover = ({
    column,
    currentFilter,
    onApplyFilter,
    onRemoveFilter
}: ColumnFilterPopoverProps) => {
    const [tempOperator, setTempOperator] = useState<FilterOperator>(">");
    const [tempValue, setTempValue] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    const handleApplyFilter = () => {
        const numValue = parseFloat(tempValue);
        if (!isNaN(numValue)) {
            onApplyFilter(tempOperator, numValue);
            setIsOpen(false);
        }
    };

    const handleRemoveFilter = () => {
        onRemoveFilter();
        setIsOpen(false);
    };

    // Initialize temp values when opening
    const handleOpenChange = (open: boolean) => {
        if (open && currentFilter) {
            setTempOperator(currentFilter.operator);
            setTempValue(currentFilter.value.toString());
        } else if (open) {
            setTempOperator(">");
            setTempValue("");
        }
        setIsOpen(open);
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ${currentFilter ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Filter className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Filter {column.label}</Label>
                        {currentFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFilter}
                                className="h-auto p-1 text-xs text-red-600 hover:text-red-700"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Select value={tempOperator} onValueChange={(value: FilterOperator) => setTempOperator(value)}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=">">&gt; (greater than)</SelectItem>
                                <SelectItem value=">=">&gt;= (greater than or equal)</SelectItem>
                                <SelectItem value="<">&lt; (less than)</SelectItem>
                                <SelectItem value="<=">&lt;= (less than or equal)</SelectItem>
                                <SelectItem value="=">=  (equal to)</SelectItem>
                                <SelectItem value="!=">!= (not equal to)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            inputMode="numeric"
                            step="0.1"
                            placeholder="Value"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleApplyFilter();
                                }
                            }}
                        />
                    </div>

                    <Button
                        onClick={handleApplyFilter}
                        size="sm"
                        className="w-full"
                        disabled={!tempValue || isNaN(parseFloat(tempValue))}
                    >
                        Apply Filter
                    </Button>

                    {currentFilter && (
                        <div className="text-xs text-muted-foreground text-center">
                            Current: {column.label} {currentFilter.operator} {currentFilter.value}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
