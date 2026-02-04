/**
 * Teleop Field Map Component
 * 
 * Field-based scoring interface for Teleop period.
 * Uses zone overlays for manual zone selection with shoot/pass paths.
 * 
 * Key differences from Auto:
 * - No connected movement path - only shoot/pass paths are standalone
 * - Zone selection via overlay tap (not traversal actions)
 * - Climb includes level selection (L1/L2/L3) + success/fail
 * - Defense and Steal actions in opponent zone
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/core/components/ui/button';
import { cn } from '@/core/lib/utils';
import { loadPitScoutingByTeamAndEvent } from '@/core/db/database';

import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/core/hooks/use-mobile';
import fieldImage from '@/game-template/assets/2026-field.png';

// Import shared field-map components
import {
    type PathWaypoint,

    FIELD_ELEMENTS,
    ZONE_BOUNDS,
    FieldCanvas,
    FieldButton,
    FieldHeader,
    getVisibleElements,
    PendingWaypointPopup,
    SHOT_DISTANCES_KEYS,
    PathActionType,
} from '../field-map';

// Context hooks
import { TeleopPathProvider, useTeleopScoring } from '@/game-template/contexts';

// Local sub-components
import { TeleopActionLog } from './components/TeleopActionLog';
import { PostClimbProceed } from '../scoring/PostClimbProceed';
import { Badge, Card } from '@/components';


// =============================================================================
// TYPES
// =============================================================================

export interface TeleopFieldMapProps {
    onAddAction: (action: PathWaypoint) => void;
    actions: PathWaypoint[];
    onUndo?: () => void;
    canUndo?: boolean;
    matchNumber?: string | number;
    matchType?: 'qm' | 'sf' | 'f';
    teamNumber?: string | number;
    onBack?: () => void;
    onProceed?: () => void;
}

// =============================================================================
// WRAPPER COMPONENT - Provides Context
// =============================================================================

export function TeleopFieldMap(props: TeleopFieldMapProps) {
    const location = useLocation();
    const alliance = location.state?.inputs?.alliance || 'blue';

    return (
        <TeleopPathProvider
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
            <TeleopFieldMapContent />
        </TeleopPathProvider>
    );
}

// =============================================================================
// CONTENT COMPONENT - Uses Context
// =============================================================================

function TeleopFieldMapContent() {
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
        resetFuel,
        stuckStarts,
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
        // From TeleopPathContext
        activeZone,
        climbLevel,
        setClimbLevel,
        climbResult,
        setClimbResult,
        showPostClimbProceed,
        setShowPostClimbProceed,
        canvasDimensions,
        containerRef,
        isSelectingScore,
        setIsSelectingScore,
        isSelectingPass,
        setIsSelectingPass,
        isSelectingCollect,
        setIsSelectingCollect,
    } = useTeleopScoring();

    const fieldCanvasRef = useRef<{ canvas: HTMLCanvasElement | null }>({ canvas: null });

    const isMobile = useIsMobile();

    // Local state (UI-only)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [robotCapacity, setRobotCapacity] = useState<number | undefined>();
    const [actionLogOpen, setActionLogOpen] = useState(false);
    
    // Broken down state - persisted with localStorage
    const [brokenDownStart, setBrokenDownStart] = useState<number | null>(() => {
        const saved = localStorage.getItem('teleopBrokenDownStart');
        return saved ? parseInt(saved, 10) : null;
    });
    const [totalBrokenDownTime, setTotalBrokenDownTime] = useState<number>(() => {
        const saved = localStorage.getItem('teleopBrokenDownTime');
        return saved ? parseInt(saved, 10) : 0;
    });
    const isBrokenDown = brokenDownStart !== null;

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

    // Reset fuel accumulation when entering Teleop (component mounts)
    // Also reset when pendingWaypoint changes to ensure clean state
    useEffect(() => {
        resetFuel();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Reset fuel when any pending waypoint is cleared
    useEffect(() => {
        if (!pendingWaypoint) {
            resetFuel();
        }
    }, [pendingWaypoint, resetFuel]);

    // Path drawing hook - constrain to active zone bounds
    const currentZoneBounds = activeZone ? ZONE_BOUNDS[activeZone] : undefined;

    // Auto-fullscreen on mobile
    useEffect(() => {
        if (isMobile) {
            setIsFullscreen(true);
        }
    }, [isMobile]);

    // Calculate totals
    const totalFuelScored = actions
        .filter(a => a.type === 'score')
        .reduce((sum, a) => sum + Math.abs(a.fuelDelta || 0), 0);

    const totalFuelPassed = actions
        .filter(a => a.type === 'pass')
        .reduce((sum, a) => sum + Math.abs(a.fuelDelta || 0), 0);

    // Defense and steal counted from actions array like everything else
    const totalDefense = actions.filter(a => a.type === 'defense').length;
    const totalSteal = actions.filter(a => a.type === 'steal').length;

    // ==========================================================================
    // HANDLERS
    // ==========================================================================
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
            localStorage.setItem('teleopBrokenDownTime', String(newTotal));
            setBrokenDownStart(null);
            localStorage.removeItem('teleopBrokenDownStart');
        } else {
            // Robot is breaking down - start tracking time
            const now = Date.now();
            setBrokenDownStart(now);
            localStorage.setItem('teleopBrokenDownStart', String(now));
        }
    };

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
    const handleElementClick = (elementKey: string) => {
        const element = FIELD_ELEMENTS[elementKey];
        
        if (!element) return;
        const position = { x: element.x, y: element.y };
        // Block if popup active or broken down
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
        if (pendingWaypoint || isSelectingPass || isBrokenDown) return;

        


        switch (elementKey) {
            case 'trench1':
            case 'trench2':
            case 'bump1':
            case 'bump2': 

                const type = elementKey.includes('trench') ? 'trench' : 'bump';
                addWaypoint('traversal', type, position);

                break;
            
            case 'hub':
                setIsSelectingScore(true);
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
            case 'tower':
                // Open climb selector
                setPendingWaypoint({
                    id: generateId(),
                    type: 'climb',
                    action: 'attempt',
                    position: position,
                    timestamp: Date.now(),
                    zone: 'allianceZone',
                });
                setClimbLevel(undefined);
                setClimbResult('success');
                break;
            case 'defense_alliance':
            case 'defense_neutral':
            case 'defense_opponent':
                // Defense - create minimal action (no waypoint needed)
                onAddAction({
                    id: generateId(),
                    type: 'defense',
                    timestamp: Date.now(),
                } as any);
                break;
            case 'pass_opponent':
                // Pass from opponent zone - same behavior as regular pass
                setIsSelectingPass(true);
                handleInteractionEnd(position, elementKey, true);
                break;
            case 'steal':
                // Steal - create minimal action (no waypoint needed)
                onAddAction({
                    id: generateId(),
                    type: 'steal',
                    timestamp: Date.now(),
                } as any);
                break;
        }
    };

    const handleFuelSelect = (amount: number) => {
        setAccumulatedFuel(prev => prev + amount);
        setFuelHistory(prev => [...prev, amount]);
    };

    const handleFuelConfirm = () => {
        if (!pendingWaypoint || accumulatedFuel === 0) return;

        const waypoint: PathWaypoint = {
            ...pendingWaypoint,
            fuelDelta: pendingWaypoint.type === 'score' ? -accumulatedFuel : accumulatedFuel,
            amountLabel: `${accumulatedFuel}`,
        };
        onAddAction(waypoint);
        setPendingWaypoint(null);
        setAccumulatedFuel(0);
        setFuelHistory([]);
    };

    const handleFuelCancel = () => {
        setPendingWaypoint(null);
        setAccumulatedFuel(0);
        setFuelHistory([]);
        setIsSelectingScore(false);
        setIsSelectingPass(false);
    };

    const handleFuelUndo = () => {
        if (fuelHistory.length === 0) return;
        const lastAmount = fuelHistory[fuelHistory.length - 1]!;
        setAccumulatedFuel(prev => prev - lastAmount);
        setFuelHistory(prev => prev.slice(0, -1));
    };



    const handleClimbCancel = () => {
        setPendingWaypoint(null);
        setClimbLevel(undefined);
    };

    // Undo wrapper that also clears active broken down state
    const handleUndoWrapper = () => {
        if (brokenDownStart) {
            setBrokenDownStart(null);
        }
        if (onUndo) {
            onUndo();
        }
    };

    // ==========================================================================
    // GET VISIBLE ELEMENTS FOR ACTIVE ZONE
    // ==========================================================================

    // Use shared zone element config
    const visibleElements = getVisibleElements('teleop', 'allianceZone');

    // ==========================================================================
    // RENDER
    // ==========================================================================

    const content = (
        <div className={cn("flex flex-col gap-2", isFullscreen && "h-full")}>
            {/* Header */}
            <FieldHeader
                phase="teleop"
                stats={[
                    { label: 'Scored', value: totalFuelScored, color: 'green' },
                    { label: 'Passed', value: totalFuelPassed, color: 'purple' },
                ]}
                currentZone={activeZone}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                actionLogSlot={<TeleopActionLog actions={actions} open={actionLogOpen} onOpenChange={setActionLogOpen} />}
                onActionLogOpen={() => setActionLogOpen(true)}
                matchNumber={matchNumber}
                matchType={matchType}
                teamNumber={teamNumber}
                alliance={alliance}
                isFieldRotated={isFieldRotated}
                canUndo={canUndo}
                onUndo={handleUndoWrapper}
                onBack={onBack}
                onProceed={() => {
                    // Capture any active broken down time before proceeding
                    if (brokenDownStart) {
                        const duration = Date.now() - brokenDownStart;
                        const finalTotal = totalBrokenDownTime + duration;
                        localStorage.setItem('teleopBrokenDownTime', String(finalTotal));
                    }
                    if (onProceed) onProceed();
                }}
                toggleFieldOrientation={toggleFieldOrientation}
                isBrokenDown={isBrokenDown}
                onBrokenDownToggle={handleBrokenDownToggle}
            />

            {/* Field Map */}
            <div className={cn("flex-1 relative", isFullscreen ? "h-full flex items-center justify-center" : "")}>
                {/* Container with 2:1 aspect ratio */}
                <div
                    ref={containerRef}
                    className={cn(
                        "relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 select-none",
                        "w-full aspect-[2/1]",
                        isFullscreen ? "max-h-[85vh] m-auto" : "h-auto"
                    )}
                    style={{
                        transform: isFieldRotated ? 'rotate(180deg)' : undefined,
                    }}
                >
                    {/* Field Background */}
                    <img
                        src={fieldImage}
                        alt="2026 Field"
                        className="w-full h-full object-fill"
                        style={{ opacity: 0.9 }}
                    />

                    {/* Canvas Layer */}
                    <FieldCanvas
                        ref={fieldCanvasRef}
                        actions={actions}
                        pendingWaypoint={pendingWaypoint}
                        alliance={alliance}
                        isFieldRotated={isFieldRotated}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        drawConnectedPaths={false}
                        drawingZoneBounds={currentZoneBounds}
                    />

                    {/* Field Buttons (only visible ones for this zone) */}
                    {!pendingWaypoint && !isSelectingScore && !isSelectingPass && (
                        <>
                            {visibleElements.map((key) => {
                                let element = FIELD_ELEMENTS[key];
                                if (!element) return null;

                                // Add counts for defense and steal buttons
                                let count: number | undefined = undefined;
                                if (key === 'defense_alliance' || key === 'defense_neutral' || key === 'defense_opponent') {
                                    count = totalDefense;
                                } else if (key === 'steal') {
                                    count = totalSteal;
                                }

                                return (
                                    <FieldButton
                                        key={key}
                                        elementKey={key}
                                        element={element}
                                        isVisible={true}
                                        isDisabled={isAnyStuck && !stuckStarts[key]}
                                        isStuck={!!stuckStarts[key]}
                                        count={count}
                                        onClick={handleElementClick}
                                        alliance={alliance}
                                        isFieldRotated={isFieldRotated}
                                        containerWidth={canvasDimensions.width}
                                    />
                                );
                            })}
                        </>
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

                    {/* Post-Action Popup (Fuel or Climb) */}
                    {pendingWaypoint && (
                        <PendingWaypointPopup
                            pendingWaypoint={pendingWaypoint}
                            accumulatedFuel={accumulatedFuel}
                            fuelHistory={fuelHistory}
                            isFieldRotated={isFieldRotated}
                            alliance={alliance}
                            robotCapacity={robotCapacity}
                            onFuelSelect={handleFuelSelect}
                            onFuelUndo={handleFuelUndo}
                            climbResult={climbResult}
                            onClimbResultSelect={(result) => setClimbResult(result as any)}
                            climbWithLevels={true}
                            climbLevel={climbLevel}
                            onClimbLevelSelect={(level) => setClimbLevel(level)}
                            onConfirm={pendingWaypoint.type === 'climb' ? () => {
                                if (climbLevel && climbResult) {
                                    const waypoint: PathWaypoint = {
                                        ...pendingWaypoint,
                                        action: climbLevel,
                                        amountLabel: `${climbLevel} ${climbResult === 'success' ? '✓' : '✗'}`,
                                        climbLevel: climbLevel,
                                        climbResult: climbResult,
                                    };
                                    onAddAction(waypoint);
                                    setPendingWaypoint(null);
                                    setClimbLevel(undefined);
                                    setClimbResult('success');
                                    // Show proceed dialog
                                    setShowPostClimbProceed(true);
                                }
                            } : handleFuelConfirm}
                            onCancel={pendingWaypoint.type === 'climb' ? handleClimbCancel : handleFuelCancel}
                        />
                    )}

                    {/* Post-Climb Transition Overlay */}
                    {showPostClimbProceed && onProceed && (
                        <PostClimbProceed
                            isFieldRotated={isFieldRotated}
                            onProceed={onProceed}
                            onStay={() => setShowPostClimbProceed(false)}
                            nextPhaseName="Endgame"
                        />
                    )}
                </div>
            </div>
        </div>
    );

    // Wrap in fullscreen modal or return content directly
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-background p-4 flex flex-col">
                {content}
            </div>
        );
    }

    return content;
}
