"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentService = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * Service for managing note attachments
 */
class AttachmentService {
    constructor(attachmentRepository, storageService) {
        this.attachmentRepository = attachmentRepository;
        this.storageService = storageService;
    }
    /**
     * Upload an attachment for a note
     */
    async uploadAttachment(userId, noteId, fileName, fileBuffer, fileSize, mimeType) {
        // Check user's total storage usage (10MB limit per user for free tier)
        const totalSize = await this.attachmentRepository.getTotalSizeByUserId(userId);
        const maxStorage = 100 * 1024 * 1024; // 100MB total storage limit
        if (totalSize + fileSize > maxStorage) {
            throw new AppError_1.ValidationError('Storage limit exceeded. Please delete some attachments or upgrade your plan.');
        }
        // Upload file to storage
        const { url, path } = await this.storageService.uploadFile(userId, noteId, fileName, fileBuffer, mimeType);
        // Create attachment record
        const attachment = await this.attachmentRepository.create({
            noteId,
            url,
            fileName,
            size: fileSize,
        });
        return {
            attachment,
            uploadUrl: url,
        };
    }
    /**
     * Get all attachments for a note
     */
    async getAttachmentsByNoteId(noteId) {
        return this.attachmentRepository.findByNoteId(noteId);
    }
    /**
     * Delete an attachment
     */
    async deleteAttachment(attachmentId) {
        const attachment = await this.attachmentRepository.findById(attachmentId);
        if (!attachment) {
            throw new AppError_1.NotFoundError('Attachment not found');
        }
        // Extract file path from URL
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        // Delete from storage
        try {
            await this.storageService.deleteFile(fileName);
        }
        catch (error) {
            console.error('Failed to delete file from storage:', error);
            // Continue with database deletion even if storage deletion fails
        }
        // Delete from database
        await this.attachmentRepository.delete(attachmentId);
    }
    /**
     * Delete all attachments for a note
     */
    async deleteAttachmentsByNoteId(noteId) {
        const attachments = await this.attachmentRepository.findByNoteId(noteId);
        // Delete all files from storage
        for (const attachment of attachments) {
            try {
                const urlParts = attachment.url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                await this.storageService.deleteFile(fileName);
            }
            catch (error) {
                console.error(`Failed to delete file ${attachment.fileName} from storage:`, error);
            }
        }
        // Delete all records from database
        await this.attachmentRepository.deleteByNoteId(noteId);
    }
    /**
     * Get user's total storage usage
     */
    async getUserStorageUsage(userId) {
        const totalBytes = await this.attachmentRepository.getTotalSizeByUserId(userId);
        const totalMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
        return {
            totalBytes,
            totalMB,
        };
    }
}
exports.AttachmentService = AttachmentService;
