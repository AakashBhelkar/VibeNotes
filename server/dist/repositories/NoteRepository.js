"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotes = exports.remove = exports.update = exports.create = exports.findById = exports.findByUserId = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Find all notes for a specific user
 * @param userId - The user's ID
 * @returns Array of notes sorted by pinned status and update time
 */
const findByUserId = async (userId) => {
    return db_1.default.note.findMany({
        where: { userId },
        orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' },
        ],
    });
};
exports.findByUserId = findByUserId;
/**
 * Find a specific note by ID and verify user ownership
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The note if found and owned by user, null otherwise
 */
const findById = async (id, userId) => {
    return db_1.default.note.findFirst({
        where: { id, userId },
    });
};
exports.findById = findById;
/**
 * Create a new note for a user
 * @param data - Note creation data
 * @returns The created note
 */
const create = async (data) => {
    return db_1.default.note.create({
        data: {
            userId: data.userId,
            title: data.title,
            content: data.content,
            tags: data.tags || [],
        },
    });
};
exports.create = create;
/**
 * Update a note with user ownership verification
 * @param id - The note ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated note
 * @throws Error if note doesn't exist or user doesn't own it
 */
const update = async (id, userId, data) => {
    // Verify ownership before updating
    return db_1.default.note.update({
        where: {
            id,
            userId, // Ensures user owns the note
        },
        data: {
            ...data,
            version: { increment: 1 },
        },
    });
};
exports.update = update;
/**
 * Delete a note with user ownership verification
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The deleted note
 * @throws Error if note doesn't exist or user doesn't own it
 */
const remove = async (id, userId) => {
    // Verify ownership before deleting
    return db_1.default.note.delete({
        where: {
            id,
            userId, // Ensures user owns the note
        },
    });
};
exports.remove = remove;
/**
 * Search notes by query and/or tag
 * @param userId - The user's ID
 * @param query - Search query for title/content
 * @param tag - Optional tag filter
 * @returns Array of matching notes
 */
const searchNotes = async (userId, query, tag) => {
    const where = { userId };
    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
        ];
    }
    if (tag) {
        where.tags = { has: tag };
    }
    return db_1.default.note.findMany({
        where,
        orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' },
        ],
    });
};
exports.searchNotes = searchNotes;
