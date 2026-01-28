import { useState, useEffect } from 'react';
import { Box, Slide, Typography } from '@mui/material';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Offline indicator component
 * Shows a banner when the app goes offline
 */
export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Show "back online" message briefly
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <Slide direction="down" in={showBanner} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    py: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    bgcolor: isOnline ? '#10b981' : '#f59e0b',
                    color: 'white',
                }}
            >
                {isOnline ? (
                    <>
                        <Wifi className="h-4 w-4" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Back online
                        </Typography>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            You&apos;re offline. Changes will sync when reconnected.
                        </Typography>
                    </>
                )}
            </Box>
        </Slide>
    );
}

/**
 * Hook to get online status
 */
export function useOnlineStatus(): boolean {
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
