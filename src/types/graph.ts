/**
 * Microsoft Graph API Type Definitions
 * 
 * These types represent the data structures returned by Microsoft Graph API
 * for Lighthouse, Intune, and Security endpoints.
 */

// ============================================================================
// Base Graph Types
// ============================================================================

export interface GraphError {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  date?: string;
  body?: string;
}

export interface ODataResponse<T> {
  '@odata.context': string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: T[];
}

// ============================================================================
// Compliance & Device Types
// ============================================================================

export type ComplianceState = 
  | 'compliant' 
  | 'noncompliant' 
  | 'inGracePeriod' 
  | 'configManager' 
  | 'unknown'
  | 'notApplicable'
  | 'error';

export interface ManagedDevice {
  id: string;
  deviceName: string;
  operatingSystem: string;
  osVersion: string;
  userPrincipalName: string;
  complianceState: ComplianceState;
  lastSyncDateTime: string;
  enrolledDateTime: string;
  managementAgent: string;
  deviceEnrollmentType: string;
  userId?: string;
  emailAddress?: string;
  azureADDeviceId?: string;
  deviceRegistrationState?: string;
  managementState?: string;
}

export interface DeviceCompliancePolicyState {
  id: string;
  displayName: string;
  state: ComplianceState;
  version: number;
  settingStates: DeviceComplianceSettingState[];
}

export interface DeviceComplianceSettingState {
  setting: string;
  settingName?: string;
  state: ComplianceState;
  errorCode: number;
  errorDescription?: string;
  userId?: string;
  userName?: string;
}

// ============================================================================
// Security Incident Types
// ============================================================================

export type IncidentSeverity = 'informational' | 'low' | 'medium' | 'high';

export type IncidentStatus = 
  | 'active' 
  | 'resolved' 
  | 'inProgress' 
  | 'redirected'
  | 'awaitingAction';

export type IncidentClassification = 
  | 'unknown' 
  | 'falsePositive' 
  | 'truePositive' 
  | 'benignPositive'
  | 'unknownFutureValue';

export type AlertSeverity = 'informational' | 'low' | 'medium' | 'high';

export type AlertStatus = 
  | 'new' 
  | 'inProgress' 
  | 'resolved' 
  | 'unknown'
  | 'unknownFutureValue';

export type DetectionSource = 
  | 'microsoftDefenderForEndpoint'
  | 'microsoftDefenderForIdentity'
  | 'microsoftDefenderForCloudApps'
  | 'microsoftDefenderForOffice365'
  | 'microsoft365Defender'
  | 'azureAdIdentityProtection'
  | 'microsoftAppGovernance'
  | 'dataLossPrevention'
  | 'unknownFutureValue';

export interface SecurityIncident {
  id: string;
  incidentWebUrl: string;
  displayName: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  classification: IncidentClassification;
  determination?: string;
  createdDateTime: string;
  lastUpdateDateTime: string;
  assignedTo?: string;
  tags: string[];
  comments: IncidentComment[];
  alerts: Alert[];
  impactedAssets?: ImpactedAsset[];
  tenantId?: string; // Added for multi-tenant tracking
  isNew?: boolean; // Client-side flag for highlighting new incidents
}

export interface Alert {
  alertId: string;
  title: string;
  description?: string;
  severity: AlertSeverity;
  category: string;
  status: AlertStatus;
  detectionSource: DetectionSource;
  serviceSource?: string;
  createdDateTime: string;
  lastUpdateDateTime: string;
  firstActivityDateTime?: string;
  lastActivityDateTime?: string;
  resolvedDateTime?: string;
  actorDisplayName?: string;
  threatDisplayName?: string;
  threatFamilyName?: string;
  mitreTechniques?: string[];
}

export interface IncidentComment {
  comment: string;
  createdBy: string;
  createdDateTime: string;
}

export interface ImpactedAsset {
  '@odata.type': string;
  assetType: 'device' | 'user' | 'mailbox' | 'cloudApplication';
  assetIdentifier: string;
  assetId?: string;
}

// ============================================================================
// User & Identity Types
// ============================================================================

export interface User {
  id: string;
  userPrincipalName: string;
  displayName: string;
  mail?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

// ============================================================================
// Error & Status Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  endpoint?: string;
  requiredPermission?: string;
  guidance?: string;
}

export interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
}

// Made with Bob
