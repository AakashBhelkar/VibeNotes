import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, X, Filter, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useColorLabels } from '@/hooks/useColorLabels';
import { Note, ColorLabel } from '@/lib/db';
import { cn } from '@/lib/utils';

export interface SearchFilters {
    query: string;
    tags: string[];
    colorLabelIds: string[];
    dateFrom: Date | null;
    dateTo: Date | null;
    sortBy: 'updated' | 'created' | 'title';
    sortOrder: 'asc' | 'desc';
}

interface SavedSearch {
    id: string;
    name: string;
    filters: SearchFilters;
}

const SAVED_SEARCHES_KEY = 'vibenotes-saved-searches';

const defaultFilters: SearchFilters = {
    query: '',
    tags: [],
    colorLabelIds: [],
    dateFrom: null,
    dateTo: null,
    sortBy: 'updated',
    sortOrder: 'desc',
};

interface AdvancedSearchPanelProps {
    notes: Note[];
    allTags: string[];
    onFiltersChange: (filters: SearchFilters) => void;
    onClose?: () => void;
}

/**
 * Advanced search panel with multiple filter options
 * Supports date ranges, tags, color labels, and saved searches
 */
export function AdvancedSearchPanel({
    allTags,
    onFiltersChange,
    onClose,
}: AdvancedSearchPanelProps) {
    const { labels } = useColorLabels();
    const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');

    // Load saved searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const searches = parsed.map((s: SavedSearch) => ({
                    ...s,
                    filters: {
                        ...s.filters,
                        dateFrom: s.filters.dateFrom ? new Date(s.filters.dateFrom) : null,
                        dateTo: s.filters.dateTo ? new Date(s.filters.dateTo) : null,
                    },
                }));
                setSavedSearches(searches);
            } catch {
                setSavedSearches([]);
            }
        }
    }, []);

    // Notify parent of filter changes
    useEffect(() => {
        onFiltersChange(filters);
    }, [filters, onFiltersChange]);

    const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
    }, []);

    const toggleTag = useCallback((tag: string) => {
        setFilters((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...prev.tags, tag],
        }));
    }, []);

    const toggleLabel = useCallback((labelId: string) => {
        setFilters((prev) => ({
            ...prev,
            colorLabelIds: prev.colorLabelIds.includes(labelId)
                ? prev.colorLabelIds.filter((id) => id !== labelId)
                : [...prev.colorLabelIds, labelId],
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    const hasActiveFilters =
        filters.query ||
        filters.tags.length > 0 ||
        filters.colorLabelIds.length > 0 ||
        filters.dateFrom ||
        filters.dateTo;

    const saveSearch = useCallback(() => {
        if (!saveSearchName.trim()) return;

        const newSearch: SavedSearch = {
            id: crypto.randomUUID(),
            name: saveSearchName.trim(),
            filters: { ...filters },
        };

        const updated = [...savedSearches, newSearch];
        setSavedSearches(updated);
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
        setSaveSearchName('');
        setShowSaveDialog(false);
    }, [saveSearchName, filters, savedSearches]);

    const loadSearch = useCallback((search: SavedSearch) => {
        setFilters(search.filters);
    }, []);

    const deleteSearch = useCallback((id: string) => {
        const updated = savedSearches.filter((s) => s.id !== id);
        setSavedSearches(updated);
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
    }, [savedSearches]);

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Advanced Search</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear All
                        </Button>
                    )}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Search query */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search in titles and content..."
                    value={filters.query}
                    onChange={(e) => updateFilters({ query: e.target.value })}
                    className="pl-10"
                />
            </div>

            {/* Date range */}
            <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Date Range</span>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'flex-1 justify-start text-left font-normal',
                                    !filters.dateFrom && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateFrom ? format(filters.dateFrom, 'PP') : 'From'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={filters.dateFrom || undefined}
                                onSelect={(date) => updateFilters({ dateFrom: date || null })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'flex-1 justify-start text-left font-normal',
                                    !filters.dateTo && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateTo ? format(filters.dateTo, 'PP') : 'To'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={filters.dateTo || undefined}
                                onSelect={(date) => updateFilters({ dateTo: date || null })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
                <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                        {allTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Color labels filter */}
            {labels.length > 0 && (
                <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Color Labels</span>
                    <div className="flex flex-wrap gap-1.5">
                        {labels.map((label: ColorLabel) => (
                            <button
                                key={label.id}
                                onClick={() => toggleLabel(label.id)}
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs transition-all',
                                    filters.colorLabelIds.includes(label.id)
                                        ? 'ring-2 ring-offset-2 ring-offset-background'
                                        : 'opacity-60 hover:opacity-100'
                                )}
                                style={{
                                    backgroundColor: `${label.color}20`,
                                    color: label.color,
                                    borderColor: label.color,
                                    ...(filters.colorLabelIds.includes(label.id) && {
                                        ringColor: label.color,
                                    }),
                                }}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                />
                                {label.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sort options */}
            <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Sort By</span>
                <div className="flex gap-2">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                        className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="updated">Last Updated</option>
                        <option value="created">Created</option>
                        <option value="title">Title</option>
                    </select>
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => updateFilters({ sortOrder: e.target.value as SearchFilters['sortOrder'] })}
                        className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                    </select>
                </div>
            </div>

            {/* Save search button */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowSaveDialog(true)}
                >
                    <Save className="h-4 w-4" />
                    Save This Search
                </Button>
            )}

            {/* Saved searches */}
            {savedSearches.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                    <span className="text-sm text-muted-foreground">Saved Searches</span>
                    <div className="space-y-1">
                        {savedSearches.map((search) => (
                            <div
                                key={search.id}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                            >
                                <button
                                    onClick={() => loadSearch(search)}
                                    className="flex-1 text-left text-sm"
                                >
                                    {search.name}
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => deleteSearch(search.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save search dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Search</DialogTitle>
                        <DialogDescription>
                            Give your search a name to easily find it later.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Search name..."
                        value={saveSearchName}
                        onChange={(e) => setSaveSearchName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveSearch()}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveSearch} disabled={!saveSearchName.trim()}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * Apply search filters to notes array
 */
export function applySearchFilters(
    notes: Note[],
    filters: SearchFilters,
    noteLabelsMap: Record<string, string[]>
): Note[] {
    let result = [...notes];

    // Text search
    if (filters.query) {
        const query = filters.query.toLowerCase();
        result = result.filter(
            (note) =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
        );
    }

    // Tag filter (AND logic - must have all selected tags)
    if (filters.tags.length > 0) {
        result = result.filter((note) =>
            filters.tags.every((tag) => note.tags.includes(tag))
        );
    }

    // Color label filter (OR logic - must have any of selected labels)
    if (filters.colorLabelIds.length > 0) {
        result = result.filter((note) => {
            const noteLabels = noteLabelsMap[note.id] || [];
            return filters.colorLabelIds.some((labelId) => noteLabels.includes(labelId));
        });
    }

    // Date range filter
    if (filters.dateFrom) {
        result = result.filter(
            (note) => new Date(note.updatedAt) >= filters.dateFrom!
        );
    }
    if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        result = result.filter((note) => new Date(note.updatedAt) <= endOfDay);
    }

    // Sort
    result.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
            case 'updated':
                comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                break;
            case 'created':
                comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                break;
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
        }
        return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
}
