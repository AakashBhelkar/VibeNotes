import { Server } from 'socket.io';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { encoding, decoding } from 'lib0';
import { AuthenticatedSocket } from './index';
import prisma from '../config/db';

/**
 * Collaboration handler for real-time note editing
 * Uses Yjs CRDT for conflict-free collaborative editing
 */

// Store for Yjs documents (in production, use Redis or similar)
const documents = new Map<string, Y.Doc>();
const awareness = new Map<string, awarenessProtocol.Awareness>();

// Track users in each document
const documentUsers = new Map<string, Set<string>>();

// Track cleanup timeouts for documents
const cleanupTimeouts = new Map<string, NodeJS.Timeout>();

// Cleanup delay in milliseconds (5 minutes)
const DOCUMENT_CLEANUP_DELAY_MS = 5 * 60 * 1000;

/**
 * Schedule document cleanup after all users have left
 * Documents are kept in memory for a grace period to allow reconnections
 */
function scheduleDocumentCleanup(noteId: string): void {
    // Clear any existing timeout
    const existingTimeout = cleanupTimeouts.get(noteId);
    if (existingTimeout) {
        clearTimeout(existingTimeout);
    }

    // Schedule cleanup
    const timeout = setTimeout(async () => {
        const users = documentUsers.get(noteId);
        // Only cleanup if no users are connected
        if (!users || users.size === 0) {
            // Save document before cleanup
            await saveDocument(noteId);

            // Clean up document
            const doc = documents.get(noteId);
            if (doc) {
                doc.destroy();
                documents.delete(noteId);
            }

            // Clean up awareness
            const awarenesInstance = awareness.get(noteId);
            if (awarenesInstance) {
                awarenesInstance.destroy();
                awareness.delete(noteId);
            }

            // Clean up user tracking
            documentUsers.delete(noteId);
            cleanupTimeouts.delete(noteId);
        }
    }, DOCUMENT_CLEANUP_DELAY_MS);

    cleanupTimeouts.set(noteId, timeout);
}

/**
 * Cancel scheduled cleanup (when a user joins)
 */
function cancelDocumentCleanup(noteId: string): void {
    const timeout = cleanupTimeouts.get(noteId);
    if (timeout) {
        clearTimeout(timeout);
        cleanupTimeouts.delete(noteId);
    }
}

// Message types
const messageSync = 0;
const messageAwareness = 1;

/**
 * Get or create a Yjs document for a note
 */
function getDocument(noteId: string): Y.Doc {
    let doc = documents.get(noteId);
    if (!doc) {
        doc = new Y.Doc();
        documents.set(noteId, doc);
    }
    return doc;
}

/**
 * Get or create awareness for a document
 */
function getAwareness(noteId: string): awarenessProtocol.Awareness {
    let awarenesInstance = awareness.get(noteId);
    if (!awarenesInstance) {
        const doc = getDocument(noteId);
        awarenesInstance = new awarenessProtocol.Awareness(doc);
        awareness.set(noteId, awarenesInstance);
    }
    return awarenesInstance;
}

/**
 * Check if user can access note
 */
async function canAccessNote(noteId: string, userId: string): Promise<boolean> {
    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            deletedAt: null,
            OR: [
                { userId }, // Owner
                {
                    workspace: {
                        members: {
                            some: { userId },
                        },
                    },
                },
            ],
        },
    });
    return !!note;
}

/**
 * Check if user can edit note
 */
async function canEditNote(noteId: string, userId: string): Promise<boolean> {
    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            deletedAt: null,
        },
        include: {
            workspace: {
                include: {
                    members: {
                        where: { userId },
                    },
                },
            },
        },
    });

    if (!note) return false;

    // Owner can always edit
    if (note.userId === userId) return true;

    // Check workspace membership
    if (note.workspace) {
        const member = note.workspace.members[0];
        if (member && (member.role === 'admin' || member.role === 'editor')) {
            return true;
        }
    }

    return false;
}

/**
 * Setup collaboration handlers for a socket
 */
export function setupCollaborationHandlers(io: Server, socket: AuthenticatedSocket): void {
    const userId = socket.userId!;

    // Join a document room for collaboration
    socket.on('join-document', async (noteId: string, callback: (response: { success: boolean; error?: string }) => void) => {
        try {
            // Check access
            const hasAccess = await canAccessNote(noteId, userId);
            if (!hasAccess) {
                callback({ success: false, error: 'Access denied' });
                return;
            }

            // Join the room
            socket.join(`doc:${noteId}`);

            // Cancel any pending cleanup for this document
            cancelDocumentCleanup(noteId);

            // Track user in document
            if (!documentUsers.has(noteId)) {
                documentUsers.set(noteId, new Set());
            }
            documentUsers.get(noteId)!.add(userId);

            // Get document and awareness
            const doc = getDocument(noteId);
            const awarenesInstance = getAwareness(noteId);

            // Send initial sync
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageSync);
            syncProtocol.writeSyncStep1(encoder, doc);
            socket.emit('sync', encoding.toUint8Array(encoder));

            // Send awareness states
            const awarenessStates = awarenessProtocol.encodeAwarenessUpdate(
                awarenesInstance,
                Array.from(awarenesInstance.getStates().keys())
            );
            socket.emit('awareness', awarenessStates);

            // Notify others
            socket.to(`doc:${noteId}`).emit('user-joined', {
                odcId: noteId,
                userId,
                userCount: documentUsers.get(noteId)!.size,
            });

            callback({ success: true });
        } catch (error) {
            console.error('Error joining document:', error);
            callback({ success: false, error: 'Failed to join document' });
        }
    });

    // Leave a document room
    socket.on('leave-document', (noteId: string) => {
        socket.leave(`doc:${noteId}`);

        // Remove user from tracking
        const users = documentUsers.get(noteId);
        if (users) {
            users.delete(userId);
            if (users.size === 0) {
                // Schedule cleanup after grace period
                scheduleDocumentCleanup(noteId);
            }
        }

        // Remove awareness
        const awarenesInstance = awareness.get(noteId);
        if (awarenesInstance) {
            awarenessProtocol.removeAwarenessStates(awarenesInstance, [socket.id as unknown as number], null);
        }

        // Notify others
        socket.to(`doc:${noteId}`).emit('user-left', {
            noteId,
            userId,
            userCount: users?.size || 0,
        });
    });

    // Handle sync messages
    socket.on('sync', async (noteId: string, message: Uint8Array) => {
        try {
            // Check edit permission
            const canEdit = await canEditNote(noteId, userId);
            if (!canEdit) {
                socket.emit('error', { message: 'Edit permission denied' });
                return;
            }

            const doc = getDocument(noteId);
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(message);
            const messageType = decoding.readVarUint(decoder);

            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync);
                    const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, null);

                    if (syncMessageType === syncProtocol.messageYjsSyncStep2 ||
                        syncMessageType === syncProtocol.messageYjsUpdate) {
                        // Broadcast to others in the room
                        socket.to(`doc:${noteId}`).emit('sync', message);
                    }

                    if (encoding.length(encoder) > 1) {
                        socket.emit('sync', encoding.toUint8Array(encoder));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling sync:', error);
        }
    });

    // Handle awareness updates (cursor position, selection, etc.)
    socket.on('awareness', (noteId: string, message: Uint8Array) => {
        try {
            const awarenesInstance = getAwareness(noteId);
            awarenessProtocol.applyAwarenessUpdate(awarenesInstance, message, socket);

            // Broadcast to others
            socket.to(`doc:${noteId}`).emit('awareness', message);
        } catch (error) {
            console.error('Error handling awareness:', error);
        }
    });

    // Handle cursor position updates
    socket.on('cursor', (noteId: string, cursor: { position: number; selection?: { start: number; end: number } }) => {
        socket.to(`doc:${noteId}`).emit('cursor', {
            odcId: noteId,
            userId,
            cursor,
        });
    });

    // Get active users in a document
    socket.on('get-users', (noteId: string, callback: (users: string[]) => void) => {
        const users = documentUsers.get(noteId);
        callback(users ? Array.from(users) : []);
    });

    // Handle disconnect - clean up all document memberships
    socket.on('disconnect', () => {
        documentUsers.forEach((users, noteId) => {
            if (users.has(userId)) {
                users.delete(userId);
                socket.to(`doc:${noteId}`).emit('user-left', {
                    noteId,
                    userId,
                    userCount: users.size,
                });

                // Schedule cleanup if no users left
                if (users.size === 0) {
                    scheduleDocumentCleanup(noteId);
                }
            }
        });
    });
}

/**
 * Save document content to database
 * Called periodically or on document close
 */
export async function saveDocument(noteId: string): Promise<void> {
    const doc = documents.get(noteId);
    if (!doc) return;

    try {
        const content = doc.getText('content').toString();
        const title = doc.getText('title').toString();

        await prisma.note.update({
            where: { id: noteId },
            data: {
                content,
                title,
                version: { increment: 1 },
            },
        });
    } catch (error) {
        console.error('Error saving document:', error);
    }
}

/**
 * Load document content from database
 */
export async function loadDocument(noteId: string): Promise<Y.Doc | null> {
    try {
        const note = await prisma.note.findUnique({
            where: { id: noteId },
        });

        if (!note) return null;

        const doc = getDocument(noteId);
        doc.getText('content').insert(0, note.content);
        doc.getText('title').insert(0, note.title);

        return doc;
    } catch (error) {
        console.error('Error loading document:', error);
        return null;
    }
}
