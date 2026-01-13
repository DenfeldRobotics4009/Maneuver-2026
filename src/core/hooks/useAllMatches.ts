/**
 * Hook to fetch all scouting entries from IndexedDB
 */

import { useState, useEffect } from "react";
import { loadScoutingEntriesByEvent } from "@/core/db/database";
import { loadScoutingData } from "@/core/lib/scoutingDataUtils";
import type { ScoutingEntry } from "@/game-template/scoring";

export interface UseAllMatchesResult {
    matches: ScoutingEntry[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetch all scouting entries, optionally filtered by event
 * 
 * @param eventKey - Optional event filter. If not provided, loads ALL entries.
 * @returns Scouting entries from IndexedDB
 */
export const useAllMatches = (eventKey?: string): UseAllMatchesResult => {
    const [matches, setMatches] = useState<ScoutingEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (eventKey) {
                    // Fetch for specific event
                    const entries = await loadScoutingEntriesByEvent(eventKey);
                    setMatches(entries as ScoutingEntry[]);
                } else {
                    // Fetch ALL entries across all events
                    const entries = await loadScoutingData();
                    setMatches(entries as unknown as ScoutingEntry[]);
                }
            } catch (err) {
                console.error("Error loading matches:", err);
                setError(err instanceof Error ? err : new Error("Failed to load matches"));
                setMatches([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, [eventKey]);

    return { matches, isLoading, error };
};
