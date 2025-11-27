/**
 * Microsoft 365 Lighthouse API Type Definitions
 * 
 * Types specific to the Lighthouse managedTenants namespace
 * for multi-tenant MSP scenarios.
 */

import { ComplianceState } from './graph';

// ============================================================================
// Managed Tenant Types
// ============================================================================

export interface ManagedTenant {
  id: string;
  tenantId: string;
  displayName: string;
  defaultDomainName: string;
  tenantStatusInformation: TenantStatusInformation;
  contractType?: string;
  delegatedPrivilegeStatus?: string;
}

export interface TenantStatusInformation {
  onboardingStatus: 'Active' | 'Ineligible' | 'InProcess' | 'NotOnboarded';
  offboardingStatus?: string | null;
  workloadStatuses?: WorkloadStatus[];
}

export interface WorkloadStatus {
  workloadName: string;
  status: string;
  onboardedDateTime?: string;
}

// ============================================================================
// Device Compliance Types (Lighthouse)
// ============================================================================

export interface ManagedDeviceCompliance {
  id: string;
  tenantId: string;
  tenantDisplayName: string;
  managedDeviceId: string;
  managedDeviceName: string;
  complianceStatus: ComplianceState;
  osDescription: string;
  osVersion: string;
  lastRefreshedDateTime: string;
  lastSyncDateTime: string;
  inGracePeriodUntilDateTime?: string;
  deviceType?: string;
  userPrincipalName?: string;
  userId?: string;
}

export interface ManagedDeviceComplianceTrend {
  tenantId: string;
  tenantDisplayName: string;
  countDateTime: string;
  compliantDeviceCount: number;
  nonCompliantDeviceCount: number;
  errorDeviceCount: number;
  unknownDeviceCount: number;
  inGracePeriodDeviceCount: number;
  configManagerDeviceCount: number;
  totalDeviceCount: number;
}

// ============================================================================
// Aggregated Policy Compliance Types
// ============================================================================

export interface AggregatedPolicyCompliance {
  id: string;
  tenantId: string;
  tenantDisplayName?: string;
  compliancePolicyId: string;
  compliancePolicyName: string;
  compliancePolicyType?: string;
  compliancePolicyPlatform?: string;
  numberOfCompliantDevices: number;
  numberOfNonCompliantDevices: number;
  numberOfErrorDevices: number;
  numberOfConflictDevices: number;
  numberOfNotApplicableDevices?: number;
  policyModifiedDateTime?: string;
  lastRefreshedDateTime: string;
}

// ============================================================================
// Lighthouse Roles & Permissions
// ============================================================================

export interface MyRole {
  tenantId: string;
  assignments: RoleAssignment[];
}

export interface RoleAssignment {
  assignedRoles: AssignedRole[];
}

export interface AssignedRole {
  roleDefinitionId: string;
  displayName: string;
  description?: string;
  templateId?: string;
}

// ============================================================================
// Tenant Summary & Health
// ============================================================================

export interface TenantSummary {
  tenant: ManagedTenant;
  deviceCompliance: {
    total: number;
    compliant: number;
    nonCompliant: number;
    inGracePeriod: number;
    unknown: number;
    error: number;
  };
  incidentSummary?: {
    total: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

// ============================================================================
// Lighthouse API Response Types
// ============================================================================

export interface LighthouseApiResponse<T> {
  '@odata.context': string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: T[];
}

// ============================================================================
// Client-Side Aggregation Types
// ============================================================================

export interface TenantComplianceStats {
  tenantId: string;
  tenantName: string;
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  compliancePercentage: number;
  healthIndicator: 'green' | 'amber' | 'red';
}

export interface GlobalComplianceStats {
  totalTenants: number;
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  overallCompliancePercentage: number;
  tenantsWithIssues: number;
}

// Made with Bob
