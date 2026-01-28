# Coding Rules & Engineering Standards

These rules must be followed by every AI-generated file (frontend + backend).

## 1. Language & Framework
- TypeScript only (strict mode ON).
- React 18 for UI (function components).
- Node.js + Express (TypeScript).
- IndexedDB via Dexie for offline.
- Prefer React Query for remote data.

## 2. Code Quality
- No `any` types unless explicitly justified.
- All modules must be pure unless interacting with external systems.
- Maximum function length: 40 lines.
- Maximum file length: 300 lines (for readability).
- Avoid deep nested conditions; prefer early returns.
- Keep state minimal and colocated.

## 3. Architecture Rules
- Separate UI, logic, and data access.
- Backend: controllers → services → repositories → DB.
- Frontend: components → hooks → services → utils.
- No direct DB access inside controllers.
- No API calls directly inside components (use services/hooks).

## 4. Testing Rules
- Every file must include at least one test (unit or integration).
- Tests must mock external services.
- Never skip tests using `.skip`.
- E2E test must run as part of CI pipeline.

## 5. Security Rules
- No plaintext secrets.
- All user inputs must be validated & sanitized.
- Use prepared statements (SQL) or ORM safeguards.
- Escape HTML or sanitize rendered markup.
- Enforce rate limiting in backend for sensitive routes.

## 6. Error Handling
- Never swallow errors silently.
- Use typed error objects.
- Send user-friendly API responses.

## 7. Comments & Documentation
- Use JSDoc/@param style for complex functions.
- Avoid unnecessary comments (self-document through naming).
- Inline comments only for tricky logic.

## 8. Performance
- Use pagination in API responses.
- Use memo and callback hooks in React to avoid unnecessary re-renders.
- Virtualize long lists.
- Debounce expensive operations (search, autosave).

## 9. Accessibility (A11y)
- All interactive elements must have ARIA attributes.
- Keyboard navigation must work for core flows.
- Support prefers-color-scheme.

## 10. Git & CI
- No commits with failing tests.
- No console logs in production builds.
- PRs must include test coverage for new code.
