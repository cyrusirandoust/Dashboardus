# Changelog

All notable changes to Dashboardus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for v1.1.0
- Access diagnostics panel with permission troubleshooting
- Auto-refresh with configurable intervals
- Live mode for real-time SOC monitoring
- PII anonymization toggle for GDPR compliance
- Auto-lock after inactivity

### Planned for v2.0.0
- Security incidents integration (when available via Lighthouse)
- Compliance trends over time
- Per-tenant health scores
- Custom dashboards per role
- Export to CSV/Excel

---

## [1.0.0] - 2025-11-27

### 🎉 Initial Release

The first production-ready release of Dashboardus - a secure, enterprise-grade multi-tenant security and compliance dashboard for MSPs.

### Added

#### Core Features
- **Multi-tenant dashboard** via Microsoft 365 Lighthouse
- **Device compliance monitoring** across all customer tenants
- **Real-time data refresh** with manual refresh button
- **Tenant filtering** to focus on specific customers
- **Compliance status filtering** (all devices vs. non-compliant only)
- **Deep links** to Intune, Defender, and Entra admin portals
- **Responsive design** optimized for 4K SOC/NOC displays
- **Dark theme** for low-light environments

#### Authentication & Security
- **MSAL authentication** with Authorization Code + PKCE flow
- **Delegated permissions only** (no client secrets)
- **Session-based token storage** for enhanced security
- **Silent token refresh** for seamless UX
- **Conditional Access support** (MFA, device compliance, phishing-resistant auth)

#### API Integration
- **Microsoft 365 Lighthouse APIs** (beta) for multi-tenant data
  - `/beta/tenantRelationships/managedTenants/tenants`
  - `/beta/tenantRelationships/managedTenants/managedDeviceCompliances`
  - `/beta/tenantRelationships/managedTenants/myRoles`
- **Error handling** with user-friendly messages
- **Retry logic** with exponential backoff for transient errors
- **Rate limiting protection** (429 handling)

#### UI Components
- **Summary cards** showing key metrics:
  - Managed tenants count
  - Device compliance percentage
  - Non-compliant device count
  - Health status indicator
- **Device table** with:
  - Device name, tenant, OS, user, status
  - Last sync timestamp
  - Deep link to Intune admin center
  - Sortable columns
  - Responsive layout
- **Filter controls**:
  - All devices / Non-compliant toggle
  - Tenant dropdown filter
  - Device count badges
- **Header** with:
  - App branding
  - Last updated timestamp
  - Manual refresh button
  - User profile and sign-out

#### Developer Experience
- **TypeScript** for type-safe development
- **React 18** with modern hooks
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for consistent styling
- **ESLint** for code quality
- **Comprehensive documentation**:
  - README.md with setup guide
  - ARCHITECTURE.md with technical details
  - API_REFERENCE.md with endpoint documentation
  - CONTRIBUTING.md for contributors
  - IMPLEMENTATION_PLAN.md with roadmap

### Security

#### Authentication
- ✅ OAuth 2.0 Authorization Code Flow with PKCE
- ✅ No client secrets in frontend code
- ✅ Delegated permissions only (user-context)
- ✅ Session storage for tokens (cleared on browser close)
- ✅ Silent token refresh with interactive fallback

#### API Security
- ✅ Principle of least privilege (minimal Graph scopes)
- ✅ GDAP integration for customer tenant access
- ✅ Lighthouse RBAC enforcement
- ✅ Read-only operations (no write permissions)
- ✅ Deep links for write operations in admin portals

#### Privacy & Compliance
- ✅ GDPR-ready architecture
- ✅ Data minimization (only fetch what's needed)
- ✅ No local data persistence (except session tokens)
- ✅ No analytics or tracking
- ✅ Audit trail via user-context API calls

### Performance

- ✅ Parallel API calls with `Promise.allSettled`
- ✅ Pagination support (top 1000 devices)
- ✅ Efficient React rendering with functional components
- ✅ Tailwind CSS with purged unused styles
- ✅ Vite production build with tree shaking

### Documentation

- ✅ Comprehensive README with setup instructions
- ✅ Architecture documentation with diagrams
- ✅ API reference with endpoint details
- ✅ Contributing guidelines
- ✅ Security best practices
- ✅ Inline code comments explaining security decisions

### Known Limitations

- **Security incidents**: Not yet available via Lighthouse (planned for v2.0)
- **Auto-refresh**: Manual refresh only (planned for v1.1)
- **Historical data**: No compliance trends yet (planned for v2.0)
- **Tenant filtering bug**: Some tenants may not show devices correctly (investigating)
- **Compliance status**: May show "unknown" for some devices (API data issue)

### Technical Details

#### Dependencies
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- @azure/msal-browser 3.7.0
- @azure/msal-react 2.0.0
- @microsoft/microsoft-graph-client 3.0.7
- Tailwind CSS 3.3.6
- Lucide React 0.294.0

#### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

#### Microsoft 365 Requirements
- Microsoft 365 Lighthouse enabled
- GDAP relationships configured
- Azure AD app registration with delegated permissions

---

## Development History

### 2025-11-27 - Initial Development
- **Duration**: ~4 hours (outside business hours)
- **Tool**: IBM Bob AI coding assistant
- **Approach**: Rapid prototyping with AI-assisted development
- **Result**: Production-ready v1.0 release

### Key Milestones
1. ✅ Project scaffolding (Vite + React + TypeScript)
2. ✅ MSAL authentication implementation
3. ✅ Microsoft Graph API integration
4. ✅ Lighthouse API wrappers
5. ✅ Dashboard UI components
6. ✅ Device filtering and display
7. ✅ Error handling and retry logic
8. ✅ Documentation and security review

---

## Acknowledgments

Special thanks to:
- **IBM Bob** - AI coding assistant that made rapid development possible
- **Sripathi Dantuluri** - For introducing IBM Bob and inspiring innovation
- **Richard Hogan & David Rowley** - For similar projects that inspired this work
- **Tim Callaghan** - For encouraging outside-the-box thinking
- **Microsoft** - For excellent cloud services (Entra, Intune, Defender, Lighthouse)

---

## Links

- [GitHub Repository](https://github.com/cyrusirandoust/dashboardus)
- [Documentation](https://github.com/cyrusirandoust/dashboardus/tree/main/docs)
- [Issues](https://github.com/cyrusirandoust/dashboardus/issues)
- [Discussions](https://github.com/cyrusirandoust/dashboardus/discussions)

---

[Unreleased]: https://github.com/cyrusirandoust/dashboardus/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cyrusirandoust/dashboardus/releases/tag/v1.0.0