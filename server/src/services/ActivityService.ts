import * as ActivityRepository from '../repositories/ActivityRepository';
import { ActivityType, ActivityTypes, ActivityWithDetails } from '../repositories/ActivityRepository';
import { Prisma } from '@prisma/client';

/**
 * Activity Service
 * Business logic for activity tracking and feed generation
 */

/**
 * Log a new activity
 */
export const logActivity = async (
    type: ActivityType,
    userId: string,
    noteId?: string | null,
    metadata?: Record<string, unknown>
): Promise<void> => {
    await ActivityRepository.create({
        type,
        userId,
        noteId,
        metadata: metadata as Prisma.JsonValue,
    });
};

/**
 * Log note creation
 */
export const logNoteCreated = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_CREATED, userId, noteId, { title });
};

/**
 * Log note update
 */
export const logNoteUpdated = async (
    userId: string,
    noteId: string,
    title: string,
    changes?: string[]
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_UPDATED, userId, noteId, { title, changes });
};

/**
 * Log note deletion (soft delete)
 */
export const logNoteDeleted = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_DELETED, userId, noteId, { title });
};

/**
 * Log note restoration
 */
export const logNoteRestored = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_RESTORED, userId, noteId, { title });
};

/**
 * Log note archived
 */
export const logNoteArchived = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_ARCHIVED, userId, noteId, { title });
};

/**
 * Log note unarchived
 */
export const logNoteUnarchived = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_UNARCHIVED, userId, noteId, { title });
};

/**
 * Log note pinned
 */
export const logNotePinned = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_PINNED, userId, noteId, { title });
};

/**
 * Log note unpinned
 */
export const logNoteUnpinned = async (
    userId: string,
    noteId: string,
    title: string
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_UNPINNED, userId, noteId, { title });
};

/**
 * Log note moved to folder
 */
export const logNoteMoved = async (
    userId: string,
    noteId: string,
    title: string,
    folderName: string | null
): Promise<void> => {
    await logActivity(ActivityTypes.NOTE_MOVED, userId, noteId, {
        title,
        folder: folderName || 'All Notes'
    });
};

/**
 * Log folder creation
 */
export const logFolderCreated = async (
    userId: string,
    folderName: string
): Promise<void> => {
    await logActivity(ActivityTypes.FOLDER_CREATED, userId, null, { folderName });
};

/**
 * Log folder update
 */
export const logFolderUpdated = async (
    userId: string,
    folderName: string,
    changes?: Record<string, unknown>
): Promise<void> => {
    await logActivity(ActivityTypes.FOLDER_UPDATED, userId, null, { folderName, changes });
};

/**
 * Log folder deletion
 */
export const logFolderDeleted = async (
    userId: string,
    folderName: string
): Promise<void> => {
    await logActivity(ActivityTypes.FOLDER_DELETED, userId, null, { folderName });
};

/**
 * Log color label creation
 */
export const logLabelCreated = async (
    userId: string,
    labelName: string,
    color: string
): Promise<void> => {
    await logActivity(ActivityTypes.LABEL_CREATED, userId, null, { labelName, color });
};

/**
 * Log label assigned to note
 */
export const logLabelAssigned = async (
    userId: string,
    noteId: string,
    noteTitle: string,
    labelName: string
): Promise<void> => {
    await logActivity(ActivityTypes.LABEL_ASSIGNED, userId, noteId, { noteTitle, labelName });
};

/**
 * Log label removed from note
 */
export const logLabelRemoved = async (
    userId: string,
    noteId: string,
    noteTitle: string,
    labelName: string
): Promise<void> => {
    await logActivity(ActivityTypes.LABEL_REMOVED, userId, noteId, { noteTitle, labelName });
};

/**
 * Get user's activity feed
 */
export const getActivityFeed = async (
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        type?: ActivityType;
    } = {}
): Promise<ActivityWithDetails[]> => {
    return ActivityRepository.findByUserId(userId, options);
};

/**
 * Get activities for a specific note
 */
export const getNoteActivities = async (
    noteId: string,
    userId: string,
    limit?: number
): Promise<ActivityWithDetails[]> => {
    return ActivityRepository.findByNoteId(noteId, userId, limit);
};

/**
 * Get recent activities (last N days)
 */
export const getRecentActivities = async (
    userId: string,
    days?: number
): Promise<ActivityWithDetails[]> => {
    return ActivityRepository.getRecentActivities(userId, days);
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (
    userId: string
): Promise<{
    totalActivities: number;
    notesCreated: number;
    notesUpdated: number;
    notesDeleted: number;
}> => {
    const [totalActivities, notesCreated, notesUpdated, notesDeleted] = await Promise.all([
        ActivityRepository.countByUserId(userId),
        ActivityRepository.countByUserId(userId, ActivityTypes.NOTE_CREATED),
        ActivityRepository.countByUserId(userId, ActivityTypes.NOTE_UPDATED),
        ActivityRepository.countByUserId(userId, ActivityTypes.NOTE_DELETED),
    ]);

    return {
        totalActivities,
        notesCreated,
        notesUpdated,
        notesDeleted,
    };
};

/**
 * Clean up old activities
 */
export const cleanupOldActivities = async (
    userId: string,
    olderThanDays?: number
): Promise<number> => {
    return ActivityRepository.deleteOldActivities(userId, olderThanDays);
};

// Helper function to format activity message for display
export const formatActivityMessage = (activity: ActivityWithDetails): string => {
    const metadata = activity.metadata as Record<string, unknown> | null;
    const title = metadata?.title as string || activity.note?.title || 'a note';

    switch (activity.type) {
        case ActivityTypes.NOTE_CREATED:
            return `Created "${title}"`;
        case ActivityTypes.NOTE_UPDATED:
            return `Updated "${title}"`;
        case ActivityTypes.NOTE_DELETED:
            return `Deleted "${title}"`;
        case ActivityTypes.NOTE_RESTORED:
            return `Restored "${title}"`;
        case ActivityTypes.NOTE_ARCHIVED:
            return `Archived "${title}"`;
        case ActivityTypes.NOTE_UNARCHIVED:
            return `Unarchived "${title}"`;
        case ActivityTypes.NOTE_PINNED:
            return `Pinned "${title}"`;
        case ActivityTypes.NOTE_UNPINNED:
            return `Unpinned "${title}"`;
        case ActivityTypes.NOTE_MOVED:
            const folder = metadata?.folder as string || 'All Notes';
            return `Moved "${title}" to ${folder}`;
        case ActivityTypes.FOLDER_CREATED:
            return `Created folder "${metadata?.folderName}"`;
        case ActivityTypes.FOLDER_UPDATED:
            return `Updated folder "${metadata?.folderName}"`;
        case ActivityTypes.FOLDER_DELETED:
            return `Deleted folder "${metadata?.folderName}"`;
        case ActivityTypes.LABEL_CREATED:
            return `Created label "${metadata?.labelName}"`;
        case ActivityTypes.LABEL_ASSIGNED:
            return `Added label "${metadata?.labelName}" to "${metadata?.noteTitle}"`;
        case ActivityTypes.LABEL_REMOVED:
            return `Removed label "${metadata?.labelName}" from "${metadata?.noteTitle}"`;
        default:
            return `Activity: ${activity.type}`;
    }
};
