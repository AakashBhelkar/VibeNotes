import prisma from '../config/db';
import { Folder } from '@prisma/client';

/**
 * Folder Repository
 * Handles database operations for folder hierarchies
 */

// Type for folder with children count
export interface FolderWithCounts extends Folder {
    _count?: {
        children: number;
        notes: number;
    };
}

/**
 * Find all folders for a user
 * @param userId - The user's ID
 * @returns Array of folders with children and notes count
 */
export const findByUserId = async (userId: string): Promise<FolderWithCounts[]> => {
    return prisma.folder.findMany({
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

/**
 * Find root folders (no parent) for a user
 * @param userId - The user's ID
 * @returns Array of root folders
 */
export const findRootFolders = async (userId: string): Promise<FolderWithCounts[]> => {
    return prisma.folder.findMany({
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

/**
 * Find children of a folder
 * @param parentId - The parent folder ID
 * @param userId - The user's ID (for verification)
 * @returns Array of child folders
 */
export const findChildren = async (parentId: string, userId: string): Promise<FolderWithCounts[]> => {
    return prisma.folder.findMany({
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

/**
 * Find a folder by ID with ownership verification
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The folder if found and owned, null otherwise
 */
export const findById = async (id: string, userId: string): Promise<Folder | null> => {
    return prisma.folder.findFirst({
        where: { id, userId },
    });
};

/**
 * Create a new folder
 * @param data - Folder creation data
 * @returns The created folder
 */
export const create = async (data: {
    userId: string;
    name: string;
    parentId?: string | null;
}): Promise<Folder> => {
    return prisma.folder.create({
        data: {
            userId: data.userId,
            name: data.name,
            parentId: data.parentId || null,
        },
    });
};

/**
 * Update a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated folder
 */
export const update = async (
    id: string,
    userId: string,
    data: {
        name?: string;
        parentId?: string | null;
    }
): Promise<Folder> => {
    return prisma.folder.update({
        where: { id, userId },
        data,
    });
};

/**
 * Delete a folder (cascades to children)
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The deleted folder
 */
export const remove = async (id: string, userId: string): Promise<Folder> => {
    return prisma.folder.delete({
        where: { id, userId },
    });
};

/**
 * Move a note to a folder
 * @param noteId - The note ID
 * @param folderId - The target folder ID (null to remove from folder)
 * @param userId - The user's ID
 */
export const moveNoteToFolder = async (
    noteId: string,
    folderId: string | null,
    userId: string
): Promise<void> => {
    await prisma.note.update({
        where: { id: noteId, userId },
        data: { folderId },
    });
};

/**
 * Get notes in a folder
 * @param folderId - The folder ID (null for unfiled notes)
 * @param userId - The user's ID
 * @returns Array of note IDs
 */
export const getNotesInFolder = async (
    folderId: string | null,
    userId: string
): Promise<string[]> => {
    const notes = await prisma.note.findMany({
        where: {
            userId,
            folderId,
            deletedAt: null,
        },
        select: { id: true },
    });
    return notes.map((n) => n.id);
};

/**
 * Get folder path (ancestors) for breadcrumb display
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Array of folders from root to current
 */
export const getFolderPath = async (id: string, userId: string): Promise<Folder[]> => {
    const path: Folder[] = [];
    let currentId: string | null = id;

    while (currentId) {
        const folder: Folder | null = await prisma.folder.findFirst({
            where: { id: currentId, userId },
        });

        if (!folder) break;

        path.unshift(folder);
        currentId = folder.parentId;
    }

    return path;
};

/**
 * Check if moving a folder would create a circular reference
 * @param folderId - The folder to move
 * @param newParentId - The proposed new parent
 * @param userId - The user's ID
 * @returns true if the move would create a circular reference
 */
export const wouldCreateCircularReference = async (
    folderId: string,
    newParentId: string,
    userId: string
): Promise<boolean> => {
    let currentId: string | null = newParentId;

    while (currentId) {
        if (currentId === folderId) {
            return true;
        }

        const folder: { parentId: string | null } | null = await prisma.folder.findFirst({
            where: { id: currentId, userId },
            select: { parentId: true },
        });

        if (!folder) break;
        currentId = folder.parentId;
    }

    return false;
};
