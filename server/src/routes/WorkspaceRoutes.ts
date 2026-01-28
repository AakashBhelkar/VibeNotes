import { Router } from 'express';
import * as WorkspaceController from '../controllers/WorkspaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

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

export default router;
