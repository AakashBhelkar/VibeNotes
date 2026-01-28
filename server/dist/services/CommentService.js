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
exports.getRecentUserComments = exports.getCommentCount = exports.deleteComment = exports.updateComment = exports.getCommentsForNote = exports.createComment = void 0;
const CommentRepository = __importStar(require("../repositories/CommentRepository"));
/**
 * Comment Service
 * Business logic for comment operations
 */
/**
 * Create a new comment
 * @param content - Comment content
 * @param noteId - The note ID
 * @param userId - The user ID
 * @param parentId - Optional parent comment ID for replies
 * @returns The created comment
 * @throws Error if user cannot access the note
 */
const createComment = async (content, noteId, userId, parentId) => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        throw new Error('Note not found or access denied');
    }
    // If this is a reply, verify parent comment exists and belongs to the same note
    if (parentId) {
        const parentComment = await CommentRepository.findById(parentId);
        if (!parentComment || parentComment.noteId !== noteId) {
            throw new Error('Parent comment not found');
        }
    }
    // Validate content
    if (!content.trim()) {
        throw new Error('Comment content cannot be empty');
    }
    return CommentRepository.create({
        content: content.trim(),
        noteId,
        userId,
        parentId,
    });
};
exports.createComment = createComment;
/**
 * Get all comments for a note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @returns Array of comments with replies
 * @throws Error if user cannot access the note
 */
const getCommentsForNote = async (noteId, userId) => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        throw new Error('Note not found or access denied');
    }
    return CommentRepository.findByNoteId(noteId);
};
exports.getCommentsForNote = getCommentsForNote;
/**
 * Update a comment
 * @param commentId - The comment ID
 * @param userId - The user ID
 * @param content - New content
 * @returns The updated comment
 * @throws Error if comment not found or user not authorized
 */
const updateComment = async (commentId, userId, content) => {
    // Validate content
    if (!content.trim()) {
        throw new Error('Comment content cannot be empty');
    }
    const updated = await CommentRepository.update(commentId, userId, content.trim());
    if (!updated) {
        throw new Error('Comment not found or not authorized to edit');
    }
    return updated;
};
exports.updateComment = updateComment;
/**
 * Delete a comment
 * @param commentId - The comment ID
 * @param userId - The user ID
 * @throws Error if comment not found or user not authorized
 */
const deleteComment = async (commentId, userId) => {
    const deleted = await CommentRepository.remove(commentId, userId);
    if (!deleted) {
        throw new Error('Comment not found or not authorized to delete');
    }
};
exports.deleteComment = deleteComment;
/**
 * Get comment count for a note
 * @param noteId - The note ID
 * @param userId - The user ID (for authorization)
 * @returns The number of comments
 */
const getCommentCount = async (noteId, userId) => {
    // Verify user can access the note
    const canAccess = await CommentRepository.canAccessNote(noteId, userId);
    if (!canAccess) {
        return 0;
    }
    return CommentRepository.countByNoteId(noteId);
};
exports.getCommentCount = getCommentCount;
/**
 * Get recent comments by user
 * @param userId - The user ID
 * @param limit - Maximum number of comments
 * @returns Array of recent comments
 */
const getRecentUserComments = async (userId, limit = 10) => {
    return CommentRepository.findRecentByUserId(userId, limit);
};
exports.getRecentUserComments = getRecentUserComments;
