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
exports.searchNotes = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getAllNotes = void 0;
const NoteRepository = __importStar(require("../repositories/NoteRepository"));
const AppError_1 = require("../utils/AppError");
/**
 * Get all notes for a user with optional search/filter
 * @param userId - The user's ID
 * @returns Array of user's notes
 */
const getAllNotes = async (userId) => {
    const notes = await NoteRepository.findByUserId(userId);
    return notes;
};
exports.getAllNotes = getAllNotes;
/**
 * Get a specific note by ID
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The requested note
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
const getNoteById = async (id, userId) => {
    const note = await NoteRepository.findById(id, userId);
    if (!note) {
        throw new AppError_1.NotFoundError(`Note with ID ${id} not found`);
    }
    return note;
};
exports.getNoteById = getNoteById;
/**
 * Create a new note
 * @param userId - The user's ID
 * @param input - Note creation data
 * @returns The created note
 */
const createNote = async (userId, input) => {
    const note = await NoteRepository.create({
        userId,
        title: input.title,
        content: input.content,
        tags: input.tags,
    });
    return note;
};
exports.createNote = createNote;
/**
 * Update an existing note
 * @param id - The note ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated note
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
const updateNote = async (id, userId, input) => {
    // Verify note exists and user owns it
    const existingNote = await NoteRepository.findById(id, userId);
    if (!existingNote) {
        throw new AppError_1.NotFoundError(`Note with ID ${id} not found`);
    }
    const updatedNote = await NoteRepository.update(id, userId, input);
    return updatedNote;
};
exports.updateNote = updateNote;
/**
 * Delete a note
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns Success message
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
const deleteNote = async (id, userId) => {
    // Verify note exists and user owns it
    const existingNote = await NoteRepository.findById(id, userId);
    if (!existingNote) {
        throw new AppError_1.NotFoundError(`Note with ID ${id} not found`);
    }
    await NoteRepository.remove(id, userId);
    return { message: 'Note deleted successfully' };
};
exports.deleteNote = deleteNote;
/**
 * Search notes by query and/or tag
 * @param userId - The user's ID
 * @param query - Optional search query
 * @param tag - Optional tag filter
 * @returns Array of matching notes
 */
const searchNotes = async (userId, query, tag) => {
    const notes = await NoteRepository.searchNotes(userId, query || '', tag);
    return notes;
};
exports.searchNotes = searchNotes;
