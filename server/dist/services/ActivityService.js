"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatActivityMessage = exports.cleanupOldActivities = exports.getActivityStats = exports.getRecentActivities = exports.getNoteActivities = exports.getActivityFeed = exports.logLabelRemoved = exports.logLabelAssigned = exports.logLabelCreated = exports.logFolderDeleted = exports.logFolderUpdated = exports.logFolderCreated = exports.logNoteMoved = exports.logNoteUnpinned = exports.logNotePinned = exports.logNoteUnarchived = exports.logNoteArchived = exports.logNoteRestored = exports.logNoteDeleted = exports.logNoteUpdated = exports.logNoteCreated = exports.logActivity = void 0;
const ActivityRepository = __importStar(require("../repositories/ActivityRepository"));
const ActivityRepository_1 = require("../repositories/ActivityRepository");
/**
 * Activity Service
 * Business logic for activity tracking and feed generation
 */
/**
 * Log a new activity
 */
const logActivity = async (type, userId, noteId, metadata) => {
    await ActivityRepository.create({
        type,
        userId,
        noteId,
        metadata: metadata,
    });
};
exports.logActivity = logActivity;
/**
 * Log note creation
 */
const logNoteCreated = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_CREATED, userId, noteId, { title });
};
exports.logNoteCreated = logNoteCreated;
/**
 * Log note update
 */
const logNoteUpdated = async (userId, noteId, title, changes) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_UPDATED, userId, noteId, { title, changes });
};
exports.logNoteUpdated = logNoteUpdated;
/**
 * Log note deletion (soft delete)
 */
const logNoteDeleted = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_DELETED, userId, noteId, { title });
};
exports.logNoteDeleted = logNoteDeleted;
/**
 * Log note restoration
 */
const logNoteRestored = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_RESTORED, userId, noteId, { title });
};
exports.logNoteRestored = logNoteRestored;
/**
 * Log note archived
 */
const logNoteArchived = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_ARCHIVED, userId, noteId, { title });
};
exports.logNoteArchived = logNoteArchived;
/**
 * Log note unarchived
 */
const logNoteUnarchived = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_UNARCHIVED, userId, noteId, { title });
};
exports.logNoteUnarchived = logNoteUnarchived;
/**
 * Log note pinned
 */
const logNotePinned = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_PINNED, userId, noteId, { title });
};
exports.logNotePinned = logNotePinned;
/**
 * Log note unpinned
 */
const logNoteUnpinned = async (userId, noteId, title) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_UNPINNED, userId, noteId, { title });
};
exports.logNoteUnpinned = logNoteUnpinned;
/**
 * Log note moved to folder
 */
const logNoteMoved = async (userId, noteId, title, folderName) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.NOTE_MOVED, userId, noteId, {
        title,
        folder: folderName || 'All Notes'
    });
};
exports.logNoteMoved = logNoteMoved;
/**
 * Log folder creation
 */
const logFolderCreated = async (userId, folderName) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.FOLDER_CREATED, userId, null, { folderName });
};
exports.logFolderCreated = logFolderCreated;
/**
 * Log folder update
 */
const logFolderUpdated = async (userId, folderName, changes) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.FOLDER_UPDATED, userId, null, { folderName, changes });
};
exports.logFolderUpdated = logFolderUpdated;
/**
 * Log folder deletion
 */
const logFolderDeleted = async (userId, folderName) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.FOLDER_DELETED, userId, null, { folderName });
};
exports.logFolderDeleted = logFolderDeleted;
/**
 * Log color label creation
 */
const logLabelCreated = async (userId, labelName, color) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.LABEL_CREATED, userId, null, { labelName, color });
};
exports.logLabelCreated = logLabelCreated;
/**
 * Log label assigned to note
 */
const logLabelAssigned = async (userId, noteId, noteTitle, labelName) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.LABEL_ASSIGNED, userId, noteId, { noteTitle, labelName });
};
exports.logLabelAssigned = logLabelAssigned;
/**
 * Log label removed from note
 */
const logLabelRemoved = async (userId, noteId, noteTitle, labelName) => {
    await (0, exports.logActivity)(ActivityRepository_1.ActivityTypes.LABEL_REMOVED, userId, noteId, { noteTitle, labelName });
};
exports.logLabelRemoved = logLabelRemoved;
/**
 * Get user's activity feed
 */
const getActivityFeed = async (userId, options = {}) => {
    return ActivityRepository.findByUserId(userId, options);
};
exports.getActivityFeed = getActivityFeed;
/**
 * Get activities for a specific note
 */
const getNoteActivities = async (noteId, userId, limit) => {
    return ActivityRepository.findByNoteId(noteId, userId, limit);
};
exports.getNoteActivities = getNoteActivities;
/**
 * Get recent activities (last N days)
 */
const getRecentActivities = async (userId, days) => {
    return ActivityRepository.getRecentActivities(userId, days);
};
exports.getRecentActivities = getRecentActivities;
/**
 * Get activity statistics
 */
const getActivityStats = async (userId) => {
    const [totalActivities, notesCreated, notesUpdated, notesDeleted] = await Promise.all([
        ActivityRepository.countByUserId(userId),
        ActivityRepository.countByUserId(userId, ActivityRepository_1.ActivityTypes.NOTE_CREATED),
        ActivityRepository.countByUserId(userId, ActivityRepository_1.ActivityTypes.NOTE_UPDATED),
        ActivityRepository.countByUserId(userId, ActivityRepository_1.ActivityTypes.NOTE_DELETED),
    ]);
    return {
        totalActivities,
        notesCreated,
        notesUpdated,
        notesDeleted,
    };
};
exports.getActivityStats = getActivityStats;
/**
 * Clean up old activities
 */
const cleanupOldActivities = async (userId, olderThanDays) => {
    return ActivityRepository.deleteOldActivities(userId, olderThanDays);
};
exports.cleanupOldActivities = cleanupOldActivities;
// Helper function to format activity message for display
const formatActivityMessage = (activity) => {
    const metadata = activity.metadata;
    const title = metadata?.title || activity.note?.title || 'a note';
    switch (activity.type) {
        case ActivityRepository_1.ActivityTypes.NOTE_CREATED:
            return `Created "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_UPDATED:
            return `Updated "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_DELETED:
            return `Deleted "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_RESTORED:
            return `Restored "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_ARCHIVED:
            return `Archived "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_UNARCHIVED:
            return `Unarchived "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_PINNED:
            return `Pinned "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_UNPINNED:
            return `Unpinned "${title}"`;
        case ActivityRepository_1.ActivityTypes.NOTE_MOVED:
            const folder = metadata?.folder || 'All Notes';
            return `Moved "${title}" to ${folder}`;
        case ActivityRepository_1.ActivityTypes.FOLDER_CREATED:
            return `Created folder "${metadata?.folderName}"`;
        case ActivityRepository_1.ActivityTypes.FOLDER_UPDATED:
            return `Updated folder "${metadata?.folderName}"`;
        case ActivityRepository_1.ActivityTypes.FOLDER_DELETED:
            return `Deleted folder "${metadata?.folderName}"`;
        case ActivityRepository_1.ActivityTypes.LABEL_CREATED:
            return `Created label "${metadata?.labelName}"`;
        case ActivityRepository_1.ActivityTypes.LABEL_ASSIGNED:
            return `Added label "${metadata?.labelName}" to "${metadata?.noteTitle}"`;
        case ActivityRepository_1.ActivityTypes.LABEL_REMOVED:
            return `Removed label "${metadata?.labelName}" from "${metadata?.noteTitle}"`;
        default:
            return `Activity: ${activity.type}`;
    }
};
exports.formatActivityMessage = formatActivityMessage;
