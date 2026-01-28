# Naming Conventions

Consistent naming ensures readability and predictable AI-generated code.

## 1. General Rules
- Use descriptive, clear names.
- Avoid abbreviations unless widely understood (e.g., HTML, URL, DB, ID).
- Use American spelling (e.g., "color" not "colour").

## 2. File Names
- React components: PascalCase → `NoteEditor.tsx`
- Hooks: camelCase with prefix `use` → `useAutosave.ts`
- Services: camelCase → `noteService.ts`
- Utilities/helpers: camelCase → `markdownToHtml.ts`
- Backend controllers: PascalCase → `NoteController.ts`
- Backend services: PascalCase → `NoteService.ts`
- Database models: PascalCase → `NoteModel.ts`

## 3. Variable Names
- camelCase for all variables and function names.
- Boolean variables must start with: `is`, `has`, `should`, `can`
  - Example: `isSaving`, `hasChanges`, `shouldSync`
- Arrays: plural nouns → `notes`, `tags`, `pendingChanges`
- Constants: SCREAMING_SNAKE_CASE → `DEFAULT_PAGE_SIZE`

## 4. Component Names
- Always descriptive: `NoteList`, `TagSelector`, `SyncIndicator`
- Suffix UI-only components with:
  - `Modal`, `Card`, `Badge`, `Chip`, `ListItem`, etc.

## 5. TypeScript Types & Interfaces
- Interfaces: PascalCase → `Note`, `User`, `SyncItem`
- Types for specific use-cases:
  - `NoteDTO`, `NotePayload`, `NoteResponse`
- Enums: PascalCase → `SyncStatus`

## 6. API Naming
- Endpoints must be RESTful.
- Use nouns for resources: `/notes`, `/users`, `/tags`
- Use kebab-case for URL paths.

## 7. Database Fields
- snake_case for SQL databases: `created_at`
- camelCase for MongoDB: `createdAt`

## 8. CSS/Styling
- Use Tailwind classes.
- Component wrapper class names: `vn-note-list`, `vn-editor-container`
