/**
 * Alliance Initializer Component
 * 
 * Initial setup for alliance selection count.
 * Matches 2025 styling.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";

interface AllianceInitializerProps {
    onInitialize: (count: number) => void;
}

export const AllianceInitializer = ({ onInitialize }: AllianceInitializerProps) => {
    const [newAllianceCount, setNewAllianceCount] = useState(8);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Alliance Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <label className="font-medium">Number of alliances:</label>
                    <Select value={newAllianceCount.toString()} onValueChange={(value) => setNewAllianceCount(Number(value))}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[4, 6, 8, 12, 16].map(count => (
                                <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => onInitialize(newAllianceCount)}>
                    Initialize Alliance Selection
                </Button>
            </CardContent>
        </Card>
    );
};
