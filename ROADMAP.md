# VibeNotes Product Roadmap

This document outlines the planned features and improvements for VibeNotes.

## Current Version: 1.3.0

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

## Upcoming Features

### v1.4 - Developer Experience
*Focus: Infrastructure and code quality*

| Feature | Status | Description |
|---------|--------|-------------|
| Code Formatting | Planned | Prettier integration for consistent code style |
| Pre-commit Hooks | Planned | Husky + lint-staged for quality gates |
| CI/CD Pipeline | Planned | GitHub Actions for automated testing |
| API Documentation | Planned | OpenAPI/Swagger specification |
| Contributing Guide | Planned | Developer onboarding documentation |

### v1.5 - Performance & Polish
*Focus: Speed and user experience*

| Feature | Status | Description |
|---------|--------|-------------|
| Bundle Optimization | Planned | Reduce JavaScript bundle size |
| Virtual Scrolling | Planned | Handle large note lists efficiently |
| Lazy Loading | Planned | Defer loading of images and attachments |
| Service Worker Cache | Planned | Faster offline experience |
| Skeleton Loaders | Planned | Better loading state indicators |

### v1.6 - Mobile Experience
*Focus: Progressive Web App enhancements*

| Feature | Status | Description |
|---------|--------|-------------|
| PWA Improvements | Planned | Install prompts, splash screens |
| Touch Gestures | Planned | Swipe actions for note management |
| Mobile Editor | Planned | Optimized editing on touch devices |
| Push Notifications | Planned | Sync and mention notifications |
| Offline Indicator | Planned | Improved sync status UI |

### v1.7 - React Native Mobile App
*Focus: Native mobile experience*

| Feature | Status | Description |
|---------|--------|-------------|
| Core Note CRUD | Planned | Create, read, update, delete notes |
| Offline Storage | Planned | SQLite or WatermelonDB |
| Server Sync | Planned | Full sync with existing API |
| Push Notifications | Planned | FCM/APNs integration |
| Biometric Auth | Planned | Fingerprint/Face ID support |
| Share Extension | Planned | Share content to VibeNotes |
| Home Widgets | Planned | Quick note access widgets |

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
