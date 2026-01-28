import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Download, ExternalLink } from 'lucide-react';
import { AttachmentService, Attachment } from '@/services/attachmentService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

interface AttachmentListProps {
    attachments: Attachment[];
    onDelete: (attachmentId: string) => void;
}

/**
 * Component for displaying and managing note attachments
 */
export function AttachmentList({ attachments, onDelete }: AttachmentListProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

    const handleDeleteClick = (attachmentId: string) => {
        setAttachmentToDelete(attachmentId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (attachmentToDelete) {
            onDelete(attachmentToDelete);
            setAttachmentToDelete(null);
        }
        setDeleteDialogOpen(false);
    };

    const handleDownload = (attachment: Attachment) => {
        window.open(attachment.url, '_blank');
    };

    if (attachments.length === 0) {
        return null;
    }

    return (
        <>
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Attachments ({attachments.length})
                </h3>
                <div className="space-y-2">
                    {attachments.map((attachment) => (
                        <Card key={attachment.id}>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    {AttachmentService.isImage(attachment.fileName) ? (
                                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                                            <img
                                                src={attachment.url}
                                                alt={attachment.fileName}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 flex-shrink-0 rounded bg-muted flex items-center justify-center text-2xl">
                                            {AttachmentService.getFileTypeIcon(attachment.fileName)}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {attachment.fileName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {AttachmentService.formatFileSize(attachment.size)}
                                        </p>
                                    </div>

                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(attachment.url, '_blank')}
                                            title="Open in new tab"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(attachment)}
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(attachment.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Full image preview for images */}
                                {AttachmentService.isImage(attachment.fileName) && (
                                    <div className="mt-3 rounded overflow-hidden">
                                        <img
                                            src={attachment.url}
                                            alt={attachment.fileName}
                                            className="w-full h-auto max-h-96 object-contain bg-muted"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this attachment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
