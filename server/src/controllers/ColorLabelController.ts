import { Response, NextFunction } from 'express';
import * as ColorLabelService from '../services/ColorLabelService';
import { AuthRequest } from '../middleware/auth';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Color Label Controller
 * Handles HTTP requests for color label operations
 */

/**
 * Get all color labels for the authenticated user
 */
export const getAllLabels = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const labels = await ColorLabelService.getAllLabels(userId);
        res.json(labels);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific color label by ID
 */
export const getLabelById = async (
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

        const label = await ColorLabelService.getLabelById(id, userId);
        res.json(label);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new color label
 */
export const createLabel = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;

        const label = await ColorLabelService.createLabel(userId, req.body);
        res.status(201).json(label);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing color label
 */
export const updateLabel = async (
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

        const label = await ColorLabelService.updateLabel(id, userId, req.body);
        res.json(label);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a color label
 */
export const deleteLabel = async (
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

        const result = await ColorLabelService.deleteLabel(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all labels assigned to a note
 */
export const getNoteLabels = async (
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

        const labels = await ColorLabelService.getNoteLabels(noteId, userId);
        res.json(labels);
    } catch (error) {
        next(error);
    }
};

/**
 * Assign a label to a note
 */
export const assignLabelToNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId, labelId } = req.params;

        const result = await ColorLabelService.assignLabelToNote(noteId, labelId, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Remove a label from a note
 */
export const removeLabelFromNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId, labelId } = req.params;

        const result = await ColorLabelService.removeLabelFromNote(noteId, labelId, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Update all labels for a note (replace existing)
 */
export const updateNoteLabels = async (
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
        const { labelIds } = req.body;

        const result = await ColorLabelService.updateNoteLabels(noteId, labelIds || [], userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
