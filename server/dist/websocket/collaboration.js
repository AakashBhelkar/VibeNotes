"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCollaborationHandlers = setupCollaborationHandlers;
exports.saveDocument = saveDocument;
exports.loadDocument = loadDocument;
const Y = __importStar(require("yjs"));
const syncProtocol = __importStar(require("y-protocols/sync"));
const awarenessProtocol = __importStar(require("y-protocols/awareness"));
const lib0_1 = require("lib0");
const db_1 = __importDefault(require("../config/db"));
/**
 * Collaboration handler for real-time note editing
 * Uses Yjs CRDT for conflict-free collaborative editing
 */
// Store for Yjs documents (in production, use Redis or similar)
const documents = new Map();
const awareness = new Map();
// Track users in each document
const documentUsers = new Map();
// Message types
const messageSync = 0;
const messageAwareness = 1;
/**
 * Get or create a Yjs document for a note
 */
function getDocument(noteId) {
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
function getAwareness(noteId) {
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
async function canAccessNote(noteId, userId) {
    const note = await db_1.default.note.findFirst({
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
async function canEditNote(noteId, userId) {
    const note = await db_1.default.note.findFirst({
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
    if (!note)
        return false;
    // Owner can always edit
    if (note.userId === userId)
        return true;
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
function setupCollaborationHandlers(io, socket) {
    const userId = socket.userId;
    // Join a document room for collaboration
    socket.on('join-document', async (noteId, callback) => {
        try {
            // Check access
            const hasAccess = await canAccessNote(noteId, userId);
            if (!hasAccess) {
                callback({ success: false, error: 'Access denied' });
                return;
            }
            // Join the room
            socket.join(`doc:${noteId}`);
            // Track user in document
            if (!documentUsers.has(noteId)) {
                documentUsers.set(noteId, new Set());
            }
            documentUsers.get(noteId).add(userId);
            // Get document and awareness
            const doc = getDocument(noteId);
            const awarenesInstance = getAwareness(noteId);
            // Send initial sync
            const encoder = lib0_1.encoding.createEncoder();
            lib0_1.encoding.writeVarUint(encoder, messageSync);
            syncProtocol.writeSyncStep1(encoder, doc);
            socket.emit('sync', lib0_1.encoding.toUint8Array(encoder));
            // Send awareness states
            const awarenessStates = awarenessProtocol.encodeAwarenessUpdate(awarenesInstance, Array.from(awarenesInstance.getStates().keys()));
            socket.emit('awareness', awarenessStates);
            // Notify others
            socket.to(`doc:${noteId}`).emit('user-joined', {
                odcId: noteId,
                userId,
                userCount: documentUsers.get(noteId).size,
            });
            callback({ success: true });
        }
        catch (error) {
            console.error('Error joining document:', error);
            callback({ success: false, error: 'Failed to join document' });
        }
    });
    // Leave a document room
    socket.on('leave-document', (noteId) => {
        socket.leave(`doc:${noteId}`);
        // Remove user from tracking
        const users = documentUsers.get(noteId);
        if (users) {
            users.delete(userId);
            if (users.size === 0) {
                documentUsers.delete(noteId);
                // Optionally clean up document after delay
            }
        }
        // Remove awareness
        const awarenesInstance = awareness.get(noteId);
        if (awarenesInstance) {
            awarenessProtocol.removeAwarenessStates(awarenesInstance, [socket.id], null);
        }
        // Notify others
        socket.to(`doc:${noteId}`).emit('user-left', {
            noteId,
            userId,
            userCount: users?.size || 0,
        });
    });
    // Handle sync messages
    socket.on('sync', async (noteId, message) => {
        try {
            // Check edit permission
            const canEdit = await canEditNote(noteId, userId);
            if (!canEdit) {
                socket.emit('error', { message: 'Edit permission denied' });
                return;
            }
            const doc = getDocument(noteId);
            const encoder = lib0_1.encoding.createEncoder();
            const decoder = lib0_1.decoding.createDecoder(message);
            const messageType = lib0_1.decoding.readVarUint(decoder);
            switch (messageType) {
                case messageSync:
                    lib0_1.encoding.writeVarUint(encoder, messageSync);
                    const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, null);
                    if (syncMessageType === syncProtocol.messageYjsSyncStep2 ||
                        syncMessageType === syncProtocol.messageYjsUpdate) {
                        // Broadcast to others in the room
                        socket.to(`doc:${noteId}`).emit('sync', message);
                    }
                    if (lib0_1.encoding.length(encoder) > 1) {
                        socket.emit('sync', lib0_1.encoding.toUint8Array(encoder));
                    }
                    break;
            }
        }
        catch (error) {
            console.error('Error handling sync:', error);
        }
    });
    // Handle awareness updates (cursor position, selection, etc.)
    socket.on('awareness', (noteId, message) => {
        try {
            const awarenesInstance = getAwareness(noteId);
            awarenessProtocol.applyAwarenessUpdate(awarenesInstance, message, socket);
            // Broadcast to others
            socket.to(`doc:${noteId}`).emit('awareness', message);
        }
        catch (error) {
            console.error('Error handling awareness:', error);
        }
    });
    // Handle cursor position updates
    socket.on('cursor', (noteId, cursor) => {
        socket.to(`doc:${noteId}`).emit('cursor', {
            odcId: noteId,
            userId,
            cursor,
        });
    });
    // Get active users in a document
    socket.on('get-users', (noteId, callback) => {
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
            }
        });
    });
}
/**
 * Save document content to database
 * Called periodically or on document close
 */
async function saveDocument(noteId) {
    const doc = documents.get(noteId);
    if (!doc)
        return;
    try {
        const content = doc.getText('content').toString();
        const title = doc.getText('title').toString();
        await db_1.default.note.update({
            where: { id: noteId },
            data: {
                content,
                title,
                version: { increment: 1 },
            },
        });
    }
    catch (error) {
        console.error('Error saving document:', error);
    }
}
/**
 * Load document content from database
 */
async function loadDocument(noteId) {
    try {
        const note = await db_1.default.note.findUnique({
            where: { id: noteId },
        });
        if (!note)
            return null;
        const doc = getDocument(noteId);
        doc.getText('content').insert(0, note.content);
        doc.getText('title').insert(0, note.title);
        return doc;
    }
    catch (error) {
        console.error('Error loading document:', error);
        return null;
    }
}
