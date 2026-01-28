import { Response, NextFunction } from 'express';
import * as FolderService from '../services/FolderService';
import { AuthRequest } from '../middleware/auth';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Folder Controller
 * Handles HTTP requests for folder operations
 */

/**
 * Get all folders for the authenticated user
 */
export const getAllFolders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const folders = await FolderService.getAllFolders(userId);
        res.json(folders);
    } catch (error) {
        next(error);
    }
};

/**
 * Get folders as tree structure
 */
export const getFolderTree = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const tree = await FolderService.getFolderTree(userId);
        res.json(tree);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific folder by ID
 */
export const getFolderById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const folder = await FolderService.getFolderById(id, userId);
        res.json(folder);
    } catch (error) {
        next(error);
    }
};

/**
 * Get folder path (breadcrumb)
 */
export const getFolderPath = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const path = await FolderService.getFolderPath(id, userId);
        res.json(path);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new folder
 */
export const createFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const folder = await FolderService.createFolder(userId, req.body);
        res.status(201).json(folder);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a folder
 */
export const updateFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const folder = await FolderService.updateFolder(id, userId, req.body);
        res.json(folder);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const result = await FolderService.deleteFolder(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Move a note to a folder
 */
export const moveNoteToFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId } = req.params;
        const { folderId } = req.body;

        const result = await FolderService.moveNoteToFolder(noteId, folderId ?? null, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get notes in a folder
 */
export const getNotesInFolder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const noteIds = await FolderService.getNotesInFolder(id === 'unfiled' ? null : id, userId);
        res.json(noteIds);
    } catch (error) {
        next(error);
    }
};
