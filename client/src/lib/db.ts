import Dexie, { Table } from 'dexie';

/**
 * Note interface matching backend schema
 */
export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    folderId?: string | null;
    isPinned: boolean;
    isArchived: boolean;
    deletedAt?: Date | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    syncedAt?: Date;
}

/**
 * Sync queue item for offline changes
 */
export interface SyncQueueItem {
    id?: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    noteId: string;
    data?: Partial<Note>;
    timestamp: Date;
    retryCount: number;
}

/**
 * Note version for history tracking
 */
export interface NoteVersion {
    id?: number;
    noteId: string;
    version: number;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    userId: string;
}

/**
 * Color label for visual organization
 */
export interface ColorLabel {
    id: string;
    name: string;
    color: string; // Hex color code
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    syncedAt?: Date;
}

/**
 * Note-ColorLabel association
 */
export interface NoteColorLabel {
    noteId: string;
    colorLabelId: string;
    assignedAt: Date;
}

/**
 * Sync queue item for color label changes
 */
export interface ColorLabelSyncQueueItem {
    id?: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'UNASSIGN';
    colorLabelId: string;
    noteId?: string; // For ASSIGN/UNASSIGN actions
    data?: Partial<ColorLabel>;
    timestamp: Date;
    retryCount: number;
}

/**
 * Folder for hierarchical organization
 */
export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    syncedAt?: Date;
}

/**
 * Folder with computed properties
 */
export interface FolderWithCounts extends Folder {
    childCount: number;
    noteCount: number;
}

/**
 * Dexie database for offline storage
 * Follows architecture.md specifications
 */
export class VibeNotesDB extends Dexie {
    notes!: Table<Note, string>;
    syncQueue!: Table<SyncQueueItem, number>;
    noteVersions!: Table<NoteVersion, number>;
    colorLabels!: Table<ColorLabel, string>;
    noteColorLabels!: Table<NoteColorLabel, [string, string]>;
    colorLabelSyncQueue!: Table<ColorLabelSyncQueueItem, number>;
    folders!: Table<Folder, string>;

    constructor() {
        super('VibeNotesDB');

        this.version(3).stores({
            notes: 'id, userId, isPinned, isArchived, deletedAt, updatedAt, *tags',
            syncQueue: '++id, noteId, timestamp',
            noteVersions: '++id, noteId, version, createdAt, userId'
        });

        this.version(4).stores({
            notes: 'id, userId, isPinned, isArchived, deletedAt, updatedAt, *tags',
            syncQueue: '++id, noteId, timestamp',
            noteVersions: '++id, noteId, version, createdAt, userId',
            colorLabels: 'id, userId, name, updatedAt',
            noteColorLabels: '[noteId+colorLabelId], noteId, colorLabelId',
            colorLabelSyncQueue: '++id, colorLabelId, noteId, timestamp'
        });

        this.version(5).stores({
            notes: 'id, userId, folderId, isPinned, isArchived, deletedAt, updatedAt, *tags',
            syncQueue: '++id, noteId, timestamp',
            noteVersions: '++id, noteId, version, createdAt, userId',
            colorLabels: 'id, userId, name, updatedAt',
            noteColorLabels: '[noteId+colorLabelId], noteId, colorLabelId',
            colorLabelSyncQueue: '++id, colorLabelId, noteId, timestamp',
            folders: 'id, userId, parentId, name, updatedAt'
        });
    }
}

export const db = new VibeNotesDB();
