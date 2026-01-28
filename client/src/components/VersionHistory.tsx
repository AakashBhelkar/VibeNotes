import { useState, useEffect } from 'react';
import { NoteVersion } from '@/lib/db';
import { versionService } from '@/services/versionService';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
    noteId: string;
    onRestore: (version: NoteVersion) => void;
    onClose: () => void;
}

export function VersionHistory({ noteId, onRestore, onClose }: VersionHistoryProps) {
    const [versions, setVersions] = useState<NoteVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVersions();
    }, [noteId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const versionList = await versionService.getVersions(noteId);
            setVersions(versionList);
        } catch {
            // Error handled silently - versions will remain empty
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = (version: NoteVersion) => {
        if (confirm(`Restore to version ${version.version}? This will create a new version with the restored content.`)) {
            onRestore(version);
            onClose();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading versions...</p>
            </div>
        );
    }

    if (versions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Clock className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No version history yet</p>
                <p className="text-sm text-muted-foreground">Versions are saved automatically when you edit this note</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Version History</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Version List */}
                <div className="w-64 border-r">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            {versions.map((version) => (
                                <button
                                    key={version.id}
                                    onClick={() => setSelectedVersion(version)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedVersion?.id === version.id
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">Version {version.version}</span>
                                        {version.id === versions[0].id && (
                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Version Preview */}
                <div className="flex-1 flex flex-col">
                    {selectedVersion ? (
                        <>
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">{selectedVersion.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedVersion.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleRestore(selectedVersion)}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Restore
                                    </Button>
                                </div>
                                {selectedVersion.tags.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {selectedVersion.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-4">
                                    <pre className="whitespace-pre-wrap font-mono text-sm">
                                        {selectedVersion.content}
                                    </pre>
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">Select a version to view</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
