import { Button } from "@/core/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Stage {
    id: string;
    label: string;
}

interface MobileStageControlsProps {
    currentStage: Stage;
    currentStageIndex: number;
    stages: Stage[];
    onStageSwitch: (direction: 'prev' | 'next') => void;
    isVisible: boolean;
}

export const MobileStageControls = ({
    currentStage,
    currentStageIndex,
    stages,
    onStageSwitch,
    isVisible
}: MobileStageControlsProps) => {
    if (!isVisible) return null;

    return (
        <div className="shrink-0 p-2 md:p-3 border-b bg-background md:hidden">
            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStageSwitch('prev')}
                    className="flex items-center gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                        {currentStage?.label}
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        {currentStageIndex + 1} / {stages.length}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStageSwitch('next')}
                    className="flex items-center gap-1"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
