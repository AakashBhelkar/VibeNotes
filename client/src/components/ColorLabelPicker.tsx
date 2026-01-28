import { useState } from 'react';
import { Check, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useColorLabels, useNoteColorLabels } from '@/hooks/useColorLabels';
import { ColorLabel } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ColorLabelPickerProps {
    noteId: string;
    onError?: (error: string) => void;
}

/**
 * Color label picker component for assigning labels to notes
 * Displays as a dropdown with all available labels
 */
export function ColorLabelPicker({ noteId, onError }: ColorLabelPickerProps) {
    const { labels, createLabel, defaultColors } = useColorLabels();
    const { noteLabels, toggleLabel, hasLabel } = useNoteColorLabels(noteId);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

    const handleToggleLabel = async (labelId: string) => {
        try {
            await toggleLabel(labelId);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to toggle label');
        }
    };

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return;

        try {
            const newLabel = await createLabel(newLabelName.trim(), selectedColor);
            await toggleLabel(newLabel.id);
            setNewLabelName('');
            setIsCreating(false);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to create label');
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                >
                    <Tag className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline">Labels</span>
                    {noteLabels.length > 0 && (
                        <span className="ml-1 flex gap-0.5">
                            {noteLabels.slice(0, 3).map((label) => (
                                <span
                                    key={label.id}
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                />
                            ))}
                            {noteLabels.length > 3 && (
                                <span className="text-xs">+{noteLabels.length - 3}</span>
                            )}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-2">
                    <div className="px-2 py-1.5 text-sm font-medium">Labels</div>

                    {/* Existing labels */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {labels.length === 0 && !isCreating && (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                No labels yet. Create one below.
                            </div>
                        )}
                        {labels.map((label) => (
                            <button
                                key={label.id}
                                onClick={() => handleToggleLabel(label.id)}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                                    hasLabel(label.id) && 'bg-accent'
                                )}
                            >
                                <span
                                    className="h-3 w-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: label.color }}
                                />
                                <span className="flex-1 text-left truncate">{label.name}</span>
                                {hasLabel(label.id) && (
                                    <Check className="h-4 w-4 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Create new label */}
                    {isCreating ? (
                        <div className="border-t pt-2 space-y-2">
                            <Input
                                placeholder="Label name"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateLabel();
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                                autoFocus
                                className="h-8"
                            />
                            <div className="flex flex-wrap gap-1">
                                {defaultColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                                            selectedColor === color
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleCreateLabel}
                                    disabled={!newLabelName.trim()}
                                    className="flex-1"
                                >
                                    Create
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
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
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground border-t"
                        >
                            <Plus className="h-4 w-4" />
                            Create new label
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Display component for showing assigned labels inline
 */
export function ColorLabelDisplay({ labels }: { labels: ColorLabel[] }) {
    if (labels.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1">
            {labels.map((label) => (
                <span
                    key={label.id}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                    style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                        border: `1px solid ${label.color}40`,
                    }}
                >
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                </span>
            ))}
        </div>
    );
}

/**
 * Small color dot indicators for compact display
 */
export function ColorLabelDots({ labels, max = 3 }: { labels: ColorLabel[]; max?: number }) {
    if (labels.length === 0) return null;

    const displayed = labels.slice(0, max);
    const remaining = labels.length - max;

    return (
        <div className="flex items-center gap-0.5">
            {displayed.map((label) => (
                <span
                    key={label.id}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                />
            ))}
            {remaining > 0 && (
                <span className="text-xs text-muted-foreground ml-0.5">+{remaining}</span>
            )}
        </div>
    );
}
