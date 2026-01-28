import { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Undo2,
    Archive,
    Inbox,
    Pin,
    PinOff,
    Folder,
    Tag,
    Activity,
    Clock,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useActivities,
    Activity as ActivityType,
    formatActivityMessage,
    ActivityType as ActivityTypeEnum,
} from '@/hooks/useActivities';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
    onClose: () => void;
    onSelectNote?: (noteId: string) => void;
}

/**
 * Get icon component for activity type
 */
function getActivityIcon(type: ActivityTypeEnum) {
    switch (type) {
        case 'note_created':
            return Plus;
        case 'note_updated':
            return Pencil;
        case 'note_deleted':
            return Trash2;
        case 'note_restored':
            return Undo2;
        case 'note_archived':
            return Archive;
        case 'note_unarchived':
            return Inbox;
        case 'note_pinned':
            return Pin;
        case 'note_unpinned':
            return PinOff;
        case 'note_moved':
        case 'folder_created':
        case 'folder_updated':
        case 'folder_deleted':
            return Folder;
        case 'label_created':
        case 'label_assigned':
        case 'label_removed':
            return Tag;
        default:
            return Activity;
    }
}

/**
 * Get color for activity type
 */
function getActivityColor(type: ActivityTypeEnum): string {
    switch (type) {
        case 'note_created':
            return 'text-green-500';
        case 'note_deleted':
            return 'text-red-500';
        case 'note_archived':
            return 'text-amber-500';
        case 'note_pinned':
            return 'text-blue-500';
        default:
            return 'text-muted-foreground';
    }
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

/**
 * Group activities by date
 */
function groupActivitiesByDate(activities: ActivityType[]): Map<string, ActivityType[]> {
    const groups = new Map<string, ActivityType[]>();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    activities.forEach((activity) => {
        const dateStr = new Date(activity.createdAt).toDateString();
        let label: string;

        if (dateStr === today) {
            label = 'Today';
        } else if (dateStr === yesterday) {
            label = 'Yesterday';
        } else {
            label = new Date(activity.createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            });
        }

        if (!groups.has(label)) {
            groups.set(label, []);
        }
        groups.get(label)!.push(activity);
    });

    return groups;
}

/**
 * Activity Feed component showing recent user activity
 */
export function ActivityFeed({ onClose, onSelectNote }: ActivityFeedProps) {
    const { activities, isLoading, error, fetchActivities, fetchRecentActivities, fetchStats, stats } = useActivities();
    const [filter, setFilter] = useState<'all' | 'recent'>('recent');

    useEffect(() => {
        if (filter === 'recent') {
            fetchRecentActivities(7);
        } else {
            fetchActivities({ limit: 100 });
        }
        fetchStats();
    }, [filter, fetchActivities, fetchRecentActivities, fetchStats]);

    const groupedActivities = groupActivitiesByDate(activities);

    const handleActivityClick = (activity: ActivityType) => {
        if (activity.noteId && onSelectNote) {
            onSelectNote(activity.noteId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Activity Feed</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.totalActivities}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{stats.notesCreated}</div>
                        <div className="text-xs text-muted-foreground">Created</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{stats.notesUpdated}</div>
                        <div className="text-xs text-muted-foreground">Updated</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{stats.notesDeleted}</div>
                        <div className="text-xs text-muted-foreground">Deleted</div>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 p-4 border-b">
                <Button
                    variant={filter === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('recent')}
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Last 7 Days
                </Button>
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                >
                    All Activity
                </Button>
            </div>

            {/* Activity list */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        Loading activities...
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-32 text-destructive">
                        {error}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Activity className="h-8 w-8 mb-2" />
                        <p>No activities yet</p>
                        <p className="text-sm">Start creating and editing notes to see your activity here</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {Array.from(groupedActivities.entries()).map(([date, dateActivities]) => (
                            <div key={date}>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                                <div className="space-y-2">
                                    {dateActivities.map((activity) => {
                                        const Icon = getActivityIcon(activity.type);
                                        const colorClass = getActivityColor(activity.type);
                                        const message = formatActivityMessage(activity);

                                        return (
                                            <button
                                                key={activity.id}
                                                onClick={() => handleActivityClick(activity)}
                                                className={cn(
                                                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                                                    activity.noteId
                                                        ? 'hover:bg-accent cursor-pointer'
                                                        : 'cursor-default'
                                                )}
                                                disabled={!activity.noteId}
                                            >
                                                <div className={cn('mt-0.5', colorClass)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">{message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatRelativeTime(activity.createdAt)}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t text-sm text-muted-foreground">
                <p>Click on an activity to open the related note</p>
            </div>
        </div>
    );
}
