# VibeNotes Product Roadmap

This document outlines the planned features and improvements for VibeNotes.

## Current Version: 1.7.0

VibeNotes is an offline-first collaborative note-taking application with:
- Full offline support with automatic sync
- Rich markdown editing with live preview
- Templates and daily notes
- File attachments with cloud storage
- Folder organization and color labels
- Real-time collaboration (WebSocket infrastructure)
- Version history
- Advanced search capabilities

---

## v1.3.1 - UI/UX Improvements (January 2026)
*Focus: User interface polish and bug fixes*

| Feature | Status | Description |
|---------|--------|-------------|
| Auto-save Fix | Completed | Fixed refresh loop in NoteEditor that caused content flickering |
| State Management | Completed | Consolidated 14 useState calls into 2 custom hooks (useModalManager, useNotesPageState) |
| MUI Migration | Completed | Implemented AppBar, Drawer, and Toolbar components for professional layout |
| Template Redesign | Completed | Added tabs, preview panel, icon picker, edit functionality, and delete confirmation |
| Collaboration Status | Completed | Graceful "Offline mode" display instead of connection errors |
| Branding | Completed | New favicon and logo SVG assets with indigo gradient theme |
| SEO Meta Tags | Completed | Added Open Graph, Twitter Card, and theme-color meta tags |

---

## v1.4 - Developer Experience (January 2026)
*Focus: Infrastructure and code quality*

| Feature | Status | Description |
|---------|--------|-------------|
| Code Formatting | Completed | Prettier integration with .prettierrc config |
| Pre-commit Hooks | Completed | Husky + lint-staged for quality gates |
| CI/CD Pipeline | Completed | GitHub Actions workflow for lint, test, build |
| API Documentation | Completed | OpenAPI/Swagger spec at /api-docs |
| Contributing Guide | Completed | CONTRIBUTING.md with developer guidelines |

---

## v1.5 - Performance & Polish (January 2026)
*Focus: Speed and user experience*

| Feature | Status | Description |
|---------|--------|-------------|
| Bundle Optimization | Completed | Code splitting with manual chunks (React, MUI, Markdown, Collab) |
| Route Lazy Loading | Completed | React.lazy() for all page components |
| Lazy Loading | Completed | LazyImage component with Intersection Observer |
| Service Worker Cache | Completed | VitePWA with workbox caching strategies |
| Skeleton Loaders | Completed | PageLoader component with MUI Skeleton |

---

## v1.6 - Mobile Experience (January 2026)
*Focus: Progressive Web App enhancements*

| Feature | Status | Description |
|---------|--------|-------------|
| PWA Install Prompt | Completed | Smart install banner with dismiss option |
| Touch Gesture Hooks | Completed | useSwipeGesture and useSwipeToAction for mobile |
| Offline Indicator | Completed | Real-time banner showing online/offline status |
| Service Worker Cache | Completed | Workbox caching for fonts, images, app shell |

---

## v1.7 - React Native Mobile App (January 2026)
*Focus: Native mobile experience*

| Feature | Status | Description |
|---------|--------|-------------|
| Project Structure | Completed | React Native 0.73+ with TypeScript |
| API Service | Completed | Axios client with auth interceptors |
| State Management | Completed | Zustand store for notes |
| Core Note CRUD | Completed | Home, Note, Login, Settings screens with full CRUD |
| Offline Storage | Completed | SQLite database service for local persistence |
| Server Sync | Completed | Full sync service with conflict resolution |
| React Navigation | Completed | Native stack navigator with auth flow |
| Custom Hooks | Completed | useNotes, useSync, useAuth for state management |
| Push Notifications | Planned | FCM/APNs integration |
| Biometric Auth | Planned | Fingerprint/Face ID support |

---

## Upcoming Features

---

## Future Versions (v2.x)

### v2.0 - AI Features
*Focus: Intelligent note assistance*

| Feature | Status | Description |
|---------|--------|-------------|
| AI Summarization | Planned | Generate summaries of long notes |
| Smart Tagging | Planned | Auto-suggest tags based on content |
| Related Notes | Planned | AI-powered note recommendations |
| Writing Assistant | Planned | Grammar and style suggestions |
| Natural Language Search | Planned | Search with plain English queries |

### v2.1 - Sharing & Publishing
*Focus: Content distribution*

| Feature | Status | Description |
|---------|--------|-------------|
| Public Sharing | Planned | Shareable note links |
| Blog Publishing | Planned | Custom URLs, SEO optimization |
| Embed Support | Planned | Embed notes in external websites |
| Platform Export | Planned | Export to Medium, Dev.to |
| Team Sharing | Planned | Workspace-based sharing |

### v2.2 - Integrations
*Focus: Third-party connectivity*

| Feature | Status | Description |
|---------|--------|-------------|
| Calendar Sync | Planned | Google/Outlook integration |
| Slack | Planned | Share notes, notifications |
| Browser Extension | Planned | Quick capture from any page |
| Email to Note | Planned | Forward emails as notes |
| Webhooks | Planned | Zapier/Make automation |

### v2.3 - Security & Enterprise
*Focus: Enterprise-ready features*

| Feature | Status | Description |
|---------|--------|-------------|
| E2E Encryption | Planned | Client-side encryption |
| Two-Factor Auth | Planned | TOTP support |
| SSO | Planned | SAML, OAuth providers |
| Audit Logging | Planned | Admin activity tracking |
| GDPR Compliance | Planned | Full data portability |

---

## Features In Progress

### Real-time Collaboration
- WebSocket infrastructure exists
- Working on: Yjs document sync, cursor sharing, presence indicators

### Graph View
- UI component exists
- Working on: Note relationship parsing, force-directed layout, navigation

### Advanced Search
- Search panel exists
- Working on: Date range filters, saved searches, highlighting

---

## How to Contribute

We welcome contributions! See our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Priority Areas
1. Performance optimizations
2. Mobile experience improvements
3. Accessibility enhancements
4. Test coverage expansion

### Reporting Issues
- Use GitHub Issues for bug reports
- Include steps to reproduce
- Attach screenshots if applicable

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

*Last updated: January 2026*
