# Contributing to VibeNotes

Thank you for your interest in contributing to VibeNotes! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- PostgreSQL 15+
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vibenotes.git
   cd vibenotes
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (includes Husky, Prettier)
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env
   # Edit .env with your database credentials

   # Client (if needed)
   cp client/.env.example client/.env
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev

   # Or separately:
   # Terminal 1: cd client && npm run dev
   # Terminal 2: cd server && npm run dev
   ```

## Development Workflow

### Branching Strategy

- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Run linting and tests:
   ```bash
   npm run lint
   npm run test
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add dark mode toggle to settings
fix: resolve note sync conflict on reconnection
docs: update API documentation for attachments
```

## Code Standards

### TypeScript

- Use strict mode (`"strict": true`)
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Document public APIs with JSDoc comments

### React

- Use functional components with hooks
- Follow the component file structure
- Keep components focused and small
- Use TypeScript for all components

### Styling

- Use Tailwind CSS for layout utilities
- Use Material UI components for UI elements
- Follow the existing design system
- Support both light and dark modes

### Testing

- Write tests for new features
- Maintain test coverage
- Use Vitest for unit tests
- Use Playwright for E2E tests

## Project Structure

```
vibenotes/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API and storage services
│   │   └── lib/         # Utilities
│   └── tests/           # Frontend tests
├── server/              # Express backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Data access
│   │   ├── routes/      # API routes
│   │   └── middleware/  # Express middleware
│   └── tests/           # Backend tests
├── e2e/                 # End-to-end tests
└── website/             # Marketing website
```

## Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Run linting with no errors
   - Update documentation if needed
   - Add tests for new functionality

2. **PR description should include:**
   - Summary of changes
   - Related issue number (if applicable)
   - Screenshots for UI changes
   - Testing instructions

3. **Review process:**
   - At least one approval required
   - All CI checks must pass
   - Address reviewer feedback

## Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to reproduce** - Detailed steps to reproduce
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - Browser, OS, Node version
6. **Screenshots** - If applicable

## Feature Requests

We welcome feature suggestions! Please:

1. Check existing issues to avoid duplicates
2. Describe the use case
3. Explain the expected behavior
4. Consider potential implementation approaches

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow open source best practices

## Questions?

- Open a GitHub Discussion for questions
- Join our community chat (coming soon)
- Check existing documentation

---

Thank you for contributing to VibeNotes!
