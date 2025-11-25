# Contributing to Certus

First off, thank you for considering contributing to Certus! It's people like you that make Certus such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guides](#style-guides)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [security@hergon.com](mailto:security@hergon.com).

## Getting Started

Before you begin:
- Make sure you have a [GitHub account](https://github.com/signup/free)
- Submit an issue for your work if one does not already exist
- Fork the repository on GitHub

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Setting Up Your Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/hergon-vector01.git
   cd hergon-vector01
   ```

2. **Install dependencies**

   ```bash
   cd app
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.development
   ```

   Edit `.env.development` with your local configuration.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Run tests**

   ```bash
   # Unit tests
   npm run test

   # E2E tests
   npm run test:e2e
   ```

### Setting Up Pre-commit Hooks

We use Husky for pre-commit hooks. After installing dependencies:

```bash
npx husky install
```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues for newcomers
- `help wanted` - Issues needing extra attention
- `documentation` - Documentation improvements

### Pull Requests

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**

3. **Write or update tests**

4. **Run the test suite**

   ```bash
   npm run test
   npm run lint
   npm run build:check
   ```

5. **Commit your changes** (see [Commit Messages](#commit-messages))

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

## Style Guides

### TypeScript Style Guide

- Use TypeScript strict mode
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for functions
- Avoid `any` type - use `unknown` if type is truly unknown

```typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// Avoid
type User = {
  id: any
  name: any
}
```

### React Style Guide

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused
- Use custom hooks to extract logic

```tsx
// Good
export function UserCard({ user }: UserCardProps) {
  const { data, isLoading } = useUser(user.id)

  if (isLoading) return <Skeleton />

  return (
    <Card>
      <CardHeader>{data.name}</CardHeader>
    </Card>
  )
}
```

### CSS / Tailwind Style Guide

- Use Tailwind CSS utility classes
- Extract repeated patterns into components
- Use CSS variables for theming
- Follow mobile-first responsive design

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User.types.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Tests | Same as source + `.test` | `UserCard.test.tsx` |

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that don't affect code meaning |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Examples

```bash
# Feature
feat(auth): Add Azure AD multi-factor authentication

# Bug fix
fix(validation): Correct CONSAR file parsing for type 23

# Documentation
docs(readme): Update installation instructions

# Breaking change
feat(api)!: Change response format for validation endpoints

BREAKING CHANGE: The validation response now returns an array instead of object
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure CI passes** - all checks must be green
4. **Request review** from at least one maintainer
5. **Address feedback** promptly
6. **Squash commits** if requested

### PR Title Format

Follow the same convention as commit messages:

```
feat(ui): Add dark mode toggle to settings
fix(export): Correct Excel date formatting
docs: Update API documentation
```

### PR Description

Use the provided template and fill in all sections:

- Description of changes
- Related issues
- Type of change
- Testing performed
- Screenshots (if applicable)

## Issue Guidelines

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots
- Environment (browser, OS)
- Console errors

### Feature Requests

Include:
- Problem statement
- Proposed solution
- Alternatives considered
- Mockups (if applicable)

## Questions?

Feel free to open a discussion on GitHub or reach out to the maintainers.

Thank you for contributing to Certus! 🎉
