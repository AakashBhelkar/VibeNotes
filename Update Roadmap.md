# VibeNotes - Product Roadmap & Development Guide

**Last Updated**: November 24, 2025  
**Current Status**: v1 at 70% completion  
**Production Ready**: ✅ Yes

---

## Purpose

This document serves as the comprehensive roadmap for VibeNotes development. It provides end-to-end specifications for features, UI/UX, API design, and implementation priorities.

---

## Table of Contents

1. [Feature Roadmap](#1--feature-roadmap)
2. [UI Wireframes](#2--ui-wireframes)
3. [API Design](#3--api-design)
4. [AI/Editor/Search APIs](#4--ai-editor-search-apis)
5. [Marketing Website](#5--marketing-website)
6. [AI Features (Final Phase)](#6--ai-features-final-phase)
7. [Tasks & Acceptance Criteria](#7--tasks--acceptance-criteria)
8. [Non-Functional Requirements](#8--non-functional-requirements)
9. [Deliverables](#9--deliverables--output-format)
10. [Timeline](#10--priorities--timeline)
11. [Implementation Notes](#11--final-notes)

---

## Global Instructions

### Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL (Prisma) or Supabase
- **Offline**: Dexie for IndexedDB
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel (frontend) + Render/Railway (backend)
- **UI Library**: shadcn/ui + Tailwind CSS (exclusive)

### Development Principles
- ✅ Strict TypeScript with no `any` types
- ✅ Tests for every feature
- ✅ WCAG AA accessibility
- ✅ No inline secrets
- ✅ Design system tokens usage
- ✅ Small atomic PRs with changelogs

### Documentation References
Refer to `/docs` folder for:
- `prd.md` - Product requirements
- `architecture.md` - System architecture
- `schema.md` - Database schema
- `api-spec.md` - API specifications
- `coding-rules.md` - Coding standards
- `design-system.md` - Design tokens

---

## 1 — Feature Roadmap

### MVP (100% Complete) ✅

**Target**: Minimal viable product  
**Status**: ✅ **COMPLETE**

- ✅ Auth (JWT email/password)
- ✅ Notes CRUD (title + markdown content)
- ✅ Markdown editor with live preview
- ✅ Tags & tag filtering
- ✅ Local persistence (IndexedDB via Dexie)
- ✅ Online sync (queue + flush + optimistic updates)
- ✅ Note list (virtualized)
- ✅ Search (full-text)
- ✅ Responsive UI (desktop + mobile)
- ✅ Pin notes functionality
- ✅ Word & character count
- ✅ Keyboard shortcuts (Ctrl+S, Ctrl+C, Ctrl+K)
- ✅ Online/offline status indicator
- ✅ Theme toggle (light/dark mode)

**Acceptance**: ✅ All core features working, offline-first, responsive

---

### v1 (70% Complete) ⏳

**Target**: Enhanced features for production  
**Status**: ⏳ **IN PROGRESS** (7/10 features)

#### ✅ Completed Features

1. **Export & Import** ✅
   - Markdown export (single & bulk)
   - JSON backup/restore
   - PDF export via browser print
   - Status: Complete (Nov 20, 2025)

2. **Marketing Website** ✅
   - Landing page with hero section
   - Feature showcase
   - Pricing tiers (Free/Pro/Team)
   - Comparison table
   - Documentation
   - Status: Complete (Nov 20, 2025)

3. **Templates & Daily Notes** ✅
   - 8 built-in professional templates
   - Custom template creation
   - Daily note auto-generation
   - Template selector UI
   - Status: Complete (Nov 21, 2025)

4. **Autosave Indicator & Offline Status** ✅
   - Save status display
   - Online/offline indicator
   - Manual sync button
   - Status: Complete (Nov 19, 2025)

5. **Attachments** ✅
   - Image upload via Supabase Storage
   - Signed URLs for security
   - File size limits & validation
   - Drag-and-drop support
   - Storage quota tracking
   - Preview for images
   - Status: Complete (Nov 24, 2025)

6. **Rich Editor Enhancements** ✅
   - Slash commands (/heading, /code, /bullet, etc.)
   - 10 command types with keyboard navigation
   - Code blocks with syntax highlighting
   - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K)
   - Edit/Preview mode toggle
   - Table support
   - Status: Complete (Nov 24, 2025)

7. **Advanced Search Filters** ✅
   - Multi-tag filtering with AND logic
   - Search query filtering
   - Tag combination support
   - Clear filters button
   - Status: Complete (Nov 24, 2025)

#### 📋 Remaining Features

8. **Version History** (Planned)
   - Snapshot on each save
   - Diff viewer for comparing versions
   - Restore functionality
   - Timeline view

9. **Improved Onboarding** (Planned)
   - Welcome tour
   - Feature highlights
   - Sample notes
   - Interactive tutorial

10. **Analytics** (Planned)
    - Plausible or Segment integration
    - Usage tracking
    - Performance metrics
    - User behavior insights

**Acceptance**: All features tested, production-ready, comprehensive documentation

---

### v2 (0% Complete) 📋

**Target**: Collaboration & advanced features  
**Status**: 📋 **PLANNED**

- 🔲 Real-time collaboration
- 🔲 Comments & Mentions
- 🔲 Shared notebooks & granular permissions
- 🔲 Integrations (Google Drive, Zapier webhooks)
- 🔲 Tasks & reminders (calendar integration)
- 🔲 Mobile wrappers (Capacitor / React Native Web)
- 🔲 Search indexing improvements (ranking, highlighting)

**Acceptance**: Team sharing flows tested, collaboration latency < 2s

---

### PRO (0% Complete) 🚀

**Target**: Monetization + Enterprise features  
**Status**: 🚀 **FUTURE**

- 🔲 End-to-end encryption (client-side crypto)
- 🔲 Advanced AI features (summaries, Q&A, auto-tagging, rewriter)
- 🔲 Unlimited storage & attachment quotas
- 🔲 SSO (SAML / OAuth for enterprise)
- 🔲 Audit logs, admin console, billing
- 🔲 Enterprise dashboard
- 🔲 Templates marketplace
- 🔲 Team roles & workspace management

**Acceptance**: Enterprise security audit and compliance checklist

---

## 2 — UI Wireframes

### 2.1 App Shell (Desktop)

```
+---------------------------------------------------------------+
| Topbar: Logo | Search (⌘K) | Global actions | Profile         |
+---------------------------------------------------------------+
| Sidebar (left, 260px):                                        |
|   - New Note                                                  |
|   - Notebooks                                                 |
|   - Tags                                                      |
|   - Favorites                                                 |
|                                                               |
| Note List (center):                                           |
|   - Search results / list / pinned notes                      |
|   - Virtualized list items                                    |
|   - (title, excerpt, tags, updatedAt)                         |
|                                                               |
| Editor Panel (right):                                         |
|   - Title input                                               |
|   - Toolbar (slash menu)                                      |
|   - Markdown editor                                           |
|   - Preview toggle                                            |
+---------------------------------------------------------------+
```

### Component Mapping (shadcn/ui)

| Component | shadcn Mapping |
|-----------|----------------|
| **Sidebar** | Sheet/custom Sidebar using Card + Command |
| **Note List** | Virtualized List + Card items |
| **Editor** | Textarea/TipTap with Button, DropdownMenu, Tooltip |
| **Save Indicator** | Badge (top-right of editor) |
| **Search** | Command component |
| **Dialogs** | Dialog component |

### 2.2 Mobile Layout

- Collapsible sidebar (Sheet)
- Compact topbar
- Full-screen editor
- Bottom toolbar (New Note, Search, Sync)

### 2.3 Feature-Specific Wireframes

**AI Assistant Modal**:
- Dialog with prompt input
- Mode selector (summary/qa/rewrite)
- Response pane (collapsible)

**Version History**:
- Timeline tabs
- Diff viewer (code block)
- Restore button

**Share Dialog**:
- Permission toggles
- Link generation
- Expiration settings

---

## 3 — API Design

### 3.1 Authentication

```
POST /auth/signup
POST /auth/login
POST /auth/magiclink
GET  /auth/me
```

### 3.2 Notes

```
GET    /notes?q=&tag=&notebook=&limit=&offset=
POST   /notes
GET    /notes/{id}
PUT    /notes/{id}     // version for optimistic locking
DELETE /notes/{id}
POST   /notes/{id}/attachments → {signedUrl, publicUrl}
GET    /notes/export?format=md|pdf
```

**Note Model**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "string",
  "content": "markdown",
  "blocks": [],
  "tags": ["string"],
  "notebookId": "uuid|null",
  "version": 5,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 3.3 Tags & Notebooks

```
GET  /tags
POST /tags
GET  /notebooks
POST /notebooks
```

### 3.4 Search

```
POST /search
Body: {
  q: string,
  scope: "title|content|tags",
  filters: { tags: [], dateRange: {} }
}
Response: {
  results: [{ id, title, excerpt, score }]
}
```

**Implementation**: PostgreSQL full-text (tsvector + GIN) or Supabase/Algolia

### 3.5 Sync & Conflict Resolution

```
POST /sync/changes
```

- Client sends queued ops: `{op, note, tempId, version}`
- Server returns resolved mapping and conflicts (409)
- Uses version numbers & If-Match headers

### 3.6 Admin & Billing

```
GET  /admin/users
GET  /billing/plan
POST /billing/webhooks  // Stripe integration
```

---

## 4 — AI, Editor & Search APIs

### 4.1 AI Orchestration (Proxy Pattern)

```
POST /ai/summarize
Body: { noteIds: [uuid], style: "short|detailed|bullets" }
Response: { summary: string, modelMeta: {model, tokens} }

POST /ai/qa
Body: { noteIds: [uuid], question: string }
Response: { answer: string, sources: [{noteId, excerpt}] }

POST /ai/rewrite
Body: { noteId: uuid, instructions: string }
Response: { rewritten: string, changes: [diff] }

POST /ai/autotag
Body: { noteId: uuid }
Response: { tags: ["ideas", "meeting"] }
```

**Security & Rate Limits**:
- Queue LLM calls server-side
- Require authentication
- Per-user rate limits
- Token usage accounting
- Provider-agnostic adapters (OpenAI, Anthropic, Vertex AI)
- Persist prompts & outputs for audit

### 4.2 Editor Autosave & Deltas

```
POST /editor/delta    // Block-level deltas (CRDT or OT)
GET  /editor/state/{noteId}  // Latest block state
```

**Realtime**: WebSocket channel `/ws/notes/{id}` for collaborative edits

### 4.3 Advanced Search

**Indexer Worker**:
1. Consume note change events
2. Normalize markdown → text
3. Extract headings, tasks, code blocks
4. Index to Postgres tsvector or external (Algolia/Meilisearch)
5. Support ranking, highlighting, snippet generation

---

## 5 — Marketing Website

### Required Pages

1. **Landing** - Hero with brand screenshot
2. **Features** - Highlight AI, offline, collaboration
3. **Pricing** - Free / Pro / Team tiers
4. **Docs** - Auto-generated skeleton
5. **About / Contact**
6. **Changelog / Roadmap**

### Requirements

- ✅ shadcn components + design tokens
- ✅ Clear CTA funnel: Get Started → Demo → Pricing
- ✅ SEO-friendly meta tags
- ✅ Screenshots + animated GIF demo
- ✅ "Why VibeNotes" comparison (vs Notion/Obsidian/Evernote)

**Deliverable**: Deployable site with preview URL + CI

---

## 6 — AI Features (Final Phase)

⚠️ **Work on this LAST** - Requires planning, training data, monitoring, ops

### 6.1 Minimum Viable AI Features

- Summarize single note
- Auto-tagging
- Q&A over user notes (single-user scope)
- Simple rewrite/improve

### 6.2 Architecture (LLM Ops)

- **Adapter Layer**: Provider-agnostic interface
- **Prompt Store**: Versioned prompts + templates
- **Invoke Layer**: Queue + retry, rate-limit per-user
- **Result Cache**: Cache repeated queries, TTL
- **Audit Log**: Store prompt, response, cost, tokens
- **Privacy**: "Do not store" option, E2E encrypt inputs
- **Training**: Collect anonymized interactions (opt-in)

### 6.3 Data & Labels

- **Summaries**: (note, summary) pairs - synthetic seed data
- **Tags**: (note, tags) - heuristics + manual corrections
- **Q&A**: RAG with vector DB (Pinecone/Weaviate/PGVector)

### 6.4 Deployment & Monitoring

- API Gateway + autoscaling worker pool
- Track cost, token usage, latency, error rates
- A/B test generations
- Human-in-the-loop for quality
- Privacy & data retention compliance

**Acceptance**: LLM plan with sample prompts, data schema, staging rollout

---

## 7 — Tasks & Acceptance Criteria

### Example: Notes CRUD

**Deliverables**:
- API endpoints
- Frontend components
- Unit tests
- E2E tests

**Acceptance**:
- ✅ Create → Read → Update → Delete works
- ✅ Offline create syncs to server
- ✅ Version increment on update
- ✅ Vitest + Playwright green

### Example: AI Summarize (MVP)

**Deliverables**:
- `/ai/summarize` endpoint
- Server adapter to LLM
- Frontend modal
- Integration tests (mock LLM)

**Acceptance**:
- ✅ Summary < 200 words
- ✅ References source notes
- ✅ UI displays loader + error handling

---

## 8 — Non-Functional Requirements

| Requirement | Standard |
|-------------|----------|
| **Accessibility** | WCAG AA for all core flows |
| **Performance** | Render 1k notes fast (virtualization) |
| **Security** | Sanitize HTML, rate-limit auth, HTTPS |
| **Observability** | Sentry + basic metrics |
| **CI/CD** | Tests on PRs, preview deployments |

---

## 9 — Deliverables & Output Format

For every artifact:

1. **PR Bundle**: Files + diffs (unified patch)
2. **Runbook**: Local setup + tests + deploy preview
3. **Test Results**: Vitest & Playwright outputs
4. **Design Assets**: Wireframes (SVG/PNG) + hero screenshot
5. **LLM Plan**: AI feature spec (prompts, data, rollout)

---

## 10 — Priorities & Timeline

| Phase | Timeline | Features |
|-------|----------|----------|
| **Week 0** | Setup | Repo scaffold, CI, theme, marketing landing |
| **Week 1-3** | MVP | Auth, Notes CRUD, Editor, persistence, sync, search |
| **Week 4-7** | v1 | Attachments, autosave, templates, export, analytics |
| **Week 8-12** | v2 | Collaboration, comments, shared notebooks, enhanced search |
| **Week 12+** | PRO | E2E encryption, AI features, enterprise |

**Current Status**: Week 7 (v1 at 70%)

---

## 11 — Final Notes

### Development Guidelines

1. **Work Incrementally**: Deploy preview after each major PR
2. **Run Tests**: Ensure all tests pass before merge
3. **Consistency**: Follow `/docs/design-system.md` and `.cursorrules`
4. **AI Features Last**: Requires dataset collection, prompt design, ops setup

### Current Progress

- ✅ MVP: 100% Complete
- ⏳ v1: 70% Complete (7/10 features)
- 📋 v2: Planned
- 🚀 PRO: Future

### Next Steps

1. Version History implementation
2. Improved Onboarding
3. Analytics integration
4. API documentation (OpenAPI)
5. Rate limiting

---

**Document Version**: 2.0  
**Last Review**: November 24, 2025  
**Next Review**: After v1 completion