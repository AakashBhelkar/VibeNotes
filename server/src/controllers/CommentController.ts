import { Response, NextFunction } from 'express';
import * as CommentService from '../services/CommentService';
import { AuthRequest } from '../middleware/auth';

/**
 * Comment Controller
 * Handles HTTP requests for comment endpoints
 */

/**
 * Create a new comment
 * POST /api/comments
 */
export const createComment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { content, noteId, parentId } = req.body;

        if (!content || !noteId) {
            res.status(400).json({ error: { message: 'Content and noteId are required' } });
            return;
        }

        const comment = await CommentService.createComment(content, noteId, userId, parentId);
        res.status(201).json(comment);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Get comments for a note
 * GET /api/comments/note/:noteId
 */
export const getComments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { noteId } = req.params;
        const comments = await CommentService.getCommentsForNote(noteId, userId);

        res.json(comments);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Update a comment
 * PUT /api/comments/:id
 */
export const updateComment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ error: { message: 'Content is required' } });
            return;
        }

        const comment = await CommentService.updateComment(id, userId, content);
        res.json(comment);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
export const deleteComment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        await CommentService.deleteComment(id, userId);

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Get comment count for a note
 * GET /api/comments/note/:noteId/count
 */
export const getCommentCount = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { noteId } = req.params;
        const count = await CommentService.getCommentCount(noteId, userId);

        res.json({ count });
    } catch (error) {
        next(error);
    }
};
