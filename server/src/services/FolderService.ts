import * as FolderRepository from '../repositories/FolderRepository';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { Folder } from '@prisma/client';

/**
 * Folder Service
 * Business logic for folder hierarchies
 */

export interface FolderTree extends Folder {
    children: FolderTree[];
    noteCount: number;
}

/**
 * Get all folders for a user
 * @param userId - The user's ID
 * @returns Array of folders with counts
 */
export const getAllFolders = async (userId: string): Promise<FolderRepository.FolderWithCounts[]> => {
    return FolderRepository.findByUserId(userId);
};

/**
 * Get folders as a tree structure
 * @param userId - The user's ID
 * @returns Array of root folders with nested children
 */
export const getFolderTree = async (userId: string): Promise<FolderTree[]> => {
    const folders = await FolderRepository.findByUserId(userId);

    // Build a map for quick lookup
    const folderMap = new Map<string, FolderTree>();
    folders.forEach((f) => {
        folderMap.set(f.id, {
            ...f,
            children: [],
            noteCount: f._count?.notes || 0,
        });
    });

    // Build the tree
    const rootFolders: FolderTree[] = [];
    folders.forEach((f) => {
        const folder = folderMap.get(f.id)!;
        if (f.parentId && folderMap.has(f.parentId)) {
            folderMap.get(f.parentId)!.children.push(folder);
        } else {
            rootFolders.push(folder);
        }
    });

    // Sort children at each level
    const sortChildren = (nodes: FolderTree[]): void => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(rootFolders);

    return rootFolders;
};

/**
 * Get a specific folder by ID
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The folder
 * @throws NotFoundError if folder doesn't exist
 */
export const getFolderById = async (id: string, userId: string): Promise<Folder> => {
    const folder = await FolderRepository.findById(id, userId);

    if (!folder) {
        throw new NotFoundError(`Folder with ID ${id} not found`);
    }

    return folder;
};

/**
 * Get folder path for breadcrumb
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Array of folders from root to current
 */
export const getFolderPath = async (id: string, userId: string): Promise<Folder[]> => {
    return FolderRepository.getFolderPath(id, userId);
};

/**
 * Create a new folder
 * @param userId - The user's ID
 * @param input - Folder creation data
 * @returns The created folder
 */
export const createFolder = async (
    userId: string,
    input: { name: string; parentId?: string | null }
): Promise<Folder> => {
    // Validate name
    if (!input.name.trim()) {
        throw new BadRequestError('Folder name cannot be empty');
    }

    // Verify parent exists if provided
    if (input.parentId) {
        const parent = await FolderRepository.findById(input.parentId, userId);
        if (!parent) {
            throw new NotFoundError('Parent folder not found');
        }
    }

    return FolderRepository.create({
        userId,
        name: input.name.trim(),
        parentId: input.parentId || null,
    });
};

/**
 * Update a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated folder
 */
export const updateFolder = async (
    id: string,
    userId: string,
    input: { name?: string; parentId?: string | null }
): Promise<Folder> => {
    // Verify folder exists
    const existing = await FolderRepository.findById(id, userId);
    if (!existing) {
        throw new NotFoundError(`Folder with ID ${id} not found`);
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
        throw new BadRequestError('Folder name cannot be empty');
    }

    // Check for circular reference if changing parent
    if (input.parentId !== undefined && input.parentId !== existing.parentId) {
        if (input.parentId) {
            // Verify new parent exists
            const newParent = await FolderRepository.findById(input.parentId, userId);
            if (!newParent) {
                throw new NotFoundError('Parent folder not found');
            }

            // Check for circular reference
            const wouldBeCircular = await FolderRepository.wouldCreateCircularReference(
                id,
                input.parentId,
                userId
            );
            if (wouldBeCircular) {
                throw new BadRequestError('Cannot move folder to its own descendant');
            }
        }
    }

    const updateData: { name?: string; parentId?: string | null } = {};
    if (input.name) updateData.name = input.name.trim();
    if (input.parentId !== undefined) updateData.parentId = input.parentId;

    return FolderRepository.update(id, userId, updateData);
};

/**
 * Delete a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Success message
 */
export const deleteFolder = async (
    id: string,
    userId: string
): Promise<{ message: string }> => {
    const existing = await FolderRepository.findById(id, userId);
    if (!existing) {
        throw new NotFoundError(`Folder with ID ${id} not found`);
    }

    await FolderRepository.remove(id, userId);
    return { message: 'Folder deleted successfully' };
};

/**
 * Move a note to a folder
 * @param noteId - The note ID
 * @param folderId - The target folder ID (null to unfiled)
 * @param userId - The user's ID
 * @returns Success message
 */
export const moveNoteToFolder = async (
    noteId: string,
    folderId: string | null,
    userId: string
): Promise<{ message: string }> => {
    // Verify folder exists if provided
    if (folderId) {
        const folder = await FolderRepository.findById(folderId, userId);
        if (!folder) {
            throw new NotFoundError('Folder not found');
        }
    }

    await FolderRepository.moveNoteToFolder(noteId, folderId, userId);
    return { message: 'Note moved successfully' };
};

/**
 * Get notes in a folder
 * @param folderId - The folder ID (null for unfiled)
 * @param userId - The user's ID
 * @returns Array of note IDs
 */
export const getNotesInFolder = async (
    folderId: string | null,
    userId: string
): Promise<string[]> => {
    if (folderId) {
        // Verify folder exists
        const folder = await FolderRepository.findById(folderId, userId);
        if (!folder) {
            throw new NotFoundError('Folder not found');
        }
    }

    return FolderRepository.getNotesInFolder(folderId, userId);
};
