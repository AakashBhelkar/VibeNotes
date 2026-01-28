import { Router, Response, NextFunction } from 'express';
import { AttachmentService } from '../services/AttachmentService';
import { AttachmentRepository } from '../repositories/AttachmentRepository';
import { StorageService } from '../services/StorageService';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { attachmentUploadSchema, attachmentDeleteSchema } from '../utils/attachmentValidationSchemas';
import { ValidationError } from '../utils/AppError';
import { STORAGE_CONFIG } from '../config/constants';
import multer from 'multer';

const router = Router();
const prisma = new PrismaClient();
const attachmentRepository = new AttachmentRepository(prisma);
const storageService = new StorageService();
const attachmentService = new AttachmentService(attachmentRepository, storageService);

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: STORAGE_CONFIG.MAX_FILE_SIZE_BYTES,
    },
    fileFilter: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        if (STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype as typeof STORAGE_CONFIG.ALLOWED_MIME_TYPES[number])) {
            cb(null, true);
        } else {
            cb(new ValidationError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed.'));
        }
    },
});

/**
 * POST /api/attachments/upload
 * Upload an attachment for a note
 */
router.post(
    '/upload',
    authenticateToken,
    upload.single('file'),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
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
            const validatedData = attachmentUploadSchema.parse({
                noteId,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
            });

            // Upload attachment
            const result = await attachmentService.uploadAttachment(
                userId,
                validatedData.noteId,
                validatedData.fileName,
                file.buffer,
                validatedData.fileSize,
                validatedData.mimeType
            );

            res.status(201).json({
                message: 'Attachment uploaded successfully',
                attachment: result.attachment,
                url: result.uploadUrl,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/attachments/note/:noteId
 * Get all attachments for a note
 */
router.get(
    '/note/:noteId',
    authenticateToken,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { noteId } = req.params;

            const attachments = await attachmentService.getAttachmentsByNoteId(noteId);

            res.json({
                attachments,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/attachments/:id
 * Delete an attachment
 */
router.delete(
    '/:id',
    authenticateToken,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            // Validate request
            const validatedData = attachmentDeleteSchema.parse({ id });

            await attachmentService.deleteAttachment(validatedData.id);

            res.json({
                message: 'Attachment deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/attachments/storage/usage
 * Get user's storage usage
 */
router.get(
    '/storage/usage',
    authenticateToken,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const usage = await attachmentService.getUserStorageUsage(userId);

            res.json({
                usage,
                limit: {
                    totalBytes: STORAGE_CONFIG.MAX_STORAGE_PER_USER_BYTES,
                    totalMB: STORAGE_CONFIG.MAX_STORAGE_PER_USER_MB,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
