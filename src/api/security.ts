/**
 * Microsoft Security API Wrapper
 * 
 * Functions to interact with Microsoft Graph Security endpoints
 * for security incidents and alerts.
 */

import type { SecurityIncident, ODataResponse, IncidentSeverity, IncidentStatus } from '@/types';
import { retryWithBackoff, handleGraphError } from './graphClient';

/**
 * Get security incidents from Microsoft Defender.
 * 
 * @param graphClient - Authenticated Graph client
 * @param options - Filter options
 * @returns Array of security incidents
 */
export async function getSecurityIncidents(
  graphClient: any,
  options?: {
    severity?: IncidentSeverity[];
    status?: IncidentStatus[];
    timeRange?: 'last24h' | 'last7d' | 'last30d' | 'last90d';
    top?: number;
  }
): Promise<SecurityIncident[]> {
  try {
    console.info('[Security] Fetching security incidents...');
    
    let request = graphClient
      .api('/security/incidents')
      .top(options?.top || 100)
      .orderby('lastUpdateDateTime desc');

    // Build filter string
    const filters: string[] = [];

    // Filter by severity
    if (options?.severity && options.severity.length > 0) {
      const severityFilter = options.severity
        .map(s => `severity eq '${s}'`)
        .join(' or ');
      filters.push(`(${severityFilter})`);
    }

    // Filter by status
    if (options?.status && options.status.length > 0) {
      const statusFilter = options.status
        .map(s => `status eq '${s}'`)
        .join(' or ');
      filters.push(`(${statusFilter})`);
    }

    // Filter by time range
    if (options?.timeRange) {
      const now = new Date();
      let startDate: Date;

      switch (options.timeRange) {
        case 'last24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'last7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      filters.push(`createdDateTime ge ${startDate.toISOString()}`);
    }

    // Apply filters
    if (filters.length > 0) {
      request = request.filter(filters.join(' and '));
    }

    const response: ODataResponse<SecurityIncident> = await retryWithBackoff(() =>
      request.get()
    );

    console.info(`[Security] Found ${response.value.length} incidents`);
    return response.value;
  } catch (error) {
    console.error('[Security] Error fetching incidents:', error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get active (non-resolved) incidents only.
 * 
 * @param graphClient - Authenticated Graph client
 * @param severity - Optional severity filter
 * @returns Array of active incidents
 */
export async function getActiveIncidents(
  graphClient: any,
  severity?: IncidentSeverity[]
): Promise<SecurityIncident[]> {
  return getSecurityIncidents(graphClient, {
    status: ['active', 'inProgress'],
    severity,
    timeRange: 'last30d',
  });
}

/**
 * Get high severity incidents.
 * 
 * @param graphClient - Authenticated Graph client
 * @returns Array of high severity incidents
 */
export async function getHighSeverityIncidents(graphClient: any): Promise<SecurityIncident[]> {
  return getSecurityIncidents(graphClient, {
    severity: ['high'],
    status: ['active', 'inProgress'],
    timeRange: 'last30d',
  });
}

/**
 * Get incident details by ID.
 * 
 * @param graphClient - Authenticated Graph client
 * @param incidentId - Incident ID
 * @returns Incident details
 */
export async function getIncidentDetails(
  graphClient: any,
  incidentId: string
): Promise<SecurityIncident> {
  try {
    console.info(`[Security] Fetching incident ${incidentId}...`);
    
    const incident: SecurityIncident = await retryWithBackoff(() =>
      graphClient
        .api(`/v1.0/security/incidents/${incidentId}`)
        .get()
    );

    return incident;
  } catch (error) {
    console.error(`[Security] Error fetching incident ${incidentId}:`, error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Aggregate incidents by severity.
 * 
 * @param incidents - Array of incidents
 * @returns Count by severity
 */
export function aggregateIncidentsBySeverity(incidents: SecurityIncident[]): {
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
} {
  const stats = {
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
    total: incidents.length,
  };

  for (const incident of incidents) {
    switch (incident.severity) {
      case 'high':
        stats.high++;
        break;
      case 'medium':
        stats.medium++;
        break;
      case 'low':
        stats.low++;
        break;
      case 'informational':
        stats.informational++;
        break;
    }
  }

  return stats;
}

/**
 * Aggregate incidents by status.
 * 
 * @param incidents - Array of incidents
 * @returns Count by status
 */
export function aggregateIncidentsByStatus(incidents: SecurityIncident[]): {
  active: number;
  resolved: number;
  inProgress: number;
  redirected: number;
  total: number;
} {
  const stats = {
    active: 0,
    resolved: 0,
    inProgress: 0,
    redirected: 0,
    total: incidents.length,
  };

  for (const incident of incidents) {
    switch (incident.status) {
      case 'active':
        stats.active++;
        break;
      case 'resolved':
        stats.resolved++;
        break;
      case 'inProgress':
        stats.inProgress++;
        break;
      case 'redirected':
        stats.redirected++;
        break;
    }
  }

  return stats;
}

/**
 * Mark new incidents (created in last 5 minutes).
 * 
 * @param incidents - Array of incidents
 * @param previousIncidents - Previous array of incidents
 * @returns Incidents with isNew flag
 */
export function markNewIncidents(
  incidents: SecurityIncident[],
  previousIncidents: SecurityIncident[] = []
): SecurityIncident[] {
  const previousIds = new Set(previousIncidents.map(i => i.id));
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  return incidents.map(incident => ({
    ...incident,
    isNew: !previousIds.has(incident.id) && 
           new Date(incident.createdDateTime) > fiveMinutesAgo,
  }));
}

export default {
  getSecurityIncidents,
  getActiveIncidents,
  getHighSeverityIncidents,
  getIncidentDetails,
  aggregateIncidentsBySeverity,
  aggregateIncidentsByStatus,
  markNewIncidents,
};

// Made with Bob
