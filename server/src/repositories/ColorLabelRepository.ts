import prisma from '../config/db';
import { ColorLabel, NoteColorLabel } from '@prisma/client';

/**
 * Color Label Repository
 * Handles database operations for color labels and note-label associations
 */

/**
 * Find all color labels for a specific user
 * @param userId - The user's ID
 * @returns Array of color labels sorted by name
 */
export const findByUserId = async (userId: string): Promise<ColorLabel[]> => {
    return prisma.colorLabel.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
    });
};

/**
 * Find a specific color label by ID and verify user ownership
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The color label if found and owned by user, null otherwise
 */
export const findById = async (id: string, userId: string): Promise<ColorLabel | null> => {
    return prisma.colorLabel.findFirst({
        where: { id, userId },
    });
};

/**
 * Create a new color label for a user
 * @param data - Color label creation data
 * @returns The created color label
 */
export const create = async (data: {
    userId: string;
    name: string;
    color: string;
}): Promise<ColorLabel> => {
    return prisma.colorLabel.create({
        data: {
            userId: data.userId,
            name: data.name,
            color: data.color,
        },
    });
};

/**
 * Update a color label with user ownership verification
 * @param id - The color label ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated color label
 * @throws Error if color label doesn't exist or user doesn't own it
 */
export const update = async (
    id: string,
    userId: string,
    data: {
        name?: string;
        color?: string;
    }
): Promise<ColorLabel> => {
    return prisma.colorLabel.update({
        where: {
            id,
            userId,
        },
        data,
    });
};

/**
 * Delete a color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The deleted color label
 * @throws Error if color label doesn't exist or user doesn't own it
 */
export const remove = async (id: string, userId: string): Promise<ColorLabel> => {
    return prisma.colorLabel.delete({
        where: {
            id,
            userId,
        },
    });
};

/**
 * Get all labels assigned to a note
 * @param noteId - The note ID
 * @param userId - The user's ID (for verification)
 * @returns Array of color labels assigned to the note
 */
export const findByNoteId = async (noteId: string, userId: string): Promise<ColorLabel[]> => {
    const noteLabels = await prisma.noteColorLabel.findMany({
        where: {
            noteId,
            colorLabel: { userId },
        },
        include: {
            colorLabel: true,
        },
    });
    return noteLabels.map((nl) => nl.colorLabel);
};

/**
 * Assign a color label to a note
 * @param noteId - The note ID
 * @param colorLabelId - The color label ID
 * @returns The created note-label association
 */
export const assignToNote = async (
    noteId: string,
    colorLabelId: string
): Promise<NoteColorLabel> => {
    return prisma.noteColorLabel.create({
        data: {
            noteId,
            colorLabelId,
        },
    });
};

/**
 * Remove a color label from a note
 * @param noteId - The note ID
 * @param colorLabelId - The color label ID
 * @returns The deleted note-label association
 */
export const removeFromNote = async (
    noteId: string,
    colorLabelId: string
): Promise<NoteColorLabel> => {
    return prisma.noteColorLabel.delete({
        where: {
            noteId_colorLabelId: {
                noteId,
                colorLabelId,
            },
        },
    });
};

/**
 * Get all notes with a specific color label
 * @param colorLabelId - The color label ID
 * @param userId - The user's ID (for verification)
 * @returns Array of note IDs with this label
 */
export const findNotesByLabelId = async (
    colorLabelId: string,
    userId: string
): Promise<string[]> => {
    const noteLabels = await prisma.noteColorLabel.findMany({
        where: {
            colorLabelId,
            colorLabel: { userId },
        },
        select: {
            noteId: true,
        },
    });
    return noteLabels.map((nl) => nl.noteId);
};

/**
 * Update labels for a note (replace all existing labels)
 * @param noteId - The note ID
 * @param colorLabelIds - Array of color label IDs to assign
 * @param userId - The user's ID (for verification)
 */
export const updateNoteLabels = async (
    noteId: string,
    colorLabelIds: string[],
    userId: string
): Promise<void> => {
    // Verify all labels belong to the user
    const validLabels = await prisma.colorLabel.findMany({
        where: {
            id: { in: colorLabelIds },
            userId,
        },
        select: { id: true },
    });
    const validLabelIds = validLabels.map((l) => l.id);

    await prisma.$transaction([
        // Remove all existing labels
        prisma.noteColorLabel.deleteMany({
            where: { noteId },
        }),
        // Add new labels
        prisma.noteColorLabel.createMany({
            data: validLabelIds.map((colorLabelId) => ({
                noteId,
                colorLabelId,
            })),
        }),
    ]);
};
