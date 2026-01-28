import { useCallback, useEffect, useState } from 'react';
import { useNoteStore } from '../store/noteStore';
import { database } from '../services/database';
import { syncService } from '../services/sync';
import { Note } from '../services/api';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export function useNotes() {
    const {
        notes,
        selectedNote,
        isLoading,
        error,
        setNotes,
        setSelectedNote,
        setLoading,
        setError,
    } = useNoteStore();

    const [syncStatus, setSyncStatus] = useState<{
        isOnline: boolean;
        lastSync: string | null;
        pendingCount: number;
    }>({ isOnline: false, lastSync: null, pendingCount: 0 });

    // Initialize database and load notes
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await database.init();
                await syncService.init();
                await loadNotes();
                await updateSyncStatus();
            } catch (error: any) {
                setError(error.message || 'Failed to initialize');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadNotes = useCallback(async () => {
        try {
            const localNotes = await database.getAllNotes();
            setNotes(localNotes);
        } catch (error: any) {
            setError(error.message || 'Failed to load notes');
        }
    }, [setNotes, setError]);

    const updateSyncStatus = useCallback(async () => {
        const status = await syncService.getStatus();
        setSyncStatus(status);
    }, []);

    const createNote = useCallback(async (
        title: string,
        content: string,
        tags: string[] = []
    ): Promise<Note> => {
        const now = new Date().toISOString();
        const newNote: Note = {
            id: uuidv4(),
            title,
            content,
            tags,
            isPinned: false,
            isArchived: false,
            version: 1,
            createdAt: now,
            updatedAt: now,
        };

        await database.saveNote(newNote, true);
        await database.addToSyncQueue(newNote.id, 'create');
        await loadNotes();
        await updateSyncStatus();

        return newNote;
    }, [loadNotes, updateSyncStatus]);

    const updateNote = useCallback(async (
        id: string,
        updates: Partial<Note>
    ): Promise<void> => {
        const note = await database.getNote(id);
        if (!note) {
            throw new Error('Note not found');
        }

        const updatedNote: Note = {
            ...note,
            ...updates,
            version: note.version + 1,
            updatedAt: new Date().toISOString(),
        };

        await database.saveNote(updatedNote, true);
        await database.addToSyncQueue(id, 'update');
        await loadNotes();
        await updateSyncStatus();

        // Update selected note if it's the same note
        if (selectedNote?.id === id) {
            setSelectedNote(updatedNote);
        }
    }, [loadNotes, updateSyncStatus, selectedNote, setSelectedNote]);

    const deleteNote = useCallback(async (id: string): Promise<void> => {
        await database.addToSyncQueue(id, 'delete');
        await database.deleteNote(id);
        await loadNotes();
        await updateSyncStatus();

        if (selectedNote?.id === id) {
            setSelectedNote(null);
        }
    }, [loadNotes, updateSyncStatus, selectedNote, setSelectedNote]);

    const selectNote = useCallback((note: Note | null) => {
        setSelectedNote(note);
    }, [setSelectedNote]);

    const sync = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const result = await syncService.syncNow();
            if (result.success) {
                await loadNotes();
            }
            await updateSyncStatus();
            return result;
        } finally {
            setLoading(false);
        }
    }, [loadNotes, updateSyncStatus, setLoading]);

    const refreshNotes = useCallback(async () => {
        setLoading(true);
        try {
            await loadNotes();
            await updateSyncStatus();
        } finally {
            setLoading(false);
        }
    }, [loadNotes, updateSyncStatus, setLoading]);

    return {
        notes,
        selectedNote,
        isLoading,
        error,
        syncStatus,
        createNote,
        updateNote,
        deleteNote,
        selectNote,
        sync,
        refreshNotes,
    };
}
