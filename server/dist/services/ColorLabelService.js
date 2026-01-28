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
exports.updateNoteLabels = exports.removeLabelFromNote = exports.assignLabelToNote = exports.getNoteLabels = exports.deleteLabel = exports.updateLabel = exports.createLabel = exports.getLabelById = exports.getAllLabels = exports.DEFAULT_COLORS = void 0;
const ColorLabelRepository = __importStar(require("../repositories/ColorLabelRepository"));
const NoteRepository = __importStar(require("../repositories/NoteRepository"));
const AppError_1 = require("../utils/AppError");
/**
 * Color Label Service
 * Business logic for color labels and note-label associations
 */
// Default color palette for suggestions
exports.DEFAULT_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
];
/**
 * Get all color labels for a user
 * @param userId - The user's ID
 * @returns Array of user's color labels
 */
const getAllLabels = async (userId) => {
    return ColorLabelRepository.findByUserId(userId);
};
exports.getAllLabels = getAllLabels;
/**
 * Get a specific color label by ID
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The requested color label
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
const getLabelById = async (id, userId) => {
    const label = await ColorLabelRepository.findById(id, userId);
    if (!label) {
        throw new AppError_1.NotFoundError(`Color label with ID ${id} not found`);
    }
    return label;
};
exports.getLabelById = getLabelById;
/**
 * Create a new color label
 * @param userId - The user's ID
 * @param input - Label creation data
 * @returns The created color label
 */
const createLabel = async (userId, input) => {
    // Validate color format (hex color)
    if (!/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
        throw new AppError_1.BadRequestError('Color must be a valid hex color (e.g., #FF5733)');
    }
    // Validate name is not empty
    if (!input.name.trim()) {
        throw new AppError_1.BadRequestError('Label name cannot be empty');
    }
    return ColorLabelRepository.create({
        userId,
        name: input.name.trim(),
        color: input.color.toUpperCase(),
    });
};
exports.createLabel = createLabel;
/**
 * Update an existing color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated color label
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
const updateLabel = async (id, userId, input) => {
    // Verify label exists and user owns it
    const existingLabel = await ColorLabelRepository.findById(id, userId);
    if (!existingLabel) {
        throw new AppError_1.NotFoundError(`Color label with ID ${id} not found`);
    }
    // Validate color format if provided
    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
        throw new AppError_1.BadRequestError('Color must be a valid hex color (e.g., #FF5733)');
    }
    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
        throw new AppError_1.BadRequestError('Label name cannot be empty');
    }
    const updateData = {};
    if (input.name)
        updateData.name = input.name.trim();
    if (input.color)
        updateData.color = input.color.toUpperCase();
    return ColorLabelRepository.update(id, userId, updateData);
};
exports.updateLabel = updateLabel;
/**
 * Delete a color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
const deleteLabel = async (id, userId) => {
    const existingLabel = await ColorLabelRepository.findById(id, userId);
    if (!existingLabel) {
        throw new AppError_1.NotFoundError(`Color label with ID ${id} not found`);
    }
    await ColorLabelRepository.remove(id, userId);
    return { message: 'Color label deleted successfully' };
};
exports.deleteLabel = deleteLabel;
/**
 * Get all labels assigned to a note
 * @param noteId - The note ID
 * @param userId - The user's ID
 * @returns Array of color labels assigned to the note
 */
const getNoteLabels = async (noteId, userId) => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new AppError_1.NotFoundError(`Note with ID ${noteId} not found`);
    }
    return ColorLabelRepository.findByNoteId(noteId, userId);
};
exports.getNoteLabels = getNoteLabels;
/**
 * Assign a color label to a note
 * @param noteId - The note ID
 * @param labelId - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 */
const assignLabelToNote = async (noteId, labelId, userId) => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new AppError_1.NotFoundError(`Note with ID ${noteId} not found`);
    }
    // Verify label exists and user owns it
    const label = await ColorLabelRepository.findById(labelId, userId);
    if (!label) {
        throw new AppError_1.NotFoundError(`Color label with ID ${labelId} not found`);
    }
    try {
        await ColorLabelRepository.assignToNote(noteId, labelId);
        return { message: 'Label assigned successfully' };
    }
    catch (error) {
        // Handle case where label is already assigned
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { message: 'Label already assigned to this note' };
        }
        throw error;
    }
};
exports.assignLabelToNote = assignLabelToNote;
/**
 * Remove a color label from a note
 * @param noteId - The note ID
 * @param labelId - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 */
const removeLabelFromNote = async (noteId, labelId, userId) => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new AppError_1.NotFoundError(`Note with ID ${noteId} not found`);
    }
    // Verify label exists and user owns it
    const label = await ColorLabelRepository.findById(labelId, userId);
    if (!label) {
        throw new AppError_1.NotFoundError(`Color label with ID ${labelId} not found`);
    }
    try {
        await ColorLabelRepository.removeFromNote(noteId, labelId);
        return { message: 'Label removed successfully' };
    }
    catch (error) {
        // Handle case where label wasn't assigned
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return { message: 'Label was not assigned to this note' };
        }
        throw error;
    }
};
exports.removeLabelFromNote = removeLabelFromNote;
/**
 * Update all labels for a note (replace existing labels)
 * @param noteId - The note ID
 * @param labelIds - Array of label IDs to assign
 * @param userId - The user's ID
 * @returns Success message
 */
const updateNoteLabels = async (noteId, labelIds, userId) => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new AppError_1.NotFoundError(`Note with ID ${noteId} not found`);
    }
    await ColorLabelRepository.updateNoteLabels(noteId, labelIds, userId);
    return { message: 'Note labels updated successfully' };
};
exports.updateNoteLabels = updateNoteLabels;
