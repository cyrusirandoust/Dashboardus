/**
 * Microsoft Security API Wrapper
 *
 * Functions to interact with Microsoft Graph Security endpoints
 * for security incidents, alerts, and comprehensive M365 E5 security monitoring.
 *
 * Supports:
 * - Microsoft Defender XDR (Incidents, Alerts, Events)
 * - Microsoft Defender for Endpoint
 * - Microsoft Purview (Compliance, DLP)
 * - Microsoft Sentinel (via Security Graph)
 * - Microsoft Entra ID (Identity risks, audit logs)
 */

import type { SecurityIncident, ODataResponse, IncidentSeverity, IncidentStatus } from '@/types';
import { retryWithBackoff, handleGraphError } from './graphClient';

/**
 * Check if user has required security permissions.
 * This helps diagnose permission issues early.
 */
export async function checkSecurityPermissions(graphClient: any): Promise<{
  hasIncidentAccess: boolean;
  hasAlertAccess: boolean;
  hasAuditLogAccess: boolean;
  errors: string[];
}> {
  const result = {
    hasIncidentAccess: false,
    hasAlertAccess: false,
    hasAuditLogAccess: false,
    errors: [] as string[],
  };

  // Test incident access
  try {
    await graphClient.api('/security/incidents').top(1).get();
    result.hasIncidentAccess = true;
  } catch (error: any) {
    result.errors.push(`Incidents: ${error.message || 'Access denied'}`);
  }

  // Test alert access
  try {
    await graphClient.api('/security/alerts_v2').top(1).get();
    result.hasAlertAccess = true;
  } catch (error: any) {
    result.errors.push(`Alerts: ${error.message || 'Access denied'}`);
  }

  // Test audit log access
  try {
    await graphClient.api('/auditLogs/directoryAudits').top(1).get();
    result.hasAuditLogAccess = true;
  } catch (error: any) {
    result.errors.push(`Audit Logs: ${error.message || 'Access denied'}`);
  }

  return result;
}

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
  } catch (error: any) {
    console.error('[Security] Error fetching incidents:', error);
    
    // Provide more helpful error messages for common permission issues
    if (error.statusCode === 403 || error.message?.includes('Missing user permissions')) {
      const permissionError = new Error(
        'Missing required permissions to access security incidents. ' +
        'Please ensure the following permissions are granted in Azure AD:\n' +
        '- SecurityIncident.Read.All\n' +
        '- SecurityAlert.Read.All\n' +
        '- SecurityEvents.Read.All\n\n' +
        'Contact your administrator to grant these permissions.'
      );
      permissionError.name = 'PermissionError';
      throw permissionError;
    }
    
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get security alerts from Microsoft Defender.
 * Uses the v2 alerts API for better coverage.
 *
 * @param graphClient - Authenticated Graph client
 * @param options - Filter options
 * @returns Array of security alerts
 */
export async function getSecurityAlerts(
  graphClient: any,
  options?: {
    severity?: string[];
    status?: string[];
    timeRange?: 'last24h' | 'last7d' | 'last30d';
    top?: number;
  }
): Promise<any[]> {
  try {
    console.info('[Security] Fetching security alerts...');
    
    let request = graphClient
      .api('/security/alerts_v2')
      .top(options?.top || 100)
      .orderby('createdDateTime desc');

    // Build filter
    const filters: string[] = [];
    
    if (options?.severity && options.severity.length > 0) {
      const severityFilter = options.severity
        .map(s => `severity eq '${s}'`)
        .join(' or ');
      filters.push(`(${severityFilter})`);
    }
    
    if (options?.status && options.status.length > 0) {
      const statusFilter = options.status
        .map(s => `status eq '${s}'`)
        .join(' or ');
      filters.push(`(${statusFilter})`);
    }
    
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
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      filters.push(`createdDateTime ge ${startDate.toISOString()}`);
    }
    
    if (filters.length > 0) {
      request = request.filter(filters.join(' and '));
    }

    const response = await retryWithBackoff(() => request.get());
    
    console.info(`[Security] Found ${response.value.length} alerts`);
    return response.value;
  } catch (error: any) {
    console.error('[Security] Error fetching alerts:', error);
    
    if (error.statusCode === 403) {
      console.warn('[Security] Missing SecurityAlert.Read.All permission');
    }
    
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get identity risk events from Entra ID Protection.
 *
 * @param graphClient - Authenticated Graph client
 * @returns Array of risk events
 */
export async function getIdentityRiskEvents(graphClient: any): Promise<any[]> {
  try {
    console.info('[Security] Fetching identity risk events...');
    
    const response = await retryWithBackoff(() =>
      graphClient
        .api('/identityProtection/riskDetections')
        .top(100)
        .orderby('detectedDateTime desc')
        .get()
    );
    
    console.info(`[Security] Found ${response.value.length} risk events`);
    return response.value;
  } catch (error: any) {
    console.error('[Security] Error fetching risk events:', error);
    
    if (error.statusCode === 403) {
      console.warn('[Security] Missing IdentityRiskEvent.Read.All permission');
    }
    
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get risky users from Entra ID Protection.
 *
 * @param graphClient - Authenticated Graph client
 * @returns Array of risky users
 */
export async function getRiskyUsers(graphClient: any): Promise<any[]> {
  try {
    console.info('[Security] Fetching risky users...');
    
    const response = await retryWithBackoff(() =>
      graphClient
        .api('/identityProtection/riskyUsers')
        .filter("riskState eq 'atRisk' or riskState eq 'confirmedCompromised'")
        .top(100)
        .get()
    );
    
    console.info(`[Security] Found ${response.value.length} risky users`);
    return response.value;
  } catch (error: any) {
    console.error('[Security] Error fetching risky users:', error);
    
    if (error.statusCode === 403) {
      console.warn('[Security] Missing IdentityRiskyUser.Read.All permission');
    }
    
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get audit logs from Entra ID.
 *
 * @param graphClient - Authenticated Graph client
 * @param hours - Number of hours to look back (default 24)
 * @returns Array of audit log entries
 */
export async function getAuditLogs(
  graphClient: any,
  hours: number = 24
): Promise<any[]> {
  try {
    console.info('[Security] Fetching audit logs...');
    
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const response = await retryWithBackoff(() =>
      graphClient
        .api('/auditLogs/directoryAudits')
        .filter(`activityDateTime ge ${startDate.toISOString()}`)
        .top(100)
        .orderby('activityDateTime desc')
        .get()
    );
    
    console.info(`[Security] Found ${response.value.length} audit log entries`);
    return response.value;
  } catch (error: any) {
    console.error('[Security] Error fetching audit logs:', error);
    
    if (error.statusCode === 403) {
      console.warn('[Security] Missing AuditLog.Read.All permission');
    }
    
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get comprehensive security posture across all M365 E5 services.
 * This is a convenience function that fetches data from multiple sources.
 *
 * @param graphClient - Authenticated Graph client
 * @returns Object with security data from all sources
 */
export async function getComprehensiveSecurityPosture(graphClient: any): Promise<{
  incidents: SecurityIncident[];
  alerts: any[];
  riskEvents: any[];
  riskyUsers: any[];
  auditLogs: any[];
  errors: string[];
}> {
  const result = {
    incidents: [] as SecurityIncident[],
    alerts: [] as any[],
    riskEvents: [] as any[],
    riskyUsers: [] as any[],
    auditLogs: [] as any[],
    errors: [] as string[],
  };

  // Fetch all data in parallel, but don't fail if one source fails
  const [incidentsResult, alertsResult, riskEventsResult, riskyUsersResult, auditLogsResult] =
    await Promise.allSettled([
      getSecurityIncidents(graphClient, { status: ['active', 'inProgress'], timeRange: 'last30d' }),
      getSecurityAlerts(graphClient, { timeRange: 'last7d' }),
      getIdentityRiskEvents(graphClient),
      getRiskyUsers(graphClient),
      getAuditLogs(graphClient, 24),
    ]);

  // Process results
  if (incidentsResult.status === 'fulfilled') {
    result.incidents = incidentsResult.value;
  } else {
    result.errors.push(`Incidents: ${incidentsResult.reason.message}`);
  }

  if (alertsResult.status === 'fulfilled') {
    result.alerts = alertsResult.value;
  } else {
    result.errors.push(`Alerts: ${alertsResult.reason.message}`);
  }

  if (riskEventsResult.status === 'fulfilled') {
    result.riskEvents = riskEventsResult.value;
  } else {
    result.errors.push(`Risk Events: ${riskEventsResult.reason.message}`);
  }

  if (riskyUsersResult.status === 'fulfilled') {
    result.riskyUsers = riskyUsersResult.value;
  } else {
    result.errors.push(`Risky Users: ${riskyUsersResult.reason.message}`);
  }

  if (auditLogsResult.status === 'fulfilled') {
    result.auditLogs = auditLogsResult.value;
  } else {
    result.errors.push(`Audit Logs: ${auditLogsResult.reason.message}`);
  }

  console.info('[Security] Comprehensive security posture fetched:', {
    incidents: result.incidents.length,
    alerts: result.alerts.length,
    riskEvents: result.riskEvents.length,
    riskyUsers: result.riskyUsers.length,
    auditLogs: result.auditLogs.length,
    errors: result.errors.length,
  });

  return result;
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
