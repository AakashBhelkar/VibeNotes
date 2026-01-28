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
exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getAllNotes = void 0;
const NoteService = __importStar(require("../services/NoteService"));
const AppError_1 = require("../utils/AppError");
/**
 * Get all notes for the authenticated user
 * Supports optional search query and tag filtering
 */
const getAllNotes = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { q, tag } = req.query;
        const notes = await NoteService.searchNotes(userId, q, tag);
        res.json(notes);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllNotes = getAllNotes;
/**
 * Get a specific note by ID
 */
const getNoteById = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const note = await NoteService.getNoteById(id, userId);
        res.json(note);
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteById = getNoteById;
/**
 * Create a new note
 */
const createNote = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const note = await NoteService.createNote(userId, req.body);
        res.status(201).json(note);
    }
    catch (error) {
        next(error);
    }
};
exports.createNote = createNote;
/**
 * Update an existing note
 */
const updateNote = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const note = await NoteService.updateNote(id, userId, req.body);
        res.json(note);
    }
    catch (error) {
        next(error);
    }
};
exports.updateNote = updateNote;
/**
 * Delete a note
 */
const deleteNote = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const result = await NoteService.deleteNote(id, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNote = deleteNote;
