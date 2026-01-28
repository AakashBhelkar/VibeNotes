# VibeNotes — Product Requirements Document (PRD)

## 1. Purpose
VibeNotes is a modern note-taking application built via Vibe Coding.  
It must support offline-first usage, syncing, Markdown editing, tagging, search, and user authentication.

## 2. Product Goals
- Fast, simple, distraction-free note-taking.
- Reliable offline editing with auto-sync.
- Easy organization using tags.
- Full-text search.
- Clean UI with minimal friction.
- Work across desktop/mobile.

## 3. Core Features (MVP)
1. User Authentication (signup/login).
2. Create / Read / Update / Delete notes.
3. Markdown editor (with preview toggle).
4. Auto-save every 1–2 seconds.
5. Tags + tag-based filtering.
6. Full-text search on title + content.
7. Offline-first local storage.
8. Online sync (queue-based).
9. Responsive UI (mobile + desktop).

## 4. Non-MVP (Pro Features)
- Attachments (images/files).
- Version history.
- Collaboration (real-time).
- Shareable read-only notes.
- PDF/Markdown export.
- Folders or nested notebooks.
- Encryption.

## 5. Constraints
- AI must generate clean, testable, modular code.
- Every feature must have unit tests.
- No inline secrets.
- Entire app must be deployable via CI/CD.

## 6. Success Criteria
- All MVP features implemented with passing tests.
- Fully functional offline/online sync.
- Code readable & maintainable.
- Preview environment deploys successfully.
