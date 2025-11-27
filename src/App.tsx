/**
 * Main Application Component
 *
 * Root component that displays the MSP Dashboardus with authentication,
 * device compliance across customer tenants via Microsoft 365 Lighthouse.
 */

import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { useDashboardData } from './hooks/useDashboardData';
import { formatDateTime, formatRelativeTime } from './utils/dateTime';
import { getSeverityColor, getComplianceColor, getSeverityLabel, getComplianceLabel } from './utils/severity';
import { getIntuneDeviceLink, getDefenderIncidentLink, getEntraUserLink } from './utils/deepLinks';
import { ExternalLink, RefreshCw, AlertTriangle, Shield, Server, Activity, Filter } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoading, account, login, logout } = useAuth();

  // Show loading state while authentication initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              MSP Dashboard
            </h1>
            <p className="text-text-secondary">
              Multi-Tenant Security & Compliance Monitoring
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-text-secondary text-sm">
              Sign in with your MSP technician account to access the dashboard.
            </p>
          </div>

          <button
            onClick={login}
            className="btn-primary w-full"
          >
            Sign In with Microsoft
          </button>

          <div className="mt-6 text-xs text-text-muted">
            <p>This dashboard uses delegated permissions.</p>
            <p>Your access is determined by your assigned roles.</p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return <Dashboard account={account} onLogout={logout} />;
}

// Dashboard component (authenticated view)
function Dashboard({ account, onLogout }: { account: any; onLogout: () => void }) {
  const { tenants, devices, incidents, summary, loading, error, lastUpdated, refresh } = useDashboardData();
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">MSP Dashboardus</h1>
                <p className="text-text-secondary text-sm">
                  Security & Compliance Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="text-right text-sm">
                  <p className="text-text-muted">Last updated</p>
                  <p className="text-text-secondary">{formatRelativeTime(lastUpdated)}</p>
                </div>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {account?.name || 'User'}
                </p>
                <button
                  onClick={onLogout}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 font-medium">Error loading data</p>
            </div>
            <p className="text-text-secondary text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={<Server className="w-6 h-6" />}
            title="Managed Tenants"
            value={summary.tenants.total}
            subtitle={`${summary.tenants.active} active`}
            color="blue"
          />
          <SummaryCard
            icon={<Activity className="w-6 h-6" />}
            title="Device Compliance"
            value={`${summary.devices.compliancePercentage}%`}
            subtitle={`${summary.devices.nonCompliant} non-compliant`}
            color={summary.devices.compliancePercentage >= 95 ? 'green' : summary.devices.compliancePercentage >= 80 ? 'amber' : 'red'}
          />
          <SummaryCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Security Incidents"
            value={summary.incidents.total}
            subtitle={`${summary.incidents.high} high severity`}
            color={summary.incidents.high > 0 ? 'red' : 'green'}
          />
          <SummaryCard
            icon={<Shield className="w-6 h-6" />}
            title="Health Status"
            value={summary.health.overallStatus.toUpperCase()}
            subtitle={`${summary.health.tenantsAtRisk} tenants at risk`}
            color={summary.health.overallStatus === 'healthy' ? 'green' : summary.health.overallStatus === 'warning' ? 'amber' : 'red'}
          />
        </div>

        {loading && !error && (
          <div className="text-center py-12">
            <div className="spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard data...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Device Compliance */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Device Compliance
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {/* Compliance Status Filter */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAllDevices(true)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          showAllDevices
                            ? 'bg-primary text-white'
                            : 'bg-background-card text-text-secondary hover:bg-background-hover border border-border'
                        }`}
                      >
                        All Devices ({devices.length})
                      </button>
                      <button
                        onClick={() => setShowAllDevices(false)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          !showAllDevices
                            ? 'bg-primary text-white'
                            : 'bg-background-card text-text-secondary hover:bg-background-hover border border-border'
                        }`}
                      >
                        Non-Compliant Only ({devices.filter(d => d.complianceStatus === 'noncompliant').length})
                      </button>
                    </div>

                    {/* Tenant Filter */}
                    {tenants.length > 1 && (
                      <select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        className="px-3 py-1 rounded text-sm bg-background-card text-text-secondary border border-border hover:bg-background-hover transition-colors"
                      >
                        <option value="all">All Tenants ({tenants.length})</option>
                        {tenants.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.displayName} ({devices.filter(d => d.tenantId === tenant.id).length} devices)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="btn-secondary text-sm"
                >
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
              <DeviceTable
                devices={devices
                  .filter(d => showAllDevices || d.complianceStatus === 'noncompliant')
                  .filter(d => selectedTenant === 'all' || d.tenantId === selectedTenant)
                }
              />
            </div>

            {/* Security Incidents */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Security Incidents ({incidents.length})
              </h2>
              <IncidentTable incidents={incidents} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'amber' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    red: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>
          <p className="text-text-muted text-xs">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Device Table Component
function DeviceTable({ devices }: { devices: any[] }) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No devices found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Tenant</th>
            <th>OS</th>
            <th>User</th>
            <th>Status</th>
            <th>Last Sync</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.slice(0, 20).map((device) => (
            <tr key={device.id}>
              <td className="font-medium">{device.managedDeviceName}</td>
              <td className="text-text-secondary text-sm">{device.tenantDisplayName}</td>
              <td className="text-text-secondary text-sm">{device.osDescription} {device.osVersion}</td>
              <td className="text-text-secondary text-sm">{device.userPrincipalName || 'N/A'}</td>
              <td>
                <span className={`badge ${getComplianceColor(device.complianceStatus)}`}>
                  {getComplianceLabel(device.complianceStatus)}
                </span>
              </td>
              <td className="text-text-secondary text-sm">{formatRelativeTime(device.lastSyncDateTime)}</td>
              <td>
                <a
                  href={getIntuneDeviceLink(device.managedDeviceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {devices.length > 20 && (
        <p className="text-center text-text-muted text-sm mt-4">
          Showing 20 of {devices.length} devices
        </p>
      )}
    </div>
  );
}

// Incident Table Component
function IncidentTable({ incidents }: { incidents: any[] }) {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No recent security incidents. All clear!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.slice(0, 20).map((incident) => (
            <tr key={incident.id} className={incident.isNew ? 'bg-blue-500/5' : ''}>
              <td>
                <span className={`badge ${getSeverityColor(incident.severity)}`}>
                  {getSeverityLabel(incident.severity)}
                </span>
              </td>
              <td className="font-medium max-w-md truncate">{incident.displayName}</td>
              <td className="text-text-secondary text-sm capitalize">{incident.status}</td>
              <td className="text-text-secondary text-sm">{formatRelativeTime(incident.createdDateTime)}</td>
              <td className="text-text-secondary text-sm">{formatRelativeTime(incident.lastUpdateDateTime)}</td>
              <td>
                <a
                  href={getDefenderIncidentLink(incident.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {incidents.length > 20 && (
        <p className="text-center text-text-muted text-sm mt-4">
          Showing 20 of {incidents.length} incidents
        </p>
      )}
    </div>
  );
}

export default App;

// Made with Bob
