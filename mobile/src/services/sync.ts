import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { api, Note } from './api';
import { database } from './database';

class SyncService {
    private isSyncing: boolean = false;
    private unsubscribeNetInfo: (() => void) | null = null;

    async init(): Promise<void> {
        // Listen for network changes
        this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
            if (state.isConnected && state.isInternetReachable) {
                this.syncNow();
            }
        });
    }

    async syncNow(): Promise<{ success: boolean; error?: string }> {
        if (this.isSyncing) {
            return { success: false, error: 'Sync already in progress' };
        }

        try {
            this.isSyncing = true;

            // Check network connectivity
            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !netState.isInternetReachable) {
                return { success: false, error: 'No internet connection' };
            }

            // Process sync queue (local changes to push)
            await this.processSyncQueue();

            // Pull remote changes
            await this.pullRemoteChanges();

            // Update last sync time
            await database.setLastSyncTime(new Date().toISOString());

            return { success: true };
        } catch (error: any) {
            console.error('Sync failed:', error);
            return { success: false, error: error.message || 'Sync failed' };
        } finally {
            this.isSyncing = false;
        }
    }

    private async processSyncQueue(): Promise<void> {
        const queue = await database.getSyncQueue();

        for (const item of queue) {
            try {
                const note = await database.getNote(item.noteId);

                switch (item.action) {
                    case 'create':
                        if (note) {
                            const created = await api.createNote(
                                note.title,
                                note.content,
                                note.tags
                            );
                            // Update local note with server ID if different
                            if (created.id !== note.id) {
                                await database.deleteNote(note.id);
                                await database.saveNote(created, false);
                            }
                        }
                        break;

                    case 'update':
                        if (note) {
                            await api.updateNote(note.id, {
                                title: note.title,
                                content: note.content,
                                tags: note.tags,
                                isPinned: note.isPinned,
                                isArchived: note.isArchived,
                            });
                        }
                        break;

                    case 'delete':
                        await api.deleteNote(item.noteId);
                        break;
                }

                // Remove from queue after successful sync
                await database.removeSyncQueueItem(item.id);

                // Mark note as synced
                if (note && item.action !== 'delete') {
                    await database.markNoteSynced(note.id);
                }
            } catch (error) {
                console.error(`Failed to sync item ${item.id}:`, error);
                // Keep item in queue for retry
            }
        }
    }

    private async pullRemoteChanges(): Promise<void> {
        const lastSyncTime = await database.getLastSyncTime();
        const localNotes = await database.getPendingSyncNotes();

        try {
            // Get sync updates from server
            const result = await api.syncNotes(localNotes, lastSyncTime || '');

            if (result.notes) {
                // Process remote notes
                for (const remoteNote of result.notes) {
                    const localNote = await database.getNote(remoteNote.id);

                    if (!localNote) {
                        // New note from server
                        await database.saveNote(remoteNote, false);
                    } else if (remoteNote.version > localNote.version) {
                        // Server has newer version
                        await database.saveNote(remoteNote, false);
                    }
                    // If local version is newer or equal, keep local (will be synced up)
                }

                // Handle deleted notes
                if (result.deletedIds) {
                    for (const deletedId of result.deletedIds) {
                        await database.deleteNote(deletedId);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to pull remote changes:', error);
            throw error;
        }
    }

    async getStatus(): Promise<{
        isOnline: boolean;
        lastSync: string | null;
        pendingCount: number;
    }> {
        const netState = await NetInfo.fetch();
        const lastSync = await database.getLastSyncTime();
        const queue = await database.getSyncQueue();

        return {
            isOnline: !!(netState.isConnected && netState.isInternetReachable),
            lastSync,
            pendingCount: queue.length,
        };
    }

    destroy(): void {
        if (this.unsubscribeNetInfo) {
            this.unsubscribeNetInfo();
            this.unsubscribeNetInfo = null;
        }
    }
}

export const syncService = new SyncService();
