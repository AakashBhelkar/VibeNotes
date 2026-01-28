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
const FolderRepository = __importStar(require("../repositories/FolderRepository"));
const AppError_1 = require("../utils/AppError");
/**
 * Get all folders for a user
 * @param userId - The user's ID
 * @returns Array of folders with counts
 */
const getAllFolders = async (userId) => {
    return FolderRepository.findByUserId(userId);
};
exports.getAllFolders = getAllFolders;
/**
 * Get folders as a tree structure
 * @param userId - The user's ID
 * @returns Array of root folders with nested children
 */
const getFolderTree = async (userId) => {
    const folders = await FolderRepository.findByUserId(userId);
    // Build a map for quick lookup
    const folderMap = new Map();
    folders.forEach((f) => {
        folderMap.set(f.id, {
            ...f,
            children: [],
            noteCount: f._count?.notes || 0,
        });
    });
    // Build the tree
    const rootFolders = [];
    folders.forEach((f) => {
        const folder = folderMap.get(f.id);
        if (f.parentId && folderMap.has(f.parentId)) {
            folderMap.get(f.parentId).children.push(folder);
        }
        else {
            rootFolders.push(folder);
        }
    });
    // Sort children at each level
    const sortChildren = (nodes) => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(rootFolders);
    return rootFolders;
};
exports.getFolderTree = getFolderTree;
/**
 * Get a specific folder by ID
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns The folder
 * @throws NotFoundError if folder doesn't exist
 */
const getFolderById = async (id, userId) => {
    const folder = await FolderRepository.findById(id, userId);
    if (!folder) {
        throw new AppError_1.NotFoundError(`Folder with ID ${id} not found`);
    }
    return folder;
};
exports.getFolderById = getFolderById;
/**
 * Get folder path for breadcrumb
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Array of folders from root to current
 */
const getFolderPath = async (id, userId) => {
    return FolderRepository.getFolderPath(id, userId);
};
exports.getFolderPath = getFolderPath;
/**
 * Create a new folder
 * @param userId - The user's ID
 * @param input - Folder creation data
 * @returns The created folder
 */
const createFolder = async (userId, input) => {
    // Validate name
    if (!input.name.trim()) {
        throw new AppError_1.BadRequestError('Folder name cannot be empty');
    }
    // Verify parent exists if provided
    if (input.parentId) {
        const parent = await FolderRepository.findById(input.parentId, userId);
        if (!parent) {
            throw new AppError_1.NotFoundError('Parent folder not found');
        }
    }
    return FolderRepository.create({
        userId,
        name: input.name.trim(),
        parentId: input.parentId || null,
    });
};
exports.createFolder = createFolder;
/**
 * Update a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated folder
 */
const updateFolder = async (id, userId, input) => {
    // Verify folder exists
    const existing = await FolderRepository.findById(id, userId);
    if (!existing) {
        throw new AppError_1.NotFoundError(`Folder with ID ${id} not found`);
    }
    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
        throw new AppError_1.BadRequestError('Folder name cannot be empty');
    }
    // Check for circular reference if changing parent
    if (input.parentId !== undefined && input.parentId !== existing.parentId) {
        if (input.parentId) {
            // Verify new parent exists
            const newParent = await FolderRepository.findById(input.parentId, userId);
            if (!newParent) {
                throw new AppError_1.NotFoundError('Parent folder not found');
            }
            // Check for circular reference
            const wouldBeCircular = await FolderRepository.wouldCreateCircularReference(id, input.parentId, userId);
            if (wouldBeCircular) {
                throw new AppError_1.BadRequestError('Cannot move folder to its own descendant');
            }
        }
    }
    const updateData = {};
    if (input.name)
        updateData.name = input.name.trim();
    if (input.parentId !== undefined)
        updateData.parentId = input.parentId;
    return FolderRepository.update(id, userId, updateData);
};
exports.updateFolder = updateFolder;
/**
 * Delete a folder
 * @param id - The folder ID
 * @param userId - The user's ID
 * @returns Success message
 */
const deleteFolder = async (id, userId) => {
    const existing = await FolderRepository.findById(id, userId);
    if (!existing) {
        throw new AppError_1.NotFoundError(`Folder with ID ${id} not found`);
    }
    await FolderRepository.remove(id, userId);
    return { message: 'Folder deleted successfully' };
};
exports.deleteFolder = deleteFolder;
/**
 * Move a note to a folder
 * @param noteId - The note ID
 * @param folderId - The target folder ID (null to unfiled)
 * @param userId - The user's ID
 * @returns Success message
 */
const moveNoteToFolder = async (noteId, folderId, userId) => {
    // Verify folder exists if provided
    if (folderId) {
        const folder = await FolderRepository.findById(folderId, userId);
        if (!folder) {
            throw new AppError_1.NotFoundError('Folder not found');
        }
    }
    await FolderRepository.moveNoteToFolder(noteId, folderId, userId);
    return { message: 'Note moved successfully' };
};
exports.moveNoteToFolder = moveNoteToFolder;
/**
 * Get notes in a folder
 * @param folderId - The folder ID (null for unfiled)
 * @param userId - The user's ID
 * @returns Array of note IDs
 */
const getNotesInFolder = async (folderId, userId) => {
    if (folderId) {
        // Verify folder exists
        const folder = await FolderRepository.findById(folderId, userId);
        if (!folder) {
            throw new AppError_1.NotFoundError('Folder not found');
        }
    }
    return FolderRepository.getNotesInFolder(folderId, userId);
};
exports.getNotesInFolder = getNotesInFolder;
