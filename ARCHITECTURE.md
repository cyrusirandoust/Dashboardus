# Architecture Documentation

## System Overview

Dashboardus is a modern, security-first single-page application (SPA) built for Managed Service Providers (MSPs) to monitor device compliance and security posture across multiple customer tenants using Microsoft 365 Lighthouse.

### Core Principles

1. **Security First**: Zero secrets in frontend, delegated permissions only, PKCE flow
2. **Lighthouse Native**: Built specifically for Microsoft 365 Lighthouse multi-tenant APIs
3. **Read-Only**: Dashboard displays data; actions performed in admin portals
4. **Modern Stack**: React 18, TypeScript, Vite, Tailwind CSS
5. **Responsive**: Optimized for 4K SOC/NOC displays and mobile devices

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Auth       │  │   Dashboard  │  │  Components  │    │ │
│  │  │   Provider   │  │   Hook       │  │  (UI Layer)  │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │ │
│  │         │                  │                               │ │
│  │         ▼                  ▼                               │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │           MSAL Browser (Auth Layer)              │    │ │
│  │  │  • Authorization Code + PKCE                     │    │ │
│  │  │  • Token Management (sessionStorage)             │    │ │
│  │  │  • Silent Token Refresh                          │    │ │
│  │  └──────────────────┬───────────────────────────────┘    │ │
│  │                     │                                     │ │
│  │                     ▼                                     │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │      Microsoft Graph Client SDK                  │    │ │
│  │  │  • API Wrappers (lighthouse.ts, security.ts)     │    │ │
│  │  │  • Error Handling & Retry Logic                  │    │ │
│  │  │  • Type-Safe API Calls                           │    │ │
│  │  └──────────────────┬───────────────────────────────┘    │ │
│  └────────────────────┼────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTPS (OAuth 2.0 + PKCE)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microsoft Entra ID                            │
│  • Authentication & Authorization                                │
│  • Token Issuance (Access + Refresh)                            │
│  • Conditional Access Policies                                  │
│  • MFA & Phishing-Resistant Auth                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Delegated Permissions
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microsoft Graph API                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Microsoft 365 Lighthouse (Beta)                          │ │
│  │  • /tenantRelationships/managedTenants/tenants            │ │
│  │  • /tenantRelationships/managedTenants/                   │ │
│  │    managedDeviceCompliances                               │ │
│  │  • /tenantRelationships/managedTenants/myRoles            │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Device Management (v1.0) - Fallback Only                │ │
│  │  • /deviceManagement/managedDevices                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Security (v1.0) - Future Use                             │ │
│  │  • /security/incidents                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ GDAP + Lighthouse RBAC
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Customer Tenants (Multi-Tenant)                     │
│  • Tenant A: Devices, Compliance, Security                      │
│  • Tenant B: Devices, Compliance, Security                      │
│  • Tenant C: Devices, Compliance, Security                      │
│  • ...                                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Framework
- **React 18.2**: Modern UI library with hooks and concurrent features
- **TypeScript 5.2**: Type-safe development with excellent IDE support
- **Vite 5.0**: Lightning-fast build tool and dev server

### UI & Styling
- **Tailwind CSS 3.3**: Utility-first CSS framework
- **Lucide React 0.294**: Modern, consistent icon library
- **Custom CSS**: Dark theme optimized for SOC/NOC displays

### Authentication & API
- **@azure/msal-browser 3.7**: Microsoft Authentication Library
- **@azure/msal-react 2.0**: React bindings for MSAL
- **@microsoft/microsoft-graph-client 3.0**: Type-safe Graph API client

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript ESLint**: TypeScript-specific linting
- **PostCSS**: CSS processing with Autoprefixer

---

## Project Structure

```
dashboardus/
├── public/                      # Static assets
├── src/
│   ├── api/                     # Microsoft Graph API wrappers
│   │   ├── graphClient.ts       # Graph client initialization & error handling
│   │   ├── lighthouse.ts        # Lighthouse API calls (tenants, devices)
│   │   └── security.ts          # Security incidents API (future use)
│   │
│   ├── auth/                    # Authentication layer
│   │   ├── msalConfig.ts        # MSAL configuration (OAuth 2.0 + PKCE)
│   │   └── AuthProvider.tsx     # React context for auth state
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useDashboardData.ts  # Data fetching & state management
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── graph.ts             # Microsoft Graph types
│   │   └── lighthouse.ts        # Lighthouse-specific types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── anonymize.ts         # PII anonymization (future)
│   │   ├── dateTime.ts          # Date/time formatting
│   │   ├── deepLinks.ts         # Admin portal URL generation
│   │   └── severity.ts          # Severity/compliance color mapping
│   │
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles & Tailwind imports
│
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── .env.example                 # Environment variables template
├── README.md                    # Main documentation
├── ARCHITECTURE.md              # This file
├── API_REFERENCE.md             # API documentation
└── IMPLEMENTATION_PLAN.md       # Development roadmap

```

---

## Component Architecture

### Component Hierarchy

```
App (Root)
├── AuthProvider (Context)
│   └── Dashboard (Authenticated View)
│       ├── Header
│       │   ├── Logo & Title
│       │   ├── Last Updated Timestamp
│       │   ├── Refresh Button
│       │   └── User Menu (Sign Out)
│       │
│       ├── Summary Cards (Grid)
│       │   ├── Managed Tenants Card
│       │   ├── Device Compliance Card
│       │   ├── Security Incidents Card
│       │   └── Health Status Card
│       │
│       ├── Device Compliance Section
│       │   ├── Filter Controls
│       │   │   ├── All Devices / Non-Compliant Toggle
│       │   │   └── Tenant Dropdown Filter
│       │   └── DeviceTable
│       │       └── Device Rows (with deep links)
│       │
│       └── Security Incidents Section (Future)
│           └── IncidentTable
│               └── Incident Rows (with deep links)
│
└── Login Screen (Unauthenticated View)
    ├── Logo & Title
    ├── Description
    └── Sign In Button
```

### Key Components

#### 1. **App.tsx**
- Root component
- Handles authentication state
- Routes between login and dashboard views

#### 2. **AuthProvider.tsx**
- React Context for authentication
- Wraps MSAL instance
- Provides `login()`, `logout()`, `isAuthenticated`, `account`

#### 3. **Dashboard Component**
- Main authenticated view
- Uses `useDashboardData()` hook for data
- Manages filter state (tenant, compliance status)

#### 4. **useDashboardData Hook**
- Custom hook for data fetching
- Manages loading, error, and data state
- Provides `refresh()` function
- Implements Promise.allSettled for parallel API calls

#### 5. **DeviceTable Component**
- Displays device compliance data
- Sortable columns
- Deep links to Intune admin center
- Responsive design

#### 6. **SummaryCard Component**
- Reusable card for KPIs
- Color-coded by severity/health
- Icon + value + subtitle layout

---

## Data Flow

### 1. Authentication Flow

```
User clicks "Sign In"
    ↓
MSAL initiates Authorization Code + PKCE flow
    ↓
Redirect to Microsoft login page
    ↓
User authenticates (MFA, Conditional Access)
    ↓
Redirect back to app with authorization code
    ↓
MSAL exchanges code for tokens (using PKCE verifier)
    ↓
Access token + Refresh token stored in sessionStorage
    ↓
App renders Dashboard component
```

### 2. Data Fetching Flow

```
Dashboard mounts
    ↓
useDashboardData hook initializes
    ↓
useEffect triggers fetchData()
    ↓
Acquire Graph access token (silent)
    ↓
Parallel API calls via Promise.allSettled:
    ├── getManagedTenants()
    └── getManagedDeviceCompliance()
    ↓
Process responses:
    ├── Success: Update state with data
    └── Failure: Log error, set error message
    ↓
Calculate summary statistics
    ↓
Update lastUpdated timestamp
    ↓
Dashboard re-renders with data
```

### 3. Filtering Flow

```
User changes filter (tenant or compliance status)
    ↓
React state updated (showAllDevices, selectedTenant)
    ↓
Component re-renders
    ↓
DeviceTable receives filtered devices array
    ↓
Table displays filtered results
```

### 4. Refresh Flow

```
User clicks "Refresh" button
    ↓
refresh() function called
    ↓
Set loading state
    ↓
Re-fetch data from Graph API
    ↓
Update state with new data
    ↓
Update lastUpdated timestamp
    ↓
Clear loading state
```

---

## Security Architecture

### Authentication Security

#### OAuth 2.0 Authorization Code Flow with PKCE

**Why PKCE?**
- Prevents authorization code interception attacks
- No client secret required (impossible to secure in frontend)
- Recommended by OAuth 2.0 Security Best Practices

**Flow Details**:
1. Generate random `code_verifier` (43-128 characters)
2. Create `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Send `code_challenge` with authorization request
4. Receive authorization code
5. Exchange code + `code_verifier` for tokens
6. Server validates: SHA256(code_verifier) == code_challenge

**Implementation**:
```typescript
// MSAL handles PKCE automatically
const loginRequest = {
  scopes: ['User.Read', 'ManagedTenants.Read.All'],
  // PKCE enabled by default in MSAL Browser
};
```

### Token Management

#### Storage Strategy

**sessionStorage** (chosen over localStorage):
- ✅ Cleared when browser closes
- ✅ Better for shared SOC displays
- ✅ Reduces token theft risk
- ✅ Still allows silent token refresh during session

**Token Lifecycle**:
1. **Access Token**: 1 hour lifetime, used for API calls
2. **Refresh Token**: 90 days lifetime, used to get new access tokens
3. **Silent Refresh**: MSAL automatically refreshes before expiry
4. **Interactive Fallback**: If silent fails, prompt user

#### Token Security Measures

```typescript
// 1. Tokens never logged or exposed
// 2. Tokens stored in sessionStorage (not localStorage)
// 3. Tokens cleared on sign-out
// 4. No token transmission except to Microsoft endpoints
```

### API Security

#### Delegated Permissions Only

**Why Delegated?**
- All actions tied to user identity (audit trail)
- User can only access what their roles permit
- No elevated privileges beyond user's rights
- Principle of least privilege enforced

**Permission Scopes**:
```typescript
const scopes = [
  'User.Read',                                  // Basic profile
  'ManagedTenants.Read.All',                    // Lighthouse data
  'DeviceManagementManagedDevices.Read.All',    // Device compliance
  'SecurityIncident.Read.All',                  // Security incidents
  'offline_access',                             // Refresh tokens
];
```

#### GDAP Integration

**Granular Delegated Admin Privileges**:
- Modern replacement for legacy DAP
- Fine-grained role assignments per customer tenant
- Time-limited access
- Audit logging
- Least privilege by default

**Dashboardus + GDAP**:
- Dashboard respects GDAP role assignments
- User sees only tenants they have access to
- Actions limited by GDAP roles
- No privilege escalation possible

### Conditional Access Support

**Compatible Policies**:
- ✅ Require MFA
- ✅ Require compliant device
- ✅ Require hybrid Azure AD joined device
- ✅ Require approved client app
- ✅ Location-based restrictions
- ✅ Sign-in risk policies
- ✅ User risk policies

**Phishing-Resistant Authentication**:
- ✅ Windows Hello for Business
- ✅ FIDO2 security keys
- ✅ Passkeys (WebAuthn)
- ✅ Certificate-based authentication

### GDPR & Privacy

#### Data Minimization
- Only fetches data necessary for current view
- No local data persistence (except session tokens)
- No analytics or tracking

#### PII Protection (Future)
- Anonymization toggle for public displays
- Hides: user names, emails, device names
- Shows: compliance status, counts, trends

#### Right to be Forgotten
- No data stored locally (except session)
- Sign out clears all session data
- No cookies (except MSAL session)

---

## Performance Optimization

### API Call Optimization

#### Parallel Requests
```typescript
// Fetch tenants and devices in parallel
const [tenantsResult, devicesResult] = await Promise.allSettled([
  getManagedTenants(graphClient),
  getManagedDeviceCompliance(graphClient),
]);
```

#### Pagination
```typescript
// Limit initial results
.api('/tenantRelationships/managedTenants/managedDeviceCompliances')
.top(1000)  // Fetch up to 1000 devices
```

#### Field Selection (Future)
```typescript
// Request only needed fields
.select('id,tenantId,managedDeviceName,complianceStatus')
```

### Rendering Optimization

#### React Best Practices
- Functional components with hooks
- Memoization where appropriate (future)
- Lazy loading for large lists (future)
- Virtual scrolling for 1000+ devices (future)

#### CSS Optimization
- Tailwind CSS purges unused styles
- Critical CSS inlined
- Minimal custom CSS

---

## Error Handling Strategy

### Layered Error Handling

#### 1. API Layer
```typescript
// graphClient.ts
export function handleGraphError(error: any): string {
  if (error.statusCode === 401) return 'Authentication required';
  if (error.statusCode === 403) return 'Insufficient permissions';
  if (error.statusCode === 404) return 'Resource not found';
  if (error.statusCode === 429) return 'Rate limited';
  return error.message || 'Unexpected error';
}
```

#### 2. Retry Logic
```typescript
// Exponential backoff for transient errors
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.statusCode === 429 && i < maxRetries - 1) {
        await delay(1000 * Math.pow(2, i));
        continue;
      }
      throw error;
    }
  }
}
```

#### 3. UI Layer
```typescript
// Display user-friendly error messages
{error && (
  <div className="error-banner">
    <AlertTriangle />
    <p>{error}</p>
  </div>
)}
```

### Error Recovery

- **401 Unauthorized**: Trigger interactive login
- **403 Forbidden**: Show permissions guidance
- **404 Not Found**: Suggest Lighthouse enablement
- **429 Rate Limited**: Retry with backoff
- **500/503 Server Error**: Suggest retry later

---

## Deployment Architecture

### Development
```
npm run dev
    ↓
Vite dev server (http://localhost:5173)
    ↓
Hot module replacement (HMR)
    ↓
Fast refresh on code changes
```

### Production Build
```
npm run build
    ↓
TypeScript compilation
    ↓
Vite production build
    ↓
Tree shaking & minification
    ↓
Output: dist/ folder
    ↓
Static files ready for hosting
```

### Hosting Options

#### 1. Azure Static Web Apps (Recommended)
- ✅ Free tier available
- ✅ Global CDN
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ GitHub Actions integration

#### 2. Azure App Service
- ✅ Easy deployment
- ✅ Scaling options
- ✅ Staging slots

#### 3. GitHub Pages
- ✅ Free for public repos
- ✅ Simple deployment
- ⚠️ Public only

#### 4. Any Static Host
- Netlify, Vercel, Cloudflare Pages
- Any web server (nginx, Apache)

---

## Future Architecture Enhancements

### Phase 2: Real-Time Updates
- WebSocket connection to Graph API (if available)
- Server-Sent Events for live updates
- Optimistic UI updates

### Phase 3: Offline Support
- Service Worker for offline functionality
- IndexedDB for local caching
- Background sync when online

### Phase 4: Advanced Analytics
- Client-side data aggregation
- Chart.js or D3.js for visualizations
- Historical trend analysis

### Phase 5: Extensibility
- Plugin architecture
- Custom widget support
- Third-party integrations

---

## Monitoring & Observability

### Current Logging
- Console logging for debugging
- Error logging with context
- API call logging (dev mode)

### Future Monitoring
- Application Insights integration
- Performance metrics
- User analytics (privacy-respecting)
- Error tracking (Sentry, etc.)

---

## Compliance & Certifications

### Security Standards
- ✅ OAuth 2.0 Security Best Practices
- ✅ OWASP Top 10 mitigations
- ✅ Microsoft Security Development Lifecycle

### Privacy Regulations
- ✅ GDPR-ready (PII anonymization)
- ✅ Data minimization
- ✅ Right to be forgotten

### Microsoft Compliance
- ✅ Microsoft Graph API best practices
- ✅ MSAL recommended patterns
- ✅ Lighthouse API guidelines

---

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0  
**Author**: Cyrus Irandoust