import { useState, useEffect, useCallback } from 'react';
import { colorLabelStorage, DEFAULT_COLORS } from '@/services/colorLabelStorage';
import { authService } from '@/services/authService';
import { ColorLabel } from '@/lib/db';

/**
 * Hook to manage color labels with offline storage
 * Provides CRUD operations for labels and note-label associations
 */
export function useColorLabels() {
    const [labels, setLabels] = useState<ColorLabel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLabels = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            const allLabels = await colorLabelStorage.fetchAndSync();
            setLabels(allLabels);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load color labels';
            setError(errorMessage);
            // Fall back to local data
            const localLabels = await colorLabelStorage.getAll();
            setLabels(localLabels);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLabels();
    }, [loadLabels]);

    const createLabel = useCallback(async (
        name: string,
        color: string
    ): Promise<ColorLabel> => {
        try {
            const user = authService.getUser();
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const newLabel = await colorLabelStorage.create({
                userId: user.id,
                name,
                color,
            });

            setLabels(prev => [...prev, newLabel].sort((a, b) => a.name.localeCompare(b.name)));
            setError(null);
            return newLabel;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create label';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const updateLabel = useCallback(async (
        id: string,
        updates: Partial<Pick<ColorLabel, 'name' | 'color'>>
    ): Promise<ColorLabel | undefined> => {
        try {
            const updated = await colorLabelStorage.update(id, updates);
            if (updated) {
                setLabels(prev => prev.map(l => l.id === id ? updated : l).sort((a, b) => a.name.localeCompare(b.name)));
            }
            setError(null);
            return updated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update label';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const deleteLabel = useCallback(async (id: string): Promise<void> => {
        try {
            await colorLabelStorage.delete(id);
            setLabels(prev => prev.filter(l => l.id !== id));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete label';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const getLabelById = useCallback((id: string): ColorLabel | undefined => {
        return labels.find(l => l.id === id);
    }, [labels]);

    return {
        labels,
        isLoading,
        error,
        createLabel,
        updateLabel,
        deleteLabel,
        getLabelById,
        refresh: loadLabels,
        defaultColors: DEFAULT_COLORS,
    };
}

/**
 * Hook to manage color labels for a specific note
 */
export function useNoteColorLabels(noteId: string | null) {
    const [noteLabels, setNoteLabels] = useState<ColorLabel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNoteLabels = useCallback(async (): Promise<void> => {
        if (!noteId) {
            setNoteLabels([]);
            return;
        }

        try {
            setIsLoading(true);
            const labels = await colorLabelStorage.getLabelsForNote(noteId);
            setNoteLabels(labels);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load note labels';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [noteId]);

    useEffect(() => {
        loadNoteLabels();
    }, [loadNoteLabels]);

    const assignLabel = useCallback(async (labelId: string): Promise<void> => {
        if (!noteId) return;

        try {
            await colorLabelStorage.assignLabelToNote(noteId, labelId);
            await loadNoteLabels();
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to assign label';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [noteId, loadNoteLabels]);

    const removeLabel = useCallback(async (labelId: string): Promise<void> => {
        if (!noteId) return;

        try {
            await colorLabelStorage.removeLabelFromNote(noteId, labelId);
            setNoteLabels(prev => prev.filter(l => l.id !== labelId));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove label';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [noteId]);

    const updateLabels = useCallback(async (labelIds: string[]): Promise<void> => {
        if (!noteId) return;

        try {
            await colorLabelStorage.updateNoteLabels(noteId, labelIds);
            await loadNoteLabels();
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update labels';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [noteId, loadNoteLabels]);

    const hasLabel = useCallback((labelId: string): boolean => {
        return noteLabels.some(l => l.id === labelId);
    }, [noteLabels]);

    const toggleLabel = useCallback(async (labelId: string): Promise<void> => {
        if (hasLabel(labelId)) {
            await removeLabel(labelId);
        } else {
            await assignLabel(labelId);
        }
    }, [hasLabel, assignLabel, removeLabel]);

    return {
        noteLabels,
        isLoading,
        error,
        assignLabel,
        removeLabel,
        updateLabels,
        hasLabel,
        toggleLabel,
        refresh: loadNoteLabels,
    };
}
