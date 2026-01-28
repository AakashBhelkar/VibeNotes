import apiClient from '@/lib/apiClient';
import { noteStorage } from './noteStorage';
import { Note, db } from '@/lib/db';

/**
 * Sync service for syncing local changes with server
 * Implements offline-first sync logic from architecture.md
 */
export const syncService = {
    /**
     * Check if online
     */
    isOnline(): boolean {
        return navigator.onLine;
    },

    /**
     * Sync all pending changes to server
     */
    async syncToServer(): Promise<{ success: boolean; errors: string[] }> {
        if (!this.isOnline()) {
            return { success: false, errors: ['Device is offline'] };
        }

        const queue = await noteStorage.getSyncQueue();
        const errors: string[] = [];

        for (const item of queue) {
            try {
                switch (item.action) {
                    case 'CREATE':
                        await apiClient.post('/notes', item.data);
                        break;
                    case 'UPDATE':
                        await apiClient.put(`/notes/${item.noteId}`, item.data);
                        break;
                    case 'DELETE':
                        await apiClient.delete(`/notes/${item.noteId}`);
                        break;
                }

                // Remove from queue on success
                if (item.id) {
                    await noteStorage.removeSyncQueueItem(item.id);
                }
            } catch (error: unknown) {
                const status = error && typeof error === 'object' && 'response' in error
                    ? (error.response as { status?: number })?.status
                    : undefined;

                // If note not found (404), it was likely deleted on server
                // We should remove this action from queue to stop retrying
                if (status === 404) {
                    if (item.id) {
                        await noteStorage.removeSyncQueueItem(item.id);
                    }
                    continue;
                }

                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to sync ${item.action} for note ${item.noteId}: ${errorMessage}`);

                // Increment retry count or remove if max retries exceeded
                if (item.id) {
                    if (item.retryCount < 3) {
                        // Increment retry count for next attempt
                        await db.syncQueue.update(item.id, {
                            retryCount: item.retryCount + 1,
                            timestamp: new Date() // Push to back of queue
                        });
                    } else {
                        // Max retries exceeded, remove from queue to prevent infinite retries
                        await noteStorage.removeSyncQueueItem(item.id);
                        errors.push(`Max retries exceeded for ${item.action} on note ${item.noteId}, removed from queue`);
                    }
                }
            }
        }

        return { success: errors.length === 0, errors };
    },

    /**
     * Sync notes from server to local storage
     */
    async syncFromServer(): Promise<{ success: boolean; error?: string }> {
        if (!this.isOnline()) {
            return { success: false, error: 'Device is offline' };
        }

        try {
            const response = await apiClient.get<Note[]>('/notes');
            await noteStorage.syncFromServer(response.data);
            return { success: true };
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? ((error.response as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Failed to sync from server')
                : 'Failed to sync from server';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    /**
     * Full bidirectional sync
     */
    async fullSync(): Promise<{ success: boolean; errors: string[] }> {
        // First sync local changes to server
        const uploadResult = await this.syncToServer();

        // Then sync server changes to local
        const downloadResult = await this.syncFromServer();

        const errors = [...uploadResult.errors];
        if (downloadResult.error) {
            errors.push(downloadResult.error);
        }

        return { success: errors.length === 0, errors };
    },

    /**
     * Setup auto-sync on network status change
     */
    setupAutoSync(callback?: (result: { success: boolean; errors: string[] }) => void): () => void {
        const handleOnline = async () => {
            const result = await this.fullSync();
            callback?.(result);
        };

        window.addEventListener('online', handleOnline);

        // Return cleanup function
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    },
};
