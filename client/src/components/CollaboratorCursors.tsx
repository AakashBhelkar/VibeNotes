import { Users } from 'lucide-react';
import { Collaborator } from '@/hooks/useCollaboration';
import { cn } from '@/lib/utils';

interface CollaboratorCursorsProps {
    collaborators: Collaborator[];
    className?: string;
}

/**
 * Display collaborator avatars
 */
export function CollaboratorAvatars({ collaborators, className }: CollaboratorCursorsProps) {
    if (collaborators.length === 0) return null;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
                {collaborators.slice(0, 5).map((collaborator) => (
                    <div
                        key={collaborator.odcId}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-background"
                        style={{ backgroundColor: collaborator.color }}
                        title={collaborator.name}
                    >
                        {collaborator.name.charAt(0).toUpperCase()}
                    </div>
                ))}
                {collaborators.length > 5 && (
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-muted text-muted-foreground border-2 border-background"
                        title={`${collaborators.length - 5} more`}
                    >
                        +{collaborators.length - 5}
                    </div>
                )}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
                {collaborators.length} {collaborators.length === 1 ? 'user' : 'users'} editing
            </span>
        </div>
    );
}

interface CollaborationStatusProps {
    isConnected: boolean;
    isCollaborating: boolean;
    collaborators: Collaborator[];
    error: string | null;
}

/**
 * Collaboration status indicator
 */
export function CollaborationStatus({
    isConnected,
    isCollaborating,
    collaborators,
    error,
}: CollaborationStatusProps) {
    if (error) {
        return (
            <div className="flex items-center gap-2 text-xs text-destructive">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span>Connection error</span>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                <span>Connecting...</span>
            </div>
        );
    }

    if (isCollaborating && collaborators.length > 0) {
        return <CollaboratorAvatars collaborators={collaborators} />;
    }

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Connected</span>
        </div>
    );
}

interface CursorOverlayProps {
    collaborators: Collaborator[];
    getPositionFromOffset: (offset: number) => { top: number; left: number } | null;
}

/**
 * Overlay showing remote cursors in the editor
 */
export function CursorOverlay({ collaborators, getPositionFromOffset }: CursorOverlayProps) {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {collaborators.map((collaborator) => {
                if (!collaborator.cursor) return null;

                const position = getPositionFromOffset(collaborator.cursor.position);
                if (!position) return null;

                return (
                    <div
                        key={collaborator.odcId}
                        className="absolute transition-all duration-100"
                        style={{
                            top: position.top,
                            left: position.left,
                        }}
                    >
                        {/* Cursor line */}
                        <div
                            className="w-0.5 h-5"
                            style={{ backgroundColor: collaborator.color }}
                        />
                        {/* Name tag */}
                        <div
                            className="absolute -top-5 left-0 px-1 py-0.5 rounded text-xs text-white whitespace-nowrap"
                            style={{ backgroundColor: collaborator.color }}
                        >
                            {collaborator.name}
                        </div>
                        {/* Selection highlight */}
                        {collaborator.cursor.selection && (
                            <div
                                className="absolute h-5 opacity-20"
                                style={{
                                    backgroundColor: collaborator.color,
                                    // Width would be calculated based on selection
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
