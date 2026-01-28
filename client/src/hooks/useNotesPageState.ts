import { useReducer, useCallback } from 'react';
import { Note } from '@/lib/db';

/**
 * State shape for NotesPage
 */
export interface NotesPageState {
    selectedNote: Note | null;
    selectedFolderId: string | null;
    errorMessage: string | null;
    showArchived: boolean;
    showFolders: boolean;
    distractionFreeMode: boolean;
}

/**
 * Action types for the reducer
 */
type NotesPageAction =
    | { type: 'SELECT_NOTE'; payload: Note | null }
    | { type: 'SELECT_FOLDER'; payload: string | null }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'TOGGLE_ARCHIVED' }
    | { type: 'TOGGLE_FOLDERS' }
    | { type: 'TOGGLE_DISTRACTION_FREE' }
    | { type: 'EXIT_DISTRACTION_FREE' }
    | { type: 'CLEAR_SELECTION' };

const initialState: NotesPageState = {
    selectedNote: null,
    selectedFolderId: null,
    errorMessage: null,
    showArchived: false,
    showFolders: true,
    distractionFreeMode: false,
};

function notesPageReducer(state: NotesPageState, action: NotesPageAction): NotesPageState {
    switch (action.type) {
        case 'SELECT_NOTE':
            return { ...state, selectedNote: action.payload };
        case 'SELECT_FOLDER':
            return { ...state, selectedFolderId: action.payload };
        case 'SET_ERROR':
            return { ...state, errorMessage: action.payload };
        case 'TOGGLE_ARCHIVED':
            return {
                ...state,
                showArchived: !state.showArchived,
                selectedNote: null, // Clear selection when toggling archive view
            };
        case 'TOGGLE_FOLDERS':
            return { ...state, showFolders: !state.showFolders };
        case 'TOGGLE_DISTRACTION_FREE':
            return { ...state, distractionFreeMode: !state.distractionFreeMode };
        case 'EXIT_DISTRACTION_FREE':
            return { ...state, distractionFreeMode: false };
        case 'CLEAR_SELECTION':
            return { ...state, selectedNote: null };
        default:
            return state;
    }
}

/**
 * Hook for managing NotesPage state with useReducer
 * Consolidates multiple useState calls into organized state management
 */
export function useNotesPageState() {
    const [state, dispatch] = useReducer(notesPageReducer, initialState);

    // Action creators
    const selectNote = useCallback((note: Note | null) => {
        dispatch({ type: 'SELECT_NOTE', payload: note });
    }, []);

    const selectFolder = useCallback((folderId: string | null) => {
        dispatch({ type: 'SELECT_FOLDER', payload: folderId });
    }, []);

    const setError = useCallback((message: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: message });
    }, []);

    const toggleArchived = useCallback(() => {
        dispatch({ type: 'TOGGLE_ARCHIVED' });
    }, []);

    const toggleFolders = useCallback(() => {
        dispatch({ type: 'TOGGLE_FOLDERS' });
    }, []);

    const toggleDistractionFree = useCallback(() => {
        dispatch({ type: 'TOGGLE_DISTRACTION_FREE' });
    }, []);

    const exitDistractionFree = useCallback(() => {
        dispatch({ type: 'EXIT_DISTRACTION_FREE' });
    }, []);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTION' });
    }, []);

    return {
        state,
        actions: {
            selectNote,
            selectFolder,
            setError,
            toggleArchived,
            toggleFolders,
            toggleDistractionFree,
            exitDistractionFree,
            clearSelection,
        },
    };
}
