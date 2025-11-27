# Contributing to Dashboardus

Thank you for your interest in contributing to Dashboardus! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Security](#security)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Microsoft 365 tenant with Lighthouse (for testing)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dashboardus.git
   cd dashboardus
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/dashboardus.git
   ```

### Install Dependencies

```bash
npm install
```

### Configure Environment

1. Copy `.env.example` to `.env`
2. Add your Azure AD app registration details
3. Ensure you have appropriate Lighthouse access

### Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add device filtering by OS type"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a pull request
- Fill out the PR template
- Link any related issues
- Request review from maintainers

---

## Coding Standards

### TypeScript

- **Use TypeScript**: All new code must be TypeScript
- **Strict mode**: Enable strict type checking
- **No `any`**: Avoid `any` type; use proper types or `unknown`
- **Interfaces over types**: Prefer interfaces for object shapes

Example:
```typescript
// ✅ Good
interface Device {
  id: string;
  name: string;
  complianceStatus: ComplianceState;
}

// ❌ Bad
type Device = any;
```

### React

- **Functional components**: Use function components with hooks
- **Hooks**: Follow Rules of Hooks
- **Props**: Define prop types with TypeScript interfaces
- **State**: Use `useState` for local state, context for shared state

Example:
```typescript
// ✅ Good
interface DeviceTableProps {
  devices: Device[];
  onDeviceClick?: (device: Device) => void;
}

function DeviceTable({ devices, onDeviceClick }: DeviceTableProps) {
  // Component logic
}

// ❌ Bad
function DeviceTable(props: any) {
  // Component logic
}
```

### Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Consistent spacing**: Use Tailwind spacing scale
- **Dark theme**: Ensure all components work with dark theme
- **Responsive**: Mobile-first responsive design

Example:
```tsx
// ✅ Good
<div className="card p-4 bg-background-card border border-border">
  <h2 className="text-xl font-semibold text-text-primary">Title</h2>
</div>

// ❌ Bad
<div style={{ padding: '16px', backgroundColor: '#1a1a1a' }}>
  <h2 style={{ fontSize: '20px' }}>Title</h2>
</div>
```

### File Organization

```
src/
├── api/           # API wrappers (one file per service)
├── auth/          # Authentication logic
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Main application component
```

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
  - `dateTime.ts`, `DeviceTable.tsx`
- **Functions**: camelCase
  - `getManagedTenants()`, `formatDateTime()`
- **Components**: PascalCase
  - `DeviceTable`, `SummaryCard`
- **Constants**: UPPER_SNAKE_CASE
  - `MAX_RETRIES`, `DEFAULT_TIMEOUT`
- **Interfaces/Types**: PascalCase
  - `Device`, `ManagedTenant`

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(devices): add OS type filter"

# Bug fix
git commit -m "fix(auth): resolve token refresh issue"

# Documentation
git commit -m "docs(readme): update setup instructions"

# Breaking change
git commit -m "feat(api)!: change device compliance endpoint

BREAKING CHANGE: getManagedDeviceCompliance now returns Promise<Device[]> instead of Device[]"
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests when applicable
- Explain *what* and *why*, not *how*

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### PR Title

Follow same format as commit messages:
```
feat(devices): add OS type filter
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated checks**: CI/CD runs linter and build
2. **Code review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### After Merge

- Delete your feature branch
- Pull latest main branch
- Start next feature

---

## Testing

### Manual Testing

1. **Authentication**: Test sign-in/sign-out flow
2. **Data fetching**: Verify data loads correctly
3. **Filtering**: Test all filter combinations
4. **Responsive**: Test on different screen sizes
5. **Error handling**: Test error scenarios

### Future: Automated Testing

We plan to add:
- Unit tests (Jest + React Testing Library)
- Integration tests
- E2E tests (Playwright)

---

## Documentation

### Code Comments

- **Why, not what**: Explain reasoning, not obvious code
- **Complex logic**: Add comments for non-trivial algorithms
- **Security decisions**: Document security-related choices
- **TODOs**: Use `// TODO:` for future improvements

Example:
```typescript
// Use sessionStorage instead of localStorage for better security on shared displays.
// Tokens are cleared when browser closes, reducing risk of token theft.
cacheLocation: 'sessionStorage',
```

### API Documentation

When adding new API calls:
1. Update `API_REFERENCE.md`
2. Document endpoint, version, purpose
3. Explain why beta vs. v1.0
4. Add request/response examples

### README Updates

Update `README.md` when:
- Adding new features
- Changing setup process
- Updating dependencies
- Modifying configuration

---

## Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Message security concerns directly to me: 
2. Include detailed description
3. Provide steps to reproduce
4. Allow time for fix before disclosure

### Security Guidelines

- **No secrets**: Never commit secrets, tokens, or credentials
- **Delegated permissions only**: No app-only permissions
- **Input validation**: Validate all user inputs
- **XSS prevention**: Sanitize any user-generated content
- **HTTPS only**: All API calls over HTTPS
- **Token security**: Follow MSAL best practices

### Security Checklist for PRs

- [ ] No hardcoded secrets or credentials
- [ ] No console.log of sensitive data
- [ ] Input validation for user inputs
- [ ] Proper error handling (no stack traces to users)
- [ ] HTTPS for all external requests
- [ ] Follows principle of least privilege

---

## Questions?

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: cyrus@intunus.com

---

## Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- Release notes
- GitHub contributors page

Thank you for contributing to Dashboardus! 🚀

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0