import prisma from '../config/db';
import { Workspace, WorkspaceMember } from '@prisma/client';

/**
 * Workspace Repository
 * Handles database operations for workspaces
 */

// Workspace roles
export const WorkspaceRoles = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
} as const;

export type WorkspaceRole = typeof WorkspaceRoles[keyof typeof WorkspaceRoles];

// Workspace with member count
export interface WorkspaceWithCounts extends Workspace {
    _count: {
        members: number;
        notes: number;
    };
}

// Workspace member with user info
export interface WorkspaceMemberWithUser extends WorkspaceMember {
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
}

// Full workspace with members
export interface WorkspaceWithMembers extends Workspace {
    owner: {
        id: string;
        email: string;
        displayName: string | null;
    };
    members: WorkspaceMemberWithUser[];
    _count: {
        notes: number;
    };
}

/**
 * Create a new workspace
 */
export const create = async (data: {
    name: string;
    description?: string;
    ownerId: string;
}): Promise<Workspace> => {
    return prisma.workspace.create({
        data: {
            name: data.name,
            description: data.description,
            ownerId: data.ownerId,
            // Automatically add owner as admin member
            members: {
                create: {
                    userId: data.ownerId,
                    role: WorkspaceRoles.ADMIN,
                },
            },
        },
    });
};

/**
 * Find workspace by ID
 */
export const findById = async (id: string): Promise<WorkspaceWithMembers | null> => {
    return prisma.workspace.findUnique({
        where: { id },
        include: {
            owner: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                        },
                    },
                },
            },
            _count: {
                select: { notes: true },
            },
        },
    });
};

/**
 * Find workspaces for a user (owned or member of)
 */
export const findByUserId = async (userId: string): Promise<WorkspaceWithCounts[]> => {
    return prisma.workspace.findMany({
        where: {
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } },
            ],
        },
        include: {
            _count: {
                select: {
                    members: true,
                    notes: true,
                },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
};

/**
 * Update workspace
 */
export const update = async (
    id: string,
    data: {
        name?: string;
        description?: string;
    }
): Promise<Workspace> => {
    return prisma.workspace.update({
        where: { id },
        data,
    });
};

/**
 * Delete workspace
 */
export const remove = async (id: string): Promise<Workspace> => {
    return prisma.workspace.delete({
        where: { id },
    });
};

/**
 * Add member to workspace
 */
export const addMember = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
): Promise<WorkspaceMember> => {
    return prisma.workspaceMember.create({
        data: {
            workspaceId,
            userId,
            role,
        },
    });
};

/**
 * Update member role
 */
export const updateMemberRole = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
): Promise<WorkspaceMember> => {
    return prisma.workspaceMember.update({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
        data: { role },
    });
};

/**
 * Remove member from workspace
 */
export const removeMember = async (
    workspaceId: string,
    userId: string
): Promise<WorkspaceMember> => {
    return prisma.workspaceMember.delete({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
    });
};

/**
 * Get user's role in workspace
 */
export const getUserRole = async (
    workspaceId: string,
    userId: string
): Promise<WorkspaceRole | null> => {
    // Check if owner
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
        return WorkspaceRoles.ADMIN;
    }

    // Check membership
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
    });

    return membership?.role as WorkspaceRole | null;
};

/**
 * Check if user can access workspace
 */
export const canAccess = async (
    workspaceId: string,
    userId: string
): Promise<boolean> => {
    const role = await getUserRole(workspaceId, userId);
    return role !== null;
};

/**
 * Check if user can edit in workspace
 */
export const canEdit = async (
    workspaceId: string,
    userId: string
): Promise<boolean> => {
    const role = await getUserRole(workspaceId, userId);
    return role === WorkspaceRoles.ADMIN || role === WorkspaceRoles.EDITOR;
};

/**
 * Check if user is admin of workspace
 */
export const isAdmin = async (
    workspaceId: string,
    userId: string
): Promise<boolean> => {
    const role = await getUserRole(workspaceId, userId);
    return role === WorkspaceRoles.ADMIN;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<{ id: string; email: string; displayName: string | null } | null> => {
    return prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            displayName: true,
        },
    });
};

/**
 * Get workspace notes
 */
export const getWorkspaceNotes = async (
    workspaceId: string,
    options: {
        limit?: number;
        offset?: number;
    } = {}
) => {
    const { limit = 50, offset = 0 } = options;

    return prisma.note.findMany({
        where: {
            workspaceId,
            deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
    });
};

/**
 * Move note to workspace
 */
export const moveNoteToWorkspace = async (
    noteId: string,
    workspaceId: string | null
): Promise<void> => {
    await prisma.note.update({
        where: { id: noteId },
        data: { workspaceId },
    });
};
