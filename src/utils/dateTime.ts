/**
 * Date and Time Utilities
 * 
 * Helper functions for formatting dates and times in a consistent way
 * throughout the dashboard.
 */

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date string or Date object to a localized date string.
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('[DateTime] Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date string or Date object to a localized time string.
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('[DateTime] Error formatting time:', error);
    return 'Invalid time';
  }
}

/**
 * Format a date string or Date object to a localized date and time string.
 * @param date - Date string or Date object
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 10:30 AM")
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('[DateTime] Error formatting date/time:', error);
    return 'Invalid date/time';
  }
}

/**
 * Format a date string or Date object to ISO 8601 format.
 * @param date - Date string or Date object
 * @returns ISO 8601 formatted string (e.g., "2024-01-15T10:30:00Z")
 */
export function formatISO(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('[DateTime] Error formatting ISO date:', error);
    return '';
  }
}

// ============================================================================
// Relative Time Formatting
// ============================================================================

/**
 * Format a date as relative time (e.g., "2 hours ago", "just now").
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('[DateTime] Error formatting relative time:', error);
    return 'Invalid date';
  }
}

// ============================================================================
// Time Range Utilities
// ============================================================================

/**
 * Get the start date for a time range.
 * @param range - Time range identifier
 * @returns Date object representing the start of the range
 */
export function getTimeRangeStart(range: 'last24h' | 'last7d' | 'last30d' | 'last90d'): Date {
  const now = new Date();
  
  switch (range) {
    case 'last24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'last7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

/**
 * Get a human-readable label for a time range.
 * @param range - Time range identifier
 * @returns Human-readable label
 */
export function getTimeRangeLabel(range: 'last24h' | 'last7d' | 'last30d' | 'last90d'): string {
  switch (range) {
    case 'last24h':
      return 'Last 24 hours';
    case 'last7d':
      return 'Last 7 days';
    case 'last30d':
      return 'Last 30 days';
    case 'last90d':
      return 'Last 90 days';
    default:
      return 'Unknown range';
  }
}

// ============================================================================
// Duration Formatting
// ============================================================================

/**
 * Format a duration in milliseconds to a human-readable string.
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s")
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format milliseconds to minutes and seconds.
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2:30")
 */
export function formatMinutesSeconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a date string or Date object is valid.
 * @param date - Date string or Date object
 * @returns True if valid, false otherwise
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the past.
 * @param date - Date string or Date object
 * @returns True if in the past, false otherwise
 */
export function isInPast(date: string | Date | null | undefined): boolean {
  if (!date || !isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future.
 * @param date - Date string or Date object
 * @returns True if in the future, false otherwise
 */
export function isInFuture(date: string | Date | null | undefined): boolean {
  if (!date || !isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

// ============================================================================
// Comparison
// ============================================================================

/**
 * Compare two dates.
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): number {
  if (!date1 || !date2) return 0;
  
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const time1 = d1.getTime();
  const time2 = d2.getTime();
  
  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
}

// ============================================================================
// Export All
// ============================================================================

export const dateTime = {
  format: formatDate,
  formatTime,
  formatDateTime,
  formatISO,
  formatRelativeTime,
  formatDuration,
  formatMinutesSeconds,
  getTimeRangeStart,
  getTimeRangeLabel,
  isValidDate,
  isInPast,
  isInFuture,
  compareDates,
};

export default dateTime;

// Made with Bob
