import { Note } from '@/lib/db';

export const sampleNotes: Omit<Note, 'id' | 'userId' | 'version' | 'createdAt' | 'updatedAt' | 'syncedAt'>[] = [
    {
        title: '👋 Welcome to VibeNotes!',
        content: `# Welcome to VibeNotes!

Thank you for choosing VibeNotes - your offline-first, privacy-focused note-taking app.

## ✨ Key Features

- **Offline First**: All your notes are stored locally and sync when you're online
- **Markdown Support**: Write with full markdown formatting
- **Tags**: Organize notes with tags for easy filtering
- **Search**: Powerful full-text search across all your notes
- **Templates**: Quick-start with built-in templates
- **Attachments**: Add images and files to your notes
- **Dark Mode**: Easy on the eyes, day or night

## 🚀 Getting Started

1. **Create a note**: Click the "New Note" button
2. **Use templates**: Click "Templates" for quick starts
3. **Add tags**: Organize with tags like #work #personal
4. **Search**: Use Ctrl+K to search anytime
5. **Pin important notes**: Keep them at the top

## 💡 Pro Tips

- Use **Ctrl+S** to save manually
- **Slash commands** (/) for quick formatting
- **Multi-tag filter** to find notes with specific tags
- Check the **word count** at the bottom of the editor

## 🔒 Your Privacy

- All notes stored locally in your browser
- End-to-end sync with your account
- No tracking, no ads, just notes

Happy note-taking! 📝`,
        tags: ['welcome', 'getting-started'],
        isPinned: true,
        isArchived: false,
    },
    {
        title: '⌨️ Keyboard Shortcuts',
        content: `# Keyboard Shortcuts

Master VibeNotes with these handy shortcuts!

## Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + S** | Save current note |
| **Ctrl + K** | Open search |
| **Ctrl + N** | Create new note |
| **Ctrl + /** | Toggle preview mode |

## Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + B** | Bold text |
| **Ctrl + I** | Italic text |
| **Ctrl + K** | Insert link |
| **/** | Slash commands menu |

## Navigation

| Shortcut | Action |
|----------|--------|
| **↑/↓** | Navigate note list |
| **Enter** | Open selected note |
| **Esc** | Close dialogs |

## Slash Commands

Type **/** in the editor to access:

- **/h1**, **/h2**, **/h3** - Headings
- **/bullet** - Bullet list
- **/numbered** - Numbered list
- **/code** - Code block
- **/quote** - Blockquote
- **/divider** - Horizontal rule
- **/table** - Insert table

## Tips

- Shortcuts work in both edit and preview modes
- Use slash commands for faster formatting
- Combine shortcuts for maximum productivity

*Bookmark this note for quick reference!*`,
        tags: ['reference', 'shortcuts', 'tips'],
        isPinned: false,
        isArchived: false,
    },
    {
        title: '📋 Quick Start Guide',
        content: `# Quick Start Guide

Get up and running with VibeNotes in minutes!

## Step 1: Create Your First Note

1. Click **"New Note"** button (top left)
2. Give it a title
3. Start writing in markdown
4. Notes auto-save every second

## Step 2: Organize with Tags

Tags help you find notes quickly:

\`\`\`
Add tags like: #work #ideas #todo
\`\`\`

- Click any tag to filter notes
- Select multiple tags for AND filtering
- Clear filters to see all notes

## Step 3: Use Templates

Save time with templates:

1. Click **"Templates"** button
2. Choose from 8 built-in templates
3. Or create your own custom template

Popular templates:
- 📅 Daily Note
- 👥 Meeting Notes
- ✅ To-Do List
- 🎯 Project Planning

## Step 4: Search Everything

Find any note instantly:

- Press **Ctrl + K** to search
- Search in titles and content
- Filter by tags
- Combine search + tags

## Step 5: Attach Files

Add context to your notes:

- Drag and drop images
- Attach PDFs and documents
- 10MB limit per file
- Secure cloud storage

## Next Steps

- Explore slash commands (type **/*)
- Try dark mode (top right)
- Pin important notes
- Export notes (Markdown, JSON, PDF)

*Delete these sample notes when you're ready!*`,
        tags: ['guide', 'getting-started'],
        isPinned: false,
        isArchived: false,
    },
];
