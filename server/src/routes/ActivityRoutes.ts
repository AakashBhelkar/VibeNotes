import { Router } from 'express';
import * as ActivityController from '../controllers/ActivityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Activity Routes
 *
 * GET /api/activities - Get activity feed with pagination
 * GET /api/activities/recent - Get recent activities (last N days)
 * GET /api/activities/stats - Get activity statistics
 * GET /api/activities/note/:noteId - Get activities for a specific note
 * DELETE /api/activities/cleanup - Clean up old activities
 */

// Get activity feed with pagination
router.get('/', ActivityController.getActivityFeed);

// Get recent activities
router.get('/recent', ActivityController.getRecentActivities);

// Get activity statistics
router.get('/stats', ActivityController.getActivityStats);

// Get activities for a specific note
router.get('/note/:noteId', ActivityController.getNoteActivities);

// Clean up old activities
router.delete('/cleanup', ActivityController.cleanupActivities);

export default router;
