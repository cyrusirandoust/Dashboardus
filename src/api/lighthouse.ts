/**
 * Microsoft 365 Lighthouse API Wrapper with Fallback
 * 
 * Functions to interact with Lighthouse managedTenants endpoints
 * for multi-tenant MSP scenarios.
 * 
 * FALLBACK STRATEGY:
 * - If Lighthouse (/beta) is not available, falls back to v1.0 Intune APIs
 * - Uses current tenant's Intune data as a single-tenant view
 * - Provides graceful degradation for MSPs without Lighthouse access
 */

import type { 
  ManagedTenant, 
  ManagedDeviceCompliance,
  MyRole,
  LighthouseApiResponse 
} from '@/types';
import { retryWithBackoff, handleGraphError } from './graphClient';

// Track if Lighthouse is available to avoid repeated failed attempts
let lighthouseAvailable: boolean | null = null;

/**
 * Check if Lighthouse API is available for this tenant.
 * 
 * @param graphClient - Authenticated Graph client
 * @returns True if Lighthouse is available
 */
async function isLighthouseAvailable(graphClient: any): Promise<boolean> {
  if (lighthouseAvailable !== null) {
    return lighthouseAvailable;
  }

  try {
    console.info('[Lighthouse] Checking Lighthouse availability...');
    await graphClient
      .api('/tenantRelationships/managedTenants/tenants')
      .version('beta')
      .top(1)
      .get();
    
    lighthouseAvailable = true;
    console.info('[Lighthouse] ✓ Lighthouse API is available');
    return true;
  } catch (error: any) {
    if (error?.statusCode === 404 || error?.message?.includes('not found')) {
      lighthouseAvailable = false;
      console.warn('[Lighthouse] ✗ Lighthouse API not available - using fallback mode');
      console.warn('[Lighthouse] This is normal if your tenant does not have Microsoft 365 Lighthouse enabled');
      return false;
    }
    // Other errors (403, 401) might be permission issues - but Lighthouse might still be available
    console.warn('[Lighthouse] Permission error, but Lighthouse might be available:', error.message);
    lighthouseAvailable = true; // Assume available if we get permission errors
    return true;
  }
}

/**
 * Get current tenant info as a fallback "managed tenant".
 * 
 * @param graphClient - Authenticated Graph client
 * @returns Array with single tenant (current tenant)
 */
async function getCurrentTenantAsManagedTenant(graphClient: any): Promise<ManagedTenant[]> {
  try {
    console.info('[Lighthouse] Fallback: Fetching current tenant info...');
    
    const orgResponse: any = await retryWithBackoff(() =>
      graphClient.api('/organization').get()
    );

    const org = orgResponse.value[0];
    
    const tenant: ManagedTenant = {
      id: org.id,
      tenantId: org.id,
      displayName: org.displayName || 'Current Tenant',
      defaultDomainName: org.verifiedDomains?.find((d: any) => d.isDefault)?.name || 'unknown',
      tenantStatusInformation: {
        onboardingStatus: 'Active',
        offboardingStatus: null,
      },
    };

    console.info(`[Lighthouse] Fallback: Using current tenant as managed tenant: ${tenant.displayName}`);
    return [tenant];
  } catch (error) {
    console.error('[Lighthouse] Fallback: Error fetching current tenant:', error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get device compliance from current tenant's Intune as fallback.
 * 
 * @param graphClient - Authenticated Graph client
 * @param tenantId - Current tenant ID
 * @param filter - Optional compliance filter
 * @returns Array of device compliance records
 */
async function getIntuneDeviceComplianceFallback(
  graphClient: any,
  tenantId: string,
  filter?: string
): Promise<ManagedDeviceCompliance[]> {
  try {
    console.info('[Lighthouse] Fallback: Fetching Intune managed devices...');
    
    let request = graphClient
      .api('/deviceManagement/managedDevices')
      .select('id,deviceName,operatingSystem,osVersion,complianceState,lastSyncDateTime,userPrincipalName,managedDeviceOwnerType')
      .top(1000);

    if (filter) {
      request = request.filter(filter);
    }

    const response: any = await retryWithBackoff(() => request.get());

    // Transform Intune device format to ManagedDeviceCompliance format
    const devices: ManagedDeviceCompliance[] = response.value.map((device: any) => ({
      id: device.id,
      tenantId: tenantId,
      tenantDisplayName: 'Current Tenant',
      managedDeviceId: device.id,
      managedDeviceName: device.deviceName,
      complianceStatus: mapIntuneComplianceState(device.complianceState),
      osDescription: device.operatingSystem,
      osVersion: device.osVersion,
      ownerType: device.managedDeviceOwnerType,
      lastSyncDateTime: device.lastSyncDateTime,
      userPrincipalName: device.userPrincipalName,
      inGracePeriodUntilDateTime: null,
    }));

    console.info(`[Lighthouse] Fallback: Found ${devices.length} devices from Intune`);
    return devices;
  } catch (error) {
    console.error('[Lighthouse] Fallback: Error fetching Intune devices:', error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Map Intune complianceState to Lighthouse complianceStatus format.
 */
function mapIntuneComplianceState(state: string): string {
  const mapping: Record<string, string> = {
    'compliant': 'compliant',
    'noncompliant': 'noncompliant',
    'conflict': 'noncompliant',
    'error': 'error',
    'inGracePeriod': 'inGracePeriod',
    'configManager': 'unknown',
    'unknown': 'unknown',
  };
  return mapping[state] || 'unknown';
}

/**
 * Get all managed tenants from Lighthouse (or fallback to current tenant).
 * 
 * @param graphClient - Authenticated Graph client
 * @returns Array of managed tenants
 */
export async function getManagedTenants(graphClient: any): Promise<ManagedTenant[]> {
  try {
    const hasLighthouse = await isLighthouseAvailable(graphClient);
    
    if (hasLighthouse) {
      console.info('[Lighthouse] Fetching managed tenants from Lighthouse...');
      
      const response: LighthouseApiResponse<ManagedTenant> = await retryWithBackoff(() =>
        graphClient
          .api('/tenantRelationships/managedTenants/tenants')
          .version('beta')
          .get()
      );

      console.info(`[Lighthouse] Found ${response.value.length} managed tenants`);
      return response.value;
    } else {
      // Fallback: Use current tenant
      return await getCurrentTenantAsManagedTenant(graphClient);
    }
  } catch (error) {
    console.error('[Lighthouse] Error fetching managed tenants:', error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get device compliance data across all managed tenants (or current tenant).
 * 
 * @param graphClient - Authenticated Graph client
 * @param filter - Optional OData filter
 * @returns Array of device compliance records
 */
export async function getManagedDeviceCompliance(
  graphClient: any,
  filter?: string
): Promise<ManagedDeviceCompliance[]> {
  try {
    const hasLighthouse = await isLighthouseAvailable(graphClient);
    
    if (hasLighthouse) {
      console.info('[Lighthouse] Fetching device compliance from Lighthouse...');
      
      let request = graphClient
        .api('/tenantRelationships/managedTenants/managedDeviceCompliances')
        .version('beta')
        .top(1000);

      if (filter) {
        request = request.filter(filter);
      }

      const response: LighthouseApiResponse<ManagedDeviceCompliance> = await retryWithBackoff(() =>
        request.get()
      );

      console.info(`[Lighthouse] Found ${response.value.length} device compliance records`);
      return response.value;
    } else {
      // Fallback: Get devices from current tenant's Intune
      const tenants = await getCurrentTenantAsManagedTenant(graphClient);
      const tenantId = tenants[0]?.tenantId || '';
      
      // Convert filter from Lighthouse format to Intune format if needed
      let intuneFilter = filter;
      if (filter?.includes('complianceStatus')) {
        intuneFilter = filter.replace('complianceStatus', 'complianceState');
      }
      
      return await getIntuneDeviceComplianceFallback(graphClient, tenantId, intuneFilter);
    }
  } catch (error) {
    console.error('[Lighthouse] Error fetching device compliance:', error);
    throw new Error(handleGraphError(error));
  }
}

/**
 * Get non-compliant devices only.
 * 
 * @param graphClient - Authenticated Graph client
 * @returns Array of non-compliant device records
 */
export async function getNonCompliantDevices(graphClient: any): Promise<ManagedDeviceCompliance[]> {
  return getManagedDeviceCompliance(
    graphClient,
    "complianceStatus eq 'noncompliant'"
  );
}

/**
 * Get the current user's Lighthouse roles across managed tenants.
 * 
 * @param graphClient - Authenticated Graph client
 * @returns Array of role assignments per tenant
 */
export async function getMyLighthouseRoles(graphClient: any): Promise<MyRole[]> {
  try {
    const hasLighthouse = await isLighthouseAvailable(graphClient);
    
    if (!hasLighthouse) {
      console.info('[Lighthouse] Fallback: Skipping roles check (Lighthouse not available)');
      return [];
    }

    console.info('[Lighthouse] Fetching user roles...');
    
    const response: LighthouseApiResponse<MyRole> = await retryWithBackoff(() =>
      graphClient
        .api('/tenantRelationships/managedTenants/myRoles')
        .version('beta')
        .get()
    );

    console.info(`[Lighthouse] Found roles for ${response.value.length} tenants`);
    return response.value;
  } catch (error) {
    console.error('[Lighthouse] Error fetching roles:', error);
    // Don't throw - roles are optional for diagnostics
    return [];
  }
}

/**
 * Get aggregated compliance statistics per tenant.
 * 
 * @param devices - Array of device compliance records
 * @returns Map of tenant ID to compliance stats
 */
export function aggregateComplianceByTenant(
  devices: ManagedDeviceCompliance[]
): Map<string, {
  total: number;
  compliant: number;
  nonCompliant: number;
  inGracePeriod: number;
  unknown: number;
  error: number;
}> {
  const stats = new Map();

  for (const device of devices) {
    const tenantId = device.tenantId;
    
    if (!stats.has(tenantId)) {
      stats.set(tenantId, {
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        inGracePeriod: 0,
        unknown: 0,
        error: 0,
      });
    }

    const tenantStats = stats.get(tenantId);
    tenantStats.total++;

    switch (device.complianceStatus) {
      case 'compliant':
        tenantStats.compliant++;
        break;
      case 'noncompliant':
        tenantStats.nonCompliant++;
        break;
      case 'inGracePeriod':
        tenantStats.inGracePeriod++;
        break;
      case 'error':
        tenantStats.error++;
        break;
      default:
        tenantStats.unknown++;
    }
  }

  return stats;
}

export default {
  getManagedTenants,
  getManagedDeviceCompliance,
  getNonCompliantDevices,
  getMyLighthouseRoles,
  aggregateComplianceByTenant,
};

// Made with Bob
