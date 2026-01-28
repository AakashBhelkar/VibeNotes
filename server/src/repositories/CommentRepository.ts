import prisma from '../config/db';
import { Comment } from '@prisma/client';

/**
 * Comment Repository
 * Handles database operations for comments
 */

// Comment with user info
export interface CommentWithUser extends Comment {
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
}

// Comment with replies (for threaded view)
export interface CommentWithReplies extends CommentWithUser {
    replies: CommentWithUser[];
}

/**
 * Create a new comment
 * @param data - Comment creation data
 * @returns The created comment
 */
export const create = async (data: {
    content: string;
    noteId: string;
    userId: string;
    parentId?: string | null;
}): Promise<CommentWithUser> => {
    return prisma.comment.create({
        data: {
            content: data.content,
            noteId: data.noteId,
            userId: data.userId,
            parentId: data.parentId || null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};

/**
 * Find all comments for a note (with replies)
 * @param noteId - The note ID
 * @returns Array of top-level comments with their replies
 */
export const findByNoteId = async (noteId: string): Promise<CommentWithReplies[]> => {
    // Get top-level comments (no parent)
    const comments = await prisma.comment.findMany({
        where: {
            noteId,
            parentId: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            replies: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return comments as CommentWithReplies[];
};

/**
 * Find a comment by ID
 * @param id - The comment ID
 * @returns The comment or null
 */
export const findById = async (id: string): Promise<CommentWithUser | null> => {
    return prisma.comment.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};

/**
 * Update a comment
 * @param id - The comment ID
 * @param userId - The user ID (for authorization)
 * @param content - New content
 * @returns The updated comment
 */
export const update = async (
    id: string,
    userId: string,
    content: string
): Promise<CommentWithUser | null> => {
    // First verify the user owns this comment
    const existing = await prisma.comment.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return null;
    }

    return prisma.comment.update({
        where: { id },
        data: { content },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
    });
};

/**
 * Delete a comment
 * @param id - The comment ID
 * @param userId - The user ID (for authorization)
 * @returns true if deleted, false if not found or not authorized
 */
export const remove = async (id: string, userId: string): Promise<boolean> => {
    // First verify the user owns this comment
    const existing = await prisma.comment.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return false;
    }

    await prisma.comment.delete({
        where: { id },
    });

    return true;
};

/**
 * Count comments for a note
 * @param noteId - The note ID
 * @returns The number of comments
 */
export const countByNoteId = async (noteId: string): Promise<number> => {
    return prisma.comment.count({
        where: { noteId },
    });
};

/**
 * Get recent comments by user
 * @param userId - The user ID
 * @param limit - Maximum number of comments to return
 * @returns Array of recent comments
 */
export const findRecentByUserId = async (
    userId: string,
    limit: number = 10
): Promise<CommentWithUser[]> => {
    return prisma.comment.findMany({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};

/**
 * Check if user can access note (is note owner)
 * @param noteId - The note ID
 * @param userId - The user ID
 * @returns true if user can access the note
 */
export const canAccessNote = async (noteId: string, userId: string): Promise<boolean> => {
    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId,
            deletedAt: null,
        },
    });

    return !!note;
};
