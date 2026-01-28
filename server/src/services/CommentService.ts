import * as CommentRepository from '../repositories/CommentRepository';
import { CommentWithUser, CommentWithReplies } from '../repositories/CommentRepository';

/**
 * Comment Service
 * Business logic for comment operations
 */

/**
 * Create a new comment
 * @param content - Comment content
 * @param noteId - The note ID
 * @param userId - The user ID
 * @param parentId - Optional parent comment ID for replies
 * @returns The created comment
 * @throws Error if user cannot access the note
 */
export const createComment = async (
    content: string,
    noteId: string,
    userId: string,
    parentId?: string | null
): Promise<CommentWithUser> => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        throw new Error('Note not found or access denied');
    }

    // If this is a reply, verify parent comment exists and belongs to the same note
    if (parentId) {
        const parentComment = await CommentRepository.findById(parentId);
        if (!parentComment || parentComment.noteId !== noteId) {
            throw new Error('Parent comment not found');
        }
    }

    // Validate content
    if (!content.trim()) {
        throw new Error('Comment content cannot be empty');
    }

    return CommentRepository.create({
        content: content.trim(),
        noteId,
        userId,
        parentId,
    });
};

/**
 * Get all comments for a note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @returns Array of comments with replies
 * @throws Error if user cannot access the note
 */
export const getCommentsForNote = async (
    noteId: string,
    userId: string
): Promise<CommentWithReplies[]> => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        throw new Error('Note not found or access denied');
    }

    return CommentRepository.findByNoteId(noteId);
};

/**
 * Update a comment
 * @param commentId - The comment ID
 * @param userId - The user ID
 * @param content - New content
 * @returns The updated comment
 * @throws Error if comment not found or user not authorized
 */
export const updateComment = async (
    commentId: string,
    userId: string,
    content: string
): Promise<CommentWithUser> => {
    // Validate content
    if (!content.trim()) {
        throw new Error('Comment content cannot be empty');
    }

    const updated = await CommentRepository.update(commentId, userId, content.trim());

    if (!updated) {
        throw new Error('Comment not found or not authorized to edit');
    }

    return updated;
};

/**
 * Delete a comment
 * @param commentId - The comment ID
 * @param userId - The user ID
 * @throws Error if comment not found or user not authorized
 */
export const deleteComment = async (
    commentId: string,
    userId: string
): Promise<void> => {
    const deleted = await CommentRepository.remove(commentId, userId);

    if (!deleted) {
        throw new Error('Comment not found or not authorized to delete');
    }
};

/**
 * Get comment count for a note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @returns The number of comments
 */
export const getCommentCount = async (
    noteId: string,
    userId: string
): Promise<number> => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        return 0;
    }

    return CommentRepository.countByNoteId(noteId);
};

/**
 * Get recent comments by user
 * @param userId - The user ID
 * @param limit - Maximum number of comments
 * @returns Array of recent comments
 */
export const getRecentUserComments = async (
    userId: string,
    limit: number = 10
): Promise<CommentWithUser[]> => {
    return CommentRepository.findRecentByUserId(userId, limit);
};
