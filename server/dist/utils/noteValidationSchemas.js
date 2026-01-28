"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotesSchema = exports.updateNoteSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        content: zod_1.z.string(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        content: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        isPinned: zod_1.z.boolean().optional(),
        isArchived: zod_1.z.boolean().optional(),
    }),
});
exports.searchNotesSchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z.string().optional(),
        tag: zod_1.z.string().optional(),
    }),
});
