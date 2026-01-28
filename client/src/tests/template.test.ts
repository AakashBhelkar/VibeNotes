import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateService, BUILT_IN_TEMPLATES } from '../services/templateService';

describe('TemplateService', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('getAllTemplates', () => {
        it('should return built-in templates', () => {
            const templates = TemplateService.getAllTemplates();
            expect(templates.length).toBeGreaterThanOrEqual(BUILT_IN_TEMPLATES.length);
        });

        it('should include custom templates', () => {
            TemplateService.saveCustomTemplate({
                name: 'Test Template',
                description: 'Test Description',
                content: 'Test Content',
                tags: ['test'],
                icon: '🧪'
            });

            const templates = TemplateService.getAllTemplates();
            const customTemplates = templates.filter(t => t.id.startsWith('custom_'));
            expect(customTemplates.length).toBe(1);
        });
    });

    describe('saveCustomTemplate', () => {
        it('should save a custom template', () => {
            const template = TemplateService.saveCustomTemplate({
                name: 'My Template',
                description: 'My Description',
                content: '# My Content',
                tags: ['custom', 'test'],
                icon: '📝'
            });

            expect(template.id).toContain('custom_');
            expect(template.name).toBe('My Template');
            expect(template.tags).toEqual(['custom', 'test']);
        });

        it('should persist custom templates in localStorage', () => {
            TemplateService.saveCustomTemplate({
                name: 'Persistent Template',
                description: 'Test',
                content: 'Content',
                tags: [],
            });

            const stored = localStorage.getItem('vibenotes_custom_templates');
            expect(stored).toBeTruthy();
            const parsed = JSON.parse(stored!);
            expect(parsed.length).toBe(1);
            expect(parsed[0].name).toBe('Persistent Template');
        });
    });

    describe('deleteCustomTemplate', () => {
        it('should delete a custom template', () => {
            const template = TemplateService.saveCustomTemplate({
                name: 'To Delete',
                description: 'Test',
                content: 'Content',
                tags: [],
            });

            TemplateService.deleteCustomTemplate(template.id);
            const templates = TemplateService.getCustomTemplates();
            expect(templates.length).toBe(0);
        });

        it('should not affect other custom templates', () => {
            const template1 = TemplateService.saveCustomTemplate({
                name: 'Template 1',
                description: 'Test',
                content: 'Content',
                tags: [],
            });

            const template2 = TemplateService.saveCustomTemplate({
                name: 'Template 2',
                description: 'Test',
                content: 'Content',
                tags: [],
            });

            TemplateService.deleteCustomTemplate(template1.id);
            const templates = TemplateService.getCustomTemplates();
            expect(templates.length).toBe(1);
            expect(templates[0].id).toBe(template2.id);
        });
    });

    describe('getTemplateById', () => {
        it('should find built-in templates', () => {
            const template = TemplateService.getTemplateById('blank');
            expect(template).toBeDefined();
            expect(template?.name).toBe('Blank Note');
        });

        it('should find custom templates', () => {
            const custom = TemplateService.saveCustomTemplate({
                name: 'Custom',
                description: 'Test',
                content: 'Content',
                tags: [],
            });

            const found = TemplateService.getTemplateById(custom.id);
            expect(found).toBeDefined();
            expect(found?.name).toBe('Custom');
        });

        it('should return undefined for non-existent templates', () => {
            const template = TemplateService.getTemplateById('non-existent');
            expect(template).toBeUndefined();
        });
    });

    describe('createNoteFromTemplate', () => {
        it('should create note data from template', () => {
            const template = BUILT_IN_TEMPLATES.find(t => t.id === 'meeting')!;
            const noteData = TemplateService.createNoteFromTemplate(template);

            expect(noteData.title).toBe(template.name);
            expect(noteData.content).toBe(template.content);
            expect(noteData.tags).toEqual(template.tags);
        });

        it('should create a copy of tags array', () => {
            const template = BUILT_IN_TEMPLATES[0];
            const noteData = TemplateService.createNoteFromTemplate(template);

            // Modify the note data tags
            noteData.tags?.push('new-tag');

            // Original template tags should be unchanged
            expect(template.tags).not.toContain('new-tag');
        });
    });

    describe('getDailyNoteTitle', () => {
        it('should generate a formatted date title', () => {
            const date = new Date('2025-11-21');
            const title = TemplateService.getDailyNoteTitle(date);

            expect(title).toContain('Daily Note');
            expect(title).toContain('2025');
            expect(title).toContain('November');
            expect(title).toContain('21');
        });

        it('should use current date if no date provided', () => {
            const title = TemplateService.getDailyNoteTitle();
            expect(title).toContain('Daily Note');
        });
    });

    describe('getDailyNoteContent', () => {
        it('should generate daily note content with date', () => {
            const date = new Date('2025-11-21');
            const content = TemplateService.getDailyNoteContent(date);

            expect(content).toContain('2025');
            expect(content).toContain('Today\'s Focus');
            expect(content).toContain('Notes & Thoughts');
            expect(content).toContain('Wins');
            expect(content).toContain('Challenges');
            expect(content).toContain('Gratitude');
            expect(content).toContain('Tomorrow\'s Priorities');
        });
    });

    describe('createDailyNote', () => {
        it('should create daily note with proper structure', () => {
            const dailyNote = TemplateService.createDailyNote();

            expect(dailyNote.title).toContain('Daily Note');
            expect(dailyNote.content).toContain('Today\'s Focus');
            expect(dailyNote.tags).toContain('daily');
        });

        it('should include date tag in ISO format', () => {
            const date = new Date('2025-11-21');
            const dailyNote = TemplateService.createDailyNote(date);

            expect(dailyNote.tags).toContain('2025-11-21');
        });
    });

    describe('isDailyNote', () => {
        it('should identify daily notes', () => {
            const note = {
                id: '1',
                title: 'Daily Note',
                content: 'Content',
                tags: ['daily', '2025-11-21'],
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                isArchived: false,
                isPinned: false
            };

            const date = new Date('2025-11-21');
            expect(TemplateService.isDailyNote(note, date)).toBe(true);
        });

        it('should return false for non-daily notes', () => {
            const note = {
                id: '1',
                title: 'Regular Note',
                content: 'Content',
                tags: ['work'],
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                isArchived: false,
                isPinned: false
            };

            expect(TemplateService.isDailyNote(note)).toBe(false);
        });

        it('should return false for daily notes from different dates', () => {
            const note = {
                id: '1',
                title: 'Daily Note',
                content: 'Content',
                tags: ['daily', '2025-11-20'],
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                isArchived: false,
                isPinned: false
            };

            const date = new Date('2025-11-21');
            expect(TemplateService.isDailyNote(note, date)).toBe(false);
        });
    });

    describe('Built-in Templates', () => {
        it('should have all expected built-in templates', () => {
            const expectedTemplates = [
                'blank',
                'meeting',
                'daily',
                'todo',
                'project',
                'brainstorm',
                'research',
                'retrospective'
            ];

            const templateIds = BUILT_IN_TEMPLATES.map(t => t.id);
            expectedTemplates.forEach(id => {
                expect(templateIds).toContain(id);
            });
        });

        it('should have icons for all built-in templates', () => {
            BUILT_IN_TEMPLATES.forEach(template => {
                expect(template.icon).toBeDefined();
                expect(template.icon).not.toBe('');
            });
        });

        it('should have descriptions for all built-in templates', () => {
            BUILT_IN_TEMPLATES.forEach(template => {
                expect(template.description).toBeDefined();
                expect(template.description).not.toBe('');
            });
        });
    });
});
