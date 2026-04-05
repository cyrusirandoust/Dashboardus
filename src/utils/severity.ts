/**
 * Severity Utilities
 * 
 * Helper functions for mapping severity levels to colors, icons, and labels.
 * Used throughout the dashboard for consistent severity visualization.
 */

import type { IncidentSeverity, ComplianceState } from '@/types';

// ============================================================================
// Severity Color Mapping
// ============================================================================

/**
 * Get Tailwind CSS color class for incident severity.
 * @param severity - Incident severity level
 * @returns Tailwind color class
 */
export function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return 'text-severity-high bg-severity-high/10 border-severity-high';
    case 'medium':
      return 'text-severity-medium bg-severity-medium/10 border-severity-medium';
    case 'low':
      return 'text-severity-low bg-severity-low/10 border-severity-low';
    case 'informational':
      return 'text-severity-info bg-severity-info/10 border-severity-info';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500';
  }
}

/**
 * Get hex color code for incident severity.
 * @param severity - Incident severity level
 * @returns Hex color code
 */
export function getSeverityHexColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return '#ef4444'; // red-500
    case 'medium':
      return '#f59e0b'; // amber-500
    case 'low':
      return '#3b82f6'; // blue-500
    case 'informational':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
}

/**
 * Get background color class for incident severity.
 * @param severity - Incident severity level
 * @returns Tailwind background color class
 */
export function getSeverityBgColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return 'bg-severity-high';
    case 'medium':
      return 'bg-severity-medium';
    case 'low':
      return 'bg-severity-low';
    case 'informational':
      return 'bg-severity-info';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get text color class for incident severity.
 * @param severity - Incident severity level
 * @returns Tailwind text color class
 */
export function getSeverityTextColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return 'text-severity-high';
    case 'medium':
      return 'text-severity-medium';
    case 'low':
      return 'text-severity-low';
    case 'informational':
      return 'text-severity-info';
    default:
      return 'text-gray-500';
  }
}

// ============================================================================
// Compliance State Color Mapping
// ============================================================================

/**
 * Get Tailwind CSS color class for compliance state.
 * @param state - Compliance state
 * @returns Tailwind color class
 */
export function getComplianceColor(state: ComplianceState): string {
  // Handle both lowercase and capitalized values from API
  const normalizedState = state?.toLowerCase();
  
  switch (normalizedState) {
    case 'compliant':
      return 'text-severity-healthy bg-severity-healthy/10 border-severity-healthy';
    case 'noncompliant':
      return 'text-severity-high bg-severity-high/10 border-severity-high';
    case 'ingraceperiod':
      return 'text-severity-medium bg-severity-medium/10 border-severity-medium';
    case 'error':
      return 'text-red-600 bg-red-600/10 border-red-600';
    case 'unknown':
    case 'notapplicable':
    case 'configmanager':
      return 'text-gray-500 bg-gray-500/10 border-gray-500';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500';
  }
}

/**
 * Get hex color code for compliance state.
 * @param state - Compliance state
 * @returns Hex color code
 */
export function getComplianceHexColor(state: ComplianceState): string {
  switch (state) {
    case 'compliant':
      return '#10b981'; // emerald-500
    case 'noncompliant':
      return '#ef4444'; // red-500
    case 'inGracePeriod':
      return '#f59e0b'; // amber-500
    case 'error':
      return '#dc2626'; // red-600
    case 'unknown':
    case 'notApplicable':
    case 'configManager':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
}

// ============================================================================
// Severity Labels
// ============================================================================

/**
 * Get human-readable label for incident severity.
 * @param severity - Incident severity level
 * @returns Human-readable label
 */
export function getSeverityLabel(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    case 'informational':
      return 'Informational';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable label for compliance state.
 * @param state - Compliance state
 * @returns Human-readable label
 */
export function getComplianceLabel(state: ComplianceState): string {
  // Handle both lowercase and capitalized values from API
  const normalizedState = state?.toLowerCase();
  
  switch (normalizedState) {
    case 'compliant':
      return 'Compliant';
    case 'noncompliant':
      return 'Non-Compliant';
    case 'ingraceperiod':
      return 'In Grace Period';
    case 'error':
      return 'Error';
    case 'unknown':
      return 'Unknown';
    case 'notapplicable':
      return 'Not Applicable';
    case 'configmanager':
      return 'Config Manager';
    default:
      return state || 'Unknown';
  }
}

// ============================================================================
// Severity Sorting
// ============================================================================

/**
 * Get numeric value for severity (for sorting).
 * Higher number = higher severity.
 * @param severity - Incident severity level
 * @returns Numeric value
 */
export function getSeverityValue(severity: IncidentSeverity): number {
  switch (severity) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    case 'informational':
      return 0;
    default:
      return -1;
  }
}

/**
 * Compare two severities for sorting.
 * @param a - First severity
 * @param b - Second severity
 * @returns Comparison result (-1, 0, 1)
 */
export function compareSeverity(a: IncidentSeverity, b: IncidentSeverity): number {
  return getSeverityValue(b) - getSeverityValue(a); // Descending order (high first)
}

// ============================================================================
// Health Indicators
// ============================================================================

/**
 * Get health indicator color based on compliance percentage.
 * @param compliancePercentage - Percentage of compliant devices (0-100)
 * @returns Health indicator color ('green' | 'amber' | 'red')
 */
export function getHealthIndicator(compliancePercentage: number): 'green' | 'amber' | 'red' {
  if (compliancePercentage >= 95) {
    return 'green';
  } else if (compliancePercentage >= 80) {
    return 'amber';
  } else {
    return 'red';
  }
}

/**
 * Get Tailwind color class for health indicator.
 * @param indicator - Health indicator ('green' | 'amber' | 'red')
 * @returns Tailwind color class
 */
export function getHealthIndicatorColor(indicator: 'green' | 'amber' | 'red'): string {
  switch (indicator) {
    case 'green':
      return 'text-severity-healthy bg-severity-healthy/10 border-severity-healthy';
    case 'amber':
      return 'text-severity-medium bg-severity-medium/10 border-severity-medium';
    case 'red':
      return 'text-severity-high bg-severity-high/10 border-severity-high';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500';
  }
}

/**
 * Get hex color for health indicator.
 * @param indicator - Health indicator ('green' | 'amber' | 'red')
 * @returns Hex color code
 */
export function getHealthIndicatorHexColor(indicator: 'green' | 'amber' | 'red'): string {
  switch (indicator) {
    case 'green':
      return '#10b981'; // emerald-500
    case 'amber':
      return '#f59e0b'; // amber-500
    case 'red':
      return '#ef4444'; // red-500
    default:
      return '#6b7280';
  }
}

// ============================================================================
// Icon Mapping (for use with lucide-react)
// ============================================================================

/**
 * Get icon name for incident severity.
 * @param severity - Incident severity level
 * @returns Icon name (for lucide-react)
 */
export function getSeverityIcon(severity: IncidentSeverity): string {
  switch (severity) {
    case 'high':
      return 'AlertTriangle';
    case 'medium':
      return 'AlertCircle';
    case 'low':
      return 'Info';
    case 'informational':
      return 'Info';
    default:
      return 'HelpCircle';
  }
}

/**
 * Get icon name for compliance state.
 * @param state - Compliance state
 * @returns Icon name (for lucide-react)
 */
export function getComplianceIcon(state: ComplianceState): string {
  switch (state) {
    case 'compliant':
      return 'CheckCircle';
    case 'noncompliant':
      return 'XCircle';
    case 'inGracePeriod':
      return 'Clock';
    case 'error':
      return 'AlertTriangle';
    case 'unknown':
    case 'notApplicable':
    case 'configManager':
      return 'HelpCircle';
    default:
      return 'HelpCircle';
  }
}

// ============================================================================
// Export All
// ============================================================================

export const severity = {
  // Incident severity
  getSeverityColor,
  getSeverityHexColor,
  getSeverityBgColor,
  getSeverityTextColor,
  getSeverityLabel,
  getSeverityValue,
  getSeverityIcon,
  compareSeverity,
  
  // Compliance state
  getComplianceColor,
  getComplianceHexColor,
  getComplianceLabel,
  getComplianceIcon,
  
  // Health indicators
  getHealthIndicator,
  getHealthIndicatorColor,
  getHealthIndicatorHexColor,
};

export default severity;

// Made with Bob
