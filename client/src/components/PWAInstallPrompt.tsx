import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, IconButton, Slide } from '@mui/material';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA Install prompt component
 * Shows a banner prompting users to install the app
 */
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed or dismissed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        const wasDismissed = localStorage.getItem('pwa-install-dismissed');

        if (isInstalled || wasDismissed) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || dismissed || !deferredPrompt) {
        return null;
    }

    return (
        <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    maxWidth: 400,
                    mx: 'auto',
                    p: 2,
                    borderRadius: 2,
                    zIndex: 1300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Download className="h-6 w-6 text-white" />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Install VibeNotes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add to home screen for quick access
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    size="small"
                    onClick={handleInstall}
                    sx={{
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                    }}
                >
                    Install
                </Button>

                <IconButton size="small" onClick={handleDismiss}>
                    <X className="h-4 w-4" />
                </IconButton>
            </Paper>
        </Slide>
    );
}

/**
 * Hook to detect if app is running as PWA
 */
export function useIsPWA(): boolean {
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSPWA = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        setIsPWA(isStandalone || isIOSPWA);
    }, []);

    return isPWA;
}
