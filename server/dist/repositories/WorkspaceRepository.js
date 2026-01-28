"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveNoteToWorkspace = exports.getWorkspaceNotes = exports.findUserByEmail = exports.isAdmin = exports.canEdit = exports.canAccess = exports.getUserRole = exports.removeMember = exports.updateMemberRole = exports.addMember = exports.remove = exports.update = exports.findByUserId = exports.findById = exports.create = exports.WorkspaceRoles = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Workspace Repository
 * Handles database operations for workspaces
 */
// Workspace roles
exports.WorkspaceRoles = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
};
/**
 * Create a new workspace
 */
const create = async (data) => {
    return db_1.default.workspace.create({
        data: {
            name: data.name,
            description: data.description,
            ownerId: data.ownerId,
            // Automatically add owner as admin member
            members: {
                create: {
                    userId: data.ownerId,
                    role: exports.WorkspaceRoles.ADMIN,
                },
            },
        },
    });
};
exports.create = create;
/**
 * Find workspace by ID
 */
const findById = async (id) => {
    return db_1.default.workspace.findUnique({
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
exports.findById = findById;
/**
 * Find workspaces for a user (owned or member of)
 */
const findByUserId = async (userId) => {
    return db_1.default.workspace.findMany({
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
exports.findByUserId = findByUserId;
/**
 * Update workspace
 */
const update = async (id, data) => {
    return db_1.default.workspace.update({
        where: { id },
        data,
    });
};
exports.update = update;
/**
 * Delete workspace
 */
const remove = async (id) => {
    return db_1.default.workspace.delete({
        where: { id },
    });
};
exports.remove = remove;
/**
 * Add member to workspace
 */
const addMember = async (workspaceId, userId, role) => {
    return db_1.default.workspaceMember.create({
        data: {
            workspaceId,
            userId,
            role,
        },
    });
};
exports.addMember = addMember;
/**
 * Update member role
 */
const updateMemberRole = async (workspaceId, userId, role) => {
    return db_1.default.workspaceMember.update({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
        data: { role },
    });
};
exports.updateMemberRole = updateMemberRole;
/**
 * Remove member from workspace
 */
const removeMember = async (workspaceId, userId) => {
    return db_1.default.workspaceMember.delete({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
    });
};
exports.removeMember = removeMember;
/**
 * Get user's role in workspace
 */
const getUserRole = async (workspaceId, userId) => {
    // Check if owner
    const workspace = await db_1.default.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
    });
    if (workspace?.ownerId === userId) {
        return exports.WorkspaceRoles.ADMIN;
    }
    // Check membership
    const membership = await db_1.default.workspaceMember.findUnique({
        where: {
            workspaceId_userId: { workspaceId, userId },
        },
    });
    return membership?.role;
};
exports.getUserRole = getUserRole;
/**
 * Check if user can access workspace
 */
const canAccess = async (workspaceId, userId) => {
    const role = await (0, exports.getUserRole)(workspaceId, userId);
    return role !== null;
};
exports.canAccess = canAccess;
/**
 * Check if user can edit in workspace
 */
const canEdit = async (workspaceId, userId) => {
    const role = await (0, exports.getUserRole)(workspaceId, userId);
    return role === exports.WorkspaceRoles.ADMIN || role === exports.WorkspaceRoles.EDITOR;
};
exports.canEdit = canEdit;
/**
 * Check if user is admin of workspace
 */
const isAdmin = async (workspaceId, userId) => {
    const role = await (0, exports.getUserRole)(workspaceId, userId);
    return role === exports.WorkspaceRoles.ADMIN;
};
exports.isAdmin = isAdmin;
/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    return db_1.default.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            displayName: true,
        },
    });
};
exports.findUserByEmail = findUserByEmail;
/**
 * Get workspace notes
 */
const getWorkspaceNotes = async (workspaceId, options = {}) => {
    const { limit = 50, offset = 0 } = options;
    return db_1.default.note.findMany({
        where: {
            workspaceId,
            deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
    });
};
exports.getWorkspaceNotes = getWorkspaceNotes;
/**
 * Move note to workspace
 */
const moveNoteToWorkspace = async (noteId, workspaceId) => {
    await db_1.default.note.update({
        where: { id: noteId },
        data: { workspaceId },
    });
};
exports.moveNoteToWorkspace = moveNoteToWorkspace;
