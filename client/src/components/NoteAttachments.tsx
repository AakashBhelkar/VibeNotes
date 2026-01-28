import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Paperclip, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { AttachmentUploader } from './AttachmentUploader';
import { AttachmentList } from './AttachmentList';
import { Attachment, AttachmentService } from '@/services/attachmentService';

interface NoteAttachmentsProps {
    noteId: string;
    onError: (message: string) => void;
}

/**
 * Component for managing note attachments
 */
export function NoteAttachments({ noteId, onError }: NoteAttachmentsProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showUploader, setShowUploader] = useState(false);
    const [showAttachments, setShowAttachments] = useState(true);

    useEffect(() => {
        loadAttachments();
    }, [noteId]);

    const loadAttachments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vibenote-token');
            if (!token) return;

            const data = await AttachmentService.getAttachmentsByNoteId(noteId, token);
            setAttachments(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load attachments';
            onError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = (attachment: Attachment) => {
        setAttachments(prev => [...prev, attachment]);
        setShowUploader(false);
        onError(''); // Clear any errors
    };

    const handleDelete = async (attachmentId: string) => {
        try {
            const token = localStorage.getItem('vibenote-token');
            if (!token) return;

            await AttachmentService.deleteAttachment(attachmentId, token);
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete attachment';
            onError(message);
        }
    };

    return (
        <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="gap-2 px-2 -ml-2"
                >
                    <Paperclip className="h-4 w-4" />
                    <span className="font-medium">Attachments ({attachments.length})</span>
                    {showAttachments ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
                {showAttachments && (
                    <Button
                        variant={showUploader ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setShowUploader(!showUploader)}
                        title={showUploader ? "Cancel upload" : "Add attachment"}
                    >
                        {showUploader ? (
                            <>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </>
                        )}
                    </Button>
                )}
            </div>

            {showAttachments && (
                <div className="space-y-3">
                    {showUploader && (
                        <AttachmentUploader
                            noteId={noteId}
                            onUploadComplete={handleUploadComplete}
                            onError={onError}
                        />
                    )}

                    {loading ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Loading attachments...
                        </p>
                    ) : (
                        <AttachmentList
                            attachments={attachments}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
