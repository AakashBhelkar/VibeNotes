"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldActivities = exports.countByUserId = exports.getRecentActivities = exports.findByNoteId = exports.findByUserId = exports.create = exports.ActivityTypes = void 0;
const db_1 = __importDefault(require("../config/db"));
const client_1 = require("@prisma/client");
/**
 * Activity Repository
 * Handles database operations for activity tracking
 */
// Activity types enum
exports.ActivityTypes = {
    NOTE_CREATED: 'note_created',
    NOTE_UPDATED: 'note_updated',
    NOTE_DELETED: 'note_deleted',
    NOTE_RESTORED: 'note_restored',
    NOTE_ARCHIVED: 'note_archived',
    NOTE_UNARCHIVED: 'note_unarchived',
    NOTE_PINNED: 'note_pinned',
    NOTE_UNPINNED: 'note_unpinned',
    NOTE_MOVED: 'note_moved',
    FOLDER_CREATED: 'folder_created',
    FOLDER_UPDATED: 'folder_updated',
    FOLDER_DELETED: 'folder_deleted',
    LABEL_CREATED: 'label_created',
    LABEL_ASSIGNED: 'label_assigned',
    LABEL_REMOVED: 'label_removed',
};
/**
 * Create a new activity log entry
 * @param data - Activity data
 * @returns The created activity
 */
const create = async (data) => {
    return db_1.default.activity.create({
        data: {
            type: data.type,
            userId: data.userId,
            noteId: data.noteId || null,
            metadata: data.metadata || client_1.Prisma.JsonNull,
        },
    });
};
exports.create = create;
/**
 * Get activities for a user with pagination
 * @param userId - The user's ID
 * @param options - Pagination options
 * @returns Array of activities with details
 */
const findByUserId = async (userId, options = {}) => {
    const { limit = 50, offset = 0, type, noteId } = options;
    return db_1.default.activity.findMany({
        where: {
            userId,
            ...(type && { type }),
            ...(noteId && { noteId }),
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            note: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
};
exports.findByUserId = findByUserId;
/**
 * Get activities for a specific note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @param limit - Maximum number of activities to return
 * @returns Array of activities
 */
const findByNoteId = async (noteId, userId, limit = 20) => {
    return db_1.default.activity.findMany({
        where: {
            noteId,
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            note: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};
exports.findByNoteId = findByNoteId;
/**
 * Get recent activities across all notes
 * @param userId - The user ID
 * @param days - Number of days to look back
 * @returns Array of activities grouped by date
 */
const getRecentActivities = async (userId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return db_1.default.activity.findMany({
        where: {
            userId,
            createdAt: {
                gte: startDate,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            note: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getRecentActivities = getRecentActivities;
/**
 * Count activities for a user
 * @param userId - The user ID
 * @param type - Optional activity type filter
 * @returns Count of activities
 */
const countByUserId = async (userId, type) => {
    return db_1.default.activity.count({
        where: {
            userId,
            ...(type && { type }),
        },
    });
};
exports.countByUserId = countByUserId;
/**
 * Delete old activities (cleanup job)
 * @param userId - The user ID
 * @param olderThanDays - Delete activities older than this many days
 * @returns Number of deleted activities
 */
const deleteOldActivities = async (userId, olderThanDays = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const result = await db_1.default.activity.deleteMany({
        where: {
            userId,
            createdAt: {
                lt: cutoffDate,
            },
        },
    });
    return result.count;
};
exports.deleteOldActivities = deleteOldActivities;
