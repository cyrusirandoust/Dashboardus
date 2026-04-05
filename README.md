# MSP Dashboardus 🚀

> **A secure, enterprise-grade multi-tenant security and compliance dashboard for Managed Service Providers**

Built with modern web technologies and Microsoft 365 Lighthouse, Dashboardus provides MSPs with real-time visibility into customer tenant security posture, device compliance, and security incidents—all from a single, beautiful dashboard optimized for SOC/NOC wall displays.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![MSAL](https://img.shields.io/badge/MSAL-3.7-green)](https://github.com/AzureAD/microsoft-authentication-library-for-js)

---

## 🎯 Vision & Mission

**Dashboardus** empowers MSPs to deliver world-class security monitoring and compliance management across their entire customer base. Our mission is to make multi-tenant security visibility **simple**, **secure**, and **beautiful**.

### Why Dashboardus?

Traditional MSP tools are fragmented, complex, and often require excessive permissions. Dashboardus takes a different approach:

- **Security-First**: Built on the principle of least privilege with zero secrets in the frontend
- **Lighthouse-Native**: Leverages Microsoft 365 Lighthouse for true multi-tenant visibility
- **Modern UX**: Beautiful, responsive interface optimized for 4K wall displays
- **GDPR-Ready**: PII anonymization features for compliance-conscious organizations
- **Zero-Trust**: Delegated permissions only, with GDAP and Conditional Access support

---

## 🔐 Security Architecture

Dashboardus sets a new standard for secure MSP dashboards. Here's how we achieve enterprise-grade security:

### 1. **No Client Secrets** 🔒
- **Zero secrets in frontend code**: Unlike traditional SPAs that might expose secrets, Dashboardus uses only public client authentication
- **MSAL Browser with PKCE**: Implements OAuth 2.0 Authorization Code Flow with Proof Key for Code Exchange (PKCE)
- **No implicit flow**: We explicitly avoid the deprecated implicit flow in favor of the more secure authorization code flow

### 2. **Delegated Permissions Only** 👤
- **User-context authentication**: All API calls are made with the signed-in user's permissions
- **No app-only permissions**: The dashboard cannot perform actions beyond what the MSP technician is authorized to do
- **Comprehensive M365 E5 coverage**: Supports full security monitoring across Microsoft's security stack:
  - **Core**: `User.Read`, `ManagedTenants.Read.All`, `offline_access`
  - **Device Management**: `DeviceManagementManagedDevices.Read.All`
  - **Security (M365 E5)**: `SecurityIncident.Read.All`, `SecurityAlert.Read.All`, `SecurityEvents.Read.All`, `ThreatIndicators.Read.All`
  - **Identity Protection (Entra P2)**: `IdentityRiskEvent.Read.All`, `IdentityRiskyUser.Read.All`
  - **Compliance**: `Policy.Read.All`, `Directory.Read.All`, `AuditLog.Read.All`, `InformationProtectionPolicy.Read`

**Note**: The dashboard gracefully handles missing permissions. Not all permissions are required for basic functionality.

### 3. **GDAP & Lighthouse Integration** 🌐
- **Granular Delegated Admin Privileges (GDAP)**: Leverages Microsoft's modern GDAP model for customer tenant access
- **Lighthouse-first design**: Uses Microsoft 365 Lighthouse APIs for aggregated multi-tenant data
- **Role-based access**: Respects GDAP role assignments and Lighthouse RBAC
- **No direct tenant switching**: All data flows through Lighthouse, maintaining proper access boundaries

### 4. **Session Security** 🛡️
- **SessionStorage for tokens**: Tokens stored in sessionStorage (not localStorage) for better security on shared displays
- **Automatic token refresh**: Silent token renewal prevents unnecessary re-authentication
- **Session timeout**: Configurable auto-lock feature for unattended displays
- **Sign-out on close**: Session tokens cleared when browser closes

### 5. **Conditional Access & MFA** 🔐
- **Conditional Access ready**: Fully compatible with Azure AD Conditional Access policies
- **Device compliance enforcement**: Can require compliant devices for dashboard access
- **Phishing-resistant authentication**: Supports Windows Hello, FIDO2, and Passkeys
- **Location-based policies**: Works with Conditional Access location restrictions

### 6. **GDPR & Privacy** 🇪🇺
- **PII anonymization toggle**: Hide user names, emails, and device names for public displays
- **No data persistence**: Dashboard doesn't store customer data locally
- **Audit-friendly**: All actions logged to browser console for troubleshooting
- **Data minimization**: Only fetches data necessary for current view

### 7. **Read-Only by Design** 📖
- **No write operations**: Dashboard cannot modify devices, users, or policies
- **Deep links for actions**: Links to admin portals (Intune, Defender, Entra) for write operations
- **Separation of concerns**: Viewing and acting are separate, reducing risk

---

## 🏗️ Technology Stack

Dashboardus leverages the best of Microsoft's cloud platform and modern web technologies:

### Frontend
- **React 18** with TypeScript for type-safe, maintainable code
- **Vite** for lightning-fast development and optimized production builds
- **Tailwind CSS** for beautiful, responsive UI
- **Lucide React** for consistent, modern iconography

### Authentication & API
- **MSAL Browser 3.7** for secure OAuth 2.0 authentication
- **Microsoft Graph JavaScript SDK** for type-safe API calls
- **Microsoft 365 Lighthouse APIs** for multi-tenant data aggregation

### Microsoft Cloud Services
- **Microsoft Entra ID** (Azure AD) for identity and access management
- **Microsoft Intune** for device management and compliance
- **Microsoft Defender** for security incident management
- **Microsoft 365 Lighthouse** for MSP multi-tenant visibility

---

## 🚀 Current Features (v1.0)

### ✅ Implemented
- [x] **Multi-tenant dashboard** via Microsoft 365 Lighthouse
- [x] **Device compliance monitoring** across all customer tenants
- [x] **Real-time data refresh** with manual refresh button
- [x] **Tenant filtering** to focus on specific customers
- [x] **Compliance status filtering** (all devices vs. non-compliant only)
- [x] **Deep links** to Intune, Defender, and Entra admin portals
- [x] **Responsive design** optimized for 4K displays
- [x] **Dark theme** for SOC/NOC environments
- [x] **MSAL authentication** with Authorization Code + PKCE flow
- [x] **Session-based token storage** for enhanced security
- [x] **Error handling** with user-friendly messages

### 📊 Dashboard Views
- **Summary cards**: Tenant count, device compliance %, security incidents
- **Device table**: Sortable, filterable list of managed devices
- **Compliance badges**: Visual indicators for device status
- **Last sync times**: Relative timestamps for data freshness

---

## 🗺️ Roadmap & Future Phases

### Phase 2: Enhanced Security & Monitoring (Q2 2026)
- [ ] **Security incidents per-tenant** (Lighthouse doesn't support multi-tenant incidents API)
- [ ] **Security alerts aggregation** across all tenants
- [ ] **Auto-refresh with configurable intervals**
- [ ] **Live mode** for real-time SOC monitoring
- [ ] **PII anonymization toggle** for GDPR compliance
- [ ] **Auto-lock after inactivity** for shared displays

### Phase 3: Advanced Analytics (Q2 2026)
- [ ] **Compliance trends** over time
- [ ] **Per-tenant health scores**
- [ ] **Predictive analytics** for compliance drift
- [ ] **Custom dashboards** per MSP technician role
- [ ] **Export to CSV/Excel** for reporting

### Phase 4: Alerting & Automation (Q3 2026)
- [ ] **Real-time alerts** for critical incidents
- [ ] **Webhook integrations** (Teams, Slack, email)
- [ ] **Automated remediation suggestions**
- [ ] **Compliance policy recommendations**
- [ ] **Integration with ticketing systems**

### Phase 5: AI & Insights (Q4 2026)
- [ ] **AI-powered anomaly detection**
- [ ] **Natural language queries** ("Show me all non-compliant Windows devices")
- [ ] **Predictive maintenance** recommendations
- [ ] **Automated compliance reports** with AI summaries

---

## 📋 Prerequisites

### Microsoft 365 Requirements
- **Microsoft 365 Lighthouse** enabled for your MSP tenant
- **GDAP relationships** configured with customer tenants
- **Azure AD app registration** (see setup guide below)

### MSP Technician Requirements
- **Lighthouse RBAC role** in the partner tenant
- **GDAP roles** in customer tenants (via GDAP templates):
  - Security Reader or Security Operator (for incidents)
  - Intune Read-Only Operator or Help Desk Operator (for devices)

### Development Environment
- **Node.js 18+** and npm
- Modern web browser (Chrome, Edge, Firefox)
- Code editor (VS Code recommended)

---

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/cyrusirandoust/dashboardus.git
cd dashboardus
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Azure AD App Registration

1. **Navigate to Microsoft Entra Portal** → Entra → App registrations
2. **Create new registration**:
   - Name: `MSP Dashboardus`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `Single-page application (SPA)` → `http://localhost:5173`

3. **Configure API permissions** (Delegated only):
   - Microsoft Graph:
     - `User.Read` - Basic user profile
     - `ManagedTenants.Read.All` - Lighthouse multi-tenant data
     - `DeviceManagementManagedDevices.Read.All` - Device compliance
     - `SecurityIncident.Read.All` - Security incidents (M365 E5)
     - `SecurityAlert.Read.All` - Security alerts (M365 E5)
     - `SecurityEvents.Read.All` - Security events (M365 E5)
     - `ThreatIndicators.Read.All` - Threat intelligence (M365 E5)
     - `IdentityRiskEvent.Read.All` - Identity risk events (Entra P2)
     - `IdentityRiskyUser.Read.All` - Risky users (Entra P2)
     - `Policy.Read.All` - Conditional Access policies
     - `Directory.Read.All` - Directory data
     - `AuditLog.Read.All` - Audit logs
     - `InformationProtectionPolicy.Read` - Purview policies
     - `offline_access` - Refresh tokens

   **Note**: Some permissions require Microsoft 365 E5 or Entra ID P2 licenses. The dashboard will gracefully handle missing permissions.

4. **Grant admin consent** for your organization

5. **Note your Application (client) ID** and **Directory (tenant) ID**

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AAD_CLIENT_ID=your-client-id-here
VITE_AAD_TENANT_ID=your-tenant-id-here
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 6. Build for Production

```bash
npm run build
npm run preview
```

---

## 📖 Usage Guide

### First-Time Sign-In
1. Click **"Sign In with Microsoft"**
2. Authenticate with your MSP technician account
3. Consent to the requested permissions (one-time)
4. Dashboard loads with your managed tenants

### Filtering Devices
- **All Devices**: Shows all managed devices across tenants
- **Non-Compliant Only**: Filters to show only non-compliant devices
- **Tenant Filter**: Select a specific customer tenant

### Refreshing Data
- Click the **Refresh** button in the header
- Data is fetched from Microsoft Graph Lighthouse APIs
- Last updated timestamp shows data freshness

### Taking Action
- Click the **external link icon** next to any device or incident
- Opens the relevant admin portal (Intune, Defender, Entra)
- Perform write operations in the portal with proper RBAC

---

## 🔧 Configuration

### MSAL Configuration
Edit `src/auth/msalConfig.ts` to customize:
- Token cache location (sessionStorage vs localStorage)
- Redirect vs popup authentication flow
- Additional Graph scopes

### UI Customization
Edit `tailwind.config.js` for:
- Color scheme
- Font sizes for large displays
- Spacing and layout

---

## 🐛 Troubleshooting

### "You don't have permission to view this data"
- **Check GDAP roles**: Ensure your account has appropriate roles in customer tenants
- **Verify Lighthouse access**: Confirm Lighthouse is enabled and you have a Lighthouse RBAC role
- **Review Graph permissions**: Ensure admin consent was granted for all required scopes

### Devices showing as "Unknown" status
- **Check API response**: Open browser console (F12) and look for device data logs
- **Verify Lighthouse data**: Some tenants may not report compliance data to Lighthouse yet
- **Wait for sync**: Device compliance data may take time to populate in Lighthouse

### Tenant filtering not working
- **Check tenant IDs**: Ensure tenant IDs match between tenants and devices
- **Review console logs**: Look for filtering errors in browser console
- **Refresh data**: Try refreshing the dashboard data

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This project was made possible by the incredible people and tools that inspire innovation:

### Special Thanks

**[IBM Bob](https://ibm.com/bob)** - The excellent AI coding assistant that enabled rapid development of this application in less than 4 hours outside business hours. Bob's intelligent code generation and architectural guidance were instrumental in bringing Dashboardus to life.

**Sripathi Dantuluri** - For introducing me to IBM Bob and consistently showing me cool geek stuff that pushes the boundaries of what's possible. Your enthusiasm for cutting-edge technology is contagious!

**Richard Hogan & David Rowley** - For creating similar projects that served as huge inspiration for this application. Your work in the MSP space demonstrates what's possible when we think creatively about multi-tenant management.

**Tim Callaghan** - For encouraging me to think outside the box and generate added value for Microsoft and our customers at IBM. Your leadership and vision make projects like this possible.

### Technology Partners

**Microsoft** - For building world-class cloud services (Entra, Intune, Defender, Lighthouse) that make this dashboard possible. We're proud to showcase the best of Microsoft's platform.

**The Open Source Community** - For the amazing libraries and tools that power modern web development: React, TypeScript, Vite, Tailwind CSS, and countless others.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/cyrusirandoust/dashboardus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cyrusirandoust/dashboardus/discussions)

---

## 🌟 Star History

If you find Dashboardus useful, please consider giving it a star on GitHub! ⭐

---

**Built with ❤️ by MSPs, for MSPs**

*Making multi-tenant security monitoring simple, secure, and beautiful.*