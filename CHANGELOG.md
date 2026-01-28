# VibeNotes Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-11-21

### Added
- **Attachments System (Backend)**
  - File upload support for images (JPEG, PNG, GIF, WebP) and PDFs
  - Supabase Storage integration for cloud file storage
  - Storage quota management (100MB per user)
  - File size limit (10MB per file)
  - Attachment CRUD operations
  - Storage usage tracking

- **Attachments System (Frontend)**
  - AttachmentUploader component with drag-and-drop
  - AttachmentList component with image previews
  - StorageQuotaDisplay component with progress bar
  - NoteAttachments integrated component
  - File validation and error handling
  - Upload progress indicators
  - Delete confirmations

- **New Backend Services**
  - StorageService for Supabase Storage operations
  - AttachmentService for business logic
  - AttachmentRepository for database operations

- **New Frontend Components**
  - AttachmentUploader - File upload with drag-and-drop
  - AttachmentList - Display attachments with previews
  - StorageQuotaDisplay - Storage usage visualization
  - NoteAttachments - Integrated attachment management
  - Progress UI component (shadcn/ui)
  - AlertDialog UI component (shadcn/ui)

- **API Endpoints**
  - POST /api/attachments/upload - Upload files
  - GET /api/attachments/note/:noteId - Get attachments for note
  - DELETE /api/attachments/:id - Delete attachment
  - GET /api/attachments/storage/usage - Get storage usage

- **Validation & Security**
  - File type validation (whitelist)
  - File size validation
  - User quota enforcement
  - Authentication on all endpoints
  - Zod validation schemas

### Changed
- Updated AuthRequest interface to include userId
- Added ValidationError to AppError classes
- Added authenticateToken alias for auth middleware
- Modified NotesPage layout to include attachments sidebar
- Added three-column layout (notes list, editor, attachments)

### Technical
- Added @supabase/supabase-js dependency
- Added multer for file uploads
- Added @types/multer for TypeScript support
- Added @radix-ui/react-progress for progress bars
- Added @radix-ui/react-alert-dialog for confirmations
- Integrated Supabase Storage with CDN

## [1.2.0] - 2025-11-21

### Added
- **Templates & Daily Notes System**
  - 8 built-in templates (Blank, Meeting, Daily, To-Do, Project, Brainstorm, Research, Retrospective)
  - Custom template creation and management
  - Daily note auto-generation with structured format
  - Template selector dialog with grid layout
  - LocalStorage persistence for custom templates
  - Template icons and descriptions
  - Quick action button for daily notes
  - Delete functionality for custom templates

- **New Components**
  - TemplateSelector component with dialog UI
  - Dialog component (shadcn/ui)
  - Textarea component (shadcn/ui)

- **Template Service**
  - Template CRUD operations
  - Daily note generation with automatic date formatting
  - Template-to-note conversion
  - Daily note detection by date
  - Custom template persistence

- **Tests**
  - Comprehensive template service test suite (320 lines)
  - 100% coverage of template functionality
  - Tests for built-in templates, custom templates, and daily notes

### Changed
- Updated NotesPage to integrate template selector
- Modified NoteList to accept and display template selector
- Enhanced note creation workflow with template support

### Technical
- Added @radix-ui/react-dialog dependency
- Implemented client-side template management
- LocalStorage-based custom template persistence

## [1.1.0] - 2025-11-20

### Added
- **Export & Import Features**
  - Export single note as Markdown (.md)
  - Export all notes as Markdown (combined file)
  - Export notes as JSON backup
  - Export note as PDF via browser print dialog
  - Import notes from JSON backup files
  - Markdown to HTML conversion for PDF export
  - Filename sanitization for safe downloads
  - HTML escaping for security

- **Export Menu Component**
  - Dropdown menu in top bar with all export options
  - Disabled states for unavailable actions
  - Import file picker with validation
  - Error handling and user feedback
  - Loading states during import

- **Marketing Website**
  - Professional landing page with hero section
  - Feature showcase (6 key features with icons)
  - Comparison table (vs Notion, Evernote, Obsidian)
  - Pricing page (Free, Pro, Team tiers)
  - Call-to-action sections
  - Responsive design for mobile and desktop
  - Dark mode support via CSS media queries
  - Smooth scroll navigation
  - Intersection Observer animations
  - SEO-friendly meta tags

- **Documentation**
  - Comprehensive user guide (docs.md)
  - Feature documentation
  - API reference
  - Troubleshooting guide
  - Tips and tricks section
  - Implementation summary

- **Tests**
  - Export service unit tests
  - Import validation tests
  - Security tests (HTML escaping, filename sanitization)
  - Edge case handling tests

### Changed
- Updated NotesPage to include ExportMenu in top bar
- Enhanced error handling for import/export operations
- Improved file handling with proper cleanup

### Security
- Added HTML escaping for user-generated content in exports
- Implemented filename sanitization to prevent path traversal
- Validated JSON structure during import
- Protected against XSS in exported HTML

## [1.0.0] - 2025-11-19

### Added
- **MVP Features**
  - User authentication (signup/login with JWT)
  - Notes CRUD operations (create, read, update, delete)
  - Markdown editor with live preview
  - Auto-save with 1-second debounce
  - Tag support and filtering
  - Full-text search
  - Pin notes functionality
  - Word and character count in editor
  - Keyboard shortcuts (Ctrl+S, Ctrl+C, Ctrl+K)

- **Offline-First Architecture**
  - IndexedDB storage via Dexie.js
  - Full offline CRUD operations
  - Sync queue for pending changes
  - Bidirectional sync (local ↔ server)
  - Auto-sync on network reconnection
  - Version-based conflict resolution (server wins)
  - Online/offline status indicator

- **UI Components**
  - NoteList with virtualization
  - NoteEditor with markdown preview
  - TagInput for tag management
  - Theme toggle (light/dark mode)
  - Responsive sidebar
  - Status indicators (saving, syncing, online/offline)

- **Backend**
  - Express + TypeScript server
  - PostgreSQL database with Prisma ORM
  - Repository pattern architecture
  - JWT authentication middleware
  - Zod validation schemas
  - Typed error handling
  - Integration tests

- **Frontend**
  - React 18 + TypeScript
  - Vite build tool
  - Tailwind CSS + shadcn/ui components
  - React Router for navigation
  - Custom hooks (useNotes, useSync, useDebounce)
  - API client with interceptors

### Security
- Password hashing with bcryptjs
- JWT token authentication
- User ownership verification
- Input validation with Zod
- HTTPS enforcement
- Rate limiting on auth endpoints

### Testing
- Vitest for unit tests
- Playwright for E2E tests
- Integration tests for auth and notes
- Test coverage for critical paths

### Documentation
- README with setup instructions
- API specification
- Architecture documentation
- Coding rules and standards
- Design system guidelines
- Naming conventions
- Error handling guidelines

## [0.1.0] - Initial Setup

### Added
- Project scaffolding
- Development environment setup
- Database schema design
- Basic folder structure
- Configuration files

---

## Roadmap

### v1.2 (Planned)
- Templates & Daily Notes
- Attachments (images, files)
- Version history with diff viewer
- Advanced search filters
- Improved onboarding
- Analytics integration

### v2.0 (Planned)
- Real-time collaboration
- Comments & Mentions
- Shared notebooks
- Granular permissions
- Google Drive integration
- Zapier webhooks
- Mobile wrappers (Capacitor)

### v3.0 (PRO Features)
- End-to-end encryption
- AI-powered summaries
- Q&A over notes
- Auto-tagging
- Content rewriter
- SSO (SAML/OAuth)
- Audit logs
- Admin console
- Billing integration

---

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

No breaking changes. New features are additive:

1. The Export menu appears automatically in the top bar
2. All existing notes can be exported immediately
3. No database migrations required
4. No configuration changes needed

### Data Export/Import

To backup your notes:
1. Click the Download icon in the top bar
2. Select "Backup as JSON"
3. Save the file securely

To restore from backup:
1. Click the Download icon
2. Select "Import from JSON"
3. Choose your backup file
4. Notes will be imported and synced

---

## Contributors

- Development: AI-assisted via Google Antigravity
- Design: Following VibeNotes design system
- Testing: Automated test suite

---

## License

Proprietary - All rights reserved

---

**For detailed implementation notes, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
