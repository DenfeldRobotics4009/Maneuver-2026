import { Button } from "@/core/components/ui/button";
import { Minimize2, ChevronLeft, ChevronRight } from "lucide-react";

interface Stage {
    id: string;
    label: string;
}

interface FieldCanvasHeaderProps {
    currentStage: Stage;
    hideControls: boolean;
    onStageSwitch: (direction: 'prev' | 'next') => void;
    onToggleFullscreen: () => void;
}

export const FieldCanvasHeader = ({
    currentStage,
    hideControls,
    onStageSwitch,
    onToggleFullscreen
}: FieldCanvasHeaderProps) => {
    return (
        <div className="shrink-0 p-3 md:p-4 border-b bg-background">
            <div className="flex justify-between items-center gap-2">
                {/* Left side - Title */}
                <div className="flex items-center gap-3 shrink-0">
                    <h2 className="text-lg md:text-xl font-bold whitespace-nowrap">
                        Field Strategy
                    </h2>

                    {/* Phase name when controls are hidden on any screen size */}
                    {hideControls && (
                        <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                            {currentStage?.label}
                        </div>
                    )}
                </div>

                {/* Center - Phase controls on medium+ screens when controls are visible */}
                <div className="hidden md:flex items-center justify-center gap-2 flex-1">
                    {!hideControls && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStageSwitch('prev')}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden lg:inline">Previous</span>
                            </Button>

                            <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                                {currentStage?.label}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onStageSwitch('next')}
                                className="flex items-center gap-1"
                            >
                                <span className="hidden lg:inline">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Right side - Exit button */}
                <div className="flex items-center justify-end shrink-0">
                    <Button onClick={onToggleFullscreen} variant="outline" size="sm">
                        <Minimize2 className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Exit Fullscreen</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
