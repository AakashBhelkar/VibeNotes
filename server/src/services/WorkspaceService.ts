import * as WorkspaceRepository from '../repositories/WorkspaceRepository';
import {
    WorkspaceRole,
    WorkspaceRoles,
    WorkspaceWithCounts,
    WorkspaceWithMembers,
} from '../repositories/WorkspaceRepository';

/**
 * Workspace Service
 * Business logic for workspace operations
 */

/**
 * Create a new workspace
 */
export const createWorkspace = async (
    name: string,
    ownerId: string,
    description?: string
): Promise<WorkspaceWithMembers> => {
    if (!name.trim()) {
        throw new Error('Workspace name is required');
    }

    const workspace = await WorkspaceRepository.create({
        name: name.trim(),
        description: description?.trim(),
        ownerId,
    });

    // Fetch the full workspace with members
    const fullWorkspace = await WorkspaceRepository.findById(workspace.id);
    if (!fullWorkspace) {
        throw new Error('Failed to create workspace');
    }

    return fullWorkspace;
};

/**
 * Get workspaces for a user
 */
export const getUserWorkspaces = async (
    userId: string
): Promise<WorkspaceWithCounts[]> => {
    return WorkspaceRepository.findByUserId(userId);
};

/**
 * Get workspace by ID
 */
export const getWorkspace = async (
    workspaceId: string,
    userId: string
): Promise<WorkspaceWithMembers> => {
    // Check access
    const canAccess = await WorkspaceRepository.canAccess(workspaceId, userId);
    if (!canAccess) {
        throw new Error('Workspace not found or access denied');
    }

    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
        throw new Error('Workspace not found');
    }

    return workspace;
};

/**
 * Update workspace
 */
export const updateWorkspace = async (
    workspaceId: string,
    userId: string,
    data: {
        name?: string;
        description?: string;
    }
): Promise<WorkspaceWithMembers> => {
    // Check admin access
    const isAdmin = await WorkspaceRepository.isAdmin(workspaceId, userId);
    if (!isAdmin) {
        throw new Error('Only admins can update workspace settings');
    }

    await WorkspaceRepository.update(workspaceId, {
        name: data.name?.trim(),
        description: data.description?.trim(),
    });

    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (!workspace) {
        throw new Error('Workspace not found');
    }

    return workspace;
};

/**
 * Delete workspace
 */
export const deleteWorkspace = async (
    workspaceId: string,
    userId: string
): Promise<void> => {
    const workspace = await WorkspaceRepository.findById(workspaceId);

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    // Only owner can delete workspace
    if (workspace.owner.id !== userId) {
        throw new Error('Only the workspace owner can delete the workspace');
    }

    await WorkspaceRepository.remove(workspaceId);
};

/**
 * Invite member to workspace
 */
export const inviteMember = async (
    workspaceId: string,
    inviterId: string,
    email: string,
    role: WorkspaceRole = WorkspaceRoles.EDITOR
): Promise<{ userId: string; email: string; displayName: string | null; role: WorkspaceRole }> => {
    // Check inviter is admin
    const isAdmin = await WorkspaceRepository.isAdmin(workspaceId, inviterId);
    if (!isAdmin) {
        throw new Error('Only admins can invite members');
    }

    // Find user by email
    const user = await WorkspaceRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('User not found with that email');
    }

    // Check if user is already a member
    const existingRole = await WorkspaceRepository.getUserRole(workspaceId, user.id);
    if (existingRole) {
        throw new Error('User is already a member of this workspace');
    }

    // Add member
    await WorkspaceRepository.addMember(workspaceId, user.id, role);

    return {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        role,
    };
};

/**
 * Update member role
 */
export const updateMemberRole = async (
    workspaceId: string,
    adminId: string,
    memberId: string,
    newRole: WorkspaceRole
): Promise<void> => {
    // Check admin access
    const isAdmin = await WorkspaceRepository.isAdmin(workspaceId, adminId);
    if (!isAdmin) {
        throw new Error('Only admins can change member roles');
    }

    // Can't change owner's role
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (workspace?.owner.id === memberId) {
        throw new Error("Cannot change the owner's role");
    }

    await WorkspaceRepository.updateMemberRole(workspaceId, memberId, newRole);
};

/**
 * Remove member from workspace
 */
export const removeMember = async (
    workspaceId: string,
    adminId: string,
    memberId: string
): Promise<void> => {
    // Check admin access (or user removing themselves)
    const isAdmin = await WorkspaceRepository.isAdmin(workspaceId, adminId);
    const isSelf = adminId === memberId;

    if (!isAdmin && !isSelf) {
        throw new Error('Only admins can remove members');
    }

    // Can't remove owner
    const workspace = await WorkspaceRepository.findById(workspaceId);
    if (workspace?.owner.id === memberId) {
        throw new Error('Cannot remove the workspace owner');
    }

    await WorkspaceRepository.removeMember(workspaceId, memberId);
};

/**
 * Leave workspace
 */
export const leaveWorkspace = async (
    workspaceId: string,
    userId: string
): Promise<void> => {
    const workspace = await WorkspaceRepository.findById(workspaceId);

    if (!workspace) {
        throw new Error('Workspace not found');
    }

    // Owner can't leave, they must delete or transfer ownership
    if (workspace.owner.id === userId) {
        throw new Error('Owner cannot leave the workspace. Transfer ownership or delete the workspace.');
    }

    await WorkspaceRepository.removeMember(workspaceId, userId);
};

/**
 * Get user's role in workspace
 */
export const getUserRole = async (
    workspaceId: string,
    userId: string
): Promise<WorkspaceRole | null> => {
    return WorkspaceRepository.getUserRole(workspaceId, userId);
};

/**
 * Check if user can access workspace
 */
export const canAccess = async (
    workspaceId: string,
    userId: string
): Promise<boolean> => {
    return WorkspaceRepository.canAccess(workspaceId, userId);
};

/**
 * Check if user can edit in workspace
 */
export const canEdit = async (
    workspaceId: string,
    userId: string
): Promise<boolean> => {
    return WorkspaceRepository.canEdit(workspaceId, userId);
};

/**
 * Get workspace notes
 */
export const getWorkspaceNotes = async (
    workspaceId: string,
    userId: string,
    options?: { limit?: number; offset?: number }
) => {
    // Check access
    const canAccess = await WorkspaceRepository.canAccess(workspaceId, userId);
    if (!canAccess) {
        throw new Error('Workspace not found or access denied');
    }

    return WorkspaceRepository.getWorkspaceNotes(workspaceId, options);
};

/**
 * Move note to workspace
 */
export const moveNoteToWorkspace = async (
    noteId: string,
    workspaceId: string | null,
    userId: string
): Promise<void> => {
    // If moving to a workspace, check edit access
    if (workspaceId) {
        const canEdit = await WorkspaceRepository.canEdit(workspaceId, userId);
        if (!canEdit) {
            throw new Error('You do not have permission to add notes to this workspace');
        }
    }

    await WorkspaceRepository.moveNoteToWorkspace(noteId, workspaceId);
};
