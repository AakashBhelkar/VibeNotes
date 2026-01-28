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
exports.moveNoteToWorkspace = exports.getWorkspaceNotes = exports.canEdit = exports.canAccess = exports.getUserRole = exports.leaveWorkspace = exports.removeMember = exports.updateMemberRole = exports.inviteMember = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.getUserWorkspaces = exports.createWorkspace = void 0;
const WorkspaceRepository = __importStar(require("../repositories/WorkspaceRepository"));
const WorkspaceRepository_1 = require("../repositories/WorkspaceRepository");
/**
 * Workspace Service
 * Business logic for workspace operations
 */
/**
 * Create a new workspace
 */
const createWorkspace = async (name, ownerId, description) => {
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
exports.createWorkspace = createWorkspace;
/**
 * Get workspaces for a user
 */
const getUserWorkspaces = async (userId) => {
    return WorkspaceRepository.findByUserId(userId);
};
exports.getUserWorkspaces = getUserWorkspaces;
/**
 * Get workspace by ID
 */
const getWorkspace = async (workspaceId, userId) => {
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
exports.getWorkspace = getWorkspace;
/**
 * Update workspace
 */
const updateWorkspace = async (workspaceId, userId, data) => {
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
exports.updateWorkspace = updateWorkspace;
/**
 * Delete workspace
 */
const deleteWorkspace = async (workspaceId, userId) => {
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
exports.deleteWorkspace = deleteWorkspace;
/**
 * Invite member to workspace
 */
const inviteMember = async (workspaceId, inviterId, email, role = WorkspaceRepository_1.WorkspaceRoles.EDITOR) => {
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
exports.inviteMember = inviteMember;
/**
 * Update member role
 */
const updateMemberRole = async (workspaceId, adminId, memberId, newRole) => {
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
exports.updateMemberRole = updateMemberRole;
/**
 * Remove member from workspace
 */
const removeMember = async (workspaceId, adminId, memberId) => {
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
exports.removeMember = removeMember;
/**
 * Leave workspace
 */
const leaveWorkspace = async (workspaceId, userId) => {
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
exports.leaveWorkspace = leaveWorkspace;
/**
 * Get user's role in workspace
 */
const getUserRole = async (workspaceId, userId) => {
    return WorkspaceRepository.getUserRole(workspaceId, userId);
};
exports.getUserRole = getUserRole;
/**
 * Check if user can access workspace
 */
const canAccess = async (workspaceId, userId) => {
    return WorkspaceRepository.canAccess(workspaceId, userId);
};
exports.canAccess = canAccess;
/**
 * Check if user can edit in workspace
 */
const canEdit = async (workspaceId, userId) => {
    return WorkspaceRepository.canEdit(workspaceId, userId);
};
exports.canEdit = canEdit;
/**
 * Get workspace notes
 */
const getWorkspaceNotes = async (workspaceId, userId, options) => {
    // Check access
    const canAccess = await WorkspaceRepository.canAccess(workspaceId, userId);
    if (!canAccess) {
        throw new Error('Workspace not found or access denied');
    }
    return WorkspaceRepository.getWorkspaceNotes(workspaceId, options);
};
exports.getWorkspaceNotes = getWorkspaceNotes;
/**
 * Move note to workspace
 */
const moveNoteToWorkspace = async (noteId, workspaceId, userId) => {
    // If moving to a workspace, check edit access
    if (workspaceId) {
        const canEdit = await WorkspaceRepository.canEdit(workspaceId, userId);
        if (!canEdit) {
            throw new Error('You do not have permission to add notes to this workspace');
        }
    }
    await WorkspaceRepository.moveNoteToWorkspace(noteId, workspaceId);
};
exports.moveNoteToWorkspace = moveNoteToWorkspace;
