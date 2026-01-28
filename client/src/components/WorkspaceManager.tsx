import { useState } from 'react';
import {
    Users,
    Plus,
    Settings,
    Trash2,
    UserPlus,
    Crown,
    Edit2,
    Eye,
    LogOut,
    X,
    MoreVertical,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    useWorkspaces,
    WorkspaceWithCounts,
    WorkspaceWithMembers,
    WorkspaceRole,
    WorkspaceMember,
} from '@/hooks/useWorkspaces';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

interface WorkspaceManagerProps {
    onClose: () => void;
    onSelectWorkspace?: (workspaceId: string | null) => void;
}

/**
 * Get role icon
 */
function getRoleIcon(role: WorkspaceRole) {
    switch (role) {
        case 'admin':
            return Crown;
        case 'editor':
            return Edit2;
        case 'viewer':
            return Eye;
    }
}

/**
 * Format role display name
 */
function formatRole(role: WorkspaceRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Workspace Manager component
 */
export function WorkspaceManager({ onClose, onSelectWorkspace }: WorkspaceManagerProps) {
    const {
        workspaces,
        isLoading,
        error,
        createWorkspace,
        getWorkspace,
        updateWorkspace,
        deleteWorkspace,
        inviteMember,
        updateMemberRole,
        removeMember,
        leaveWorkspace,
    } = useWorkspaces();

    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceWithMembers | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = authService.getUser();
    const currentUserId = currentUser?.id || '';

    const handleSelectWorkspace = async (workspace: WorkspaceWithCounts) => {
        const fullWorkspace = await getWorkspace(workspace.id);
        setSelectedWorkspace(fullWorkspace);
    };

    const handleCreateWorkspace = async () => {
        if (!name.trim()) {
            setFormError('Workspace name is required');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        const workspace = await createWorkspace(name.trim(), description.trim() || undefined);

        if (workspace) {
            setIsCreating(false);
            setName('');
            setDescription('');
            setSelectedWorkspace(workspace);
        } else {
            setFormError(error || 'Failed to create workspace');
        }

        setIsSubmitting(false);
    };

    const handleUpdateWorkspace = async () => {
        if (!selectedWorkspace || !name.trim()) {
            setFormError('Workspace name is required');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        const updated = await updateWorkspace(selectedWorkspace.id, {
            name: name.trim(),
            description: description.trim() || undefined,
        });

        if (updated) {
            setSelectedWorkspace(updated);
            setIsEditing(false);
        } else {
            setFormError(error || 'Failed to update workspace');
        }

        setIsSubmitting(false);
    };

    const handleDeleteWorkspace = async () => {
        if (!deleteConfirm) return;

        const success = await deleteWorkspace(deleteConfirm);
        if (success) {
            setDeleteConfirm(null);
            setSelectedWorkspace(null);
        }
    };

    const handleLeaveWorkspace = async () => {
        if (!leaveConfirm) return;

        const success = await leaveWorkspace(leaveConfirm);
        if (success) {
            setLeaveConfirm(null);
            setSelectedWorkspace(null);
        }
    };

    const handleInviteMember = async () => {
        if (!selectedWorkspace || !inviteEmail.trim()) {
            setFormError('Email is required');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        const success = await inviteMember(selectedWorkspace.id, inviteEmail.trim(), inviteRole);

        if (success) {
            setIsInviting(false);
            setInviteEmail('');
            setInviteRole('editor');
            // Refresh workspace to show new member
            const updated = await getWorkspace(selectedWorkspace.id);
            setSelectedWorkspace(updated);
        } else {
            setFormError(error || 'Failed to invite member');
        }

        setIsSubmitting(false);
    };

    const handleUpdateRole = async (member: WorkspaceMember, newRole: WorkspaceRole) => {
        if (!selectedWorkspace) return;

        const success = await updateMemberRole(selectedWorkspace.id, member.userId, newRole);
        if (success) {
            const updated = await getWorkspace(selectedWorkspace.id);
            setSelectedWorkspace(updated);
        }
    };

    const handleRemoveMember = async (member: WorkspaceMember) => {
        if (!selectedWorkspace) return;

        const success = await removeMember(selectedWorkspace.id, member.userId);
        if (success) {
            const updated = await getWorkspace(selectedWorkspace.id);
            setSelectedWorkspace(updated);
        }
    };

    const startEditing = () => {
        if (selectedWorkspace) {
            setName(selectedWorkspace.name);
            setDescription(selectedWorkspace.description || '');
            setIsEditing(true);
        }
    };

    const isOwner = selectedWorkspace?.owner.id === currentUserId;
    const currentMember = selectedWorkspace?.members.find(m => m.userId === currentUserId);
    const isAdmin = currentMember?.role === 'admin' || isOwner;

    return (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Workspaces</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Workspace
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Workspace list */}
                <div className="w-80 border-r">
                    <ScrollArea className="h-full">
                        {isLoading ? (
                            <div className="p-4 text-center text-muted-foreground">
                                Loading workspaces...
                            </div>
                        ) : workspaces.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No workspaces yet</p>
                                <p className="text-sm">Create one to start collaborating</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {workspaces.map((workspace) => (
                                    <button
                                        key={workspace.id}
                                        onClick={() => handleSelectWorkspace(workspace)}
                                        className={cn(
                                            'w-full text-left p-3 rounded-lg transition-colors',
                                            selectedWorkspace?.id === workspace.id
                                                ? 'bg-accent'
                                                : 'hover:bg-accent/50'
                                        )}
                                    >
                                        <div className="font-medium truncate">{workspace.name}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {workspace._count.members}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {workspace._count.notes}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Workspace details */}
                <div className="flex-1 overflow-hidden">
                    {selectedWorkspace ? (
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Workspace header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">{selectedWorkspace.name}</h3>
                                        {selectedWorkspace.description && (
                                            <p className="text-muted-foreground mt-1">
                                                {selectedWorkspace.description}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Created by {selectedWorkspace.owner.displayName || selectedWorkspace.owner.email}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onSelectWorkspace && (
                                                <DropdownMenuItem onClick={() => {
                                                    onSelectWorkspace(selectedWorkspace.id);
                                                    onClose();
                                                }}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Notes
                                                </DropdownMenuItem>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <DropdownMenuItem onClick={startEditing}>
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setIsInviting(true)}>
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Invite Member
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator />
                                            {isOwner ? (
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteConfirm(selectedWorkspace.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Workspace
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => setLeaveConfirm(selectedWorkspace.id)}
                                                    className="text-destructive"
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Leave Workspace
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Members list */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium">Members ({selectedWorkspace.members.length})</h4>
                                        {isAdmin && (
                                            <Button variant="outline" size="sm" onClick={() => setIsInviting(true)}>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Invite
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {/* Owner */}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                {(selectedWorkspace.owner.displayName || selectedWorkspace.owner.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {selectedWorkspace.owner.displayName || selectedWorkspace.owner.email}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {selectedWorkspace.owner.email}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Crown className="h-4 w-4" />
                                                <span className="text-sm">Owner</span>
                                            </div>
                                        </div>

                                        {/* Members */}
                                        {selectedWorkspace.members
                                            .filter(m => m.userId !== selectedWorkspace.owner.id)
                                            .map((member) => {
                                                const RoleIcon = getRoleIcon(member.role);
                                                return (
                                                    <div
                                                        key={member.userId}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            {(member.user.displayName || member.user.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">
                                                                {member.user.displayName || member.user.email}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                {member.user.email}
                                                            </div>
                                                        </div>
                                                        {isAdmin ? (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <RoleIcon className="h-4 w-4 mr-2" />
                                                                        {formatRole(member.role)}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleUpdateRole(member, 'admin')}>
                                                                        <Crown className="h-4 w-4 mr-2" />
                                                                        Admin
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleUpdateRole(member, 'editor')}>
                                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                                        Editor
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleUpdateRole(member, 'viewer')}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Viewer
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleRemoveMember(member)}
                                                                        className="text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Remove
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <RoleIcon className="h-4 w-4" />
                                                                <span className="text-sm">{formatRole(member.role)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Select a workspace to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create workspace dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Workspace</DialogTitle>
                        <DialogDescription>
                            Create a new workspace to collaborate with others
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Workspace name"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description (optional)</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the workspace"
                                rows={3}
                            />
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateWorkspace} disabled={isSubmitting}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit workspace dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Workspace Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Workspace name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the workspace"
                                rows={3}
                            />
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateWorkspace} disabled={isSubmitting}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite member dialog */}
            <Dialog open={isInviting} onOpenChange={setIsInviting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogDescription>
                            Invite someone to join this workspace
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="user@example.com"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Role</label>
                            <Select value={inviteRole} onValueChange={(v: string) => setInviteRole(v as WorkspaceRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin - Full access</SelectItem>
                                    <SelectItem value="editor">Editor - Can edit notes</SelectItem>
                                    <SelectItem value="viewer">Viewer - Read only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviting(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInviteMember} disabled={isSubmitting}>
                            Invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this workspace? This will remove all members and
                            notes in the workspace will be moved to their original owners. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteWorkspace}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Leave confirmation */}
            <AlertDialog open={!!leaveConfirm} onOpenChange={(open) => !open && setLeaveConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave Workspace</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave this workspace? You will lose access to all shared notes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveWorkspace}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
