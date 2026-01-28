import { useState, useCallback } from 'react';

/**
 * Modal types supported in the application
 */
export type ModalType =
    | 'welcome'
    | 'versionHistory'
    | 'keyboardShortcuts'
    | 'graphView'
    | 'advancedSearch'
    | 'activityFeed'
    | 'comments'
    | 'workspaces'
    | null;

interface ModalState {
    activeModal: ModalType;
    modalData?: Record<string, unknown>;
}

interface ModalManagerReturn extends ModalState {
    openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
    closeModal: () => void;
    isOpen: (modal: ModalType) => boolean;
}

/**
 * Hook for managing modal state across the application
 * Consolidates multiple boolean states into a single modal manager
 */
export function useModalManager(): ModalManagerReturn {
    const [state, setState] = useState<ModalState>({
        activeModal: null,
        modalData: undefined,
    });

    const openModal = useCallback((modal: ModalType, data?: Record<string, unknown>) => {
        setState({ activeModal: modal, modalData: data });
    }, []);

    const closeModal = useCallback(() => {
        setState({ activeModal: null, modalData: undefined });
    }, []);

    const isOpen = useCallback(
        (modal: ModalType) => state.activeModal === modal,
        [state.activeModal]
    );

    return {
        ...state,
        openModal,
        closeModal,
        isOpen,
    };
}
