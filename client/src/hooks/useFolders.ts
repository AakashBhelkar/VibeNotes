import { useState, useEffect, useCallback } from 'react';
import { db, Folder, FolderWithCounts } from '@/lib/db';
import { authService } from '@/services/authService';
import apiClient from '@/lib/apiClient';

export interface FolderTree extends Folder {
    children: FolderTree[];
    noteCount: number;
}

/**
 * Hook to manage folders with offline storage
 */
export function useFolders() {
    const [folders, setFolders] = useState<FolderWithCounts[]>([]);
    const [folderTree, setFolderTree] = useState<FolderTree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const buildTree = useCallback((flatFolders: FolderWithCounts[]): FolderTree[] => {
        const folderMap = new Map<string, FolderTree>();

        // Create tree nodes
        flatFolders.forEach((f) => {
            folderMap.set(f.id, {
                ...f,
                children: [],
                noteCount: f.noteCount || 0,
            });
        });

        // Build hierarchy
        const rootFolders: FolderTree[] = [];
        flatFolders.forEach((f) => {
            const folder = folderMap.get(f.id)!;
            if (f.parentId && folderMap.has(f.parentId)) {
                folderMap.get(f.parentId)!.children.push(folder);
            } else {
                rootFolders.push(folder);
            }
        });

        // Sort recursively
        const sortChildren = (nodes: FolderTree[]): void => {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            nodes.forEach((node) => sortChildren(node.children));
        };
        sortChildren(rootFolders);

        return rootFolders;
    }, []);

    const loadFolders = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);

            // Try to fetch from server
            try {
                const response = await apiClient.get<FolderWithCounts[]>('/api/folders');
                const serverFolders = response.data;

                // Sync to local storage
                await db.transaction('rw', db.folders, async () => {
                    await db.folders.clear();
                    await db.folders.bulkPut(
                        serverFolders.map((f) => ({
                            ...f,
                            syncedAt: new Date(),
                        }))
                    );
                });

                setFolders(serverFolders);
                setFolderTree(buildTree(serverFolders));
            } catch {
                // Fallback to local storage
                const localFolders = await db.folders.toArray();

                // Calculate counts locally
                const notes = await db.notes.filter((n) => !n.deletedAt).toArray();
                const foldersWithCounts: FolderWithCounts[] = localFolders.map((f) => ({
                    ...f,
                    childCount: localFolders.filter((c) => c.parentId === f.id).length,
                    noteCount: notes.filter((n) => n.folderId === f.id).length,
                }));

                setFolders(foldersWithCounts);
                setFolderTree(buildTree(foldersWithCounts));
            }

            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load folders';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [buildTree]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    const createFolder = useCallback(async (
        name: string,
        parentId: string | null = null
    ): Promise<Folder> => {
        try {
            const user = authService.getUser();
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            // Create on server
            const response = await apiClient.post<Folder>('/api/folders', {
                name,
                parentId,
            });

            const newFolder = response.data;

            // Save locally
            await db.folders.put({
                ...newFolder,
                syncedAt: new Date(),
            });

            await loadFolders();
            return newFolder;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [loadFolders]);

    const updateFolder = useCallback(async (
        id: string,
        updates: { name?: string; parentId?: string | null }
    ): Promise<Folder> => {
        try {
            const response = await apiClient.put<Folder>(`/api/folders/${id}`, updates);
            const updatedFolder = response.data;

            await db.folders.put({
                ...updatedFolder,
                syncedAt: new Date(),
            });

            await loadFolders();
            return updatedFolder;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update folder';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [loadFolders]);

    const deleteFolder = useCallback(async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/folders/${id}`);
            await db.folders.delete(id);
            await loadFolders();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete folder';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [loadFolders]);

    const moveNoteToFolder = useCallback(async (
        noteId: string,
        folderId: string | null
    ): Promise<void> => {
        try {
            await apiClient.put(`/api/folders/notes/${noteId}/move`, { folderId });

            // Update local note
            const note = await db.notes.get(noteId);
            if (note) {
                await db.notes.put({ ...note, folderId });
            }

            await loadFolders();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to move note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [loadFolders]);

    const getFolderById = useCallback((id: string): Folder | undefined => {
        return folders.find((f) => f.id === id);
    }, [folders]);

    const getFolderPath = useCallback((id: string): Folder[] => {
        const path: Folder[] = [];
        let currentId: string | null = id;

        while (currentId) {
            const folder = folders.find((f) => f.id === currentId);
            if (!folder) break;
            path.unshift(folder);
            currentId = folder.parentId;
        }

        return path;
    }, [folders]);

    return {
        folders,
        folderTree,
        isLoading,
        error,
        createFolder,
        updateFolder,
        deleteFolder,
        moveNoteToFolder,
        getFolderById,
        getFolderPath,
        refresh: loadFolders,
    };
}
