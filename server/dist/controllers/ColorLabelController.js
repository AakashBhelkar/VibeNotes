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
exports.updateNoteLabels = exports.removeLabelFromNote = exports.assignLabelToNote = exports.getNoteLabels = exports.deleteLabel = exports.updateLabel = exports.createLabel = exports.getLabelById = exports.getAllLabels = void 0;
const ColorLabelService = __importStar(require("../services/ColorLabelService"));
const AppError_1 = require("../utils/AppError");
/**
 * Color Label Controller
 * Handles HTTP requests for color label operations
 */
/**
 * Get all color labels for the authenticated user
 */
const getAllLabels = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const labels = await ColorLabelService.getAllLabels(userId);
        res.json(labels);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllLabels = getAllLabels;
/**
 * Get a specific color label by ID
 */
const getLabelById = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const label = await ColorLabelService.getLabelById(id, userId);
        res.json(label);
    }
    catch (error) {
        next(error);
    }
};
exports.getLabelById = getLabelById;
/**
 * Create a new color label
 */
const createLabel = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const label = await ColorLabelService.createLabel(userId, req.body);
        res.status(201).json(label);
    }
    catch (error) {
        next(error);
    }
};
exports.createLabel = createLabel;
/**
 * Update an existing color label
 */
const updateLabel = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const label = await ColorLabelService.updateLabel(id, userId, req.body);
        res.json(label);
    }
    catch (error) {
        next(error);
    }
};
exports.updateLabel = updateLabel;
/**
 * Delete a color label
 */
const deleteLabel = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const result = await ColorLabelService.deleteLabel(id, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLabel = deleteLabel;
/**
 * Get all labels assigned to a note
 */
const getNoteLabels = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId } = req.params;
        const labels = await ColorLabelService.getNoteLabels(noteId, userId);
        res.json(labels);
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteLabels = getNoteLabels;
/**
 * Assign a label to a note
 */
const assignLabelToNote = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId, labelId } = req.params;
        const result = await ColorLabelService.assignLabelToNote(noteId, labelId, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.assignLabelToNote = assignLabelToNote;
/**
 * Remove a label from a note
 */
const removeLabelFromNote = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId, labelId } = req.params;
        const result = await ColorLabelService.removeLabelFromNote(noteId, labelId, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.removeLabelFromNote = removeLabelFromNote;
/**
 * Update all labels for a note (replace existing)
 */
const updateNoteLabels = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId } = req.params;
        const { labelIds } = req.body;
        const result = await ColorLabelService.updateNoteLabels(noteId, labelIds || [], userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateNoteLabels = updateNoteLabels;
