# VibeNotes Documentation

## Getting Started

Welcome to VibeNotes! This guide will help you get started with taking notes, organizing your thoughts, and making the most of our features.

### Creating Your First Note

1. Click the "New Note" button in the sidebar
2. Give your note a title
3. Start writing in the editor
4. Your note auto-saves every second

### Markdown Support

VibeNotes supports full Markdown formatting:

- **Bold text**: `**bold**`
- *Italic text*: `*italic*`
- Headers: `# H1`, `## H2`, `### H3`
- Lists: Use `-` or `*` for bullets, `1.` for numbers
- Code blocks: Use triple backticks
- Links: `[text](url)`
- Images: `![alt](url)`

### Tags & Organization

Organize your notes with tags:

1. Click on the tag input in the editor
2. Type your tag name and press Enter
3. Filter notes by clicking tags in the sidebar
4. Use multiple tags for better organization

### Search

Find notes quickly:

- Use the search bar at the top of the note list
- Search works on both titles and content
- Results update in real-time as you type

### Offline Support

VibeNotes works completely offline:

- All notes are stored locally on your device
- Create, edit, and delete notes without internet
- Changes sync automatically when you reconnect
- See your connection status in the top bar

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Manual save (auto-save is always on)
- `Ctrl/Cmd + C`: Copy note content
- `Ctrl/Cmd + K`: Focus search

### Pinning Notes

Keep important notes at the top:

1. Hover over a note in the list
2. Click the pin icon
3. Pinned notes appear first in your list

### Sync & Backup

Your notes sync across all your devices:

- Automatic sync when online
- Manual sync button in the top bar
- Conflict resolution (server wins by default)
- All data encrypted in transit

## Advanced Features

### Markdown Preview

Toggle between edit and preview modes:

1. Click the eye icon in the editor toolbar
2. See your formatted markdown in real-time
3. Switch back to edit mode anytime

### Export Notes

Export your notes (Pro feature):

- Markdown format (.md)
- PDF format
- Bulk export all notes
- Preserve formatting and attachments

### Attachments

Add files to your notes (Pro feature):

- Drag and drop files into the editor
- Support for images, PDFs, and documents
- Files stored securely in the cloud
- Quick preview and download

### Version History

Never lose your work (Pro feature):

- Automatic snapshots on every edit
- Browse previous versions
- Restore any version with one click
- See what changed between versions

### Collaboration

Work together in real-time (Team feature):

- Share notebooks with team members
- See who's editing in real-time
- Comments and mentions
- Granular permissions

## Tips & Tricks

### Daily Notes

Create a daily journal:

1. Use a consistent naming pattern (e.g., "2025-01-20")
2. Tag with "daily" or "journal"
3. Link between days using markdown links

### Templates

Save time with templates:

1. Create a note with your template structure
2. Tag it "template"
3. Copy and customize when needed

### Code Snippets

Store code snippets:

1. Use code blocks with language syntax
2. Tag with the programming language
3. Search by language or description

### Meeting Notes

Organize meeting notes:

- Use headers for agenda items
- Tag with project name and "meeting"
- Add action items with checkboxes
- Link to related notes

## Troubleshooting

### Notes Not Syncing

1. Check your internet connection
2. Click the manual sync button
3. Check for error messages in the top bar
4. Try logging out and back in

### Search Not Working

1. Refresh the page
2. Clear your browser cache
3. Check if notes are fully loaded
4. Try searching for exact phrases

### Offline Mode Issues

1. Check browser storage permissions
2. Clear IndexedDB if corrupted
3. Re-sync from server
4. Contact support if issues persist

## API Documentation

For developers integrating with VibeNotes:

### Authentication

```bash
POST /auth/signup
POST /auth/login
GET /auth/me
```

### Notes API

```bash
GET /notes
POST /notes
GET /notes/:id
PUT /notes/:id
DELETE /notes/:id
```

### Search API

```bash
POST /search
Body: { q: string, filters: {...} }
```

See our [API Specification](api-spec.md) for full details.

## Support

Need help? We're here for you:

- **Email**: support@vibenotes.app
- **Discord**: Join our community
- **GitHub**: Report bugs and request features
- **Twitter**: @vibenotes

## Privacy & Security

Your privacy matters:

- End-to-end encryption (Pro)
- No data selling, ever
- GDPR compliant
- SOC 2 certified (Team)
- Regular security audits

## Changelog

See what's new in [Changelog](changelog.md)

## Roadmap

See what's coming in [Roadmap](roadmap.md)

---

**Last Updated**: January 2025  
**Version**: 1.0.0
