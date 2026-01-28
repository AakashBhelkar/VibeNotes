import { useState, useEffect } from 'react';
import { noteStorage } from '@/services/noteStorage';
import { authService } from '@/services/authService';
import { Note } from '@/lib/db';

/**
 * Hook to manage notes with offline storage
 * Provides CRUD operations and search functionality
 * @returns Note management functions and state
 */
export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
    const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNotes = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const allNotes = await noteStorage.getAll();
            setNotes(allNotes);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchArchivedNotes = async (): Promise<void> => {
        try {
            const archived = await noteStorage.getArchived();
            setArchivedNotes(archived);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load archived notes';
            setError(errorMessage);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const createNote = async (
        title: string,
        content: string,
        tags: string[] = []
    ): Promise<Note> => {
        try {
            const user = authService.getUser();
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const newNote = await noteStorage.create({
                userId: user.id,
                title,
                content,
                tags,
                isPinned: false,
                isArchived: false,
            });
            setNotes(prev => [newNote, ...prev]);
            setError(null);
            return newNote;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateNote = async (
        id: string,
        updates: Partial<Note>
    ): Promise<Note | undefined> => {
        try {
            const existing = await noteStorage.getById(id);
            if (!existing) return undefined;

            const updated: Note = {
                ...existing,
                ...updates,
                id,
                version: existing.version + 1,
                updatedAt: new Date(),
            };

            await noteStorage.update(id, updates);
            setNotes(prev => prev.map(n => n.id === id ? updated : n));
            setError(null);
            return updated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const deleteNote = async (id: string): Promise<void> => {
        try {
            await noteStorage.softDelete(id);
            setNotes(prev => prev.filter(n => n.id !== id));
            setArchivedNotes(prev => prev.filter(n => n.id !== id));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const fetchTrashedNotes = async (): Promise<void> => {
        try {
            const trashed = await noteStorage.getDeleted();
            setTrashedNotes(trashed);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load trashed notes';
            setError(errorMessage);
        }
    };

    const restoreNote = async (id: string): Promise<void> => {
        try {
            const restored = await noteStorage.restore(id);
            if (restored) {
                setTrashedNotes(prev => prev.filter(n => n.id !== id));
                setNotes(prev => [restored, ...prev]);
            }
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to restore note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const permanentDeleteNote = async (id: string): Promise<void> => {
        try {
            await noteStorage.permanentDelete(id);
            setTrashedNotes(prev => prev.filter(n => n.id !== id));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to permanently delete note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const searchNotes = async (query: string): Promise<void> => {
        try {
            const results = await noteStorage.search(query);
            setNotes(results);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search notes';
            setError(errorMessage);
        }
    };

    const filterByTag = async (tag: string): Promise<void> => {
        try {
            const results = await noteStorage.filterByTag(tag);
            setNotes(results);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to filter notes';
            setError(errorMessage);
        }
    };

    /**
     * Advanced filtering with date range and multiple tags
     */
    const filterNotes = async (filters: {
        searchQuery?: string;
        tags?: string[];
        dateRange?: { from: Date; to: Date };
    }): Promise<void> => {
        try {
            let results = await noteStorage.getAll();

            // Apply search query filter
            if (filters.searchQuery && filters.searchQuery.trim()) {
                const query = filters.searchQuery.toLowerCase();
                results = results.filter(note =>
                    note.title.toLowerCase().includes(query) ||
                    note.content.toLowerCase().includes(query)
                );
            }

            // Apply tag filter (notes must have ALL selected tags)
            if (filters.tags && filters.tags.length > 0) {
                results = results.filter(note =>
                    filters.tags!.every(tag => note.tags.includes(tag))
                );
            }

            // Apply date range filter
            if (filters.dateRange) {
                const { from, to } = filters.dateRange;
                results = results.filter(note => {
                    const noteDate = new Date(note.updatedAt);
                    return noteDate >= from && noteDate <= to;
                });
            }

            setNotes(results);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to filter notes';
            setError(errorMessage);
        }
    };

    /**
     * Get all unique tags from all notes
     */
    const getAllTags = (): string[] => {
        const tagSet = new Set<string>();
        notes.forEach(note => {
            note.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    };

    return {
        notes,
        archivedNotes,
        trashedNotes,
        isLoading,
        error,
        createNote,
        updateNote,
        deleteNote,
        searchNotes,
        filterByTag,
        filterNotes,
        getAllTags,
        refresh: loadNotes,
        fetchArchivedNotes,
        fetchTrashedNotes,
        restoreNote,
        permanentDeleteNote,
    };
}
