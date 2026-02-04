/**
 * Auto Field Map Component
 * 
 * Guided path tracking for autonomous period that visualizes robot movements
 * on the field map. Action buttons overlay the field at their actual positions.
 * 
 * Features:
 * - Buttons positioned at actual field locations (hub, depot, outpost, etc.)
 * - State machine for guided action selection
 * - Canvas-based path visualization
 * - Expand to fullscreen mode
 * - Alliance-aware field mirroring
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/core/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { loadPitScoutingByTeamAndEvent } from "@/core/db/database";
import { submitMatchData } from "@/core/lib/submitMatch";
import { useGame } from "@/core/contexts/GameContext";
import fieldImage from "@/game-template/assets/2026-field.png";
import {
    FIELD_ELEMENTS,
    ZONE_BOUNDS,
    AUTO_START_KEYS,
    getVisibleElements,
    type PathActionType,
    type ZoneType,
    type PathWaypoint,
    FieldHeader,
    FieldButton,
    PendingWaypointPopup,

    FieldCanvas,
    type FieldCanvasRef,
    SHOT_DISTANCES_KEYS,
} from "@/game-template/components/field-map";

// Context hooks
import { AutoPathProvider, useAutoScoring } from "@/game-template/contexts";
import { actions as schemaActions } from "@/game-template/game-schema";

// Local sub-components
import { AutoActionLog } from "./components/AutoActionLog";
import { AutoStartConfirmation } from "./components/AutoStartConfirmation";
import { PostClimbProceed } from "@/game-template/components";




// =============================================================================
// RE-EXPORT TYPES FOR CONSUMERS
// =============================================================================

// Re-export types for backward compatibility with existing consumers
export type { PathActionType, ZoneType, PathWaypoint };



export interface AutoFieldMapProps {
    onAddAction: (action: any) => void;
    actions: PathWaypoint[];
    onUndo?: () => void;
    canUndo?: boolean;
    startPosition?: number;
    matchNumber?: string | number;
    matchType?: 'qm' | 'sf' | 'f';
    teamNumber?: string | number;
    onBack?: () => void;
    onProceed?: () => void;
}

// =============================================================================
// WRAPPER COMPONENT - Provides Context
// =============================================================================

export function AutoFieldMap(props: AutoFieldMapProps) {
    const location = useLocation();
    const alliance = location.state?.inputs?.alliance || 'blue';

    return (
        <AutoPathProvider
            actions={props.actions}
            onAddAction={props.onAddAction}
            onUndo={props.onUndo}
            canUndo={props.canUndo}
            alliance={alliance}
            matchNumber={props.matchNumber}
            matchType={props.matchType}
            teamNumber={props.teamNumber}
            onBack={props.onBack}
            onProceed={props.onProceed}
        >
            <AutoFieldMapContent />
        </AutoPathProvider>
    );
}

// =============================================================================
// CONTENT COMPONENT - Uses Context
// =============================================================================

function AutoFieldMapContent() {
    // Get all state from context
    const {
        // From ScoringContext
        actions,
        onAddAction,
        onUndo,
        canUndo,
        pendingWaypoint,
        setPendingWaypoint,
        accumulatedFuel,
        setAccumulatedFuel,
        fuelHistory,
        setFuelHistory,
        stuckStarts,
        setStuckStarts,
        isAnyStuck,
        isFieldRotated,
        toggleFieldOrientation,
        alliance,
        matchNumber,
        matchType,
        teamNumber,
        onBack,
        onProceed,
        generateId,
        // From AutoPathContext
        selectedStartKey,
        setSelectedStartKey,
        stuckElementKey,
        setStuckElementKey,
        showPostClimbProceed,
        setShowPostClimbProceed,
        climbResult,
        setClimbResult,
        canvasDimensions,
        containerRef,
        isSelectingScore,
        setIsSelectingScore,
        isSelectingPass,
        setIsSelectingPass,
        isSelectingCollect,
        setIsSelectingCollect,
    } = useAutoScoring();

    const navigate = useNavigate();
    const location = useLocation();
    const { transformation } = useGame();

    const fieldCanvasRef = useRef<FieldCanvasRef>(null);

    const stuckTimeoutRef = useRef<any>(null);

    // Local state (UI-only, not shared)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentZone] = useState<ZoneType>('allianceZone');
    const [robotCapacity, setRobotCapacity] = useState<number | undefined>();
    const [actionLogOpen, setActionLogOpen] = useState(false);
    
    // Broken down state - persisted with localStorage
    const [brokenDownStart, setBrokenDownStart] = useState<number | null>(() => {
        const saved = localStorage.getItem('autoBrokenDownStart');
        return saved ? parseInt(saved, 10) : null;
    });
    const [totalBrokenDownTime, setTotalBrokenDownTime] = useState<number>(() => {
        const saved = localStorage.getItem('autoBrokenDownTime');
        return saved ? parseInt(saved, 10) : 0;
    });
    const isBrokenDown = brokenDownStart !== null;

    const isMobile = useIsMobile();

    // Load pit scouting data for fuel capacity
    useEffect(() => {
        const loadPitData = async () => {
            if (!teamNumber) return;
            try {
                const eventKey = localStorage.getItem('eventKey') || '';
                const pitData = await loadPitScoutingByTeamAndEvent(Number(teamNumber), eventKey);
                if (pitData && pitData.gameData) {
                    setRobotCapacity(pitData.gameData.fuelCapacity as number);
                }
            } catch (error) {
                console.error('Failed to load pit scouting data:', error);
            }
        };
        loadPitData();
    }, [teamNumber]);

    // Path drawing hook - use current zone bounds
    const currentZoneBounds = ZONE_BOUNDS[currentZone];

    // Auto-fullscreen on mobile on mount
    useEffect(() => {
        if (isMobile) {
            setIsFullscreen(true);
        }
    }, [isMobile]);


    // Calculate total score from actions (not just fuel count)
    const totalScore = actions.reduce((sum, action) => {
        // Find matching action in schema
        const schemaAction = Object.entries(schemaActions).find(([key, def]) => {
            if (def.pathType !== action.type) return false;
            
            // For climb, match autoClimb
            if (action.type === 'climb' && action.action === 'climb-success') {
                return key === 'autoClimb';
            }
            
            // For collect, match by pathAction
            if (action.type === 'collect' && 'pathAction' in def && def.pathAction) {
                return def.pathAction === action.action;
            }
            
            // For score, count fuel points
            if (action.type === 'score') {
                return key === 'fuelScored';
            }
            
            return true;
        });
        
        if (schemaAction) {
            const [, def] = schemaAction;
            const points = def.points.auto || 0;
            
            // For fuel scoring, multiply by fuel count
            if (action.type === 'score' && action.fuelDelta) {
                return sum + (points * Math.abs(action.fuelDelta));
            }
            
            // For other actions, just add the points
            return sum + points;
        }
        
        return sum;
    }, 0);

    const totalFuelScored = actions
        .filter(a => a.type === 'score')
        .reduce((sum, a) => sum + Math.abs(a.fuelDelta || 0), 0);

    const totalFuelPassed = actions
        .filter(a => a.type === 'pass')
        .reduce((sum, a) => sum + Math.abs(a.fuelDelta || 0), 0);





    // addWaypoint helper - wraps context's generateId with position handling
    const addWaypoint = useCallback((type: PathActionType, action: string, position: { x: number; y: number }, fuelDelta?: number, amountLabel?: string) => {
        const waypoint: PathWaypoint = {
            id: generateId(),
            type,
            action,
            position, // CSS handles mirroring, no need to mirror coordinates
            fuelDelta,
            amountLabel,
            timestamp: Date.now(),
        };
        onAddAction(waypoint);
    }, [onAddAction, generateId]);

    const handleBrokenDownToggle = () => {
        if (brokenDownStart) {
            // Robot is back up - accumulate the time
            const duration = Date.now() - brokenDownStart;
            const newTotal = totalBrokenDownTime + duration;
            setTotalBrokenDownTime(newTotal);
            localStorage.setItem('autoBrokenDownTime', String(newTotal));
            setBrokenDownStart(null);
            localStorage.removeItem('autoBrokenDownStart');
        } else {
            // Robot is breaking down - start tracking time
            const now = Date.now();
            setBrokenDownStart(now);
            localStorage.setItem('autoBrokenDownStart', String(now));
        }
    };

    const handleElementClick = (elementKey: string) => {
        const element = FIELD_ELEMENTS[elementKey as keyof typeof FIELD_ELEMENTS];
        if (!element) return;
        const position = { x: element.x, y: element.y };
        // 1. Handle Persistent Stuck Resolution
        if (stuckStarts[elementKey]) {
            const startTime = stuckStarts[elementKey]!;
            const type = elementKey.includes('trench') ? 'trench' : 'bump';

            // Include duration in the waypoint for analytics
            const stuckDuration = Date.now() - startTime;
            addWaypoint('traversal', `${type}-stuck`, position, undefined, `${Math.round(stuckDuration / 1000)}s`);

            setStuckStarts(prev => {
                const next = { ...prev };
                delete next[elementKey];
                return next;
            });
            return;
        }

        // 2. Handle Potential Stuck Promotion (Second tap within 5s)
        if (stuckElementKey === elementKey) {
            if (stuckTimeoutRef.current) {
                clearTimeout(stuckTimeoutRef.current);
                stuckTimeoutRef.current = null;
            }
            setStuckElementKey(null);
            setStuckStarts(prev => ({ ...prev, [elementKey]: Date.now() }));
            return;
        }
        if(isSelectingScore){
            switch (elementKey) {
                case 'shot_hub':
                case 'shot_outpost_close':
                case 'shot_outpost_medium':
                case 'shot_outpost_far':
                case 'shot_depot_close':
                case 'shot_depot_medium':
                case 'shot_depot_far':
                    handleInteractionEnd(position, elementKey)
                    break;
            }
            return;
        }

        // Block clicks while any popup is active or robot is stuck elsewhere or broken down
        if (pendingWaypoint || isSelectingPass || isSelectingCollect || selectedStartKey || isAnyStuck || isBrokenDown) {
            
            return;
        }

       

        if (actions.length === 0) {
            const startKeys = ['trench1', 'bump1', 'hub', 'bump2', 'trench2'];
            if (startKeys.includes(elementKey)) {
                setSelectedStartKey(elementKey);
            }
            return;
        }

        switch (elementKey) {
            case 'hub':
                setIsSelectingScore(true);
                break;
            case 'depot':
            case 'outpost':
                addWaypoint('collect', elementKey, position, 8);
                break;
            case 'tower': {
                const waypoint: PathWaypoint = {
                    id: generateId(),
                    type: 'climb',
                    action: 'attempt',
                    position: position,
                    timestamp: Date.now(),
                };
                setPendingWaypoint(waypoint);
                setClimbResult('success');
                break;
            }
            case 'trench1':
            case 'trench2':
            case 'bump1':
            case 'bump2': 

                const type = elementKey.includes('trench') ? 'trench' : 'bump';
                addWaypoint('traversal', type, position);

                break;
            
            case 'pass':
            case 'pass_alliance':
                setIsSelectingPass(true);
                handleInteractionEnd(position, elementKey, true);
                break;
            case 'collect_neutral':
            case 'collect_alliance':
                setIsSelectingCollect(true);
                handleInteractionEnd(position, elementKey, undefined, true);
                break;
            case 'opponent_foul':
                addWaypoint('foul', 'mid-line-penalty', position);
                break;
        }
    };

    // Consolidated interaction handler
    const handleInteractionEnd = (pos: { x: number; y: number }, shot_action: string, isPassing?: boolean, isCollecting?: boolean) => {
        if (isSelectingScore) {
            const waypoint: PathWaypoint = {
                id: generateId(),
                type: 'score',
                position: pos,
                action: shot_action,
                fuelDelta: -8, // Default, will be finalized in amount selection
                amountLabel: '...', // Placeholder until confirmed
                timestamp: Date.now(),
            };
            setAccumulatedFuel(0);
            setFuelHistory([]);
            setPendingWaypoint(waypoint);
            setIsSelectingScore(false);
        } else if (isSelectingPass || isPassing) {
            const waypoint: PathWaypoint = {
                id: generateId(),
                type: 'pass',
                position: pos,
                action: 'partner',
                fuelDelta: 0,
                amountLabel: '...', // Placeholder until confirmed
                timestamp: Date.now(),
            };
            setAccumulatedFuel(0);
            setFuelHistory([]);
            setPendingWaypoint(waypoint);
            setIsSelectingPass(false);
        } else if (isSelectingCollect || isCollecting) {

            addWaypoint('collect', 'field', pos, 8);
            setIsSelectingCollect(false);
        }
    };

    // Undo wrapper that also clears active broken down state
    const handleUndo = () => {
        if (brokenDownStart) {
            setBrokenDownStart(null);
        }
        if (onUndo) {
            onUndo();
        }
    };

    // Handle no-show submission
    const handleNoShow = async () => {
        await submitMatchData({
            inputs: location.state?.inputs,
            transformation,
            noShow: true,
            onSuccess: () => navigate('/game-start'),
        });
    };

    // ==========================================================================
    // RENDER
    // ==========================================================================

    const content = (
        <div className={cn("flex flex-col gap-2", isFullscreen && "h-full")}>
            {/* Header */}
            <FieldHeader
                phase="auto"
                stats={[
                    { label: 'Scored', value: totalFuelScored, color: 'green' },
                    { label: 'Passed', value: totalFuelPassed, color: 'purple' },
                ]}
                currentZone={currentZone}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                actionLogSlot={<AutoActionLog actions={actions} totalScore={totalScore} open={actionLogOpen} onOpenChange={setActionLogOpen} />}
                onActionLogOpen={() => setActionLogOpen(true)}
                matchNumber={matchNumber}
                matchType={matchType}
                teamNumber={teamNumber}
                alliance={alliance}
                isFieldRotated={isFieldRotated}
                canUndo={canUndo}
                onUndo={handleUndo}
                onBack={onBack}
                onProceed={() => {
                    // Capture any active broken down time before proceeding
                    if (brokenDownStart) {
                        const duration = Date.now() - brokenDownStart;
                        const finalTotal = totalBrokenDownTime + duration;
                        localStorage.setItem('autoBrokenDownTime', String(finalTotal));
                    }
                    if (onProceed) onProceed();
                }}
                toggleFieldOrientation={toggleFieldOrientation}
                isBrokenDown={isBrokenDown}
                onBrokenDownToggle={handleBrokenDownToggle}
                onNoShow={handleNoShow}
            />

            {/* Field with Overlay Buttons */}
            <div
                ref={containerRef}
                className={cn(
                    "relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 select-none",
                    "w-full aspect-[2/1]",
                    isFullscreen ? "max-h-[85vh] m-auto" : "h-auto",
                    isFieldRotated && "rotate-180" // 180° rotation for field orientation preference
                )}
            >
                {/* Field Background */}
                <img
                    src={fieldImage}
                    alt="2026 Field"
                    className="w-full h-full object-fill"
                    style={{ opacity: 0.9 }}
                />

                {/* Drawing Canvas Layer */}
                <FieldCanvas
                    ref={fieldCanvasRef}
                    actions={actions}
                    pendingWaypoint={pendingWaypoint}
                    alliance={alliance}
                    isFieldRotated={isFieldRotated}
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    isSelectingScore={false}
                    isSelectingPass={false}
                    isSelectingCollect={false}
                    drawConnectedPaths={true}
                    drawingZoneBounds={currentZoneBounds}
                />

                {/* Overlay Buttons */}
                {!isSelectingScore && !isSelectingPass && !isSelectingCollect && (
                    <div className="absolute inset-0 z-10">
                        {actions.length === 0 ? (
                            <>
                                {AUTO_START_KEYS.map(key => (
                                    <FieldButton
                                        key={key}
                                        elementKey={key}
                                        element={FIELD_ELEMENTS[key]!}
                                        isVisible={true}
                                        onClick={handleElementClick}
                                        alliance={alliance}
                                        isFieldRotated={isFieldRotated}
                                        containerWidth={canvasDimensions.width}
                                        overrideX={0.28}
                                        isDisabled={!!(pendingWaypoint || isSelectingScore || isSelectingPass || isSelectingCollect || selectedStartKey)}
                                    />
                                ))}
                            </>
                        ) : (
                            <>
                                {getVisibleElements('auto', currentZone).map(key => {
                                    const isPersistentStuck = !!stuckStarts[key];
                                    const isPopupActive = !!(pendingWaypoint || isSelectingScore || isSelectingPass || isSelectingCollect || selectedStartKey);

                                    return (
                                        <FieldButton
                                            key={key}
                                            elementKey={key}
                                            element={FIELD_ELEMENTS[key]!}
                                            isVisible={true}
                                            onClick={handleElementClick}
                                            alliance={alliance}
                                            isFieldRotated={isFieldRotated}
                                            containerWidth={canvasDimensions.width}
                                            isStuck={isPersistentStuck}
                                            isPotentialStuck={stuckElementKey === key}
                                            isDisabled={isPopupActive || (isAnyStuck && !isPersistentStuck)}
                                        />
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}

                {/* Score Selection Overlay */}
                {isSelectingScore && (
                    <div className="absolute inset-0 z-20">
                            {SHOT_DISTANCES_KEYS.map(key => (
                                <FieldButton
                                    key={key}
                                    elementKey={key}
                                    element={FIELD_ELEMENTS[key]!}
                                    isVisible={true}
                                    onClick={handleElementClick}
                                    alliance={alliance}
                                    isFieldRotated={isFieldRotated}
                                    containerWidth={canvasDimensions.width}
                                    isDisabled={false}
                                />
                            ))}
                        </div>
                )}
                {/* Score Selection Overlay Cancel*/}
                {isSelectingScore && (
                    <div className={cn("absolute inset-0 z-30 flex items-end justify-center pb-4 pointer-events-none", isFieldRotated && "rotate-180")}>
                        <Card className="pointer-events-auto bg-background/95 backdrop-blur-sm border-green-500/50 shadow-2xl py-2 px-3 flex flex-row items-center gap-4">
                            <Badge variant="default" className="bg-green-600">SCORING MODE</Badge>
                            <span className="text-sm font-medium">Select (approximately) Where They Are</span>
                            <Button
                                onClick={(e) => { e.stopPropagation(); setIsSelectingScore(false); }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                ✕
                            </Button>
                        </Card>
                    </div>
                )}

                {/* Pass Selection Overlay */}
                {isSelectingPass && (
                    <div className={cn("absolute inset-0 z-30 flex items-end justify-center pb-4 pointer-events-none", isFieldRotated && "rotate-180")}>
                        <Card className="pointer-events-auto bg-background/95 backdrop-blur-sm border-purple-500/50 shadow-2xl py-2 px-3 flex flex-row items-center gap-4">
                            <Badge variant="default" className="bg-purple-600">PASSING MODE</Badge>
                            <span className="text-sm font-medium">Tap or draw where the robot passed from</span>
                            <Button
                                onClick={(e) => { e.stopPropagation(); setIsSelectingPass(false);  }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                ✕
                            </Button>
                        </Card>
                    </div>
                )}

                {/* Collect Selection Overlay */}
                {isSelectingCollect && (
                    <div className={cn("absolute inset-0 z-30 flex items-end justify-center pb-4 pointer-events-none", isFieldRotated && "rotate-180")}>
                        <Card className="pointer-events-auto bg-background/95 backdrop-blur-sm border-yellow-500/50 shadow-2xl py-2 px-3 flex flex-row items-center gap-4">
                            <Badge variant="default" className="bg-yellow-600">COLLECT MODE</Badge>
                            <span className="text-sm font-medium">Tap or draw where the robot collected</span>
                            <Button
                                onClick={(e) => { e.stopPropagation(); setIsSelectingCollect(false); }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                ✕
                            </Button>
                        </Card>
                    </div>
                )}

                {/* Starting Position Confirmation Overlay */}
                {actions.length === 0 && selectedStartKey && (() => {
                    const startElement = FIELD_ELEMENTS[selectedStartKey];
                    const startPositionX = startElement ? startElement.x : 0.15;
                    return (
                        <AutoStartConfirmation
                            selectedStartKey={selectedStartKey}
                            alliance={alliance}
                            isFieldRotated={isFieldRotated}
                            startPositionX={startPositionX}
                            onConfirm={(key, pos) => {
                                addWaypoint('start', key, pos);
                                setSelectedStartKey(null);
                            }}
                            onCancel={() => setSelectedStartKey(null)}
                        />
                    );
                })()}


                {/* Post-Climb Transition Overlay */}
                {showPostClimbProceed && onProceed && (
                    <PostClimbProceed
                        isFieldRotated={isFieldRotated}
                        onProceed={onProceed}
                        onStay={() => setShowPostClimbProceed(false)}
                        nextPhaseName="Teleop"
                    />
                )}


                {/* Post-Action Amount Selection Overlay */}
                {pendingWaypoint && (
                    <PendingWaypointPopup
                        pendingWaypoint={pendingWaypoint}
                        accumulatedFuel={accumulatedFuel}
                        fuelHistory={fuelHistory}
                        climbResult={climbResult}
                        isFieldRotated={isFieldRotated}
                        alliance={alliance}
                        robotCapacity={robotCapacity}
                        onFuelSelect={(value: number) => {
                            setAccumulatedFuel(prev => prev + value);
                            setFuelHistory(prev => [...prev, value]);
                        }}
                        onFuelUndo={() => {
                            if (fuelHistory.length === 0) return;
                            const lastDelta = fuelHistory[fuelHistory.length - 1]!;
                            setAccumulatedFuel(prev => Math.max(0, prev - lastDelta));
                            setFuelHistory(prev => prev.slice(0, -1));
                        }}
                        onClimbResultSelect={setClimbResult}
                        onConfirm={() => {
                            let delta = 0;
                            let label = '';
                            let action = pendingWaypoint.action;

                            if (pendingWaypoint.type === 'climb') {
                                action = climbResult === 'success' ? 'climb-success' : 'climb-fail';
                                label = climbResult === 'success' ? 'Succeeded' : 'Failed';
                            } else {
                                delta = pendingWaypoint.type === 'score' || pendingWaypoint.type === 'pass' ? -accumulatedFuel : 0;
                                label = pendingWaypoint.type === 'score' ? `+${accumulatedFuel}` : `Pass (${accumulatedFuel})`;
                            }

                            const finalized: PathWaypoint = {
                                ...pendingWaypoint,
                                fuelDelta: delta,
                                amountLabel: label,
                                action: action
                            };
                            onAddAction(finalized);
                            setPendingWaypoint(null);
                            setAccumulatedFuel(0);
                            setFuelHistory([]);
                            setClimbResult(null);

                            // Show transition popup after climb
                            if (finalized.type === 'climb' && onProceed) {
                                setShowPostClimbProceed(true);
                            }
                        }}
                        onCancel={() => {
                            setPendingWaypoint(null);
                            setAccumulatedFuel(0);
                            setFuelHistory([]);
                        }}
                    />
                )}



            </div>
        </div>
    );

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-background p-4 flex flex-col">
                {content}
            </div>
        );
    }

    return content;
}
