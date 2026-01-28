import { Note } from '@/lib/db';

/**
 * Export service for notes
 * Handles exporting notes to various formats (Markdown, PDF, JSON)
 */

/**
 * Export a single note as Markdown
 */
export function exportNoteAsMarkdown(note: Note): void {
    const content = `# ${note.title}\n\n${note.content}\n\n---\n\nTags: ${note.tags?.join(', ') || 'None'}\nCreated: ${new Date(note.createdAt).toLocaleDateString()}\nUpdated: ${new Date(note.updatedAt).toLocaleDateString()}`;

    downloadFile(
        content,
        `${sanitizeFilename(note.title)}.md`,
        'text/markdown'
    );
}

/**
 * Export multiple notes as a single Markdown file
 */
export function exportNotesAsMarkdown(notes: Note[]): void {
    const content = notes.map(note =>
        `# ${note.title}\n\n${note.content}\n\n---\n\nTags: ${note.tags?.join(', ') || 'None'}\nCreated: ${new Date(note.createdAt).toLocaleDateString()}\n\n`
    ).join('\n\n');

    downloadFile(
        content,
        `vibenotes-export-${new Date().toISOString().split('T')[0]}.md`,
        'text/markdown'
    );
}

/**
 * Export notes as JSON
 */
export function exportNotesAsJSON(notes: Note[]): void {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        notes: notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            isPinned: note.isPinned,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }))
    };

    downloadFile(
        JSON.stringify(exportData, null, 2),
        `vibenotes-backup-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
    );
}

/**
 * Export a note as HTML (for PDF conversion)
 */
export function exportNoteAsHTML(note: Note): string {
    // Convert markdown to HTML (basic implementation)
    const htmlContent = convertMarkdownToHTML(note.content);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(note.title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .metadata {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 30px;
        }
        .tag {
            display: inline-block;
            background: #e0e7ff;
            color: #4f46e5;
            padding: 2px 8px;
            border-radius: 4px;
            margin-right: 5px;
            font-size: 0.85em;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            color: inherit;
        }
        blockquote {
            border-left: 4px solid #4f46e5;
            margin-left: 0;
            padding-left: 20px;
            color: #555;
        }
    </style>
</head>
<body>
    <h1>${escapeHTML(note.title)}</h1>
    <div class="metadata">
        <div>
            ${note.tags && note.tags.length > 0 ?
            note.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('') :
            '<span class="tag">No tags</span>'
        }
        </div>
        <div>Created: ${new Date(note.createdAt).toLocaleDateString()}</div>
        <div>Updated: ${new Date(note.updatedAt).toLocaleDateString()}</div>
    </div>
    <div class="content">
        ${htmlContent}
    </div>
</body>
</html>
    `.trim();
}

/**
 * Trigger browser print dialog for PDF export
 */
export function exportNoteAsPDF(note: Note): void {
    const htmlContent = exportNoteAsHTML(note);

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
    };
}

/**
 * Basic Markdown to HTML converter
 * For production, consider using a library like marked or remark
 */
function convertMarkdownToHTML(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = `<p>${html}</p>`;

    return html;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .substring(0, 100);
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Interface for imported note data from JSON backup files
 */
interface ImportedNoteData {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    id?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

/**
 * Import notes from JSON file
 */
export async function importNotesFromJSON(file: File): Promise<Partial<Note>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (!data.notes || !Array.isArray(data.notes)) {
                    throw new Error('Invalid backup file format');
                }

                // Return notes without IDs (will be generated on import)
                const notes = data.notes.map((note: ImportedNoteData) => ({
                    title: note.title || 'Untitled',
                    content: note.content || '',
                    tags: note.tags || [],
                    isPinned: note.isPinned || false
                }));

                resolve(notes);
            } catch (error) {
                reject(new Error('Failed to parse backup file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}
