"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessNote = exports.findRecentByUserId = exports.countByNoteId = exports.remove = exports.update = exports.findById = exports.findByNoteId = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Create a new comment
 * @param data - Comment creation data
 * @returns The created comment
 */
const create = async (data) => {
    return db_1.default.comment.create({
        data: {
            content: data.content,
            noteId: data.noteId,
            userId: data.userId,
            parentId: data.parentId || null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};
exports.create = create;
/**
 * Find all comments for a note (with replies)
 * @param noteId - The note ID
 * @returns Array of top-level comments with their replies
 */
const findByNoteId = async (noteId) => {
    // Get top-level comments (no parent)
    const comments = await db_1.default.comment.findMany({
        where: {
            noteId,
            parentId: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            replies: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
    return comments;
};
exports.findByNoteId = findByNoteId;
/**
 * Find a comment by ID
 * @param id - The comment ID
 * @returns The comment or null
 */
const findById = async (id) => {
    return db_1.default.comment.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};
exports.findById = findById;
/**
 * Update a comment
 * @param id - The comment ID
 * @param userId - The user ID (for authorization)
 * @param content - New content
 * @returns The updated comment
 */
const update = async (id, userId, content) => {
    // First verify the user owns this comment
    const existing = await db_1.default.comment.findFirst({
        where: { id, userId },
    });
    if (!existing) {
        return null;
    }
    return db_1.default.comment.update({
        where: { id },
        data: { content },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};
exports.update = update;
/**
 * Delete a comment
 * @param id - The comment ID
 * @param userId - The user ID (for authorization)
 * @returns true if deleted, false if not found or not authorized
 */
const remove = async (id, userId) => {
    // First verify the user owns this comment
    const existing = await db_1.default.comment.findFirst({
        where: { id, userId },
    });
    if (!existing) {
        return false;
    }
    await db_1.default.comment.delete({
        where: { id },
    });
    return true;
};
exports.remove = remove;
/**
 * Count comments for a note
 * @param noteId - The note ID
 * @returns The number of comments
 */
const countByNoteId = async (noteId) => {
    return db_1.default.comment.count({
        where: { noteId },
    });
};
exports.countByNoteId = countByNoteId;
/**
 * Get recent comments by user
 * @param userId - The user ID
 * @param limit - Maximum number of comments to return
 * @returns Array of recent comments
 */
const findRecentByUserId = async (userId, limit = 10) => {
    return db_1.default.comment.findMany({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};
exports.findRecentByUserId = findRecentByUserId;
/**
 * Check if user can access note (is note owner)
 * @param noteId - The note ID
 * @param userId - The user ID
 * @returns true if user can access the note
 */
const canAccessNote = async (noteId, userId) => {
    const note = await db_1.default.note.findFirst({
        where: {
            id: noteId,
            userId,
            deletedAt: null,
        },
    });
    return !!note;
};
exports.canAccessNote = canAccessNote;
