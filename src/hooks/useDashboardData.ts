/**
 * Dashboard Data Hook
 * 
 * Custom hook to fetch and manage all dashboard data
 * (tenants, devices, incidents) in one place.
 */

import { useState, useEffect, useCallback } from 'react';
import { useGraphClient } from '@/api/graphClient';
import {
  getManagedTenants,
  getManagedDeviceCompliance,
  aggregateComplianceByTenant,
  getLighthouseSecurityIncidents,
  getLighthouseSecurityAlerts
} from '@/api/lighthouse';
import { markNewIncidents, aggregateIncidentsBySeverity } from '@/api/security';
import type { ManagedTenant, ManagedDeviceCompliance, SecurityIncident, DashboardSummary } from '@/types';

interface DashboardData {
  tenants: ManagedTenant[];
  devices: ManagedDeviceCompliance[];
  incidents: SecurityIncident[];
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage all dashboard data.
 * 
 * Usage:
 * ```tsx
 * const { tenants, devices, incidents, summary, loading, error, refresh } = useDashboardData();
 * ```
 */
export function useDashboardData(): DashboardData {
  const graphClient = useGraphClient();
  
  const [tenants, setTenants] = useState<ManagedTenant[]>([]);
  const [devices, setDevices] = useState<ManagedDeviceCompliance[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [previousIncidents, setPreviousIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Fetch all dashboard data.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.info('[Dashboard] Fetching dashboard data...');

      // Fetch tenants, devices, and security incidents from Lighthouse
      // NOTE: Using Lighthouse API to get multi-tenant security data
      const [tenantsResult, devicesResult, incidentsResult, alertsResult] = await Promise.allSettled([
        getManagedTenants(graphClient),
        getManagedDeviceCompliance(graphClient),
        getLighthouseSecurityIncidents(graphClient),
        getLighthouseSecurityAlerts(graphClient),
      ]);

      // Extract successful results
      const tenantsData = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
      const devicesData = devicesResult.status === 'fulfilled' ? devicesResult.value : [];
      const incidentsData = incidentsResult.status === 'fulfilled' ? incidentsResult.value : [];
      const alertsData = alertsResult.status === 'fulfilled' ? alertsResult.value : [];

      // Combine incidents and alerts into a single incidents array
      // Alerts can be treated as incidents for display purposes
      const combinedIncidents = [...incidentsData, ...alertsData.map((alert: any) => ({
        id: alert.id,
        displayName: alert.alertDisplayName || alert.title || 'Security Alert',
        severity: alert.severity || 'medium',
        status: alert.alertStatus || alert.status || 'active',
        createdDateTime: alert.createdDateTime || alert.alertCreatedDateTime,
        lastUpdateDateTime: alert.lastUpdatedDateTime || alert.alertCreatedDateTime,
        tenantId: alert.tenantId,
        tenantDisplayName: alert.tenantDisplayName,
      }))];

      // Log any failures
      if (tenantsResult.status === 'rejected') {
        console.error('[Dashboard] Failed to fetch tenants:', tenantsResult.reason);
        setError('Failed to fetch customer tenants from Lighthouse');
      }
      if (devicesResult.status === 'rejected') {
        console.error('[Dashboard] Failed to fetch devices:', devicesResult.reason);
        setError('Failed to fetch device compliance from Lighthouse');
      }
      if (incidentsResult.status === 'rejected') {
        console.error('[Dashboard] Failed to fetch security incidents:', incidentsResult.reason);
        console.warn('[Dashboard] Security incidents unavailable from Lighthouse');
      }
      if (alertsResult.status === 'rejected') {
        console.error('[Dashboard] Failed to fetch security alerts:', alertsResult.reason);
        console.warn('[Dashboard] Security alerts unavailable from Lighthouse');
      }

      // Mark new incidents
      const markedIncidents = markNewIncidents(combinedIncidents, previousIncidents);
      setPreviousIncidents(combinedIncidents);

      setTenants(tenantsData);
      setDevices(devicesData);
      setIncidents(markedIncidents);
      setLastUpdated(new Date());

      console.info('[Dashboard] Dashboard data fetched:', {
        tenants: tenantsData.length,
        devices: devicesData.length,
        incidents: incidentsData.length,
        alerts: alertsData.length,
        combined: combinedIncidents.length,
      });
      
      // Debug: Log first device to see actual field names
      if (devicesData.length > 0) {
        console.log('[Dashboard] Sample device data:', devicesData[0]);
      }
      
      // Debug: Log first tenant to see actual field names
      if (tenantsData.length > 0) {
        console.log('[Dashboard] Sample tenant data:', tenantsData[0]);
      }
      
      // Debug: Log first incident/alert to see actual field names
      if (combinedIncidents.length > 0) {
        console.log('[Dashboard] Sample incident/alert data:', combinedIncidents[0]);
      }
    } catch (err: any) {
      console.error('[Dashboard] Unexpected error fetching data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [graphClient, previousIncidents]);

  /**
   * Initial data fetch on mount only (no auto-refresh to prevent loops).
   * Use the manual refresh button to update data.
   */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  /**
   * Calculate dashboard summary statistics.
   */
  const summary: DashboardSummary = {
    tenants: {
      total: tenants.length,
      active: tenants.filter(t => t.tenantStatusInformation?.onboardingStatus === 'Active').length,
      withIssues: 0, // Will be calculated below
    },
    devices: {
      total: devices.length,
      compliant: devices.filter(d => d.complianceStatus?.toLowerCase() === 'compliant').length,
      nonCompliant: devices.filter(d => d.complianceStatus?.toLowerCase() === 'noncompliant').length,
      compliancePercentage: devices.length > 0
        ? Math.round((devices.filter(d => d.complianceStatus?.toLowerCase() === 'compliant').length / devices.length) * 100)
        : 0,
    },
    incidents: {
      ...aggregateIncidentsBySeverity(incidents),
      active: incidents.filter(i => i.status === 'active' || i.status === 'inProgress').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
    },
    health: {
      overallStatus: 'healthy',
      tenantsAtRisk: 0,
      criticalIncidents: incidents.filter(i => i.severity === 'high' && i.status === 'active').length,
    },
  };

  // Calculate tenants with issues
  const complianceByTenant = aggregateComplianceByTenant(devices);
  let tenantsWithIssues = 0;
  
  for (const [tenantId, stats] of complianceByTenant.entries()) {
    if (stats.nonCompliant > 0 || stats.error > 0) {
      tenantsWithIssues++;
    }
  }
  
  summary.tenants.withIssues = tenantsWithIssues;

  // Determine overall health status
  if (summary.health.criticalIncidents > 0 || summary.devices.compliancePercentage < 80) {
    summary.health.overallStatus = 'critical';
  } else if (summary.devices.compliancePercentage < 95 || summary.incidents.high > 0) {
    summary.health.overallStatus = 'warning';
  }

  summary.health.tenantsAtRisk = tenantsWithIssues;

  return {
    tenants,
    devices,
    incidents,
    summary,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}

export default useDashboardData;

// Made with Bob
