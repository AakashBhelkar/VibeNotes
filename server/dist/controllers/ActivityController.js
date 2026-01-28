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
exports.cleanupActivities = exports.getActivityStats = exports.getNoteActivities = exports.getRecentActivities = exports.getActivityFeed = void 0;
const ActivityService = __importStar(require("../services/ActivityService"));
/**
 * Activity Controller
 * Handles HTTP requests for activity feed endpoints
 */
/**
 * Get user's activity feed
 * GET /api/activities
 */
const getActivityFeed = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type;
        const activities = await ActivityService.getActivityFeed(userId, {
            limit: Math.min(limit, 100), // Cap at 100
            offset,
            type,
        });
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
};
exports.getActivityFeed = getActivityFeed;
/**
 * Get recent activities (last N days)
 * GET /api/activities/recent
 */
const getRecentActivities = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const days = parseInt(req.query.days) || 7;
        const activities = await ActivityService.getRecentActivities(userId, Math.min(days, 30));
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentActivities = getRecentActivities;
/**
 * Get activities for a specific note
 * GET /api/activities/note/:noteId
 */
const getNoteActivities = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { noteId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const activities = await ActivityService.getNoteActivities(noteId, userId, limit);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteActivities = getNoteActivities;
/**
 * Get activity statistics
 * GET /api/activities/stats
 */
const getActivityStats = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const stats = await ActivityService.getActivityStats(userId);
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getActivityStats = getActivityStats;
/**
 * Clean up old activities
 * DELETE /api/activities/cleanup
 */
const cleanupActivities = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const olderThanDays = parseInt(req.query.days) || 90;
        const deletedCount = await ActivityService.cleanupOldActivities(userId, olderThanDays);
        res.json({ deleted: deletedCount });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanupActivities = cleanupActivities;
