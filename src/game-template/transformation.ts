/**
 * Game-Specific Data Transformation
 * 
 * This module transforms action arrays from match scouting into counter fields
 * for database storage. 
 * 
 * CUSTOMIZE: Modify logic below for your specific game year.
 */

import type { DataTransformation } from "@/types/game-interfaces";

export const gameDataTransformation: DataTransformation = {
  transformActionsToCounters(matchData) {
    // Extract start position index if available
    const selectedPosition = matchData.startPosition?.findIndex((pos: boolean) => pos === true);
    const startPosition = selectedPosition !== undefined && selectedPosition >= 0
      ? selectedPosition
      : null;

    // Initialize default structure
    // Customize this to match your GameData interface
    const result: Record<string, any> = {
      auto: {
        startPosition,
        action1Count: 0,
        action2Count: 0,
        action3Count: 0,
        action4Count: 0,
      },
      teleop: {
        action1Count: 0,
        action2Count: 0,
        action3Count: 0,
      },
      endgame: {
        success: false,
        park: false,
        failed: false,
      },
    };

    // Example: Count actions from action log
    // Customize action types based on your MatchScoutingActions configuration
    matchData.autoActions?.forEach((action: any) => {
      if (action.actionType === 'action1') result.auto.action1Count++;
      else if (action.actionType === 'action2') result.auto.action2Count++;
    });

    matchData.teleopActions?.forEach((action: any) => {
      if (action.actionType === 'action1') result.teleop.action1Count++;
      else if (action.actionType === 'action2') result.teleop.action2Count++;
    });

    // Copy robot status flags
    if (matchData.autoRobotStatus) Object.assign(result.auto, matchData.autoRobotStatus);
    if (matchData.teleopRobotStatus) Object.assign(result.teleop, matchData.teleopRobotStatus);
    if (matchData.endgameRobotStatus) Object.assign(result.endgame, matchData.endgameRobotStatus);

    // Copy generic fields except those we just processed/transformed
    const additionalFields = { ...matchData };
    delete additionalFields.autoActions;
    delete additionalFields.teleopActions;
    delete additionalFields.autoRobotStatus;
    delete additionalFields.teleopRobotStatus;
    delete additionalFields.endgameRobotStatus;
    delete additionalFields.startPosition;

    Object.assign(result, additionalFields);

    return result;
  }
};

export default gameDataTransformation;
