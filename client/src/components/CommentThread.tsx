import { useState, useEffect } from 'react';
import { MessageSquare, Reply, Pencil, Trash2, X, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useComments, Comment } from '@/hooks/useComments';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

interface CommentThreadProps {
    noteId: string;
    onClose: () => void;
}

interface CommentItemProps {
    comment: Comment;
    replies?: Comment[];
    onReply: (parentId: string) => void;
    onEdit: (comment: Comment) => void;
    onDelete: (commentId: string) => void;
    currentUserId: string;
    level?: number;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

/**
 * Single comment item component
 */
function CommentItem({
    comment,
    replies = [],
    onReply,
    onEdit,
    onDelete,
    currentUserId,
    level = 0,
}: CommentItemProps) {
    const isOwner = comment.userId === currentUserId;
    const displayName = comment.user.displayName || comment.user.email.split('@')[0];

    return (
        <div className={cn('space-y-2', level > 0 && 'ml-6 border-l-2 border-muted pl-4')}>
            <div className="group">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{displayName}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(comment.createdAt)}
                            </span>
                            {comment.updatedAt !== comment.createdAt && (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                            )}
                        </div>

                        {/* Content */}
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => onReply(comment.id)}
                            >
                                <Reply className="h-3 w-3 mr-1" />
                                Reply
                            </Button>

                            {isOwner && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => onEdit(comment)}
                                    >
                                        <Pencil className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-destructive hover:text-destructive"
                                        onClick={() => onDelete(comment.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="space-y-2 mt-2">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Comment thread component
 */
export function CommentThread({ noteId, onClose }: CommentThreadProps) {
    const {
        comments,
        isLoading,
        error,
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
    } = useComments(noteId);

    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editContent, setEditContent] = useState('');
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = authService.getUser();
    const currentUserId = currentUser?.id || '';

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        await createComment(newComment.trim(), replyingTo);
        setNewComment('');
        setReplyingTo(null);
        setIsSubmitting(false);
    };

    const handleEdit = async () => {
        if (!editingComment || !editContent.trim()) return;

        setIsSubmitting(true);
        await updateComment(editingComment.id, editContent.trim());
        setEditingComment(null);
        setEditContent('');
        setIsSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deletingCommentId) return;

        await deleteComment(deletingCommentId);
        setDeletingCommentId(null);
    };

    const startEditing = (comment: Comment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
    };

    const startReplying = (parentId: string) => {
        setReplyingTo(parentId);
        setEditingComment(null);
    };

    const cancelAction = () => {
        setReplyingTo(null);
        setEditingComment(null);
        setEditContent('');
    };

    return (
        <div className="flex flex-col h-full border-l bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="font-semibold">Comments</h3>
                    <span className="text-sm text-muted-foreground">
                        ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close comments panel">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Comments list */}
            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                        Loading comments...
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive py-8">{error}</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No comments yet</p>
                        <p className="text-sm">Be the first to add a comment</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                replies={comment.replies}
                                onReply={startReplying}
                                onEdit={startEditing}
                                onDelete={setDeletingCommentId}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Edit form */}
            {editingComment && (
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Pencil className="h-3 w-3" />
                        Editing comment
                        <Button variant="ghost" size="sm" onClick={cancelAction}>
                            Cancel
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit your comment..."
                            className="flex-1 min-h-[60px] resize-none"
                            autoFocus
                        />
                        <Button
                            onClick={handleEdit}
                            disabled={!editContent.trim() || isSubmitting}
                            size="icon"
                            aria-label="Save comment edit"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Reply indicator */}
            {replyingTo && !editingComment && (
                <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-3 w-3" />
                    Replying to comment
                    <Button variant="ghost" size="sm" onClick={cancelAction}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* New comment form */}
            {!editingComment && (
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
                            className="flex-1 min-h-[60px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    handleSubmit();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || isSubmitting}
                            size="icon"
                            aria-label={replyingTo ? 'Send reply' : 'Send comment'}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press Ctrl+Enter to submit
                    </p>
                </div>
            )}

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                            {comments.find(c => c.id === deletingCommentId)?.replies?.length ? (
                                <span className="block mt-2 font-medium">
                                    All replies to this comment will also be deleted.
                                </span>
                            ) : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
