import { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { useColorLabels } from '@/hooks/useColorLabels';
import { ColorLabel } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ColorLabelManagerProps {
    onError?: (error: string) => void;
}

/**
 * Full color label management component
 * Allows creating, editing, and deleting labels
 */
export function ColorLabelManager({ onError }: ColorLabelManagerProps) {
    const { labels, createLabel, updateLabel, deleteLabel, defaultColors, isLoading } = useColorLabels();
    const [isOpen, setIsOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<ColorLabel | null>(null);
    const [deleteConfirmLabel, setDeleteConfirmLabel] = useState<ColorLabel | null>(null);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState(defaultColors[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return;

        try {
            await createLabel(newLabelName.trim(), newLabelColor);
            setNewLabelName('');
            setNewLabelColor(defaultColors[0]);
            setIsCreating(false);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to create label');
        }
    };

    const handleUpdateLabel = async () => {
        if (!editingLabel || !editingLabel.name.trim()) return;

        try {
            await updateLabel(editingLabel.id, {
                name: editingLabel.name.trim(),
                color: editingLabel.color,
            });
            setEditingLabel(null);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to update label');
        }
    };

    const handleDeleteLabel = async () => {
        if (!deleteConfirmLabel) return;

        try {
            await deleteLabel(deleteConfirmLabel.id);
            setDeleteConfirmLabel(null);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to delete label');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Tag className="h-4 w-4" />
                        Manage Labels
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Color Labels</DialogTitle>
                        <DialogDescription>
                            Create and organize color labels for your notes.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Label list */}
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {isLoading && (
                                <div className="text-center py-4 text-muted-foreground">
                                    Loading labels...
                                </div>
                            )}
                            {!isLoading && labels.length === 0 && !isCreating && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No labels created yet.</p>
                                    <p className="text-sm">Create your first label below.</p>
                                </div>
                            )}
                            {labels.map((label) => (
                                <div
                                    key={label.id}
                                    className="flex items-center gap-2 p-2 rounded-md border"
                                >
                                    {editingLabel?.id === label.id ? (
                                        // Editing mode
                                        <>
                                            <div className="flex flex-wrap gap-1">
                                                {defaultColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            setEditingLabel({ ...editingLabel, color })
                                                        }
                                                        className={cn(
                                                            'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                                                            editingLabel.color === color
                                                                ? 'border-foreground scale-110'
                                                                : 'border-transparent'
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <Input
                                                value={editingLabel.name}
                                                onChange={(e) =>
                                                    setEditingLabel({
                                                        ...editingLabel,
                                                        name: e.target.value,
                                                    })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateLabel();
                                                    if (e.key === 'Escape') setEditingLabel(null);
                                                }}
                                                className="flex-1 h-8"
                                                autoFocus
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={handleUpdateLabel}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => setEditingLabel(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        // Display mode
                                        <>
                                            <span
                                                className="h-4 w-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <span className="flex-1 truncate">{label.name}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => setEditingLabel({ ...label })}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteConfirmLabel(label)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Create new label */}
                        {isCreating ? (
                            <div className="border-t pt-4 space-y-3">
                                <Input
                                    placeholder="Label name"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateLabel();
                                        if (e.key === 'Escape') {
                                            setIsCreating(false);
                                            setNewLabelName('');
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {defaultColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewLabelColor(color)}
                                            className={cn(
                                                'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                                                newLabelColor === color
                                                    ? 'border-foreground scale-110'
                                                    : 'border-transparent'
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCreateLabel}
                                        disabled={!newLabelName.trim()}
                                        className="flex-1"
                                    >
                                        Create Label
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewLabelName('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => setIsCreating(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Create New Label
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog
                open={!!deleteConfirmLabel}
                onOpenChange={(open) => !open && setDeleteConfirmLabel(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Label</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the label "
                            {deleteConfirmLabel?.name}"? This will remove the label from all
                            notes. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteLabel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
