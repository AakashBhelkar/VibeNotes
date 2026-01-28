import { db, ColorLabel, NoteColorLabel, ColorLabelSyncQueueItem } from '@/lib/db';
import apiClient from '@/lib/apiClient';

/**
 * Local storage service for color labels
 * Implements offline-first architecture
 */
export const colorLabelStorage = {
    /**
     * Get all color labels from local storage
     */
    async getAll(): Promise<ColorLabel[]> {
        return db.colorLabels.orderBy('name').toArray();
    },

    /**
     * Get a single color label by ID
     */
    async getById(id: string): Promise<ColorLabel | undefined> {
        return db.colorLabels.get(id);
    },

    /**
     * Create a new color label locally
     */
    async create(label: Omit<ColorLabel, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt'>): Promise<ColorLabel> {
        const newLabel: ColorLabel = {
            ...label,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.colorLabels.add(newLabel);
        await this.addToSyncQueue('CREATE', newLabel.id, newLabel);

        return newLabel;
    },

    /**
     * Update an existing color label locally
     */
    async update(id: string, updates: Partial<ColorLabel>): Promise<ColorLabel | undefined> {
        const existing = await db.colorLabels.get(id);
        if (!existing) return undefined;

        const updated: ColorLabel = {
            ...existing,
            ...updates,
            updatedAt: new Date(),
        };

        await db.colorLabels.put(updated);
        await this.addToSyncQueue('UPDATE', id, updates);

        return updated;
    },

    /**
     * Delete a color label
     */
    async delete(id: string): Promise<void> {
        // Remove all note associations first
        await db.noteColorLabels.where('colorLabelId').equals(id).delete();
        await db.colorLabels.delete(id);
        await this.addToSyncQueue('DELETE', id);
    },

    /**
     * Get all labels assigned to a note
     */
    async getLabelsForNote(noteId: string): Promise<ColorLabel[]> {
        const associations = await db.noteColorLabels.where('noteId').equals(noteId).toArray();
        const labelIds = associations.map(a => a.colorLabelId);
        const labels = await db.colorLabels.bulkGet(labelIds);
        return labels.filter((l): l is ColorLabel => l !== undefined);
    },

    /**
     * Get all notes that have a specific label
     */
    async getNotesWithLabel(colorLabelId: string): Promise<string[]> {
        const associations = await db.noteColorLabels.where('colorLabelId').equals(colorLabelId).toArray();
        return associations.map(a => a.noteId);
    },

    /**
     * Assign a label to a note
     */
    async assignLabelToNote(noteId: string, colorLabelId: string): Promise<void> {
        const existing = await db.noteColorLabels.get([noteId, colorLabelId]);
        if (existing) return; // Already assigned

        const association: NoteColorLabel = {
            noteId,
            colorLabelId,
            assignedAt: new Date(),
        };

        await db.noteColorLabels.add(association);
        await this.addToSyncQueue('ASSIGN', colorLabelId, undefined, noteId);
    },

    /**
     * Remove a label from a note
     */
    async removeLabelFromNote(noteId: string, colorLabelId: string): Promise<void> {
        await db.noteColorLabels.delete([noteId, colorLabelId]);
        await this.addToSyncQueue('UNASSIGN', colorLabelId, undefined, noteId);
    },

    /**
     * Update all labels for a note (replace existing)
     */
    async updateNoteLabels(noteId: string, labelIds: string[]): Promise<void> {
        await db.transaction('rw', db.noteColorLabels, async () => {
            // Remove all existing associations for this note
            await db.noteColorLabels.where('noteId').equals(noteId).delete();

            // Add new associations
            const associations: NoteColorLabel[] = labelIds.map(colorLabelId => ({
                noteId,
                colorLabelId,
                assignedAt: new Date(),
            }));

            await db.noteColorLabels.bulkAdd(associations);
        });

        // Add sync queue items for each label
        for (const labelId of labelIds) {
            await this.addToSyncQueue('ASSIGN', labelId, undefined, noteId);
        }
    },

    /**
     * Sync color labels from server
     */
    async syncFromServer(serverLabels: ColorLabel[]): Promise<void> {
        await db.transaction('rw', db.colorLabels, async () => {
            for (const serverLabel of serverLabels) {
                const localLabel = await db.colorLabels.get(serverLabel.id);

                // Only update if server version is newer
                if (!localLabel || new Date(serverLabel.updatedAt) > new Date(localLabel.updatedAt)) {
                    await db.colorLabels.put({
                        ...serverLabel,
                        syncedAt: new Date(),
                    });
                }
            }
        });
    },

    /**
     * Sync note-label associations from server
     */
    async syncNoteLabelsFromServer(noteId: string, labelIds: string[]): Promise<void> {
        await db.transaction('rw', db.noteColorLabels, async () => {
            // Remove all existing associations for this note
            await db.noteColorLabels.where('noteId').equals(noteId).delete();

            // Add server associations
            const associations: NoteColorLabel[] = labelIds.map(colorLabelId => ({
                noteId,
                colorLabelId,
                assignedAt: new Date(),
            }));

            await db.noteColorLabels.bulkAdd(associations);
        });
    },

    /**
     * Add an action to the sync queue
     */
    async addToSyncQueue(
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'UNASSIGN',
        colorLabelId: string,
        data?: Partial<ColorLabel>,
        noteId?: string
    ): Promise<void> {
        await db.colorLabelSyncQueue.add({
            action,
            colorLabelId,
            noteId,
            data,
            timestamp: new Date(),
            retryCount: 0,
        });
    },

    /**
     * Get pending sync queue items
     */
    async getSyncQueue(): Promise<ColorLabelSyncQueueItem[]> {
        return db.colorLabelSyncQueue.orderBy('timestamp').toArray();
    },

    /**
     * Remove item from sync queue
     */
    async removeSyncQueueItem(id: number): Promise<void> {
        await db.colorLabelSyncQueue.delete(id);
    },

    /**
     * Clear all local color label data
     */
    async clear(): Promise<void> {
        await db.colorLabels.clear();
        await db.noteColorLabels.clear();
        await db.colorLabelSyncQueue.clear();
    },

    /**
     * Fetch labels from server and sync to local storage
     */
    async fetchAndSync(): Promise<ColorLabel[]> {
        try {
            const response = await apiClient.get<ColorLabel[]>('/api/color-labels');
            await this.syncFromServer(response.data);
            return response.data;
        } catch (error) {
            // If offline, return local data
            return this.getAll();
        }
    },

    /**
     * Sync a single label to the server
     */
    async syncLabelToServer(label: ColorLabel): Promise<void> {
        await apiClient.post('/api/color-labels', {
            name: label.name,
            color: label.color,
        });
    },

    /**
     * Update a label on the server
     */
    async updateLabelOnServer(id: string, updates: Partial<ColorLabel>): Promise<void> {
        await apiClient.put(`/api/color-labels/${id}`, updates);
    },

    /**
     * Delete a label from the server
     */
    async deleteLabelFromServer(id: string): Promise<void> {
        await apiClient.delete(`/api/color-labels/${id}`);
    },
};

/**
 * Default color palette for quick selection
 */
export const DEFAULT_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
];
