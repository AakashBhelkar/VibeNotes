import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

/**
 * Activity types
 */
export type ActivityType =
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'note_restored'
    | 'note_archived'
    | 'note_unarchived'
    | 'note_pinned'
    | 'note_unpinned'
    | 'note_moved'
    | 'folder_created'
    | 'folder_updated'
    | 'folder_deleted'
    | 'label_created'
    | 'label_assigned'
    | 'label_removed';

/**
 * Activity with details
 */
export interface Activity {
    id: string;
    type: ActivityType;
    userId: string;
    noteId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
    note: {
        id: string;
        title: string;
    } | null;
}

/**
 * Activity statistics
 */
export interface ActivityStats {
    totalActivities: number;
    notesCreated: number;
    notesUpdated: number;
    notesDeleted: number;
}

/**
 * Hook to manage activities
 */
export function useActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch activity feed
     */
    const fetchActivities = useCallback(async (options?: {
        limit?: number;
        offset?: number;
        type?: ActivityType;
    }): Promise<void> => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.offset) params.set('offset', options.offset.toString());
            if (options?.type) params.set('type', options.type);

            const response = await apiClient.get<Activity[]>(`/api/activities?${params.toString()}`);
            setActivities(response.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load activities');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch recent activities
     */
    const fetchRecentActivities = useCallback(async (days: number = 7): Promise<void> => {
        try {
            setIsLoading(true);
            const response = await apiClient.get<Activity[]>(`/api/activities/recent?days=${days}`);
            setActivities(response.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recent activities');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch activities for a specific note
     */
    const fetchNoteActivities = useCallback(async (noteId: string, limit?: number): Promise<Activity[]> => {
        try {
            const params = limit ? `?limit=${limit}` : '';
            const response = await apiClient.get<Activity[]>(`/api/activities/note/${noteId}${params}`);
            return response.data;
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to load note activities');
        }
    }, []);

    /**
     * Fetch activity statistics
     */
    const fetchStats = useCallback(async (): Promise<void> => {
        try {
            const response = await apiClient.get<ActivityStats>('/api/activities/stats');
            setStats(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load activity stats');
        }
    }, []);

    /**
     * Clean up old activities
     */
    const cleanupActivities = useCallback(async (olderThanDays: number = 90): Promise<number> => {
        try {
            const response = await apiClient.delete<{ deleted: number }>(`/api/activities/cleanup?days=${olderThanDays}`);
            await fetchActivities();
            return response.data.deleted;
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to cleanup activities');
        }
    }, [fetchActivities]);

    // Load activities on mount
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return {
        activities,
        stats,
        isLoading,
        error,
        fetchActivities,
        fetchRecentActivities,
        fetchNoteActivities,
        fetchStats,
        cleanupActivities,
    };
}

/**
 * Format activity message for display
 */
export function formatActivityMessage(activity: Activity): string {
    const metadata = activity.metadata;
    const title = (metadata?.title as string) || activity.note?.title || 'a note';

    switch (activity.type) {
        case 'note_created':
            return `Created "${title}"`;
        case 'note_updated':
            return `Updated "${title}"`;
        case 'note_deleted':
            return `Deleted "${title}"`;
        case 'note_restored':
            return `Restored "${title}"`;
        case 'note_archived':
            return `Archived "${title}"`;
        case 'note_unarchived':
            return `Unarchived "${title}"`;
        case 'note_pinned':
            return `Pinned "${title}"`;
        case 'note_unpinned':
            return `Unpinned "${title}"`;
        case 'note_moved':
            const folder = (metadata?.folder as string) || 'All Notes';
            return `Moved "${title}" to ${folder}`;
        case 'folder_created':
            return `Created folder "${metadata?.folderName}"`;
        case 'folder_updated':
            return `Updated folder "${metadata?.folderName}"`;
        case 'folder_deleted':
            return `Deleted folder "${metadata?.folderName}"`;
        case 'label_created':
            return `Created label "${metadata?.labelName}"`;
        case 'label_assigned':
            return `Added label "${metadata?.labelName}" to "${metadata?.noteTitle}"`;
        case 'label_removed':
            return `Removed label "${metadata?.labelName}" from "${metadata?.noteTitle}"`;
        default:
            return `Activity: ${activity.type}`;
    }
}

/**
 * Get icon name for activity type
 */
export function getActivityIcon(type: ActivityType): string {
    switch (type) {
        case 'note_created':
            return 'plus';
        case 'note_updated':
            return 'pencil';
        case 'note_deleted':
            return 'trash';
        case 'note_restored':
            return 'undo';
        case 'note_archived':
            return 'archive';
        case 'note_unarchived':
            return 'inbox';
        case 'note_pinned':
            return 'pin';
        case 'note_unpinned':
            return 'pin-off';
        case 'note_moved':
            return 'folder';
        case 'folder_created':
        case 'folder_updated':
        case 'folder_deleted':
            return 'folder';
        case 'label_created':
        case 'label_assigned':
        case 'label_removed':
            return 'tag';
        default:
            return 'activity';
    }
}
