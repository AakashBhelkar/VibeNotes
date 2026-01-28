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
exports.getNotesInFolder = exports.moveNoteToFolder = exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolderPath = exports.getFolderById = exports.getFolderTree = exports.getAllFolders = void 0;
const FolderService = __importStar(require("../services/FolderService"));
const AppError_1 = require("../utils/AppError");
/**
 * Folder Controller
 * Handles HTTP requests for folder operations
 */
/**
 * Get all folders for the authenticated user
 */
const getAllFolders = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const folders = await FolderService.getAllFolders(userId);
        res.json(folders);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFolders = getAllFolders;
/**
 * Get folders as tree structure
 */
const getFolderTree = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const tree = await FolderService.getFolderTree(userId);
        res.json(tree);
    }
    catch (error) {
        next(error);
    }
};
exports.getFolderTree = getFolderTree;
/**
 * Get a specific folder by ID
 */
const getFolderById = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const folder = await FolderService.getFolderById(id, userId);
        res.json(folder);
    }
    catch (error) {
        next(error);
    }
};
exports.getFolderById = getFolderById;
/**
 * Get folder path (breadcrumb)
 */
const getFolderPath = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const path = await FolderService.getFolderPath(id, userId);
        res.json(path);
    }
    catch (error) {
        next(error);
    }
};
exports.getFolderPath = getFolderPath;
/**
 * Create a new folder
 */
const createFolder = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const folder = await FolderService.createFolder(userId, req.body);
        res.status(201).json(folder);
    }
    catch (error) {
        next(error);
    }
};
exports.createFolder = createFolder;
/**
 * Update a folder
 */
const updateFolder = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const folder = await FolderService.updateFolder(id, userId, req.body);
        res.json(folder);
    }
    catch (error) {
        next(error);
    }
};
exports.updateFolder = updateFolder;
/**
 * Delete a folder
 */
const deleteFolder = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const result = await FolderService.deleteFolder(id, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFolder = deleteFolder;
/**
 * Move a note to a folder
 */
const moveNoteToFolder = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { noteId } = req.params;
        const { folderId } = req.body;
        const result = await FolderService.moveNoteToFolder(noteId, folderId ?? null, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.moveNoteToFolder = moveNoteToFolder;
/**
 * Get notes in a folder
 */
const getNotesInFolder = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError_1.UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;
        const noteIds = await FolderService.getNotesInFolder(id === 'unfiled' ? null : id, userId);
        res.json(noteIds);
    }
    catch (error) {
        next(error);
    }
};
exports.getNotesInFolder = getNotesInFolder;
