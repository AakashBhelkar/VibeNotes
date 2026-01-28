import { z } from 'zod';

export const createNoteSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string(),
        tags: z.array(z.string()).optional(),
    }),
});

export const updateNoteSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPinned: z.boolean().optional(),
        isArchived: z.boolean().optional(),
    }),
});

export const searchNotesSchema = z.object({
    query: z.object({
        q: z.string().optional(),
        tag: z.string().optional(),
    }),
});
