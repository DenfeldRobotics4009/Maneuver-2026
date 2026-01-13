/**
 * Scout Gamification Utilities
 * 
 * OPTIONAL FEATURE: Helpers for stake calculations and streak tracking.
 */

import type { Scout } from './types';
import {
    gamificationDB,
    getOrCreateScout,
    updateScoutStats,
} from './database';

/**
 * Stake values for prediction activities
 */
export const STAKE_VALUES = {
    CORRECT_PREDICTION: 10,
    INCORRECT_PREDICTION: 0,
    PARTICIPATION_BONUS: 1,
    STREAK_BONUS_BASE: 2, // Base streak bonus (2 stakes for 2+ in a row)
} as const;

/**
 * Calculate streak bonus stakes based on streak length
 */
export const calculateStreakBonus = (streakLength: number): number => {
    if (streakLength < 2) return 0;
    return STAKE_VALUES.STREAK_BONUS_BASE * (streakLength - 1);
};

/**
 * Calculate scout accuracy percentage
 */
export const calculateAccuracy = (scout: Scout): number => {
    if (scout.totalPredictions === 0) return 0;
    return Math.round((scout.correctPredictions / scout.totalPredictions) * 100);
};

/**
 * Check if current match is sequential to last verified prediction
 */
const isMatchSequential = async (
    scoutName: string,
    eventKey: string,
    currentMatchNumber: number
): Promise<boolean> => {
    const lastPrediction = await gamificationDB.predictions
        .where('scoutName')
        .equals(scoutName)
        .and(prediction => prediction.eventKey === eventKey && prediction.verified)
        .reverse()
        .sortBy('timestamp');

    if (!lastPrediction || lastPrediction.length === 0) {
        return true; // No previous predictions, so this is sequential
    }

    const lastMatchNumber = lastPrediction[0]?.matchNumber || 0;
    const gap = currentMatchNumber - lastMatchNumber;

    // Sequential if gap is 1, 2, or 3 matches (allow for missed matches)
    return gap <= 3 && gap > 0;
};

/**
 * Update scout with prediction result and handle streaks
 * 
 * @param name Scout name
 * @param isCorrect Whether prediction was correct
 * @param basePoints Base points to award
 * @param eventKey Event key
 * @param matchNumber Match number
 * @returns Number of stakes awarded (includes streak bonus)
 */
export const updateScoutWithPredictionResult = async (
    name: string,
    isCorrect: boolean,
    basePoints: number,
    eventKey: string,
    matchNumber: number
): Promise<number> => {
    const scout = await gamificationDB.scouts.get(name);
    if (!scout) return 0;

    let pointsAwarded = 0;
    let newCurrentStreak = scout.currentStreak;
    let newLongestStreak = scout.longestStreak;

    const isSequential = await isMatchSequential(name, eventKey, matchNumber);

    if (isCorrect) {
        pointsAwarded = basePoints;

        if (isSequential || scout.totalPredictions === 0) {
            newCurrentStreak += 1;
        } else {
            newCurrentStreak = 1; // Start new streak
        }

        if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak;
        }

        // Award streak bonus if streak is 2 or more
        if (newCurrentStreak >= 2) {
            const streakBonus = calculateStreakBonus(newCurrentStreak);
            pointsAwarded += streakBonus;
        }
    } else {
        // Reset streak on incorrect prediction
        newCurrentStreak = 0;
    }

    await updateScoutStats(
        name,
        scout.stakes + pointsAwarded,
        scout.correctPredictions + (isCorrect ? 1 : 0),
        scout.totalPredictions + 1,
        newCurrentStreak,
        newLongestStreak,
        pointsAwarded
    );

    return pointsAwarded;
};

/**
 * Get leaderboard (all scouts ordered by stakes)
 */
export const getLeaderboard = async (): Promise<Scout[]> => {
    return await gamificationDB.scouts.orderBy('stakes').reverse().toArray();
};

/**
 * Get or create scout by name (wrapper for convenience)
 */
export const getOrCreateScoutByName = async (name: string): Promise<Scout> => {
    return await getOrCreateScout(name);
};
