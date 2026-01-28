import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { Note } from './api';

SQLite.enablePromise(true);

class DatabaseService {
    private db: SQLiteDatabase | null = null;

    async init(): Promise<void> {
        try {
            this.db = await SQLite.openDatabase({
                name: 'vibenotes.db',
                location: 'default',
            });

            await this.createTables();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Notes table
        await this.db.executeSql(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                tags TEXT,
                is_pinned INTEGER DEFAULT 0,
                is_archived INTEGER DEFAULT 0,
                version INTEGER DEFAULT 1,
                created_at TEXT,
                updated_at TEXT,
                synced_at TEXT,
                pending_sync INTEGER DEFAULT 0
            )
        `);

        // Sync queue table
        await this.db.executeSql(`
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id TEXT NOT NULL,
                action TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        `);

        // Settings table
        await this.db.executeSql(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
    }

    // Note operations
    async getAllNotes(): Promise<Note[]> {
        if (!this.db) throw new Error('Database not initialized');

        const [results] = await this.db.executeSql(
            'SELECT * FROM notes WHERE is_archived = 0 ORDER BY is_pinned DESC, updated_at DESC'
        );

        const notes: Note[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            notes.push(this.rowToNote(row));
        }
        return notes;
    }

    async getNote(id: string): Promise<Note | null> {
        if (!this.db) throw new Error('Database not initialized');

        const [results] = await this.db.executeSql(
            'SELECT * FROM notes WHERE id = ?',
            [id]
        );

        if (results.rows.length === 0) return null;
        return this.rowToNote(results.rows.item(0));
    }

    async saveNote(note: Note, pendingSync: boolean = true): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const tags = JSON.stringify(note.tags || []);
        const now = new Date().toISOString();

        await this.db.executeSql(
            `INSERT OR REPLACE INTO notes
            (id, title, content, tags, is_pinned, is_archived, version, created_at, updated_at, pending_sync)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                note.id,
                note.title,
                note.content,
                tags,
                note.isPinned ? 1 : 0,
                note.isArchived ? 1 : 0,
                note.version,
                note.createdAt || now,
                note.updatedAt || now,
                pendingSync ? 1 : 0,
            ]
        );
    }

    async deleteNote(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.executeSql('DELETE FROM notes WHERE id = ?', [id]);
    }

    async markNoteSynced(id: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const now = new Date().toISOString();
        await this.db.executeSql(
            'UPDATE notes SET pending_sync = 0, synced_at = ? WHERE id = ?',
            [now, id]
        );
    }

    async getPendingSyncNotes(): Promise<Note[]> {
        if (!this.db) throw new Error('Database not initialized');

        const [results] = await this.db.executeSql(
            'SELECT * FROM notes WHERE pending_sync = 1'
        );

        const notes: Note[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            notes.push(this.rowToNote(results.rows.item(i)));
        }
        return notes;
    }

    // Sync queue operations
    async addToSyncQueue(noteId: string, action: 'create' | 'update' | 'delete'): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const now = new Date().toISOString();
        await this.db.executeSql(
            'INSERT INTO sync_queue (note_id, action, created_at) VALUES (?, ?, ?)',
            [noteId, action, now]
        );
    }

    async getSyncQueue(): Promise<Array<{ id: number; noteId: string; action: string; createdAt: string }>> {
        if (!this.db) throw new Error('Database not initialized');

        const [results] = await this.db.executeSql(
            'SELECT * FROM sync_queue ORDER BY created_at ASC'
        );

        const queue = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            queue.push({
                id: row.id,
                noteId: row.note_id,
                action: row.action,
                createdAt: row.created_at,
            });
        }
        return queue;
    }

    async removeSyncQueueItem(id: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.executeSql('DELETE FROM sync_queue WHERE id = ?', [id]);
    }

    async clearSyncQueue(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.executeSql('DELETE FROM sync_queue');
    }

    // Settings operations
    async getSetting(key: string): Promise<string | null> {
        if (!this.db) throw new Error('Database not initialized');

        const [results] = await this.db.executeSql(
            'SELECT value FROM settings WHERE key = ?',
            [key]
        );

        if (results.rows.length === 0) return null;
        return results.rows.item(0).value;
    }

    async setSetting(key: string, value: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.executeSql(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, value]
        );
    }

    // Bulk operations for sync
    async bulkSaveNotes(notes: Note[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        for (const note of notes) {
            await this.saveNote(note, false);
        }
    }

    async getLastSyncTime(): Promise<string | null> {
        return this.getSetting('lastSyncTime');
    }

    async setLastSyncTime(time: string): Promise<void> {
        await this.setSetting('lastSyncTime', time);
    }

    // Helper to convert database row to Note object
    private rowToNote(row: any): Note {
        return {
            id: row.id,
            title: row.title,
            content: row.content || '',
            tags: row.tags ? JSON.parse(row.tags) : [],
            isPinned: row.is_pinned === 1,
            isArchived: row.is_archived === 1,
            version: row.version,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    // Close database connection
    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}

export const database = new DatabaseService();
