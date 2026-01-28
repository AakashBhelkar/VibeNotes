import { Response, NextFunction } from 'express';
import * as WorkspaceService from '../services/WorkspaceService';
import { WorkspaceRole, WorkspaceRoles } from '../repositories/WorkspaceRepository';
import { AuthRequest } from '../middleware/auth';

/**
 * Workspace Controller
 * Handles HTTP requests for workspace endpoints
 */

/**
 * Create a new workspace
 * POST /api/workspaces
 */
export const createWorkspace = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({ error: { message: 'Workspace name is required' } });
            return;
        }

        const workspace = await WorkspaceService.createWorkspace(name, userId, description);
        res.status(201).json(workspace);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's workspaces
 * GET /api/workspaces
 */
export const getWorkspaces = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const workspaces = await WorkspaceService.getUserWorkspaces(userId);
        res.json(workspaces);
    } catch (error) {
        next(error);
    }
};

/**
 * Get workspace by ID
 * GET /api/workspaces/:id
 */
export const getWorkspace = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const workspace = await WorkspaceService.getWorkspace(id, userId);

        res.json(workspace);
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: { message: error.message } });
            return;
        }
        next(error);
    }
};

/**
 * Update workspace
 * PUT /api/workspaces/:id
 */
export const updateWorkspace = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const { name, description } = req.body;

        const workspace = await WorkspaceService.updateWorkspace(id, userId, { name, description });
        res.json(workspace);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
            if (error.message.includes('Only admins')) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Delete workspace
 * DELETE /api/workspaces/:id
 */
export const deleteWorkspace = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        await WorkspaceService.deleteWorkspace(id, userId);

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
            if (error.message.includes('Only the workspace owner')) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Invite member to workspace
 * POST /api/workspaces/:id/members
 */
export const inviteMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const { email, role } = req.body;

        if (!email) {
            res.status(400).json({ error: { message: 'Email is required' } });
            return;
        }

        // Validate role
        const validRoles: WorkspaceRole[] = [WorkspaceRoles.ADMIN, WorkspaceRoles.EDITOR, WorkspaceRoles.VIEWER];
        if (role && !validRoles.includes(role)) {
            res.status(400).json({ error: { message: 'Invalid role. Must be admin, editor, or viewer' } });
            return;
        }

        const member = await WorkspaceService.inviteMember(id, userId, email, role);
        res.status(201).json(member);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
            if (error.message.includes('Only admins') || error.message.includes('already a member')) {
                res.status(400).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Update member role
 * PUT /api/workspaces/:id/members/:memberId
 */
export const updateMemberRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id, memberId } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles: WorkspaceRole[] = [WorkspaceRoles.ADMIN, WorkspaceRoles.EDITOR, WorkspaceRoles.VIEWER];
        if (!role || !validRoles.includes(role)) {
            res.status(400).json({ error: { message: 'Invalid role. Must be admin, editor, or viewer' } });
            return;
        }

        await WorkspaceService.updateMemberRole(id, userId, memberId, role);
        res.json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Only admins') || error.message.includes("owner's role")) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Remove member from workspace
 * DELETE /api/workspaces/:id/members/:memberId
 */
export const removeMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id, memberId } = req.params;
        await WorkspaceService.removeMember(id, userId, memberId);

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Only admins') || error.message.includes('owner')) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Leave workspace
 * POST /api/workspaces/:id/leave
 */
export const leaveWorkspace = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        await WorkspaceService.leaveWorkspace(id, userId);

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
            if (error.message.includes('Owner cannot leave')) {
                res.status(400).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};

/**
 * Get workspace notes
 * GET /api/workspaces/:id/notes
 */
export const getWorkspaceNotes = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const notes = await WorkspaceService.getWorkspaceNotes(id, userId, { limit, offset });
        res.json(notes);
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: { message: error.message } });
            return;
        }
        next(error);
    }
};

/**
 * Get user's role in workspace
 * GET /api/workspaces/:id/role
 */
export const getUserRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }

        const { id } = req.params;
        const role = await WorkspaceService.getUserRole(id, userId);

        if (!role) {
            res.status(404).json({ error: { message: 'Not a member of this workspace' } });
            return;
        }

        res.json({ role });
    } catch (error) {
        next(error);
    }
};
