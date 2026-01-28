import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

/**
 * Comment interface
 */
export interface Comment {
    id: string;
    content: string;
    noteId: string;
    userId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
}

/**
 * Comment with replies
 */
export interface CommentWithReplies extends Comment {
    replies: Comment[];
}

/**
 * Hook to manage comments for a note
 */
export function useComments(noteId: string) {
    const [comments, setComments] = useState<CommentWithReplies[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch comments for the note
     */
    const fetchComments = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.get<CommentWithReplies[]>(`/api/comments/note/${noteId}`);
            setComments(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    }, [noteId]);

    /**
     * Create a new comment
     */
    const createComment = useCallback(async (
        content: string,
        parentId?: string | null
    ): Promise<Comment | null> => {
        try {
            setError(null);
            const response = await apiClient.post<Comment>('/api/comments', {
                content,
                noteId,
                parentId,
            });

            // Refresh comments to get the updated tree
            await fetchComments();
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create comment');
            return null;
        }
    }, [noteId, fetchComments]);

    /**
     * Update a comment
     */
    const updateComment = useCallback(async (
        commentId: string,
        content: string
    ): Promise<Comment | null> => {
        try {
            setError(null);
            const response = await apiClient.put<Comment>(`/api/comments/${commentId}`, { content });

            // Refresh comments
            await fetchComments();
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update comment');
            return null;
        }
    }, [fetchComments]);

    /**
     * Delete a comment
     */
    const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.delete(`/api/comments/${commentId}`);

            // Refresh comments
            await fetchComments();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete comment');
            return false;
        }
    }, [fetchComments]);

    /**
     * Get comment count
     */
    const getCommentCount = useCallback(async (): Promise<number> => {
        try {
            const response = await apiClient.get<{ count: number }>(`/api/comments/note/${noteId}/count`);
            return response.data.count;
        } catch {
            return 0;
        }
    }, [noteId]);

    return {
        comments,
        isLoading,
        error,
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
        getCommentCount,
    };
}
