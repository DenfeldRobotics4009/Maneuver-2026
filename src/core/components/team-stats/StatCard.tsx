import { Card } from "@/core/components/ui/card";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'default' | 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
    compareValue?: number;
}

/**
 * StatCard - Displays a single statistic with optional comparison
 * 
 * Used in the Team Statistics page to show averages, totals, etc.
 * Supports team comparison with color-coded difference display.
 */
export const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
    compareValue,
    type = 'number'
}: StatCardProps & { type?: 'number' | 'percentage' }) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const diff = compareValue !== undefined ? numValue - compareValue : undefined;

    // Map color names to Tailwind classes
    const colorClasses: Record<string, string> = {
        default: 'text-foreground',
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
    };

    const formatValue = (val: string | number) => {
        if (type === 'percentage') {
            return `${val}%`;
        }
        return val;
    };

    const formatDiff = (d: number) => {
        const formatted = d.toFixed(1);
        if (type === 'percentage') {
            return `${d > 0 ? '+' : ''}${formatted}%`;
        }
        return `${d > 0 ? '+' : ''}${formatted}`;
    };

    return (
        <Card className="p-4">
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <p className={`text-2xl font-bold ${colorClasses[color] || colorClasses.default}`}>
                        {formatValue(value)}
                    </p>
                    {diff !== undefined && (
                        <div className={`flex items-center text-sm font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                            {formatDiff(diff)}
                        </div>
                    )}
                </div>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
        </Card>
    );
};

export default StatCard;
