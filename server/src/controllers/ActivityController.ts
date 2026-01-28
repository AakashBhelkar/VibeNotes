import { Response, NextFunction } from 'express';
import * as ActivityService from '../services/ActivityService';
import { ActivityType } from '../repositories/ActivityRepository';
import { AuthRequest } from '../middleware/auth';

/**
 * Activity Controller
 * Handles HTTP requests for activity feed endpoints
 */

/**
 * Get user's activity feed
 * GET /api/activities
 */
export const getActivityFeed = async (
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

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        const type = req.query.type as ActivityType | undefined;

        const activities = await ActivityService.getActivityFeed(userId, {
            limit: Math.min(limit, 100), // Cap at 100
            offset,
            type,
        });

        res.json(activities);
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent activities (last N days)
 * GET /api/activities/recent
 */
export const getRecentActivities = async (
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

        const days = parseInt(req.query.days as string) || 7;
        const activities = await ActivityService.getRecentActivities(userId, Math.min(days, 30));

        res.json(activities);
    } catch (error) {
        next(error);
    }
};

/**
 * Get activities for a specific note
 * GET /api/activities/note/:noteId
 */
export const getNoteActivities = async (
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

        const { noteId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;

        const activities = await ActivityService.getNoteActivities(noteId, userId, limit);

        res.json(activities);
    } catch (error) {
        next(error);
    }
};

/**
 * Get activity statistics
 * GET /api/activities/stats
 */
export const getActivityStats = async (
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

        const stats = await ActivityService.getActivityStats(userId);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * Clean up old activities
 * DELETE /api/activities/cleanup
 */
export const cleanupActivities = async (
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

        const olderThanDays = parseInt(req.query.days as string) || 90;
        const deletedCount = await ActivityService.cleanupOldActivities(userId, olderThanDays);

        res.json({ deleted: deletedCount });
    } catch (error) {
        next(error);
    }
};
