import prisma from '../config/db';
import { Activity, Prisma } from '@prisma/client';

/**
 * Activity Repository
 * Handles database operations for activity tracking
 */

// Activity types enum
export const ActivityTypes = {
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
} as const;

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];

// Activity with user and note info
export interface ActivityWithDetails extends Activity {
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
    note: {
        id: string;
        title: string;
    } | null;
}

/**
 * Create a new activity log entry
 * @param data - Activity data
 * @returns The created activity
 */
export const create = async (data: {
    type: ActivityType;
    userId: string;
    noteId?: string | null;
    metadata?: Prisma.JsonValue;
}): Promise<Activity> => {
    return prisma.activity.create({
        data: {
            type: data.type,
            userId: data.userId,
            noteId: data.noteId || null,
            metadata: data.metadata || Prisma.JsonNull,
        },
    });
};

/**
 * Get activities for a user with pagination
 * @param userId - The user's ID
 * @param options - Pagination options
 * @returns Array of activities with details
 */
export const findByUserId = async (
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        type?: ActivityType;
        noteId?: string;
    } = {}
): Promise<ActivityWithDetails[]> => {
    const { limit = 50, offset = 0, type, noteId } = options;

    return prisma.activity.findMany({
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

/**
 * Get activities for a specific note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @param limit - Maximum number of activities to return
 * @returns Array of activities
 */
export const findByNoteId = async (
    noteId: string,
    userId: string,
    limit: number = 20
): Promise<ActivityWithDetails[]> => {
    return prisma.activity.findMany({
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

/**
 * Get recent activities across all notes
 * @param userId - The user ID
 * @param days - Number of days to look back
 * @returns Array of activities grouped by date
 */
export const getRecentActivities = async (
    userId: string,
    days: number = 7
): Promise<ActivityWithDetails[]> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.activity.findMany({
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

/**
 * Count activities for a user
 * @param userId - The user ID
 * @param type - Optional activity type filter
 * @returns Count of activities
 */
export const countByUserId = async (
    userId: string,
    type?: ActivityType
): Promise<number> => {
    return prisma.activity.count({
        where: {
            userId,
            ...(type && { type }),
        },
    });
};

/**
 * Delete old activities (cleanup job)
 * @param userId - The user ID
 * @param olderThanDays - Delete activities older than this many days
 * @returns Number of deleted activities
 */
export const deleteOldActivities = async (
    userId: string,
    olderThanDays: number = 90
): Promise<number> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.activity.deleteMany({
        where: {
            userId,
            createdAt: {
                lt: cutoffDate,
            },
        },
    });

    return result.count;
};
