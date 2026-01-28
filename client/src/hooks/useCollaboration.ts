import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { encoding, decoding } from 'lib0';

/**
 * Collaborator information
 */
export interface Collaborator {
    odcId: string;
    name: string;
    color: string;
    cursor?: {
        position: number;
        selection?: { start: number; end: number };
    };
}

/**
 * Collaboration state
 */
export interface CollaborationState {
    isConnected: boolean;
    isCollaborating: boolean;
    collaborators: Collaborator[];
    error: string | null;
    isOffline: boolean; // True when collaboration server is unavailable (expected state)
}

// Message types
const messageSync = 0;

// Random colors for collaborators
const collaboratorColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

/**
 * Hook for real-time collaboration on notes
 */
export function useCollaboration(noteId: string | null) {
    const [state, setState] = useState<CollaborationState>({
        isConnected: false,
        isCollaborating: false,
        collaborators: [],
        error: null,
        isOffline: false,
    });

    const socketRef = useRef<Socket | null>(null);
    const docRef = useRef<Y.Doc | null>(null);
    const awarenessRef = useRef<awarenessProtocol.Awareness | null>(null);

    /**
     * Initialize socket connection
     */
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setState(prev => ({ ...prev, error: 'Not authenticated' }));
            return;
        }

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            auth: { token },
            path: '/socket.io',
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            setState(prev => ({ ...prev, isConnected: true, error: null, isOffline: false }));
        });

        socket.on('disconnect', () => {
            setState(prev => ({
                ...prev,
                isConnected: false,
                isCollaborating: false,
                collaborators: [],
            }));
        });

        socket.on('connect_error', () => {
            // Don't treat connection failure as an error - collaboration is optional
            // Set isOffline to indicate collaboration server is unavailable
            setState(prev => ({ ...prev, isOffline: true, error: null }));
        });

        socketRef.current = socket;
    }, []);

    /**
     * Disconnect socket
     */
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        docRef.current = null;
        awarenessRef.current = null;
        setState({
            isConnected: false,
            isCollaborating: false,
            collaborators: [],
            error: null,
            isOffline: false,
        });
    }, []);

    /**
     * Join a document for collaboration
     */
    const joinDocument = useCallback(async (): Promise<Y.Doc | null> => {
        if (!noteId || !socketRef.current?.connected) {
            return null;
        }

        return new Promise((resolve) => {
            const socket = socketRef.current!;

            // Create Yjs document
            const doc = new Y.Doc();
            docRef.current = doc;

            // Create awareness
            const awareness = new awarenessProtocol.Awareness(doc);
            awarenessRef.current = awareness;

            // Set local user state
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            awareness.setLocalStateField('user', {
                name: user.displayName || user.email || 'Anonymous',
                color: collaboratorColors[Math.floor(Math.random() * collaboratorColors.length)],
            });

            // Handle sync messages
            socket.on('sync', (message: Uint8Array) => {
                const decoder = decoding.createDecoder(new Uint8Array(message));
                const messageType = decoding.readVarUint(decoder);

                if (messageType === messageSync) {
                    const encoder = encoding.createEncoder();
                    encoding.writeVarUint(encoder, messageSync);
                    syncProtocol.readSyncMessage(decoder, encoder, doc, null);

                    if (encoding.length(encoder) > 1) {
                        socket.emit('sync', noteId, encoding.toUint8Array(encoder));
                    }
                }
            });

            // Handle awareness updates
            socket.on('awareness', (message: Uint8Array) => {
                awarenessProtocol.applyAwarenessUpdate(awareness, new Uint8Array(message), null);
                updateCollaborators();
            });

            // Handle user joined/left
            socket.on('user-joined', (data: { noteId: string; userId: string; userCount: number }) => {
                if (data.noteId === noteId) {
                    updateCollaborators();
                }
            });

            socket.on('user-left', (data: { noteId: string; userId: string; userCount: number }) => {
                if (data.noteId === noteId) {
                    updateCollaborators();
                }
            });

            // Handle cursor updates
            socket.on('cursor', (data: { noteId: string; userId: string; cursor: { position: number; selection?: { start: number; end: number } } }) => {
                if (data.noteId === noteId) {
                    setState(prev => ({
                        ...prev,
                        collaborators: prev.collaborators.map(c =>
                            c.odcId === data.userId ? { ...c, cursor: data.cursor } : c
                        ),
                    }));
                }
            });

            // Update collaborators list
            const updateCollaborators = () => {
                const states = awareness.getStates();
                const collabs: Collaborator[] = [];

                states.forEach((state, clientId) => {
                    if (clientId !== doc.clientID && state.user) {
                        collabs.push({
                            odcId: clientId.toString(),
                            name: state.user.name,
                            color: state.user.color,
                            cursor: state.cursor,
                        });
                    }
                });

                setState(prev => ({ ...prev, collaborators: collabs }));
            };

            // Listen for local changes and sync
            doc.on('update', (update: Uint8Array) => {
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, messageSync);
                syncProtocol.writeUpdate(encoder, update);
                socket.emit('sync', noteId, encoding.toUint8Array(encoder));
            });

            // Listen for awareness changes
            awareness.on('change', () => {
                const encoder = awarenessProtocol.encodeAwarenessUpdate(
                    awareness,
                    Array.from(awareness.getStates().keys())
                );
                socket.emit('awareness', noteId, encoder);
                updateCollaborators();
            });

            // Join the document
            socket.emit('join-document', noteId, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    setState(prev => ({ ...prev, isCollaborating: true }));
                    resolve(doc);
                } else {
                    setState(prev => ({ ...prev, error: response.error || 'Failed to join' }));
                    resolve(null);
                }
            });
        });
    }, [noteId]);

    /**
     * Leave the current document
     */
    const leaveDocument = useCallback(() => {
        if (noteId && socketRef.current) {
            socketRef.current.emit('leave-document', noteId);
        }

        docRef.current = null;
        awarenessRef.current = null;
        setState(prev => ({
            ...prev,
            isCollaborating: false,
            collaborators: [],
        }));
    }, [noteId]);

    /**
     * Update cursor position
     */
    const updateCursor = useCallback((position: number, selection?: { start: number; end: number }) => {
        if (noteId && socketRef.current?.connected) {
            socketRef.current.emit('cursor', noteId, { position, selection });
        }

        if (awarenessRef.current) {
            awarenessRef.current.setLocalStateField('cursor', { position, selection });
        }
    }, [noteId]);

    /**
     * Get Yjs text binding
     */
    const getText = useCallback((name: string = 'content'): Y.Text | null => {
        return docRef.current?.getText(name) || null;
    }, []);

    // Auto-connect when component mounts
    useEffect(() => {
        connect();
        return () => {
            leaveDocument();
            disconnect();
        };
    }, [connect, disconnect, leaveDocument]);

    // Join document when noteId changes
    useEffect(() => {
        if (noteId && state.isConnected) {
            joinDocument();
        }
        return () => {
            leaveDocument();
        };
    }, [noteId, state.isConnected, joinDocument, leaveDocument]);

    return {
        ...state,
        connect,
        disconnect,
        joinDocument,
        leaveDocument,
        updateCursor,
        getText,
        doc: docRef.current,
        awareness: awarenessRef.current,
    };
}
