import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderPlus, Pencil, Trash2, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFolders, FolderTree as FolderTreeType } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';

interface FolderTreeProps {
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onError?: (error: string) => void;
}

interface FolderNodeProps {
    folder: FolderTreeType;
    level: number;
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onCreateSubfolder: (parentId: string) => void;
    onRenameFolder: (folder: FolderTreeType) => void;
    onDeleteFolder: (folder: FolderTreeType) => void;
}

function FolderNode({
    folder,
    level,
    selectedFolderId,
    onSelectFolder,
    onCreateSubfolder,
    onRenameFolder,
    onDeleteFolder,
}: FolderNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = folder.children.length > 0;
    const isSelected = selectedFolderId === folder.id;

    return (
        <div>
            <div
                className={cn(
                    'flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer group hover:bg-accent',
                    isSelected && 'bg-accent'
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {/* Expand/collapse button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className={cn(
                        'h-4 w-4 flex items-center justify-center',
                        !hasChildren && 'invisible'
                    )}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                </button>

                {/* Folder icon and name */}
                <button
                    onClick={() => onSelectFolder(folder.id)}
                    className="flex-1 flex items-center gap-2 text-sm text-left"
                >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{folder.name}</span>
                    {folder.noteCount > 0 && (
                        <span className="text-xs text-muted-foreground">({folder.noteCount})</span>
                    )}
                </button>

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id)}>
                            <FolderPlus className="h-4 w-4 mr-2" />
                            New Subfolder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDeleteFolder(folder)}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {isExpanded && hasChildren && (
                <div>
                    {folder.children.map((child) => (
                        <FolderNode
                            key={child.id}
                            folder={child}
                            level={level + 1}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                            onCreateSubfolder={onCreateSubfolder}
                            onRenameFolder={onRenameFolder}
                            onDeleteFolder={onDeleteFolder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Folder tree component for hierarchical navigation
 */
export function FolderTree({ selectedFolderId, onSelectFolder, onError }: FolderTreeProps) {
    const { folderTree, createFolder, updateFolder, deleteFolder, isLoading } = useFolders();
    const [isCreating, setIsCreating] = useState(false);
    const [createParentId, setCreateParentId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [renamingFolder, setRenamingFolder] = useState<FolderTreeType | null>(null);
    const [deletingFolder, setDeletingFolder] = useState<FolderTreeType | null>(null);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            await createFolder(newFolderName.trim(), createParentId);
            setNewFolderName('');
            setIsCreating(false);
            setCreateParentId(null);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to create folder');
        }
    };

    const handleRenameFolder = async () => {
        if (!renamingFolder || !renamingFolder.name.trim()) return;

        try {
            await updateFolder(renamingFolder.id, { name: renamingFolder.name.trim() });
            setRenamingFolder(null);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to rename folder');
        }
    };

    const handleDeleteFolder = async () => {
        if (!deletingFolder) return;

        try {
            await deleteFolder(deletingFolder.id);
            if (selectedFolderId === deletingFolder.id) {
                onSelectFolder(null);
            }
            setDeletingFolder(null);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to delete folder');
        }
    };

    const startCreating = (parentId: string | null = null) => {
        setCreateParentId(parentId);
        setIsCreating(true);
        setNewFolderName('');
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium">Folders</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => startCreating(null)}
                    title="New Folder"
                >
                    <FolderPlus className="h-4 w-4" />
                </Button>
            </div>

            {/* All Notes option */}
            <button
                onClick={() => onSelectFolder(null)}
                className={cn(
                    'flex items-center gap-2 w-full py-1 px-2 rounded-md text-sm hover:bg-accent',
                    selectedFolderId === null && 'bg-accent'
                )}
            >
                <FileText className="h-4 w-4 text-muted-foreground" />
                All Notes
            </button>

            {/* Folder tree */}
            {isLoading ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">Loading folders...</div>
            ) : (
                <div>
                    {folderTree.map((folder) => (
                        <FolderNode
                            key={folder.id}
                            folder={folder}
                            level={0}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                            onCreateSubfolder={startCreating}
                            onRenameFolder={setRenamingFolder}
                            onDeleteFolder={setDeletingFolder}
                        />
                    ))}
                </div>
            )}

            {/* Create folder input */}
            {isCreating && (
                <div className="px-2 space-y-2">
                    <Input
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateFolder();
                            if (e.key === 'Escape') {
                                setIsCreating(false);
                                setNewFolderName('');
                            }
                        }}
                        autoFocus
                        className="h-8"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                            Create
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsCreating(false);
                                setNewFolderName('');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Rename dialog */}
            {renamingFolder && (
                <div className="px-2 space-y-2">
                    <Input
                        value={renamingFolder.name}
                        onChange={(e) => setRenamingFolder({ ...renamingFolder, name: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameFolder();
                            if (e.key === 'Escape') setRenamingFolder(null);
                        }}
                        autoFocus
                        className="h-8"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleRenameFolder}>
                            Rename
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRenamingFolder(null)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingFolder?.name}"? This will also delete
                            all subfolders. Notes in these folders will be moved to "All Notes".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFolder}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
