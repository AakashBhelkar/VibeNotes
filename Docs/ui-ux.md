    # UI and UX Specification

## Screens
1. Login screen
2. Signup screen
3. Notes dashboard
4. Note editor screen
5. Tag filter sidebar
6. Settings page (theme, profile)
7. Offline indicator
8. Conflict resolution dialog (if version mismatch)

## Components
- NoteList
- NoteListItem
- NoteEditor
- MarkdownPreview
- TagSelector
- SearchBar
- SaveIndicator
- SyncStatusBadge
- Sidebar
- Toolbar (bold, italic, list, link)
- AttachmentUploader (optional)

## Interactions
- Auto-save every 1s
- Cmd/Ctrl + N → New note
- Cmd/Ctrl + S → Manual save
- Type in search box → instant filter
- Click tag → filter notes
- Offline → Show “Offline (unsynced)” badge
- Conflict → Modal with both versions side-by-side

## States
- Loading
- Empty
- Error
- Offline
- Syncing
