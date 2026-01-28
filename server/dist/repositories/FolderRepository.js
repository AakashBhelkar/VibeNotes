"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wouldCreateCircularReference = exports.getFolderPath = exports.getNotesInFolder = exports.moveNoteToFolder = exports.remove = exports.update = exports.create = exports.findById = exports.findChildren = exports.findRootFolders = exports.findByUserId = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Find all folders for a user
 * @param userId - The user's ID
 * @returns Array of folders with children and notes count
 */
const findByUserId = async (userId) => {
    return db_1.default.folder.findMany({
        where: { userId },
        include: {
            _count: {
                select: {
                    children: true,
                    notes: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });
};
exports.findByUserId = findByUserId;
/**
 * Find root folders (no parent) for a user
 * @param userId - The user's ID
 * @returns Array of root folders
 */
const findRootFolders = async (userId) => {
    return db_1.default.folder.findMany({
        where: {
            userId,
            parentId: null,
        },
        include: {
            _count: {
                select: {
                    children: true,
                    notes: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });
};
exports.findRootFolders = findRootFolders;
/**
 * Find children of a folder
 * @param parentId - The parent folder ID
 * @param userId - The user's ID (for verification)
 * @returns Array of child folders
 */
const findChildren = async (parentId, userId) => {
    return db_1.default.folder.findMany({
        where: {
            parentId,
            userId,
        },
        include: {
            _count: {
                select: {
                    children: true,
                    notes: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });
};
exports.findChildren = findChildren;
/**
 * Find a folder by ID with ownership verification
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The folder if found and owned, null otherwise
 */
const findById = async (id, userId) => {
    return db_1.default.folder.findFirst({
        where: { id, userId },
    });
};
exports.findById = findById;
/**
 * Create a new folder
 * @param data - Folder creation data
 * @returns The created folder
 */
const create = async (data) => {
    return db_1.default.folder.create({
        data: {
            userId: data.userId,
            name: data.name,
            parentId: data.parentId || null,
        },
    });
};
exports.create = create;
/**
 * Update a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated folder
 */
const update = async (id, userId, data) => {
    return db_1.default.folder.update({
        where: { id, userId },
        data,
    });
};
exports.update = update;
/**
 * Delete a folder (cascades to children)
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The deleted folder
 */
const remove = async (id, userId) => {
    return db_1.default.folder.delete({
        where: { id, userId },
    });
};
exports.remove = remove;
/**
 * Move a note to a folder
 * @param noteId - The note ID
 * @param folderId - The target folder ID (null to remove from folder)
 * @param userId - The user's ID
 */
const moveNoteToFolder = async (noteId, folderId, userId) => {
    await db_1.default.note.update({
        where: { id: noteId, userId },
        data: { folderId },
    });
};
exports.moveNoteToFolder = moveNoteToFolder;
/**
 * Get notes in a folder
 * @param folderId - The folder ID (null for unfiled notes)
 * @param userId - The user's ID
 * @returns Array of note IDs
 */
const getNotesInFolder = async (folderId, userId) => {
    const notes = await db_1.default.note.findMany({
        where: {
            userId,
            folderId,
            deletedAt: null,
        },
        select: { id: true },
    });
    return notes.map((n) => n.id);
};
exports.getNotesInFolder = getNotesInFolder;
/**
 * Get folder path (ancestors) for breadcrumb display
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Array of folders from root to current
 */
const getFolderPath = async (id, userId) => {
    const path = [];
    let currentId = id;
    while (currentId) {
        const folder = await db_1.default.folder.findFirst({
            where: { id: currentId, userId },
        });
        if (!folder)
            break;
        path.unshift(folder);
        currentId = folder.parentId;
    }
    return path;
};
exports.getFolderPath = getFolderPath;
/**
 * Check if moving a folder would create a circular reference
 * @param folderId - The folder to move
 * @param newParentId - The proposed new parent
 * @param userId - The user's ID
 * @returns true if the move would create a circular reference
 */
const wouldCreateCircularReference = async (folderId, newParentId, userId) => {
    let currentId = newParentId;
    while (currentId) {
        if (currentId === folderId) {
            return true;
        }
        const folder = await db_1.default.folder.findFirst({
            where: { id: currentId, userId },
            select: { parentId: true },
        });
        if (!folder)
            break;
        currentId = folder.parentId;
    }
    return false;
};
exports.wouldCreateCircularReference = wouldCreateCircularReference;
