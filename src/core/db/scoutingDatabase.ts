/**
 * Scouting Database - Query Functions
 * 
 * Provides query functions to retrieve scouting data from IndexedDB.
 */

import { db } from '@/db';
import type { ScoutingEntryBase } from '@/core/types/scouting-entry';

/**
 * Get all scouting entries for an event
 */
export async function getEntriesByEvent(
    eventKey: string
): Promise<Array<ScoutingEntryBase<Record<string, unknown>> & {
    matchKey: string;
    matchNumber: number;
    allianceColor: 'red' | 'blue';
    scoutName: string;
    gameData: Record<string, unknown>;
}>> {
    try {
        // Query all scouting entries and filter by eventKey
        const allEntries = await db.scoutingData.toArray();

        const filtered = allEntries.filter(entry => entry.eventKey === eventKey);

        console.log(`[ScoutingDB] Found ${filtered.length} entries for event ${eventKey}`);

        return filtered.map(entry => ({
            ...entry,
            matchKey: entry.matchKey || `${eventKey}_qm${entry.matchNumber}`,
            matchNumber: entry.matchNumber,
            allianceColor: entry.allianceColor,
            scoutName: entry.scoutName,
            gameData: (entry.gameData || {}) as Record<string, unknown>,
        }));
    } catch (error) {
        console.error('[ScoutingDB] Error loading entries:', error);
        return [];
    }
}
