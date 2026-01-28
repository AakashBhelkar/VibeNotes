import { Box, Skeleton, Paper } from '@mui/material';

/**
 * Full page loading skeleton shown during lazy loading
 */
export function PageLoader() {
    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Sidebar skeleton */}
            <Box
                sx={{
                    width: 240,
                    height: '100vh',
                    bgcolor: '#1a1a2e',
                    p: 2,
                    display: { xs: 'none', md: 'block' },
                }}
            >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Skeleton
                        variant="rounded"
                        width={36}
                        height={36}
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                    />
                    <Skeleton
                        variant="text"
                        width={100}
                        height={28}
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                    />
                </Box>

                {/* Nav items */}
                {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1 }}>
                        <Skeleton
                            variant="circular"
                            width={24}
                            height={24}
                            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                        <Skeleton
                            variant="text"
                            width={80}
                            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                    </Box>
                ))}
            </Box>

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top bar skeleton */}
                <Paper
                    elevation={0}
                    sx={{
                        px: 3,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Skeleton variant="rounded" width={300} height={40} />
                    <Box sx={{ flex: 1 }} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Paper>

                {/* Content area skeleton */}
                <Box sx={{ flex: 1, display: 'flex' }}>
                    {/* Notes list panel */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: 320,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            p: 2,
                        }}
                    >
                        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
                        <Skeleton variant="rounded" height={36} sx={{ mb: 2 }} />

                        {/* Note items */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="text" width="60%" height={16} />
                                <Skeleton variant="text" width="40%" height={14} />
                            </Box>
                        ))}
                    </Paper>

                    {/* Editor panel */}
                    <Box sx={{ flex: 1, p: 3 }}>
                        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="75%" />
                        <Skeleton variant="text" width="85%" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

/**
 * Skeleton loader for note list items
 */
export function NoteListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <Box sx={{ p: 2 }}>
            {Array.from({ length: count }).map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={16} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Skeleton variant="rounded" width={50} height={20} />
                        <Skeleton variant="rounded" width={40} height={20} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

/**
 * Skeleton loader for note editor
 */
export function EditorSkeleton() {
    return (
        <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="50%" height={48} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 2, borderRadius: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width={60} height={28} />
                <Skeleton variant="rounded" width={80} height={28} />
                <Skeleton variant="rounded" width={50} height={28} />
            </Box>
        </Box>
    );
}

/**
 * Skeleton loader for attachments
 */
export function AttachmentsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <Box>
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        mb: 1,
                    }}
                >
                    <Skeleton variant="rounded" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" height={20} />
                        <Skeleton variant="text" width="40%" height={14} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
