import { Router } from 'express';
import * as CommentController from '../controllers/CommentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Comment Routes
 *
 * POST /api/comments - Create a new comment
 * GET /api/comments/note/:noteId - Get comments for a note
 * GET /api/comments/note/:noteId/count - Get comment count for a note
 * PUT /api/comments/:id - Update a comment
 * DELETE /api/comments/:id - Delete a comment
 */

// Create a new comment
router.post('/', CommentController.createComment);

// Get comments for a note
router.get('/note/:noteId', CommentController.getComments);

// Get comment count for a note
router.get('/note/:noteId/count', CommentController.getCommentCount);

// Update a comment
router.put('/:id', CommentController.updateComment);

// Delete a comment
router.delete('/:id', CommentController.deleteComment);

export default router;
