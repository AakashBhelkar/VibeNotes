import { db, Note, SyncQueueItem } from '@/lib/db';

/**
 * Local storage service for notes
 * Implements offline-first architecture
 */
export const noteStorage = {
    /**
     * Get all notes from local storage (excludes archived and deleted by default)
     */
    async getAll(includeArchived: boolean = false): Promise<Note[]> {
        if (includeArchived) {
            return db.notes
                .filter(note => !note.deletedAt)
                .reverse()
                .sortBy('updatedAt');
        }
        return db.notes
            .filter(note => !note.isArchived && !note.deletedAt)
            .reverse()
            .sortBy('updatedAt');
    },

    /**
     * Get only archived notes (excludes deleted)
     */
    async getArchived(): Promise<Note[]> {
        return db.notes
            .filter(note => note.isArchived && !note.deletedAt)
            .reverse()
            .sortBy('updatedAt');
    },

    /**
     * Get only deleted (trashed) notes
     */
    async getDeleted(): Promise<Note[]> {
        return db.notes
            .filter(note => !!note.deletedAt)
            .reverse()
            .sortBy('updatedAt');
    },

    /**
     * Get a single note by ID
     */
    async getById(id: string): Promise<Note | undefined> {
        return db.notes.get(id);
    },

    /**
     * Create a new note locally
     */
    async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncedAt'>): Promise<Note> {
        const newNote: Note = {
            ...note,
            id: crypto.randomUUID(),
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            // syncedAt is undefined initially
        };

        await db.notes.add(newNote);
        await this.addToSyncQueue('CREATE', newNote.id, newNote);

        return newNote;
    },

    /**
     * Update an existing note locally
     */
    async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
        const existing = await db.notes.get(id);
        if (!existing) return undefined;

        const updated: Note = {
            ...existing,
            ...updates,
            version: existing.version + 1,
            updatedAt: new Date(),
        };

        await db.notes.put(updated);
        await this.addToSyncQueue('UPDATE', id, updates);

        return updated;
    },

    /**
     * Soft delete a note (move to trash)
     */
    async softDelete(id: string): Promise<Note | undefined> {
        const existing = await db.notes.get(id);
        if (!existing) return undefined;

        const updated: Note = {
            ...existing,
            deletedAt: new Date(),
            updatedAt: new Date(),
        };

        await db.notes.put(updated);
        await this.addToSyncQueue('UPDATE', id, { deletedAt: updated.deletedAt });

        return updated;
    },

    /**
     * Restore a note from trash
     */
    async restore(id: string): Promise<Note | undefined> {
        const existing = await db.notes.get(id);
        if (!existing) return undefined;

        const updated: Note = {
            ...existing,
            deletedAt: null,
            updatedAt: new Date(),
        };

        await db.notes.put(updated);
        await this.addToSyncQueue('UPDATE', id, { deletedAt: null });

        return updated;
    },

    /**
     * Permanently delete a note
     */
    async permanentDelete(id: string): Promise<void> {
        await db.notes.delete(id);
        await this.addToSyncQueue('DELETE', id);
    },

    /**
     * @deprecated Use softDelete instead
     */
    async delete(id: string): Promise<void> {
        await this.softDelete(id);
    },

    /**
     * Search notes by query (excludes deleted notes)
     */
    async search(query: string): Promise<Note[]> {
        const lowerQuery = query.toLowerCase();
        return db.notes
            .filter(note =>
                !note.deletedAt &&
                (note.title.toLowerCase().includes(lowerQuery) ||
                note.content.toLowerCase().includes(lowerQuery))
            )
            .toArray();
    },

    /**
     * Filter notes by tag
     */
    async filterByTag(tag: string): Promise<Note[]> {
        return db.notes
            .filter(note => note.tags.includes(tag))
            .toArray();
    },

    /**
     * Sync notes from server
     */
    async syncFromServer(serverNotes: Note[]): Promise<void> {
        await db.transaction('rw', db.notes, async () => {
            for (const serverNote of serverNotes) {
                const localNote = await db.notes.get(serverNote.id);

                // Only update if server version is newer
                if (!localNote || serverNote.version > localNote.version) {
                    await db.notes.put({
                        ...serverNote,
                        syncedAt: new Date(),
                    });
                }
            }
        });
    },

    /**
     * Add an action to the sync queue
     */
    async addToSyncQueue(
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        noteId: string,
        data?: Partial<Note>
    ): Promise<void> {
        await db.syncQueue.add({
            action,
            noteId,
            data,
            timestamp: new Date(),
            retryCount: 0,
        });
    },

    /**
     * Get pending sync queue items
     */
    async getSyncQueue(): Promise<SyncQueueItem[]> {
        return db.syncQueue.orderBy('timestamp').toArray();
    },

    /**
     * Remove item from sync queue
     */
    async removeSyncQueueItem(id: number): Promise<void> {
        await db.syncQueue.delete(id);
    },

    /**
     * Clear all local data
     */
    async clear(): Promise<void> {
        await db.notes.clear();
        await db.syncQueue.clear();
    },
};
