"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttachmentService_1 = require("../services/AttachmentService");
const AttachmentRepository_1 = require("../repositories/AttachmentRepository");
const StorageService_1 = require("../services/StorageService");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const attachmentValidationSchemas_1 = require("../utils/attachmentValidationSchemas");
const AppError_1 = require("../utils/AppError");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const attachmentRepository = new AttachmentRepository_1.AttachmentRepository(prisma);
const storageService = new StorageService_1.StorageService();
const attachmentService = new AttachmentService_1.AttachmentService(attachmentRepository, storageService);
// Configure multer for file uploads (memory storage)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new AppError_1.ValidationError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed.'));
        }
    },
});
/**
 * POST /api/attachments/upload
 * Upload an attachment for a note
 */
router.post('/upload', auth_1.authenticateToken, upload.single('file'), async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { noteId } = req.body;
        // Validate request
        const validatedData = attachmentValidationSchemas_1.attachmentUploadSchema.parse({
            noteId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
        });
        // Upload attachment
        const result = await attachmentService.uploadAttachment(userId, validatedData.noteId, validatedData.fileName, file.buffer, validatedData.fileSize, validatedData.mimeType);
        res.status(201).json({
            message: 'Attachment uploaded successfully',
            attachment: result.attachment,
            url: result.uploadUrl,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/attachments/note/:noteId
 * Get all attachments for a note
 */
router.get('/note/:noteId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const attachments = await attachmentService.getAttachmentsByNoteId(noteId);
        res.json({
            attachments,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/attachments/:id
 * Delete an attachment
 */
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate request
        const validatedData = attachmentValidationSchemas_1.attachmentDeleteSchema.parse({ id });
        await attachmentService.deleteAttachment(validatedData.id);
        res.json({
            message: 'Attachment deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/attachments/storage/usage
 * Get user's storage usage
 */
router.get('/storage/usage', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = await attachmentService.getUserStorageUsage(userId);
        res.json({
            usage,
            limit: {
                totalBytes: 100 * 1024 * 1024, // 100MB
                totalMB: 100,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
