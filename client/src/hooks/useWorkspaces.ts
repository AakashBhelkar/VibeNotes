import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

/**
 * Workspace role type
 */
export type WorkspaceRole = 'admin' | 'editor' | 'viewer';

/**
 * Workspace member interface
 */
export interface WorkspaceMember {
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    joinedAt: string;
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
}

/**
 * Workspace with counts interface
 */
export interface WorkspaceWithCounts {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        members: number;
        notes: number;
    };
}

/**
 * Full workspace with members interface
 */
export interface WorkspaceWithMembers {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        email: string;
        displayName: string | null;
    };
    members: WorkspaceMember[];
    _count: {
        notes: number;
    };
}

/**
 * Hook to manage workspaces
 */
export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<WorkspaceWithCounts[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch user's workspaces
     */
    const fetchWorkspaces = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.get<WorkspaceWithCounts[]>('/api/workspaces');
            setWorkspaces(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workspaces');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Create a new workspace
     */
    const createWorkspace = useCallback(async (
        name: string,
        description?: string
    ): Promise<WorkspaceWithMembers | null> => {
        try {
            setError(null);
            const response = await apiClient.post<WorkspaceWithMembers>('/api/workspaces', {
                name,
                description,
            });
            await fetchWorkspaces();
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create workspace');
            return null;
        }
    }, [fetchWorkspaces]);

    /**
     * Get workspace by ID
     */
    const getWorkspace = useCallback(async (
        workspaceId: string
    ): Promise<WorkspaceWithMembers | null> => {
        try {
            const response = await apiClient.get<WorkspaceWithMembers>(`/api/workspaces/${workspaceId}`);
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workspace');
            return null;
        }
    }, []);

    /**
     * Update workspace
     */
    const updateWorkspace = useCallback(async (
        workspaceId: string,
        data: { name?: string; description?: string }
    ): Promise<WorkspaceWithMembers | null> => {
        try {
            setError(null);
            const response = await apiClient.put<WorkspaceWithMembers>(`/api/workspaces/${workspaceId}`, data);
            await fetchWorkspaces();
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update workspace');
            return null;
        }
    }, [fetchWorkspaces]);

    /**
     * Delete workspace
     */
    const deleteWorkspace = useCallback(async (
        workspaceId: string
    ): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.delete(`/api/workspaces/${workspaceId}`);
            await fetchWorkspaces();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete workspace');
            return false;
        }
    }, [fetchWorkspaces]);

    /**
     * Invite member to workspace
     */
    const inviteMember = useCallback(async (
        workspaceId: string,
        email: string,
        role: WorkspaceRole = 'editor'
    ): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.post(`/api/workspaces/${workspaceId}/members`, { email, role });
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to invite member');
            return false;
        }
    }, []);

    /**
     * Update member role
     */
    const updateMemberRole = useCallback(async (
        workspaceId: string,
        memberId: string,
        role: WorkspaceRole
    ): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.put(`/api/workspaces/${workspaceId}/members/${memberId}`, { role });
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update member role');
            return false;
        }
    }, []);

    /**
     * Remove member from workspace
     */
    const removeMember = useCallback(async (
        workspaceId: string,
        memberId: string
    ): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove member');
            return false;
        }
    }, []);

    /**
     * Leave workspace
     */
    const leaveWorkspace = useCallback(async (
        workspaceId: string
    ): Promise<boolean> => {
        try {
            setError(null);
            await apiClient.post(`/api/workspaces/${workspaceId}/leave`);
            await fetchWorkspaces();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to leave workspace');
            return false;
        }
    }, [fetchWorkspaces]);

    /**
     * Get user's role in workspace
     */
    const getUserRole = useCallback(async (
        workspaceId: string
    ): Promise<WorkspaceRole | null> => {
        try {
            const response = await apiClient.get<{ role: WorkspaceRole }>(`/api/workspaces/${workspaceId}/role`);
            return response.data.role;
        } catch {
            return null;
        }
    }, []);

    // Load workspaces on mount
    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return {
        workspaces,
        isLoading,
        error,
        fetchWorkspaces,
        createWorkspace,
        getWorkspace,
        updateWorkspace,
        deleteWorkspace,
        inviteMember,
        updateMemberRole,
        removeMember,
        leaveWorkspace,
        getUserRole,
    };
}
