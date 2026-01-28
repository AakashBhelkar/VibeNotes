import { useMemo } from 'react';
import { Note, ColorLabel } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Pin, Archive, ArchiveRestore, CheckSquare } from 'lucide-react';
import { ColorLabelDots } from './ColorLabelPicker';
import { parseChecklistProgress, hasChecklist } from '@/utils/checklistParser';

interface NoteListItemProps {
    note: Note;
    onSelect: (note: Note) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string, isPinned: boolean) => void;
    onToggleArchive: (id: string, isArchived: boolean) => void;
    isSelected: boolean;
    colorLabels?: ColorLabel[];
}

/**
 * Individual note list item component
 * Displays note preview with pin, archive, and delete actions
 * @param note - The note to display
 * @param onSelect - Callback when note is selected
 * @param onDelete - Callback to delete note
 * @param onTogglePin - Callback to toggle pin status
 * @param onToggleArchive - Callback to toggle archive status
 * @param isSelected - Whether this note is currently selected
 */
export function NoteListItem({ note, onSelect, onDelete, onTogglePin, onToggleArchive, isSelected, colorLabels = [] }: NoteListItemProps) {
    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Calculate checklist progress
    const checklistProgress = useMemo(() => {
        if (!note.content || !hasChecklist(note.content)) {
            return null;
        }
        return parseChecklistProgress(note.content);
    }, [note.content]);

    const handleDelete = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onDelete(note.id);
    };

    const handleTogglePin = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onTogglePin(note.id, !note.isPinned);
    };

    const handleToggleArchive = (e: React.MouseEvent): void => {
        e.stopPropagation();
        onToggleArchive(note.id, !note.isArchived);
    };

    return (
        <Card
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${isSelected ? 'border-primary' : ''
                }`}
            onClick={() => onSelect(note)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{note.title || 'Untitled'}</CardTitle>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleTogglePin}
                            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                            <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleToggleArchive}
                            aria-label={note.isArchived ? 'Unarchive note' : 'Archive note'}
                        >
                            {note.isArchived ? (
                                <ArchiveRestore className="h-4 w-4" />
                            ) : (
                                <Archive className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={handleDelete}
                            aria-label="Delete note"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {note.content || 'No content'}
                </p>
                {/* Checklist progress bar */}
                {checklistProgress && checklistProgress.total > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <Progress
                            value={checklistProgress.percentage}
                            className="h-1.5 flex-1"
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {checklistProgress.checked}/{checklistProgress.total}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span>{formatDate(note.updatedAt)}</span>
                        {colorLabels.length > 0 && (
                            <ColorLabelDots labels={colorLabels} max={4} />
                        )}
                    </div>
                    {note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end">
                            {note.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5">
                                    {tag}
                                </Badge>
                            ))}
                            {note.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">+{note.tags.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
