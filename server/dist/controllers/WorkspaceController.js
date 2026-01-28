"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRole = exports.getWorkspaceNotes = exports.leaveWorkspace = exports.removeMember = exports.updateMemberRole = exports.inviteMember = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.getWorkspaces = exports.createWorkspace = void 0;
const WorkspaceService = __importStar(require("../services/WorkspaceService"));
const WorkspaceRepository_1 = require("../repositories/WorkspaceRepository");
/**
 * Workspace Controller
 * Handles HTTP requests for workspace endpoints
 */
/**
 * Create a new workspace
 * POST /api/workspaces
 */
const createWorkspace = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkspace = createWorkspace;
/**
 * Get user's workspaces
 * GET /api/workspaces
 */
const getWorkspaces = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const workspaces = await WorkspaceService.getUserWorkspaces(userId);
        res.json(workspaces);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkspaces = getWorkspaces;
/**
 * Get workspace by ID
 * GET /api/workspaces/:id
 */
const getWorkspace = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        const workspace = await WorkspaceService.getWorkspace(id, userId);
        res.json(workspace);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: { message: error.message } });
            return;
        }
        next(error);
    }
};
exports.getWorkspace = getWorkspace;
/**
 * Update workspace
 * PUT /api/workspaces/:id
 */
const updateWorkspace = async (req, res, next) => {
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
    }
    catch (error) {
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
exports.updateWorkspace = updateWorkspace;
/**
 * Delete workspace
 * DELETE /api/workspaces/:id
 */
const deleteWorkspace = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        await WorkspaceService.deleteWorkspace(id, userId);
        res.status(204).send();
    }
    catch (error) {
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
exports.deleteWorkspace = deleteWorkspace;
/**
 * Invite member to workspace
 * POST /api/workspaces/:id/members
 */
const inviteMember = async (req, res, next) => {
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
        const validRoles = [WorkspaceRepository_1.WorkspaceRoles.ADMIN, WorkspaceRepository_1.WorkspaceRoles.EDITOR, WorkspaceRepository_1.WorkspaceRoles.VIEWER];
        if (role && !validRoles.includes(role)) {
            res.status(400).json({ error: { message: 'Invalid role. Must be admin, editor, or viewer' } });
            return;
        }
        const member = await WorkspaceService.inviteMember(id, userId, email, role);
        res.status(201).json(member);
    }
    catch (error) {
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
exports.inviteMember = inviteMember;
/**
 * Update member role
 * PUT /api/workspaces/:id/members/:memberId
 */
const updateMemberRole = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id, memberId } = req.params;
        const { role } = req.body;
        // Validate role
        const validRoles = [WorkspaceRepository_1.WorkspaceRoles.ADMIN, WorkspaceRepository_1.WorkspaceRoles.EDITOR, WorkspaceRepository_1.WorkspaceRoles.VIEWER];
        if (!role || !validRoles.includes(role)) {
            res.status(400).json({ error: { message: 'Invalid role. Must be admin, editor, or viewer' } });
            return;
        }
        await WorkspaceService.updateMemberRole(id, userId, memberId, role);
        res.json({ success: true });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Only admins') || error.message.includes("owner's role")) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.updateMemberRole = updateMemberRole;
/**
 * Remove member from workspace
 * DELETE /api/workspaces/:id/members/:memberId
 */
const removeMember = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id, memberId } = req.params;
        await WorkspaceService.removeMember(id, userId, memberId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Only admins') || error.message.includes('owner')) {
                res.status(403).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.removeMember = removeMember;
/**
 * Leave workspace
 * POST /api/workspaces/:id/leave
 */
const leaveWorkspace = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        await WorkspaceService.leaveWorkspace(id, userId);
        res.status(204).send();
    }
    catch (error) {
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
exports.leaveWorkspace = leaveWorkspace;
/**
 * Get workspace notes
 * GET /api/workspaces/:id/notes
 */
const getWorkspaceNotes = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const notes = await WorkspaceService.getWorkspaceNotes(id, userId, { limit, offset });
        res.json(notes);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({ error: { message: error.message } });
            return;
        }
        next(error);
    }
};
exports.getWorkspaceNotes = getWorkspaceNotes;
/**
 * Get user's role in workspace
 * GET /api/workspaces/:id/role
 */
const getUserRole = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserRole = getUserRole;
