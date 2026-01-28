import { Response, NextFunction } from 'express';
import * as NoteService from '../services/NoteService';
import { AuthRequest } from '../middleware/auth';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Get all notes for the authenticated user
 * Supports optional search query, tag filtering, and archived filter
 * Query params: q (search), tag (filter), archived (true|all|false)
 */
export const getAllNotes = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { q, tag, archived } = req.query;

        // If archived=true, return only archived notes
        if (archived === 'true') {
            const notes = await NoteService.getArchivedNotes(userId);
            res.json(notes);
            return;
        }

        const notes = await NoteService.searchNotes(
            userId,
            q as string | undefined,
            tag as string | undefined,
            archived === 'all' // Include archived if ?archived=all
        );

        res.json(notes);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific note by ID
 */
export const getNoteById = async (
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

        const note = await NoteService.getNoteById(id, userId);
        res.json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new note
 */
export const createNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const note = await NoteService.createNote(userId, req.body);
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing note
 */
export const updateNote = async (
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

        const note = await NoteService.updateNote(id, userId, req.body);
        res.json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a note (soft delete - move to trash)
 */
export const deleteNote = async (
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

        const result = await NoteService.deleteNote(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all notes in trash
 */
export const getTrash = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const notes = await NoteService.getTrashNotes(userId);
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

/**
 * Restore a note from trash
 */
export const restoreNote = async (
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

        const note = await NoteService.restoreNote(id, userId);
        res.json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Permanently delete a note
 */
export const permanentDelete = async (
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

        const result = await NoteService.permanentDeleteNote(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
