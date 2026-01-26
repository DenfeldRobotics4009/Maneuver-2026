/**
 * Hook for field orientation (normal/rotated) with localStorage persistence
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'fieldOrientation';

export interface FieldOrientationState {
    isFieldRotated: boolean;
    toggleFieldOrientation: () => void;
}

export function useFieldOrientation(): FieldOrientationState {
    const [isFieldRotated, setIsFieldRotated] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'rotated';
    });

    const toggleFieldOrientation = useCallback(() => {
        setIsFieldRotated(prev => {
            const newValue = !prev;
            localStorage.setItem(STORAGE_KEY, newValue ? 'rotated' : 'normal');
            return newValue;
        });
    }, []);

    return { isFieldRotated, toggleFieldOrientation };
}
