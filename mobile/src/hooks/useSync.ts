import { useCallback, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncService } from '../services/sync';

interface SyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: string | null;
    pendingCount: number;
    error: string | null;
}

export function useSync() {
    const [state, setState] = useState<SyncState>({
        isOnline: false,
        isSyncing: false,
        lastSync: null,
        pendingCount: 0,
        error: null,
    });

    useEffect(() => {
        // Initial status check
        updateStatus();

        // Subscribe to network changes
        const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
            setState((prev) => ({
                ...prev,
                isOnline: !!(netState.isConnected && netState.isInternetReachable),
            }));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const updateStatus = useCallback(async () => {
        const status = await syncService.getStatus();
        setState((prev) => ({
            ...prev,
            isOnline: status.isOnline,
            lastSync: status.lastSync,
            pendingCount: status.pendingCount,
        }));
    }, []);

    const sync = useCallback(async () => {
        if (state.isSyncing) return;

        setState((prev) => ({ ...prev, isSyncing: true, error: null }));

        try {
            const result = await syncService.syncNow();
            if (!result.success) {
                setState((prev) => ({ ...prev, error: result.error || 'Sync failed' }));
            }
            await updateStatus();
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                error: error.message || 'Sync failed',
            }));
        } finally {
            setState((prev) => ({ ...prev, isSyncing: false }));
        }
    }, [state.isSyncing, updateStatus]);

    const formatLastSync = useCallback(() => {
        if (!state.lastSync) return 'Never synced';

        const lastSyncDate = new Date(state.lastSync);
        const now = new Date();
        const diffMs = now.getTime() - lastSyncDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }, [state.lastSync]);

    return {
        ...state,
        sync,
        updateStatus,
        formatLastSync,
    };
}
