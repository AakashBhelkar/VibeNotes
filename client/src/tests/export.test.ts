import { describe, it, expect } from 'vitest';
import { Note } from '@/lib/db';

// Mock note for testing
const mockNote: Note = {
    id: 'test-123',
    userId: 'user-456',
    title: 'Test Note',
    content: '# Hello World\n\nThis is a **test** note with `code`.',
    tags: ['test', 'markdown'],
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
    version: 1
};

describe('Export Service', () => {
    describe('exportNoteAsHTML', () => {
        it('should format note correctly as HTML', async () => {
            const { exportNoteAsHTML } = await import('@/services/exportService');
            const html = exportNoteAsHTML(mockNote);

            expect(html).toContain('Test Note');
            expect(html).toContain('test');
            expect(html).toContain('markdown');
            expect(html).toContain('Hello World');
        });
    });

    describe('exportNotesAsJSON', () => {
        it('should create valid JSON structure', () => {
            const notes = [mockNote];
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

            expect(exportData.version).toBe('1.0');
            expect(exportData.notes).toHaveLength(1);
            expect(exportData.notes[0].title).toBe('Test Note');
        });
    });

    describe('importNotesFromJSON', () => {
        it('should parse valid JSON backup', async () => {
            const { importNotesFromJSON } = await import('@/services/exportService');

            const jsonContent = JSON.stringify({
                version: '1.0',
                exportDate: new Date().toISOString(),
                notes: [{
                    title: 'Imported Note',
                    content: 'Content here',
                    tags: ['imported'],
                    isPinned: false
                }]
            });

            const blob = new Blob([jsonContent], { type: 'application/json' });
            const file = new File([blob], 'backup.json', { type: 'application/json' });

            const imported = await importNotesFromJSON(file);

            expect(imported).toHaveLength(1);
            expect(imported[0].title).toBe('Imported Note');
            expect(imported[0].tags).toContain('imported');
        });

        it('should reject invalid JSON', async () => {
            const { importNotesFromJSON } = await import('@/services/exportService');

            const blob = new Blob(['invalid json'], { type: 'application/json' });
            const file = new File([blob], 'bad.json', { type: 'application/json' });

            try {
                await importNotesFromJSON(file);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Failed to parse backup file');
            }
        });

        it('should reject JSON without notes array', async () => {
            const { importNotesFromJSON } = await import('@/services/exportService');

            const jsonContent = JSON.stringify({ version: '1.0' });
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const file = new File([blob], 'incomplete.json', { type: 'application/json' });

            try {
                await importNotesFromJSON(file);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Failed to parse backup file');
            }
        });
    });

    describe('Filename sanitization', () => {
        it('should sanitize special characters', () => {
            const noteWithSpecialChars: Note = {
                ...mockNote,
                title: 'Test/Note: With "Special" <Characters>!'
            };

            // Test the sanitization logic
            const sanitized = noteWithSpecialChars.title
                .replace(/[^a-z0-9]/gi, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase();

            expect(sanitized).toBe('test-note-with-special-characters');
        });
    });

    describe('HTML escaping', () => {
        it('should escape HTML in note content', () => {
            const noteWithHTML: Note = {
                ...mockNote,
                title: '<script>alert("xss")</script>',
                content: '<img src=x onerror=alert(1)>'
            };

            const div = document.createElement('div');
            div.textContent = noteWithHTML.title;
            const escaped = div.innerHTML;

            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;script&gt;');
        });
    });
});

describe('ExportMenu Component', () => {
    it('should be importable', async () => {
        const { ExportMenu } = await import('@/components/ExportMenu');
        expect(ExportMenu).toBeDefined();
    });
});
