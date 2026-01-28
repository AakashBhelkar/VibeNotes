import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { AttachmentService, StorageUsage } from '@/services/attachmentService';

/**
 * Component for displaying user's storage usage
 */
export function StorageQuotaDisplay() {
    const [usage, setUsage] = useState<StorageUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStorageUsage();
    }, []);

    const loadStorageUsage = async () => {
        try {
            const token = localStorage.getItem('vibenote-token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const data = await AttachmentService.getStorageUsage(token);
            setUsage(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load storage usage';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Storage Usage</span>
                        </div>
                        <div className="h-2 bg-muted rounded animate-pulse" />
                        <p className="text-xs text-muted-foreground">Loading...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Storage Usage</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p>Failed to load storage information.</p>
                                <button
                                    onClick={loadStorageUsage}
                                    className="underline hover:no-underline mt-1"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!usage) {
        return null;
    }

    const usagePercentage = (usage.usage.totalBytes / usage.limit.totalBytes) * 100;
    const isNearLimit = usagePercentage >= 80;

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Storage Usage</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {usage.usage.totalMB.toFixed(2)} MB / {usage.limit.totalMB} MB
                        </span>
                    </div>

                    <Progress
                        value={usagePercentage}
                        className={isNearLimit ? 'bg-destructive/20' : ''}
                    />

                    {isNearLimit && (
                        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>
                                You're running low on storage space. Consider deleting some attachments
                                or upgrading your plan.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
