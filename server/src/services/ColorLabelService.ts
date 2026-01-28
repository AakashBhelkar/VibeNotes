import * as ColorLabelRepository from '../repositories/ColorLabelRepository';
import * as NoteRepository from '../repositories/NoteRepository';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { ColorLabel } from '@prisma/client';

/**
 * Color Label Service
 * Business logic for color labels and note-label associations
 */

// Default color palette for suggestions
export const DEFAULT_COLORS = [
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
export const getAllLabels = async (userId: string): Promise<ColorLabel[]> => {
    return ColorLabelRepository.findByUserId(userId);
};

/**
 * Get a specific color label by ID
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The requested color label
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
export const getLabelById = async (id: string, userId: string): Promise<ColorLabel> => {
    const label = await ColorLabelRepository.findById(id, userId);

    if (!label) {
        throw new NotFoundError(`Color label with ID ${id} not found`);
    }

    return label;
};

/**
 * Create a new color label
 * @param userId - The user's ID
 * @param input - Label creation data
 * @returns The created color label
 */
export const createLabel = async (
    userId: string,
    input: { name: string; color: string }
): Promise<ColorLabel> => {
    // Validate color format (hex color)
    if (!/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
        throw new BadRequestError('Color must be a valid hex color (e.g., #FF5733)');
    }

    // Validate name is not empty
    if (!input.name.trim()) {
        throw new BadRequestError('Label name cannot be empty');
    }

    return ColorLabelRepository.create({
        userId,
        name: input.name.trim(),
        color: input.color.toUpperCase(),
    });
};

/**
 * Update an existing color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated color label
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
export const updateLabel = async (
    id: string,
    userId: string,
    input: { name?: string; color?: string }
): Promise<ColorLabel> => {
    // Verify label exists and user owns it
    const existingLabel = await ColorLabelRepository.findById(id, userId);

    if (!existingLabel) {
        throw new NotFoundError(`Color label with ID ${id} not found`);
    }

    // Validate color format if provided
    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
        throw new BadRequestError('Color must be a valid hex color (e.g., #FF5733)');
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
        throw new BadRequestError('Label name cannot be empty');
    }

    const updateData: { name?: string; color?: string } = {};
    if (input.name) updateData.name = input.name.trim();
    if (input.color) updateData.color = input.color.toUpperCase();

    return ColorLabelRepository.update(id, userId, updateData);
};

/**
 * Delete a color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 * @throws NotFoundError if label doesn't exist or user doesn't own it
 */
export const deleteLabel = async (
    id: string,
    userId: string
): Promise<{ message: string }> => {
    const existingLabel = await ColorLabelRepository.findById(id, userId);

    if (!existingLabel) {
        throw new NotFoundError(`Color label with ID ${id} not found`);
    }

    await ColorLabelRepository.remove(id, userId);
    return { message: 'Color label deleted successfully' };
};

/**
 * Get all labels assigned to a note
 * @param noteId - The note ID
 * @param userId - The user's ID
 * @returns Array of color labels assigned to the note
 */
export const getNoteLabels = async (
    noteId: string,
    userId: string
): Promise<ColorLabel[]> => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);

    if (!note) {
        throw new NotFoundError(`Note with ID ${noteId} not found`);
    }

    return ColorLabelRepository.findByNoteId(noteId, userId);
};

/**
 * Assign a color label to a note
 * @param noteId - The note ID
 * @param labelId - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 */
export const assignLabelToNote = async (
    noteId: string,
    labelId: string,
    userId: string
): Promise<{ message: string }> => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new NotFoundError(`Note with ID ${noteId} not found`);
    }

    // Verify label exists and user owns it
    const label = await ColorLabelRepository.findById(labelId, userId);
    if (!label) {
        throw new NotFoundError(`Color label with ID ${labelId} not found`);
    }

    try {
        await ColorLabelRepository.assignToNote(noteId, labelId);
        return { message: 'Label assigned successfully' };
    } catch (error: unknown) {
        // Handle case where label is already assigned
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return { message: 'Label already assigned to this note' };
        }
        throw error;
    }
};

/**
 * Remove a color label from a note
 * @param noteId - The note ID
 * @param labelId - The color label ID
 * @param userId - The user's ID
 * @returns Success message
 */
export const removeLabelFromNote = async (
    noteId: string,
    labelId: string,
    userId: string
): Promise<{ message: string }> => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new NotFoundError(`Note with ID ${noteId} not found`);
    }

    // Verify label exists and user owns it
    const label = await ColorLabelRepository.findById(labelId, userId);
    if (!label) {
        throw new NotFoundError(`Color label with ID ${labelId} not found`);
    }

    try {
        await ColorLabelRepository.removeFromNote(noteId, labelId);
        return { message: 'Label removed successfully' };
    } catch (error: unknown) {
        // Handle case where label wasn't assigned
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return { message: 'Label was not assigned to this note' };
        }
        throw error;
    }
};

/**
 * Update all labels for a note (replace existing labels)
 * @param noteId - The note ID
 * @param labelIds - Array of label IDs to assign
 * @param userId - The user's ID
 * @returns Success message
 */
export const updateNoteLabels = async (
    noteId: string,
    labelIds: string[],
    userId: string
): Promise<{ message: string }> => {
    // Verify note exists and user owns it
    const note = await NoteRepository.findById(noteId, userId);
    if (!note) {
        throw new NotFoundError(`Note with ID ${noteId} not found`);
    }

    await ColorLabelRepository.updateNoteLabels(noteId, labelIds, userId);
    return { message: 'Note labels updated successfully' };
};
