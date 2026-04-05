/**
 * MSAL (Microsoft Authentication Library) Configuration
 * 
 * This file configures MSAL for browser-based authentication using
 * the redirect flow with delegated permissions only.
 * 
 * Security Notes:
 * - Uses sessionStorage instead of localStorage for enhanced security on shared screens
 * - Implements redirect flow (more secure than popup for production)
 * - Only requests delegated permissions (no app-only/client credentials)
 * - Follows principle of least privilege with minimal required scopes
 */

import { Configuration, LogLevel, RedirectRequest } from '@azure/msal-browser';

// ============================================================================
// Environment Variables
// ============================================================================

const clientId = import.meta.env.VITE_AAD_CLIENT_ID;
const tenantId = import.meta.env.VITE_AAD_TENANT_ID;

if (!clientId || !tenantId) {
  throw new Error(
    'Missing required environment variables. Please ensure VITE_AAD_CLIENT_ID and VITE_AAD_TENANT_ID are set in your .env file.'
  );
}

// ============================================================================
// MSAL Configuration
// ============================================================================

/**
 * MSAL configuration for the MSP dashboard.
 * 
 * Key security decisions:
 * - cacheLocation: "sessionStorage" - Tokens are cleared when browser tab closes,
 *   providing better security for shared/public displays
 * - storeAuthStateInCookie: false - Not needed for modern browsers, reduces
 *   attack surface
 * - Redirect flow - More secure than popup, better UX on shared screens
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for security on shared screens
    storeAuthStateInCookie: false, // Not needed for modern browsers
    secureCookies: true, // Use secure cookies if cookies are needed
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return; // Never log PII
        }
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL Error]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL Warning]', message);
            return;
          case LogLevel.Info:
            console.info('[MSAL Info]', message);
            return;
          case LogLevel.Verbose:
            console.debug('[MSAL Verbose]', message);
            return;
        }
      },
      logLevel: LogLevel.Warning, // Only log warnings and errors in production
      piiLoggingEnabled: false, // Never log PII
    },
    allowNativeBroker: false, // Not needed for web app
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  },
};

// ============================================================================
// Required Scopes (Delegated Permissions)
// ============================================================================

/**
 * Delegated permission scopes required for the MSP dashboard.
 * 
 * These are the MINIMUM scopes needed for read-only operations:
 * - User.Read: Basic user profile information
 * - ManagedTenants.Read.All: Access to Lighthouse managed tenant data
 * - DeviceManagementManagedDevices.Read.All: Read Intune device compliance
 * - SecurityIncident.Read.All: Read security incidents from Defender
 * - offline_access: Enables refresh tokens for silent token acquisition
 * 
 * IMPORTANT: These are delegated permissions tied to the signed-in user.
 * The user must have appropriate roles in both the partner tenant (Lighthouse)
 * and customer tenants (via GDAP) to access the data.
 */
export const loginRequest: RedirectRequest = {
  scopes: [
    // Basic profile
    'https://graph.microsoft.com/User.Read',
    
    // Microsoft 365 Lighthouse (MSP multi-tenant)
    'https://graph.microsoft.com/ManagedTenants.Read.All',
    
    // Intune Device Management
    'https://graph.microsoft.com/DeviceManagementManagedDevices.Read.All',
    'https://graph.microsoft.com/DeviceManagementConfiguration.Read.All',
    
    // Microsoft Defender XDR (Security Incidents & Alerts)
    'https://graph.microsoft.com/SecurityIncident.Read.All',
    'https://graph.microsoft.com/SecurityAlert.Read.All',
    'https://graph.microsoft.com/SecurityEvents.Read.All',
    'https://graph.microsoft.com/ThreatIndicators.Read.All',
    
    // Microsoft Defender for Endpoint
    'https://graph.microsoft.com/SecurityActions.Read.All',
    
    // Microsoft Purview (Compliance & DLP)
    'https://graph.microsoft.com/InformationProtectionPolicy.Read',
    // Note: ThreatAssessment.Read.All doesn't exist, only ReadWrite version
    
    // Microsoft Entra ID (Identity & Access)
    'https://graph.microsoft.com/Directory.Read.All',
    'https://graph.microsoft.com/AuditLog.Read.All',
    'https://graph.microsoft.com/IdentityRiskEvent.Read.All',
    'https://graph.microsoft.com/IdentityRiskyUser.Read.All',
    
    // Microsoft Sentinel (via Security Graph)
    'https://graph.microsoft.com/SecurityAnalyzedMessage.Read.All',
    
    // Partner/MSP specific
    'https://graph.microsoft.com/PartnerSecurity.Read.All',
    
    // Token refresh
    'offline_access',
  ],
  prompt: 'select_account', // Allow user to select account
};

/**
 * Scopes for silent token acquisition.
 * Same as login scopes but without prompt.
 */
export const tokenRequest = {
  scopes: loginRequest.scopes,
  forceRefresh: false, // Use cached tokens when possible
};

// ============================================================================
// Scope Definitions for Access Diagnostics
// ============================================================================

/**
 * Detailed information about each required scope.
 * Used by the Access Diagnostics panel to explain permissions to users.
 */
export const scopeDefinitions = {
  'User.Read': {
    name: 'User.Read',
    description: 'Read your profile information',
    required: true,
    category: 'Basic',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#userread',
  },
  'ManagedTenants.Read.All': {
    name: 'ManagedTenants.Read.All',
    description: 'Read managed tenant information via Microsoft 365 Lighthouse',
    required: true,
    category: 'Lighthouse',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#managedtenantsreadall',
  },
  'DeviceManagementManagedDevices.Read.All': {
    name: 'DeviceManagementManagedDevices.Read.All',
    description: 'Read device compliance information from Intune',
    required: true,
    category: 'Intune',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#devicemanagementmanageddevicesreadall',
  },
  'DeviceManagementConfiguration.Read.All': {
    name: 'DeviceManagementConfiguration.Read.All',
    description: 'Read Intune device configuration and policies',
    required: true,
    category: 'Intune',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#devicemanagementconfigurationreadall',
  },
  'SecurityIncident.Read.All': {
    name: 'SecurityIncident.Read.All',
    description: 'Read security incidents from Microsoft Defender XDR',
    required: true,
    category: 'Defender XDR',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#securityincidentreadall',
  },
  'SecurityAlert.Read.All': {
    name: 'SecurityAlert.Read.All',
    description: 'Read security alerts from Microsoft Defender',
    required: true,
    category: 'Defender XDR',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#securityalertreadall',
  },
  'SecurityEvents.Read.All': {
    name: 'SecurityEvents.Read.All',
    description: 'Read security events from Microsoft Defender',
    required: true,
    category: 'Defender XDR',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#securityeventsreadall',
  },
  'ThreatIndicators.Read.All': {
    name: 'ThreatIndicators.Read.All',
    description: 'Read threat intelligence indicators',
    required: true,
    category: 'Defender XDR',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#threatindicatorsreadall',
  },
  'SecurityActions.Read.All': {
    name: 'SecurityActions.Read.All',
    description: 'Read security actions from Microsoft Defender for Endpoint',
    required: true,
    category: 'Defender for Endpoint',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#securityactionsreadall',
  },
  'InformationProtectionPolicy.Read': {
    name: 'InformationProtectionPolicy.Read',
    description: 'Read information protection policies from Microsoft Purview',
    required: true,
    category: 'Purview',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#informationprotectionpolicyread',
  },
  // Note: ThreatAssessment.Read.All doesn't exist - only ThreatAssessment.ReadWrite.All is available
  'Directory.Read.All': {
    name: 'Directory.Read.All',
    description: 'Read directory data from Microsoft Entra ID',
    required: true,
    category: 'Entra ID',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#directoryreadall',
  },
  'AuditLog.Read.All': {
    name: 'AuditLog.Read.All',
    description: 'Read audit logs from Microsoft Entra ID',
    required: true,
    category: 'Entra ID',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#auditlogreadall',
  },
  'IdentityRiskEvent.Read.All': {
    name: 'IdentityRiskEvent.Read.All',
    description: 'Read identity risk events from Entra ID Protection',
    required: true,
    category: 'Entra ID Protection',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#identityriskeventreadall',
  },
  'IdentityRiskyUser.Read.All': {
    name: 'IdentityRiskyUser.Read.All',
    description: 'Read risky user information from Entra ID Protection',
    required: true,
    category: 'Entra ID Protection',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#identityriskyuserreadall',
  },
  'SecurityAnalyzedMessage.Read.All': {
    name: 'SecurityAnalyzedMessage.Read.All',
    description: 'Read analyzed messages from Microsoft Sentinel',
    required: true,
    category: 'Sentinel',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#securityanalyzedmessagereadall',
  },
  'PartnerSecurity.Read.All': {
    name: 'PartnerSecurity.Read.All',
    description: 'Read partner security information',
    required: true,
    category: 'Partner/MSP',
    documentation: 'https://learn.microsoft.com/en-us/graph/permissions-reference#partnersecurityreadall',
  },
  'offline_access': {
    name: 'offline_access',
    description: 'Maintain access to data you have given it access to',
    required: true,
    category: 'Authentication',
    documentation: 'https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#offline_access',
  },
};

// ============================================================================
// Protected Resource Map
// ============================================================================

/**
 * Maps API endpoints to required scopes.
 * Used for automatic scope selection when calling different APIs.
 */
export const protectedResources = {
  graphMe: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['https://graph.microsoft.com/User.Read'],
  },
  managedTenants: {
    endpoint: 'https://graph.microsoft.com/beta/tenantRelationships/managedTenants',
    scopes: ['https://graph.microsoft.com/ManagedTenants.Read.All'],
  },
  deviceManagement: {
    endpoint: 'https://graph.microsoft.com/v1.0/deviceManagement',
    scopes: ['https://graph.microsoft.com/DeviceManagementManagedDevices.Read.All'],
  },
  security: {
    endpoint: 'https://graph.microsoft.com/v1.0/security',
    scopes: ['https://graph.microsoft.com/SecurityIncident.Read.All'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get scopes required for a specific API endpoint.
 * @param endpoint - The API endpoint URL
 * @returns Array of required scopes
 */
export function getScopesForEndpoint(endpoint: string): string[] {
  if (endpoint.includes('/me')) {
    return protectedResources.graphMe.scopes;
  }
  if (endpoint.includes('managedTenants')) {
    return protectedResources.managedTenants.scopes;
  }
  if (endpoint.includes('deviceManagement')) {
    return protectedResources.deviceManagement.scopes;
  }
  if (endpoint.includes('security')) {
    return protectedResources.security.scopes;
  }
  // Default to all scopes if endpoint is unknown
  return loginRequest.scopes;
}

/**
 * Check if all required scopes are present in the token.
 * @param tokenScopes - Scopes present in the access token
 * @returns Object with hasAllScopes boolean and array of missing scopes
 */
export function validateScopes(tokenScopes: string[]): {
  hasAllScopes: boolean;
  missingScopes: string[];
} {
  const requiredScopes = loginRequest.scopes.filter(s => s !== 'offline_access');
  const missingScopes = requiredScopes.filter(
    scope => !tokenScopes.some(ts => ts.toLowerCase() === scope.toLowerCase())
  );
  
  return {
    hasAllScopes: missingScopes.length === 0,
    missingScopes,
  };
}

// Made with Bob
