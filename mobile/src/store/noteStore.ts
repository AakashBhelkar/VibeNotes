import { create } from 'zustand';
import { api, Note } from '../services/api';

interface NoteStore {
    notes: Note[];
    selectedNote: Note | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchNotes: () => Promise<void>;
    selectNote: (note: Note | null) => void;
    createNote: (title: string, content: string, tags?: string[]) => Promise<Note>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
    notes: [],
    selectedNote: null,
    isLoading: false,
    error: null,

    fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
            const notes = await api.getNotes();
            set({ notes, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch notes',
                isLoading: false,
            });
        }
    },

    selectNote: (note) => {
        set({ selectedNote: note });
    },

    createNote: async (title, content, tags) => {
        set({ isLoading: true, error: null });
        try {
            const note = await api.createNote(title, content, tags);
            set((state) => ({
                notes: [note, ...state.notes],
                selectedNote: note,
                isLoading: false,
            }));
            return note;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create note',
                isLoading: false,
            });
            throw error;
        }
    },

    updateNote: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updatedNote = await api.updateNote(id, updates);
            set((state) => ({
                notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
                selectedNote: state.selectedNote?.id === id ? updatedNote : state.selectedNote,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update note',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteNote: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteNote(id);
            set((state) => ({
                notes: state.notes.filter((n) => n.id !== id),
                selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete note',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));
