/**
 * Validation Display Utilities
 * 
 * Utility functions for displaying and formatting validation results.
 * Includes status styling, icons, and severity colors.
 */

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, HelpCircle, FileQuestion } from 'lucide-react';
import type { ValidationStatus, DiscrepancySeverity, ConfidenceLevel } from './matchValidationTypes';

// ============================================================================
// Status Styling
// ============================================================================

/**
 * Get Tailwind CSS classes for status badges
 */
export function getStatusColor(status: ValidationStatus): string {
    switch (status) {
        case 'passed':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'flagged':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'pending':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'no-tba-data':
            return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        case 'no-scouting':
            return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
}

/**
 * Get background color for status cards
 */
export function getStatusBgColor(status: ValidationStatus): string {
    switch (status) {
        case 'passed':
            return 'bg-green-50 dark:bg-green-900/20';
        case 'flagged':
            return 'bg-yellow-50 dark:bg-yellow-900/20';
        case 'failed':
            return 'bg-red-50 dark:bg-red-900/20';
        case 'pending':
            return 'bg-blue-50 dark:bg-blue-900/20';
        default:
            return 'bg-gray-50 dark:bg-gray-900/20';
    }
}

/**
 * Get icon component for validation status
 */
export function getStatusIcon(status: ValidationStatus, className: string = 'h-4 w-4'): React.ReactElement | null {
    switch (status) {
        case 'passed':
            return React.createElement(CheckCircle, { className: `${className} text-green-600 dark:text-green-400` });
        case 'flagged':
            return React.createElement(AlertTriangle, { className: `${className} text-yellow-600 dark:text-yellow-400` });
        case 'failed':
            return React.createElement(XCircle, { className: `${className} text-red-600 dark:text-red-400` });
        case 'pending':
            return React.createElement(Clock, { className: `${className} text-blue-600 dark:text-blue-400` });
        case 'no-tba-data':
            return React.createElement(HelpCircle, { className: `${className} text-gray-500 dark:text-gray-400` });
        case 'no-scouting':
            return React.createElement(FileQuestion, { className: `${className} text-slate-500 dark:text-slate-400` });
        default:
            return null;
    }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ValidationStatus): string {
    switch (status) {
        case 'passed':
            return 'Passed';
        case 'flagged':
            return 'Flagged';
        case 'failed':
            return 'Failed';
        case 'pending':
            return 'Pending';
        case 'no-tba-data':
            return 'No TBA Data';
        case 'no-scouting':
            return 'No Scouting';
        default:
            return 'Unknown';
    }
}

// ============================================================================
// Severity Styling
// ============================================================================

/**
 * Get color classes for discrepancy severity
 */
export function getSeverityColor(severity: DiscrepancySeverity): string {
    switch (severity) {
        case 'critical':
            return 'text-red-600 dark:text-red-400';
        case 'warning':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'minor':
            return 'text-blue-600 dark:text-blue-400';
        case 'none':
            return 'text-gray-600 dark:text-gray-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

/**
 * Get background color for severity badges
 */
export function getSeverityBgColor(severity: DiscrepancySeverity): string {
    switch (severity) {
        case 'critical':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'minor':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'none':
            return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: DiscrepancySeverity): string {
    switch (severity) {
        case 'critical':
            return 'Critical';
        case 'warning':
            return 'Warning';
        case 'minor':
            return 'Minor';
        case 'none':
            return 'None';
        default:
            return 'Unknown';
    }
}

// ============================================================================
// Confidence Styling
// ============================================================================

/**
 * Get color classes for confidence level
 */
export function getConfidenceColor(confidence: ConfidenceLevel): string {
    switch (confidence) {
        case 'high':
            return 'text-green-600 dark:text-green-400';
        case 'medium':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'low':
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

/**
 * Get confidence badge classes
 */
export function getConfidenceBgColor(confidence: ConfidenceLevel): string {
    switch (confidence) {
        case 'high':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'low':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
}

// ============================================================================
// Alliance Styling
// ============================================================================

/**
 * Get alliance color classes
 */
export function getAllianceColor(alliance: 'red' | 'blue'): string {
    return alliance === 'red'
        ? 'text-red-600 dark:text-red-400'
        : 'text-blue-600 dark:text-blue-400';
}

/**
 * Get alliance background color
 */
export function getAllianceBgColor(alliance: 'red' | 'blue'): string {
    return alliance === 'red'
        ? 'bg-red-100 dark:bg-red-900/30'
        : 'bg-blue-100 dark:bg-blue-900/30';
}

/**
 * Get alliance border color
 */
export function getAllianceBorderColor(alliance: 'red' | 'blue'): string {
    return alliance === 'red'
        ? 'border-red-300 dark:border-red-700'
        : 'border-blue-300 dark:border-blue-700';
}

// ============================================================================
// Scouting Status Styling
// ============================================================================

/**
 * Get scouting status color based on completeness
 */
export function getScoutingStatusColor(hasScouting: boolean, scoutingComplete: boolean): string {
    if (!hasScouting) {
        return 'text-slate-500 dark:text-slate-400';
    }
    if (scoutingComplete) {
        return 'text-green-600 dark:text-green-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
}

/**
 * Get scouting status label
 */
export function getScoutingStatusLabel(
    hasScouting: boolean,
    scoutingComplete: boolean,
    teamsScouted?: number
): string {
    if (!hasScouting) {
        return 'Not Scouted';
    }
    if (scoutingComplete) {
        return 'Complete';
    }
    return teamsScouted !== undefined ? `${teamsScouted}/3 Scouted` : 'Partial';
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format difference with sign
 */
export function formatDifference(value: number): string {
    if (value === 0) return '0';
    return value > 0 ? `+${value}` : `${value}`;
}

/**
 * Format score difference with color indication
 */
export function getScoreDifferenceClass(difference: number): string {
    if (difference === 0) return 'text-gray-600 dark:text-gray-400';
    if (Math.abs(difference) <= 5) return 'text-green-600 dark:text-green-400';
    if (Math.abs(difference) <= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}
