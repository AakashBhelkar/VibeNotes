---
description: Implementation plan for Rich Editor features (Slash commands, Code blocks, Tables)
---

# Rich Editor Implementation Plan

## Objective
Enhance the existing Markdown editor with productivity features:
1. **Slash Commands**: Popup menu triggered by `/` to insert headers, lists, tables, etc.
2. **Code Block Highlighting**: Syntax highlighting in preview mode.
3. **Keyboard Shortcuts**: Common formatting shortcuts (Bold, Italic, Link).

## 1. Dependencies
- Install `rehype-highlight` for syntax highlighting in `react-markdown`.
- Install `lucide-react` icons (already installed).

## 2. Components

### `SlashCommandMenu.tsx`
- **Props**:
  - `position`: { top: number, left: number }
  - `onSelect`: (command: string) => void
  - `onClose`: () => void
- **Features**:
  - List of commands (Heading 1-3, Bullet List, Numbered List, Checkbox, Code Block, Quote, Table, Divider).
  - Keyboard navigation (Arrow keys, Enter).
  - Filter commands based on search text (e.g., `/hea` -> Headings).

### `NoteEditor.tsx` Updates
- **State**:
  - `showSlashMenu`: boolean
  - `slashMenuPosition`: { top: number, left: number }
  - `slashFilter`: string (text typed after `/`)
- **Logic**:
  - Detect `/` keypress.
  - Calculate menu position relative to cursor (using a helper or simple approximation).
  - Handle selection from menu and insert Markdown syntax.
  - Handle keyboard shortcuts (`Ctrl+B`, `Ctrl+I`, etc.).

## 3. Syntax Highlighting
- Update `NoteEditor.tsx` to use `rehype-highlight` in `ReactMarkdown`.
- Import a highlight.js theme CSS (e.g., `github-dark`).

## 4. Implementation Steps

### Step 1: Install Dependencies
```bash
npm install rehype-highlight highlight.js
```

### Step 2: Create SlashCommandMenu Component
Create `client/src/components/SlashCommandMenu.tsx`.

### Step 3: Update NoteEditor
- Import `SlashCommandMenu`.
- Add keyboard event handlers.
- Implement insertion logic.

### Step 4: Add Syntax Highlighting
- Import `rehype-highlight`.
- Add to `remarkPlugins`.
- Import CSS.

## 5. Testing
- Manual testing of slash menu triggering and insertion.
- Verify syntax highlighting in preview.
- Verify keyboard shortcuts.
