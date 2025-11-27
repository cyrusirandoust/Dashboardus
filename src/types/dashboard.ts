/**
 * Dashboard-Specific Type Definitions
 * 
 * Types for dashboard state, filters, configuration, and UI components.
 */

import { IncidentSeverity, IncidentStatus } from './graph';

// ============================================================================
// Filter Types
// ============================================================================

export interface DashboardFilters {
  selectedTenants: string[]; // Array of tenant IDs
  selectedSeverities: IncidentSeverity[];
  selectedStatuses: IncidentStatus[];
  timeRange: TimeRange;
  showOnlyNonCompliant: boolean;
  searchQuery: string;
}

export type TimeRange = 
  | 'last24h'
  | 'last7d'
  | 'last30d'
  | 'last90d'
  | 'custom';

export interface CustomTimeRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Dashboard Configuration
// ============================================================================

export interface DashboardConfig {
  refreshInterval: number; // milliseconds
  enableLiveMode: boolean;
  liveModeSeverities: IncidentSeverity[]; // Which severities trigger live mode
  autoLockTimeout: number; // milliseconds
  defaultAnonymizePII: boolean;
  maxIncidentsToDisplay: number;
  maxDevicesToDisplay: number;
}

// ============================================================================
// Refresh & Auto-Update Types
// ============================================================================

export interface RefreshState {
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
  nextRefreshTime: Date | null;
  autoRefreshEnabled: boolean;
  liveMode: boolean;
}

export interface RefreshConfig {
  interval: number; // milliseconds
  enabled: boolean;
  onRefresh: () => Promise<void>;
}

// ============================================================================
// Security & Privacy Types
// ============================================================================

export interface SecuritySettings {
  anonymizePII: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // milliseconds
  lastActivityTime: Date;
  isLocked: boolean;
}

export interface AnonymizationRules {
  maskUserNames: boolean;
  maskEmails: boolean;
  maskDeviceNames: boolean;
  maskTenantNames: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface UIState {
  selectedTenantId: string | null;
  expandedTenantIds: string[];
  selectedIncidentId: string | null;
  showAccessPanel: boolean;
  showSettingsPanel: boolean;
  sidebarCollapsed: boolean;
}

export interface ModalState {
  isOpen: boolean;
  type: 'access' | 'settings' | 'incident-details' | 'device-details' | null;
  data?: any;
}

// ============================================================================
// Summary & KPI Types
// ============================================================================

export interface DashboardSummary {
  tenants: {
    total: number;
    active: number;
    withIssues: number;
  };
  devices: {
    total: number;
    compliant: number;
    nonCompliant: number;
    compliancePercentage: number;
  };
  incidents: {
    total: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    active: number;
    resolved: number;
  };
  health: {
    overallStatus: 'healthy' | 'warning' | 'critical';
    tenantsAtRisk: number;
    criticalIncidents: number;
  };
}

// ============================================================================
// Notification & Alert Types
// ============================================================================

export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  autoHide?: boolean;
  autoHideDelay?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Access & Permission Types
// ============================================================================

export interface AccessDiagnostics {
  hasRequiredPermissions: boolean;
  missingPermissions: string[];
  currentRoles: RoleInfo[];
  recommendations: AccessRecommendation[];
}

export interface RoleInfo {
  tenantId: string;
  tenantName: string;
  roles: string[];
}

export interface AccessRecommendation {
  issue: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  documentationUrl?: string;
}

// ============================================================================
// Deep Link Types
// ============================================================================

export interface DeepLinkConfig {
  type: 'intune-device' | 'defender-incident' | 'entra-user' | 'tenant-portal';
  id: string;
  tenantId?: string;
  label?: string;
}

// ============================================================================
// Chart & Visualization Types
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  timestamp: Date;
  value: number;
  label?: string;
}

// ============================================================================
// Table & List Types
// ============================================================================

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig<T> {
  key: keyof T | string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ============================================================================
// Error Display Types
// ============================================================================

export interface ErrorDisplayInfo {
  title: string;
  message: string;
  statusCode?: number;
  canRetry: boolean;
  showAccessHelp: boolean;
  technicalDetails?: string;
}

// ============================================================================
// Loading State Types
// ============================================================================

export interface LoadingState {
  tenants: boolean;
  devices: boolean;
  incidents: boolean;
  roles: boolean;
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface ExportConfig {
  format: 'csv' | 'json' | 'excel';
  includeFilters: boolean;
  includeTimestamp: boolean;
  filename?: string;
}

// ============================================================================
// Theme Types
// ============================================================================

export interface ThemeConfig {
  mode: 'dark' | 'light';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: boolean;
}

// Made with Bob
