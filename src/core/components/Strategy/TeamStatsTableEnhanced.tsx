import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import { X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/core/components/ui/table";
import {
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { createColumns } from "./columns";
import { ColumnSettingsSheet } from "./ColumnSettingsSheet";
import { StrategyColumnConfig, ColumnFilter, FilterOperator, TeamData } from "@/core/types/strategy";

interface TeamStatsTableProps {
    teamStats: TeamData[];
    filteredTeamStats: TeamData[];
    columnConfig: StrategyColumnConfig[];
    columnFilters: Record<string, ColumnFilter>;
    onToggleColumn: (key: string) => void;
    onApplyPreset: (preset: string) => void;
    onSetColumnFilter: (columnKey: string, operator: FilterOperator, value: number) => void;
    onRemoveColumnFilter: (columnKey: string) => void;
    onClearAllFilters: () => void;
    isColumnSettingsOpen: boolean;
    onColumnSettingsOpenChange: (open: boolean) => void;
}

export const TeamStatsTableEnhanced = ({
    teamStats,
    filteredTeamStats,
    columnConfig,
    columnFilters,
    onToggleColumn,
    onApplyPreset,
    onSetColumnFilter,
    onRemoveColumnFilter,
    onClearAllFilters,
    isColumnSettingsOpen,
    onColumnSettingsOpenChange,
}: TeamStatsTableProps) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFiltersState, setColumnFiltersState] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    // Create columns with current config
    const columns = React.useMemo(
        () => createColumns(columnConfig, columnFilters, onSetColumnFilter, onRemoveColumnFilter),
        [columnConfig, columnFilters, onSetColumnFilter, onRemoveColumnFilter]
    );

    // Update column visibility when columnConfig changes
    React.useEffect(() => {
        const visibility: VisibilityState = {};
        columnConfig.forEach(col => {
            visibility[col.key] = col.visible;
        });
        setColumnVisibility(visibility);
    }, [columnConfig]);

    const table = useReactTable({
        data: filteredTeamStats,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFiltersState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: (updater) => {
            const newVisibility = typeof updater === 'function'
                ? updater(columnVisibility)
                : updater;

            // Update our column config through the parent component
            Object.entries(newVisibility).forEach(([key, visible]) => {
                const currentCol = columnConfig.find(col => col.key === key);
                if (currentCol && currentCol.visible !== visible) {
                    onToggleColumn(key);
                }
            });
        },
        state: {
            sorting,
            columnFilters: columnFiltersState,
            columnVisibility,
        },
    });

    const visibleColumns = columnConfig.filter(col => col.visible);
    const activeFilterCount = Object.keys(columnFilters).length;

    return (
        <Card className="">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                        <CardTitle className="text-lg md:text-xl">Team Statistics</CardTitle>
                        <Badge variant="secondary" className="text-xs w-fit">
                            {visibleColumns.length} of {columnConfig.length} columns
                        </Badge>
                    </div>

                    {/* Column Selection Button */}
                    <ColumnSettingsSheet
                        isOpen={isColumnSettingsOpen}
                        onOpenChange={onColumnSettingsOpenChange}
                        columnConfig={columnConfig}
                        onToggleColumn={onToggleColumn}
                        onApplyPreset={onApplyPreset}
                    />
                </div>
            </CardHeader>

            {/* Filter Controls */}
            <div className="px-2 pb-2 md:pb-4 space-y-2 md:space-y-4">
                {/* Teams count with filter status */}
                <div className="flex px-4 md:px-6  items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        Showing {filteredTeamStats.length} of {teamStats.length} teams
                    </span>
                    {activeFilterCount > 0 && (
                        <>
                            <Badge variant="outline" className="text-xs">
                                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={onClearAllFilters}
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear all filters
                            </Button>
                        </>
                    )}
                </div>

                {/* Search Controls */}
                <div className="flex items-center gap-2 px-4">
                    <Input
                        placeholder="Filter teams..."
                        value={(table.getColumn("teamNumber")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("teamNumber")?.setFilterValue(event.target.value)
                        }
                        className="flex-1 text-sm h-8 sm:h-10"
                    />
                </div>
            </div>

            <CardContent className="px-4">
                <div className="px-2">
                    <div className="max-h-[35vh] sm:max-h-[40vh] md:max-h-[45vh] lg:max-h-[50vh] overflow-auto border rounded-md">
                        <div className="min-w-max">
                            <Table className="relative w-full">
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {/* Add spacing row at the bottom */}
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-4 border-0" />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
