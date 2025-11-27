# API Reference

This document provides comprehensive details about all Microsoft Graph API calls used in Dashboardus, including why each endpoint is used, why some require beta versions, and the security implications.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Microsoft 365 Lighthouse APIs](#microsoft-365-lighthouse-apis)
4. [Device Management APIs](#device-management-apis)
5. [Security APIs](#security-apis)
6. [API Versioning Strategy](#api-versioning-strategy)
7. [Error Handling](#error-handling)
8. [Rate Limiting & Throttling](#rate-limiting--throttling)

---

## Overview

Dashboardus uses **delegated permissions** exclusively, meaning all API calls are made in the context of the signed-in MSP technician. This ensures:

- **Principle of least privilege**: Users can only access what their roles permit
- **Audit trail**: All actions are tied to a specific user identity
- **No secrets in frontend**: No client secrets or app-only permissions

### Required Permissions (Delegated)

| Permission | Scope | Why Required |
|------------|-------|--------------|
| `User.Read` | Basic profile | Get signed-in user's name and email |
| `ManagedTenants.Read.All` | Lighthouse data | Access multi-tenant aggregated data |
| `DeviceManagementManagedDevices.Read.All` | Intune devices | Read device compliance across tenants |
| `SecurityIncident.Read.All` | Security incidents | Read security incidents (future use) |
| `offline_access` | Token refresh | Enable silent token renewal |
| `openid`, `profile`, `email` | OIDC | Standard OpenID Connect claims |

---

## Authentication Flow

### MSAL Configuration

**File**: `src/auth/msalConfig.ts`

```typescript
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AAD_CLIENT_ID,
    authority: import.meta.env.VITE_AAD_AUTHORITY,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // More secure for shared displays
    storeAuthStateInCookie: false,   // Not needed for modern browsers
  },
};
```

**Why sessionStorage?**
- Tokens cleared when browser closes (better for shared SOC displays)
- Reduces risk of token theft from persistent storage
- Still allows silent token renewal during session

**Why Authorization Code + PKCE?**
- Most secure OAuth 2.0 flow for SPAs
- No client secret required (impossible to secure in frontend)
- PKCE prevents authorization code interception attacks
- Recommended by Microsoft for all public clients

### Token Acquisition

**File**: `src/auth/AuthProvider.tsx`

```typescript
// Silent token acquisition (preferred)
const tokenResponse = await msalInstance.acquireTokenSilent({
  scopes: loginRequest.scopes,
  account: accounts[0],
});

// Fallback to interactive if silent fails
if (!tokenResponse) {
  await msalInstance.acquireTokenRedirect(loginRequest);
}
```

**Why silent-first approach?**
- Better UX: No interruption for users
- Automatic token refresh before expiry
- Falls back to interactive only when necessary (consent, MFA, etc.)

---

## Microsoft 365 Lighthouse APIs

All Lighthouse APIs are in **beta** because Microsoft 365 Lighthouse is a relatively new service with evolving APIs.

### 1. Check Lighthouse Availability

**Endpoint**: `GET /beta/tenantRelationships/managedTenants/tenants`  
**Version**: Beta  
**File**: `src/api/lighthouse.ts` → `isLighthouseAvailable()`

**Purpose**: Detect if the MSP tenant has Lighthouse enabled and the user has access.

**Why Beta?**
- Lighthouse APIs are still evolving
- Microsoft is actively adding features
- GA version not yet available for all Lighthouse endpoints

**Request**:
```http
GET https://graph.microsoft.com/beta/tenantRelationships/managedTenants/tenants?$top=1
Authorization: Bearer {token}
```

**Response** (Success):
```json
{
  "@odata.context": "...",
  "value": [
    {
      "id": "...",
      "tenantId": "...",
      "displayName": "Customer Tenant Name"
    }
  ]
}
```

**Error Handling**:
- `404`: Lighthouse not available or user lacks permissions
- `403`: User doesn't have Lighthouse RBAC role
- Fallback: Use single-tenant mode (not implemented in v1.0)

---

### 2. Get Managed Tenants

**Endpoint**: `GET /beta/tenantRelationships/managedTenants/tenants`  
**Version**: Beta  
**File**: `src/api/lighthouse.ts` → `getManagedTenants()`

**Purpose**: Retrieve list of all customer tenants managed via Lighthouse.

**Why This Endpoint?**
- Provides aggregated view of all customer tenants
- Includes onboarding status and metadata
- Single API call instead of querying each tenant individually

**Why Beta?**
- Lighthouse tenant management APIs are in preview
- Schema may change as Microsoft adds features
- No GA version available yet

**Request**:
```http
GET https://graph.microsoft.com/beta/tenantRelationships/managedTenants/tenants
Authorization: Bearer {token}
```

**Response**:
```json
{
  "@odata.context": "...",
  "@odata.count": 5,
  "value": [
    {
      "id": "managed-tenant-id",
      "tenantId": "customer-tenant-id",
      "displayName": "Contoso Ltd",
      "defaultDomainName": "contoso.onmicrosoft.com",
      "tenantStatusInformation": {
        "onboardingStatus": "Active",
        "workloadStatuses": [...]
      },
      "contractType": "MicrosoftCustomerAgreement",
      "delegatedPrivilegeStatus": "Active"
    }
  ]
}
```

**Key Fields**:
- `tenantId`: Unique identifier for customer tenant
- `displayName`: Customer-friendly name
- `onboardingStatus`: Whether tenant is active in Lighthouse
- `delegatedPrivilegeStatus`: GDAP status

---

### 3. Get Device Compliance (Lighthouse)

**Endpoint**: `GET /beta/tenantRelationships/managedTenants/managedDeviceCompliances`  
**Version**: Beta  
**File**: `src/api/lighthouse.ts` → `getManagedDeviceCompliance()`

**Purpose**: Retrieve device compliance data across ALL managed tenants in a single API call.

**Why This Endpoint?**
- **Multi-tenant aggregation**: Gets data from all customer tenants at once
- **Lighthouse optimization**: Pre-aggregated by Microsoft, faster than per-tenant queries
- **Consistent schema**: Normalized data structure across tenants
- **Reduced API calls**: One call instead of N calls (one per tenant)

**Why Beta?**
- Lighthouse device compliance APIs are in preview
- Microsoft is adding more compliance fields
- Schema stabilization in progress

**Request**:
```http
GET https://graph.microsoft.com/beta/tenantRelationships/managedTenants/managedDeviceCompliances?$top=1000
Authorization: Bearer {token}
```

**Response**:
```json
{
  "@odata.context": "...",
  "@odata.count": 18,
  "value": [
    {
      "id": "compliance-record-id",
      "tenantId": "customer-tenant-id",
      "tenantDisplayName": "Contoso Ltd",
      "managedDeviceId": "device-id",
      "managedDeviceName": "DESKTOP-ABC123",
      "complianceStatus": "noncompliant",
      "osDescription": "Windows",
      "osVersion": "10.0.19045",
      "lastRefreshedDateTime": "2025-11-27T10:30:00Z",
      "lastSyncDateTime": "2025-11-27T09:45:00Z",
      "deviceType": "desktop",
      "userPrincipalName": "user@contoso.com",
      "userId": "user-id"
    }
  ]
}
```

**Key Fields**:
- `complianceStatus`: `compliant`, `noncompliant`, `inGracePeriod`, `error`, `unknown`
- `tenantId`: Links device to customer tenant
- `managedDeviceId`: Unique device identifier (for deep links)
- `lastSyncDateTime`: When device last checked in

**Filtering** (Optional):
```http
GET .../managedDeviceCompliances?$filter=complianceStatus eq 'noncompliant'
```

---

### 4. Get My Lighthouse Roles

**Endpoint**: `GET /beta/tenantRelationships/managedTenants/myRoles`  
**Version**: Beta  
**File**: `src/api/lighthouse.ts` → `getMyLighthouseRoles()`

**Purpose**: Retrieve the signed-in user's Lighthouse RBAC roles and GDAP assignments.

**Why This Endpoint?**
- **Access diagnostics**: Helps troubleshoot permission issues
- **Role visibility**: Shows what the user can access per tenant
- **GDAP mapping**: Links Lighthouse roles to GDAP assignments

**Why Beta?**
- Lighthouse RBAC is evolving
- Microsoft adding more granular roles
- API schema may change

**Request**:
```http
GET https://graph.microsoft.com/beta/tenantRelationships/managedTenants/myRoles
Authorization: Bearer {token}
```

**Response**:
```json
{
  "@odata.context": "...",
  "value": [
    {
      "tenantId": "customer-tenant-id",
      "assignments": [
        {
          "roleDefinitionId": "role-id",
          "roleDefinitionName": "Security Reader",
          "assignmentType": "Delegated"
        }
      ]
    }
  ]
}
```

**Use Cases**:
- Display in "Access & Permissions" troubleshooting panel
- Explain why user can/cannot see certain data
- Guide MSP admins on required role assignments

---

## Device Management APIs

### Classic Intune Device Query (Fallback)

**Endpoint**: `GET /v1.0/deviceManagement/managedDevices`  
**Version**: v1.0 (GA)  
**File**: `src/api/lighthouse.ts` → `getCurrentTenantDevices()` (fallback only)

**Purpose**: Fallback for single-tenant scenarios when Lighthouse is unavailable.

**Why v1.0?**
- Stable, GA API
- Well-documented schema
- Widely used and tested

**Why Not Primary?**
- Requires per-tenant queries (slow for MSPs)
- No multi-tenant aggregation
- More API calls = higher throttling risk

**Request**:
```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$filter=complianceState eq 'noncompliant'
Authorization: Bearer {token}
```

**Note**: This is NOT used in v1.0 of Dashboardus. Lighthouse APIs are primary.

---

## Security APIs

### Security Incidents

**Endpoint**: `GET /v1.0/security/incidents`  
**Version**: v1.0 (GA)  
**File**: `src/api/security.ts` → `getSecurityIncidents()`

**Purpose**: Retrieve security incidents from Microsoft Defender.

**Why v1.0?**
- Security incidents API is GA
- Stable schema
- Production-ready

**Current Status**: 
- ⚠️ **Not used in v1.0**: Lighthouse doesn't provide multi-tenant incident aggregation yet
- 🔮 **Future use**: Will be enabled when Lighthouse adds incident support

**Request**:
```http
GET https://graph.microsoft.com/v1.0/security/incidents?$filter=status eq 'active'&$orderby=createdDateTime desc
Authorization: Bearer {token}
```

**Response**:
```json
{
  "@odata.context": "...",
  "value": [
    {
      "id": "incident-id",
      "displayName": "Suspicious PowerShell Activity",
      "severity": "high",
      "status": "active",
      "classification": "truePositive",
      "determination": "malware",
      "createdDateTime": "2025-11-27T10:00:00Z",
      "lastUpdateDateTime": "2025-11-27T11:30:00Z",
      "assignedTo": "analyst@msp.com",
      "tags": ["automated-investigation"],
      "alerts": [...]
    }
  ]
}
```

**Why Not Multi-Tenant?**
- Defender incidents API doesn't support cross-tenant queries
- Lighthouse doesn't aggregate incidents yet
- Would require per-tenant queries (slow, high API usage)

---

## API Versioning Strategy

### When to Use Beta vs. v1.0

| Scenario | Version | Reason |
|----------|---------|--------|
| Lighthouse APIs | **Beta** | No GA version available; APIs in preview |
| Security Incidents | **v1.0** | GA, stable, production-ready |
| Device Management (fallback) | **v1.0** | GA, stable, widely used |
| User Profile | **v1.0** | GA, stable, basic functionality |

### Beta API Considerations

**Pros**:
- Access to latest features
- Multi-tenant capabilities (Lighthouse)
- Early adoption of new functionality

**Cons**:
- Schema may change without notice
- Breaking changes possible
- Less documentation

**Mitigation**:
- Comprehensive error handling
- Graceful degradation
- Regular testing against beta endpoints
- Monitor Microsoft Graph changelog

### Version Specification in Code

```typescript
// Lighthouse (beta required)
const response = await graphClient
  .api('/tenantRelationships/managedTenants/tenants')
  .version('beta')  // Explicit beta version
  .get();

// Security incidents (v1.0 default)
const response = await graphClient
  .api('/security/incidents')
  // No .version() call = uses default v1.0
  .get();
```

---

## Error Handling

### Common Error Codes

| Code | Meaning | Dashboardus Response |
|------|---------|---------------------|
| `401` | Unauthorized | Trigger interactive login |
| `403` | Forbidden | Show "insufficient permissions" message |
| `404` | Not Found | Lighthouse not available, show guidance |
| `429` | Too Many Requests | Retry with exponential backoff |
| `500` | Server Error | Show error, suggest retry |
| `503` | Service Unavailable | Show error, suggest retry later |

### Error Handling Implementation

**File**: `src/api/graphClient.ts`

```typescript
export function handleGraphError(error: any): string {
  if (error.statusCode === 401) {
    return 'Authentication required. Please sign in again.';
  }
  if (error.statusCode === 403) {
    return 'You don\'t have permission to access this data. Contact your admin.';
  }
  if (error.statusCode === 404) {
    return 'Resource not found. Lighthouse may not be enabled.';
  }
  if (error.statusCode === 429) {
    return 'Too many requests. Please wait and try again.';
  }
  return error.message || 'An unexpected error occurred.';
}
```

### Retry Logic with Exponential Backoff

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.statusCode === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Rate Limiting & Throttling

### Microsoft Graph Limits

| Resource | Limit | Per |
|----------|-------|-----|
| Lighthouse APIs | ~1000 requests | Per app per tenant per 10 minutes |
| Device Management | ~1000 requests | Per app per tenant per 10 minutes |
| Security APIs | ~1000 requests | Per app per tenant per 10 minutes |

### Dashboardus Mitigation Strategies

1. **Batch requests where possible**
   - Use `$top` parameter to limit results
   - Use `$select` to request only needed fields

2. **Implement caching**
   - Cache data in React state
   - Manual refresh only (no auto-refresh in v1.0)
   - Future: Configurable refresh intervals

3. **Retry with backoff**
   - Exponential backoff on 429 errors
   - Max 3 retries per request

4. **Pagination**
   - Handle `@odata.nextLink` for large result sets
   - Limit initial display to 20 items

---

## Deep Links

### Intune Device Link

**Format**: `https://intune.microsoft.com/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/{deviceId}`

**Purpose**: Direct link to device details in Intune admin center

**Why Deep Links?**
- Dashboard is read-only by design
- Write operations require proper RBAC in admin portals
- Separation of viewing and acting

### Defender Incident Link

**Format**: `https://security.microsoft.com/incidents/{incidentId}`

**Purpose**: Direct link to incident details in Microsoft Defender portal

### Entra User Link

**Format**: `https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/{userId}`

**Purpose**: Direct link to user profile in Entra admin center

---

## Future API Enhancements

### Planned for Phase 2

1. **Lighthouse Incident Aggregation**
   - When available, replace per-tenant incident queries
   - Endpoint: `/beta/tenantRelationships/managedTenants/securityIncidents` (hypothetical)

2. **Compliance Trends**
   - Endpoint: `/beta/tenantRelationships/managedTenants/managedDeviceComplianceTrends`
   - Historical compliance data

3. **Aggregated Policy Compliance**
   - Endpoint: `/beta/tenantRelationships/managedTenants/aggregatedPolicyCompliances`
   - Policy-level compliance across tenants

---

## References

- [Microsoft Graph REST API Reference](https://learn.microsoft.com/en-us/graph/api/overview)
- [Microsoft 365 Lighthouse API](https://learn.microsoft.com/en-us/graph/api/resources/managedtenants-managedtenant)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [OAuth 2.0 Authorization Code Flow with PKCE](https://oauth.net/2/pkce/)

---

**Last Updated**: 2025-11-27  
**API Version**: Microsoft Graph Beta & v1.0  
**Dashboardus Version**: 1.0.0