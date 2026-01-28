import { useState, useEffect } from 'react';
import { syncService } from '@/services/syncService';

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

/**
 * Hook to manage sync status
 */
export function useSyncStatus() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncErrors, setSyncErrors] = useState<string[]>([]);
    const isOnline = useOnlineStatus();

    const sync = async () => {
        if (!isOnline) return;

        setIsSyncing(true);
        setSyncErrors([]);

        const result = await syncService.fullSync();

        setIsSyncing(false);
        setLastSyncTime(new Date());
        setSyncErrors(result.errors);
    };

    useEffect(() => {
        // Setup auto-sync on network change
        const cleanup = syncService.setupAutoSync((result) => {
            setLastSyncTime(new Date());
            setSyncErrors(result.errors);
        });

        return cleanup;
    }, []);

    return {
        isOnline,
        isSyncing,
        lastSyncTime,
        syncErrors,
        sync,
    };
}
