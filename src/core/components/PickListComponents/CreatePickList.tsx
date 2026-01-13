/**
 * Create Pick List Component
 * 
 * Form for creating a new pick list.
 * Matches 2025 styling.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Plus } from "lucide-react";

interface CreatePickListProps {
    newListName: string;
    newListDescription: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onCreateList: () => void;
}

export const CreatePickList = ({
    newListName,
    newListDescription,
    onNameChange,
    onDescriptionChange,
    onCreateList
}: CreatePickListProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Pick List
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        placeholder="List name..."
                        value={newListName}
                        onChange={(e) => onNameChange(e.target.value)}
                    />
                    <Input
                        placeholder="Description (optional)..."
                        value={newListDescription}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                    />
                </div>
                <Button onClick={onCreateList} className="w-full">
                    Create List
                </Button>
            </CardContent>
        </Card>
    );
};
