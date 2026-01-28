# Testing & Acceptance Criteria

## Unit Tests (Vitest)
- NoteList renders fetched notes
- NoteEditor auto-saves after 1s debounce
- SyncQueue flushes offline changes
- Search filters notes by title/content
- Tags filter correctly
- Auth validates credentials

## E2E Tests (Playwright)
1. User signup + login
2. Create a new note
3. Edit note content
4. Search finds the note
5. Tag a note and filter by tag
6. Go offline → create note → go online → sync

## Acceptance Criteria
- All tests must pass before feature is “Done”
- TypeScript must compile with no errors
- No inline secrets in codebase
- Lint must pass
- App loads correctly in mobile + desktop
- Offline mode must store notes locally
- Sync must update server when online
