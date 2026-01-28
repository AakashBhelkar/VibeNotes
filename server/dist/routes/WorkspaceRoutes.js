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
const express_1 = require("express");
const WorkspaceController = __importStar(require("../controllers/WorkspaceController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * Workspace Routes
 *
 * POST /api/workspaces - Create a new workspace
 * GET /api/workspaces - Get user's workspaces
 * GET /api/workspaces/:id - Get workspace by ID
 * PUT /api/workspaces/:id - Update workspace
 * DELETE /api/workspaces/:id - Delete workspace
 * POST /api/workspaces/:id/members - Invite member
 * PUT /api/workspaces/:id/members/:memberId - Update member role
 * DELETE /api/workspaces/:id/members/:memberId - Remove member
 * POST /api/workspaces/:id/leave - Leave workspace
 * GET /api/workspaces/:id/notes - Get workspace notes
 * GET /api/workspaces/:id/role - Get user's role in workspace
 */
// Create a new workspace
router.post('/', WorkspaceController.createWorkspace);
// Get user's workspaces
router.get('/', WorkspaceController.getWorkspaces);
// Get workspace by ID
router.get('/:id', WorkspaceController.getWorkspace);
// Update workspace
router.put('/:id', WorkspaceController.updateWorkspace);
// Delete workspace
router.delete('/:id', WorkspaceController.deleteWorkspace);
// Invite member to workspace
router.post('/:id/members', WorkspaceController.inviteMember);
// Update member role
router.put('/:id/members/:memberId', WorkspaceController.updateMemberRole);
// Remove member from workspace
router.delete('/:id/members/:memberId', WorkspaceController.removeMember);
// Leave workspace
router.post('/:id/leave', WorkspaceController.leaveWorkspace);
// Get workspace notes
router.get('/:id/notes', WorkspaceController.getWorkspaceNotes);
// Get user's role in workspace
router.get('/:id/role', WorkspaceController.getUserRole);
exports.default = router;
