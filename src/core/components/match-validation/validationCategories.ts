/**
 * Validation Categories
 * 
 * Dynamically generated from game-schema.ts
 */

import { getValidationCategories, type ValidationCategoryKey } from '@/game-template/game-schema';

/**
 * Category info type
 */
export interface CategoryInfo {
    key: ValidationCategoryKey;
    label: string;
    description?: string;
    phase?: 'auto' | 'teleop' | 'endgame';
}

/**
 * Get all validation categories from game schema
 */
export function getCategories(): CategoryInfo[] {
    return getValidationCategories() as unknown as CategoryInfo[];
}

/**
 * Get category label by key
 */
export function getCategoryLabel(key: string): string {
    const categories = getValidationCategories();
    const category = categories.find(c => c.key === key);
    return category?.label ?? key;
}

/**
 * Get category phase by key
 */
export function getCategoryPhase(key: string): 'auto' | 'teleop' | 'endgame' | undefined {
    const categories = getValidationCategories();
    const category = categories.find(c => c.key === key);
    return category?.phase;
}
