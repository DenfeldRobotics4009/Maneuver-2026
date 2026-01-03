import { Progress } from "@/core/components/ui/progress";
import { Card } from "@/core/components/ui/card";

interface ProgressCardProps {
    title: string;
    value: number;
    max?: number;
    suffix?: string;
    compareValue?: number;
}

/**
 * ProgressCard - Displays a rate/percentage with progress bar
 * 
 * Used in the Team Statistics page for rates like climb rate, mobility rate.
 * Supports team comparison with color-coded difference display.
 */
export const ProgressCard = ({
    title,
    value,
    suffix = "%",
    compareValue
}: ProgressCardProps) => {
    const diff = compareValue !== undefined ? value - compareValue : undefined;

    return (
        <Card className="p-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{title}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{value}{suffix}</span>
                        {diff !== undefined && (
                            <div className={`flex items-center text-xs ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                {diff > 0 ? '+' : ''}{diff}
                            </div>
                        )}
                    </div>
                </div>
                <Progress value={value} className="h-2" />
            </div>
        </Card>
    );
};

export default ProgressCard;
