"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoteLabels = exports.findNotesByLabelId = exports.removeFromNote = exports.assignToNote = exports.findByNoteId = exports.remove = exports.update = exports.create = exports.findById = exports.findByUserId = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Color Label Repository
 * Handles database operations for color labels and note-label associations
 */
/**
 * Find all color labels for a specific user
 * @param userId - The user's ID
 * @returns Array of color labels sorted by name
 */
const findByUserId = async (userId) => {
    return db_1.default.colorLabel.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
    });
};
exports.findByUserId = findByUserId;
/**
 * Find a specific color label by ID and verify user ownership
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The color label if found and owned by user, null otherwise
 */
const findById = async (id, userId) => {
    return db_1.default.colorLabel.findFirst({
        where: { id, userId },
    });
};
exports.findById = findById;
/**
 * Create a new color label for a user
 * @param data - Color label creation data
 * @returns The created color label
 */
const create = async (data) => {
    return db_1.default.colorLabel.create({
        data: {
            userId: data.userId,
            name: data.name,
            color: data.color,
        },
    });
};
exports.create = create;
/**
 * Update a color label with user ownership verification
 * @param id - The color label ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated color label
 * @throws Error if color label doesn't exist or user doesn't own it
 */
const update = async (id, userId, data) => {
    return db_1.default.colorLabel.update({
        where: {
            id,
            userId,
        },
        data,
    });
};
exports.update = update;
/**
 * Delete a color label
 * @param id - The color label ID
 * @param userId - The user's ID
 * @returns The deleted color label
 * @throws Error if color label doesn't exist or user doesn't own it
 */
const remove = async (id, userId) => {
    return db_1.default.colorLabel.delete({
        where: {
            id,
            userId,
        },
    });
};
exports.remove = remove;
/**
 * Get all labels assigned to a note
 * @param noteId - The note ID
 * @param userId - The user's ID (for verification)
 * @returns Array of color labels assigned to the note
 */
const findByNoteId = async (noteId, userId) => {
    const noteLabels = await db_1.default.noteColorLabel.findMany({
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
exports.findByNoteId = findByNoteId;
/**
 * Assign a color label to a note
 * @param noteId - The note ID
 * @param colorLabelId - The color label ID
 * @returns The created note-label association
 */
const assignToNote = async (noteId, colorLabelId) => {
    return db_1.default.noteColorLabel.create({
        data: {
            noteId,
            colorLabelId,
        },
    });
};
exports.assignToNote = assignToNote;
/**
 * Remove a color label from a note
 * @param noteId - The note ID
 * @param colorLabelId - The color label ID
 * @returns The deleted note-label association
 */
const removeFromNote = async (noteId, colorLabelId) => {
    return db_1.default.noteColorLabel.delete({
        where: {
            noteId_colorLabelId: {
                noteId,
                colorLabelId,
            },
        },
    });
};
exports.removeFromNote = removeFromNote;
/**
 * Get all notes with a specific color label
 * @param colorLabelId - The color label ID
 * @param userId - The user's ID (for verification)
 * @returns Array of note IDs with this label
 */
const findNotesByLabelId = async (colorLabelId, userId) => {
    const noteLabels = await db_1.default.noteColorLabel.findMany({
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
exports.findNotesByLabelId = findNotesByLabelId;
/**
 * Update labels for a note (replace all existing labels)
 * @param noteId - The note ID
 * @param colorLabelIds - Array of color label IDs to assign
 * @param userId - The user's ID (for verification)
 */
const updateNoteLabels = async (noteId, colorLabelIds, userId) => {
    // Verify all labels belong to the user
    const validLabels = await db_1.default.colorLabel.findMany({
        where: {
            id: { in: colorLabelIds },
            userId,
        },
        select: { id: true },
    });
    const validLabelIds = validLabels.map((l) => l.id);
    await db_1.default.$transaction([
        // Remove all existing labels
        db_1.default.noteColorLabel.deleteMany({
            where: { noteId },
        }),
        // Add new labels
        db_1.default.noteColorLabel.createMany({
            data: validLabelIds.map((colorLabelId) => ({
                noteId,
                colorLabelId,
            })),
        }),
    ]);
};
exports.updateNoteLabels = updateNoteLabels;
