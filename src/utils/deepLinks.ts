/**
 * Deep Link Utilities
 * 
 * Generates URLs to Microsoft admin portals for quick navigation.
 * These links allow technicians to perform actions in the appropriate
 * portal where their role-based access controls apply.
 * 
 * Security Note: The dashboard remains read-only. All write operations
 * (block device, disable user, etc.) are performed in the target portal
 * where proper audit trails and role checks are enforced.
 */

// ============================================================================
// Portal Base URLs
// ============================================================================

const PORTALS = {
  intune: 'https://intune.microsoft.com',
  defender: 'https://security.microsoft.com',
  entra: 'https://entra.microsoft.com',
  lighthouse: 'https://lighthouse.microsoft.com',
  admin: 'https://admin.microsoft.com',
} as const;

// ============================================================================
// Intune Admin Center Deep Links
// ============================================================================

/**
 * Generate deep link to a specific device in Intune admin center.
 * @param deviceId - The managed device ID
 * @returns URL to device details page
 */
export function getIntuneDeviceLink(deviceId: string): string {
  return `${PORTALS.intune}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/${deviceId}`;
}

/**
 * Generate deep link to all devices in Intune admin center.
 * @returns URL to devices list page
 */
export function getIntuneDevicesLink(): string {
  return `${PORTALS.intune}/#view/Microsoft_Intune_DeviceSettings/DevicesMenu/~/mDMDevicesPreview`;
}

/**
 * Generate deep link to device compliance policies in Intune.
 * @returns URL to compliance policies page
 */
export function getIntuneCompliancePoliciesLink(): string {
  return `${PORTALS.intune}/#view/Microsoft_Intune_DeviceSettings/DevicesComplianceMenu/~/policies`;
}

// ============================================================================
// Microsoft Defender Portal Deep Links
// ============================================================================

/**
 * Generate deep link to a specific incident in Defender portal.
 * @param incidentId - The security incident ID
 * @returns URL to incident details page
 */
export function getDefenderIncidentLink(incidentId: string): string {
  return `${PORTALS.defender}/incidents/${incidentId}`;
}

/**
 * Generate deep link to all incidents in Defender portal.
 * @param severity - Optional severity filter (high, medium, low)
 * @returns URL to incidents list page
 */
export function getDefenderIncidentsLink(severity?: string): string {
  const baseUrl = `${PORTALS.defender}/incidents`;
  if (severity) {
    return `${baseUrl}?severity=${severity}`;
  }
  return baseUrl;
}

/**
 * Generate deep link to a specific device in Defender portal.
 * @param deviceId - The device ID
 * @returns URL to device details page
 */
export function getDefenderDeviceLink(deviceId: string): string {
  return `${PORTALS.defender}/machines/${deviceId}`;
}

/**
 * Generate deep link to alerts in Defender portal.
 * @returns URL to alerts page
 */
export function getDefenderAlertsLink(): string {
  return `${PORTALS.defender}/alerts`;
}

// ============================================================================
// Microsoft Entra Admin Center Deep Links
// ============================================================================

/**
 * Generate deep link to a specific user in Entra admin center.
 * @param userId - The user object ID or UPN
 * @returns URL to user details page
 */
export function getEntraUserLink(userId: string): string {
  return `${PORTALS.entra}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`;
}

/**
 * Generate deep link to all users in Entra admin center.
 * @returns URL to users list page
 */
export function getEntraUsersLink(): string {
  return `${PORTALS.entra}/#view/Microsoft_AAD_UsersAndTenants/UsersManagementMenuBlade/~/AllUsers`;
}

/**
 * Generate deep link to a specific group in Entra admin center.
 * @param groupId - The group object ID
 * @returns URL to group details page
 */
export function getEntraGroupLink(groupId: string): string {
  return `${PORTALS.entra}/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/${groupId}`;
}

// ============================================================================
// Microsoft 365 Lighthouse Deep Links
// ============================================================================

/**
 * Generate deep link to a specific tenant in Lighthouse.
 * @param tenantId - The tenant ID
 * @returns URL to tenant details page
 */
export function getLighthouseTenantLink(tenantId: string): string {
  return `${PORTALS.lighthouse}/tenants/${tenantId}`;
}

/**
 * Generate deep link to all tenants in Lighthouse.
 * @returns URL to tenants list page
 */
export function getLighthouseTenantsLink(): string {
  return `${PORTALS.lighthouse}/tenants`;
}

/**
 * Generate deep link to device compliance in Lighthouse.
 * @returns URL to device compliance page
 */
export function getLighthouseDeviceComplianceLink(): string {
  return `${PORTALS.lighthouse}/devices/compliance`;
}

/**
 * Generate deep link to security incidents in Lighthouse.
 * @returns URL to security page
 */
export function getLighthouseSecurityLink(): string {
  return `${PORTALS.lighthouse}/security`;
}

// ============================================================================
// Microsoft 365 Admin Center Deep Links
// ============================================================================

/**
 * Generate deep link to a specific tenant's admin center.
 * @param tenantId - The tenant ID
 * @returns URL to tenant admin center
 */
export function getTenantAdminCenterLink(tenantId: string): string {
  return `${PORTALS.admin}?tenantId=${tenantId}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Open a URL in a new tab.
 * @param url - The URL to open
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Copy a URL to clipboard.
 * @param url - The URL to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    console.info('[DeepLinks] URL copied to clipboard');
  } catch (error) {
    console.error('[DeepLinks] Failed to copy URL:', error);
    throw new Error('Failed to copy URL to clipboard');
  }
}

/**
 * Generate a deep link based on type and ID.
 * @param type - The type of resource
 * @param id - The resource ID
 * @returns URL to the resource
 */
export function generateDeepLink(
  type: 'intune-device' | 'defender-incident' | 'entra-user' | 'lighthouse-tenant',
  id: string
): string {
  switch (type) {
    case 'intune-device':
      return getIntuneDeviceLink(id);
    case 'defender-incident':
      return getDefenderIncidentLink(id);
    case 'entra-user':
      return getEntraUserLink(id);
    case 'lighthouse-tenant':
      return getLighthouseTenantLink(id);
    default:
      throw new Error(`Unknown deep link type: ${type}`);
  }
}

// ============================================================================
// Export All
// ============================================================================

export const deepLinks = {
  intune: {
    device: getIntuneDeviceLink,
    devices: getIntuneDevicesLink,
    compliancePolicies: getIntuneCompliancePoliciesLink,
  },
  defender: {
    incident: getDefenderIncidentLink,
    incidents: getDefenderIncidentsLink,
    device: getDefenderDeviceLink,
    alerts: getDefenderAlertsLink,
  },
  entra: {
    user: getEntraUserLink,
    users: getEntraUsersLink,
    group: getEntraGroupLink,
  },
  lighthouse: {
    tenant: getLighthouseTenantLink,
    tenants: getLighthouseTenantsLink,
    deviceCompliance: getLighthouseDeviceComplianceLink,
    security: getLighthouseSecurityLink,
  },
  admin: {
    tenantAdminCenter: getTenantAdminCenterLink,
  },
  helpers: {
    openInNewTab,
    copyToClipboard,
    generateDeepLink,
  },
};

export default deepLinks;

// Made with Bob
