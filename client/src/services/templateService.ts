import { Note } from '@/lib/db';

/**
 * Template interface for note templates
 */
export interface Template {
    id: string;
    name: string;
    description: string;
    content: string;
    tags: string[];
    icon?: string;
}

/**
 * Built-in templates for common note types
 */
export const BUILT_IN_TEMPLATES: Template[] = [
    {
        id: 'blank',
        name: 'Blank Note',
        description: 'Start with an empty note',
        content: '',
        tags: [],
        icon: '📝'
    },
    {
        id: 'meeting',
        name: 'Meeting Notes',
        description: 'Template for meeting notes',
        content: `# Meeting Notes

## Date
${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Steps
`,
        tags: ['meeting'],
        icon: '👥'
    },
    {
        id: 'daily',
        name: 'Daily Note',
        description: 'Daily journal template',
        content: `# Daily Note - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## Notes
- 

## Reflections
- 

## Tomorrow's Priorities
- 
`,
        tags: ['daily'],
        icon: '📅'
    },
    {
        id: 'todo',
        name: 'To-Do List',
        description: 'Task list template',
        content: `# To-Do List

## High Priority
- [ ] 

## Medium Priority
- [ ] 

## Low Priority
- [ ] 

## Completed
- [x] 
`,
        tags: ['todo'],
        icon: '✅'
    },
    {
        id: 'project',
        name: 'Project Planning',
        description: 'Template for project planning',
        content: `# Project: [Project Name]

## Overview
Brief description of the project

## Goals
- 

## Timeline
- Start Date: 
- End Date: 
- Milestones:
  - [ ] 

## Resources
- 

## Risks & Challenges
- 

## Success Metrics
- 
`,
        tags: ['project', 'planning'],
        icon: '🎯'
    },
    {
        id: 'brainstorm',
        name: 'Brainstorming',
        description: 'Template for brainstorming sessions',
        content: `# Brainstorming Session

## Topic
[Topic Name]

## Ideas
1. 
2. 
3. 

## Pros & Cons
### Pros
- 

### Cons
- 

## Next Actions
- [ ] 
`,
        tags: ['brainstorm', 'ideas'],
        icon: '💡'
    },
    {
        id: 'research',
        name: 'Research Notes',
        description: 'Template for research and study notes',
        content: `# Research: [Topic]

## Source
- Title: 
- Author: 
- Date: 
- URL: 

## Key Points
- 

## Quotes
> 

## My Thoughts
- 

## References
1. 
`,
        tags: ['research'],
        icon: '🔍'
    },
    {
        id: 'retrospective',
        name: 'Retrospective',
        description: 'Template for team retrospectives',
        content: `# Retrospective - ${new Date().toLocaleDateString()}

## What Went Well 🎉
- 

## What Could Be Improved 🔧
- 

## Action Items 📋
- [ ] 

## Appreciation 💙
- 
`,
        tags: ['retrospective', 'team'],
        icon: '🔄'
    }
];

/**
 * Template service for managing note templates
 */
export class TemplateService {
    private static readonly CUSTOM_TEMPLATES_KEY = 'vibenotes_custom_templates';

    /**
     * Get all available templates (built-in + custom)
     */
    static getAllTemplates(): Template[] {
        const customTemplates = this.getCustomTemplates();
        return [...BUILT_IN_TEMPLATES, ...customTemplates];
    }

    /**
     * Get custom templates from localStorage
     */
    static getCustomTemplates(): Template[] {
        try {
            const stored = localStorage.getItem(this.CUSTOM_TEMPLATES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Save a custom template
     */
    static saveCustomTemplate(template: Omit<Template, 'id'>): Template {
        const customTemplates = this.getCustomTemplates();
        const newTemplate: Template = {
            ...template,
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        customTemplates.push(newTemplate);
        localStorage.setItem(this.CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
        return newTemplate;
    }

    /**
     * Delete a custom template
     */
    static deleteCustomTemplate(id: string): void {
        const customTemplates = this.getCustomTemplates();
        const filtered = customTemplates.filter(t => t.id !== id);
        localStorage.setItem(this.CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
    }

    /**
     * Get a template by ID
     */
    static getTemplateById(id: string): Template | undefined {
        return this.getAllTemplates().find(t => t.id === id);
    }

    /**
     * Create a note from a template
     */
    static createNoteFromTemplate(template: Template): Partial<Note> {
        return {
            title: template.name,
            content: template.content,
            tags: [...template.tags]
        };
    }

    /**
     * Generate daily note title
     */
    static getDailyNoteTitle(date: Date = new Date()): string {
        return `Daily Note - ${date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`;
    }

    /**
     * Generate daily note content
     */
    static getDailyNoteContent(date: Date = new Date()): string {
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `# ${dateStr}

## Today's Focus
- [ ] 
- [ ] 
- [ ] 

## Notes & Thoughts
- 

## Wins 🎉
- 

## Challenges 🤔
- 

## Gratitude 🙏
- 

## Tomorrow's Priorities
- 
`;
    }

    /**
     * Create a daily note
     */
    static createDailyNote(date: Date = new Date()): Partial<Note> {
        return {
            title: this.getDailyNoteTitle(date),
            content: this.getDailyNoteContent(date),
            tags: ['daily', date.toISOString().split('T')[0]]
        };
    }

    /**
     * Check if a daily note exists for a given date
     */
    static isDailyNote(note: Note, date: Date = new Date()): boolean {
        const dateTag = date.toISOString().split('T')[0];
        return note.tags?.includes('daily') && note.tags?.includes(dateTag);
    }
}
