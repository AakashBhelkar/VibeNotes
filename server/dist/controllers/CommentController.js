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
exports.getCommentCount = exports.deleteComment = exports.updateComment = exports.getComments = exports.createComment = void 0;
const CommentService = __importStar(require("../services/CommentService"));
/**
 * Comment Controller
 * Handles HTTP requests for comment endpoints
 */
/**
 * Create a new comment
 * POST /api/comments
 */
const createComment = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { content, noteId, parentId } = req.body;
        if (!content || !noteId) {
            res.status(400).json({ error: { message: 'Content and noteId are required' } });
            return;
        }
        const comment = await CommentService.createComment(content, noteId, userId, parentId);
        res.status(201).json(comment);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.createComment = createComment;
/**
 * Get comments for a note
 * GET /api/comments/note/:noteId
 */
const getComments = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { noteId } = req.params;
        const comments = await CommentService.getCommentsForNote(noteId, userId);
        res.json(comments);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.getComments = getComments;
/**
 * Update a comment
 * PUT /api/comments/:id
 */
const updateComment = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ error: { message: 'Content is required' } });
            return;
        }
        const comment = await CommentService.updateComment(id, userId, content);
        res.json(comment);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.updateComment = updateComment;
/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { id } = req.params;
        await CommentService.deleteComment(id, userId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(404).json({ error: { message: error.message } });
                return;
            }
        }
        next(error);
    }
};
exports.deleteComment = deleteComment;
/**
 * Get comment count for a note
 * GET /api/comments/note/:noteId/count
 */
const getCommentCount = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: { message: 'Unauthorized' } });
            return;
        }
        const { noteId } = req.params;
        const count = await CommentService.getCommentCount(noteId, userId);
        res.json({ count });
    }
    catch (error) {
        next(error);
    }
};
exports.getCommentCount = getCommentCount;
