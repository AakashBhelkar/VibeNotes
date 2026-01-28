import { AttachmentRepository } from '../repositories/AttachmentRepository';
import { StorageService } from './StorageService';
import { Attachment } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/AppError';

/**
 * Service for managing note attachments
 */
export class AttachmentService {
    private attachmentRepository: AttachmentRepository;
    private storageService: StorageService;

    constructor(attachmentRepository: AttachmentRepository, storageService: StorageService) {
        this.attachmentRepository = attachmentRepository;
        this.storageService = storageService;
    }

    /**
     * Upload an attachment for a note
     */
    async uploadAttachment(
        userId: string,
        noteId: string,
        fileName: string,
        fileBuffer: Buffer,
        fileSize: number,
        mimeType: string
    ): Promise<{ attachment: Attachment; uploadUrl: string }> {
        // Check user's total storage usage (10MB limit per user for free tier)
        const totalSize = await this.attachmentRepository.getTotalSizeByUserId(userId);
        const maxStorage = 100 * 1024 * 1024; // 100MB total storage limit

        if (totalSize + fileSize > maxStorage) {
            throw new ValidationError('Storage limit exceeded. Please delete some attachments or upgrade your plan.');
        }

        // Upload file to storage
        const { url, path } = await this.storageService.uploadFile(
            userId,
            noteId,
            fileName,
            fileBuffer,
            mimeType
        );

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
    async getAttachmentsByNoteId(noteId: string): Promise<Attachment[]> {
        return this.attachmentRepository.findByNoteId(noteId);
    }

    /**
     * Delete an attachment
     */
    async deleteAttachment(attachmentId: string): Promise<void> {
        const attachment = await this.attachmentRepository.findById(attachmentId);

        if (!attachment) {
            throw new NotFoundError('Attachment not found');
        }

        // Extract file path from URL
        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Delete from storage (continue with database deletion even if storage deletion fails)
        try {
            await this.storageService.deleteFile(fileName);
        } catch {
            // Storage deletion failed, but we still want to clean up the database record
        }

        // Delete from database
        await this.attachmentRepository.delete(attachmentId);
    }

    /**
     * Delete all attachments for a note
     */
    async deleteAttachmentsByNoteId(noteId: string): Promise<void> {
        const attachments = await this.attachmentRepository.findByNoteId(noteId);

        // Delete all files from storage
        for (const attachment of attachments) {
            try {
                const urlParts = attachment.url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                await this.storageService.deleteFile(fileName);
            } catch {
                // Continue even if individual file deletion fails
            }
        }

        // Delete all records from database
        await this.attachmentRepository.deleteByNoteId(noteId);
    }

    /**
     * Get user's total storage usage
     */
    async getUserStorageUsage(userId: string): Promise<{ totalBytes: number; totalMB: number }> {
        const totalBytes = await this.attachmentRepository.getTotalSizeByUserId(userId);
        const totalMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;

        return {
            totalBytes,
            totalMB,
        };
    }
}
