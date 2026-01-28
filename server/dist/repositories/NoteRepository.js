"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotes = exports.remove = exports.permanentDelete = exports.restore = exports.softDelete = exports.update = exports.create = exports.findById = exports.findDeletedByUserId = exports.findArchivedByUserId = exports.findByUserId = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Find all notes for a specific user (excludes deleted notes)
 * @param userId - The user's ID
 * @param includeArchived - Whether to include archived notes (default: false)
 * @returns Array of notes sorted by pinned status and update time
 */
const findByUserId = async (userId, includeArchived = false) => {
    return db_1.default.note.findMany({
        where: {
            userId,
            deletedAt: null,
            ...(includeArchived ? {} : { isArchived: false }),
        },
        orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' },
        ],
    });
};
exports.findByUserId = findByUserId;
/**
 * Find all archived notes for a specific user (excludes deleted notes)
 * @param userId - The user's ID
 * @returns Array of archived notes sorted by update time
 */
const findArchivedByUserId = async (userId) => {
    return db_1.default.note.findMany({
        where: {
            userId,
            isArchived: true,
            deletedAt: null,
        },
        orderBy: [{ updatedAt: 'desc' }],
    });
};
exports.findArchivedByUserId = findArchivedByUserId;
/**
 * Find all deleted (trashed) notes for a specific user
 * @param userId - The user's ID
 * @returns Array of deleted notes sorted by deletion time
 */
const findDeletedByUserId = async (userId) => {
    return db_1.default.note.findMany({
        where: {
            userId,
            deletedAt: { not: null },
        },
        orderBy: [{ deletedAt: 'desc' }],
    });
};
exports.findDeletedByUserId = findDeletedByUserId;
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
 * Soft delete a note (move to trash)
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The soft-deleted note
 * @throws Error if note doesn't exist or user doesn't own it
 */
const softDelete = async (id, userId) => {
    return db_1.default.note.update({
        where: {
            id,
            userId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
exports.softDelete = softDelete;
/**
 * Restore a note from trash
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The restored note
 * @throws Error if note doesn't exist or user doesn't own it
 */
const restore = async (id, userId) => {
    return db_1.default.note.update({
        where: {
            id,
            userId,
        },
        data: {
            deletedAt: null,
        },
    });
};
exports.restore = restore;
/**
 * Permanently delete a note
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The deleted note
 * @throws Error if note doesn't exist or user doesn't own it
 */
const permanentDelete = async (id, userId) => {
    return db_1.default.note.delete({
        where: {
            id,
            userId,
        },
    });
};
exports.permanentDelete = permanentDelete;
/**
 * @deprecated Use softDelete instead
 */
exports.remove = exports.softDelete;
/**
 * Search notes by query and/or tag (excludes deleted notes)
 * @param userId - The user's ID
 * @param query - Search query for title/content
 * @param tag - Optional tag filter
 * @param includeArchived - Whether to include archived notes (default: false)
 * @returns Array of matching notes
 */
const searchNotes = async (userId, query, tag, includeArchived = false) => {
    const where = {
        userId,
        deletedAt: null,
        ...(includeArchived ? {} : { isArchived: false }),
    };
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
