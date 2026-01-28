import { z } from 'zod';

/**
 * Validation schema for attachment upload
 */
export const attachmentUploadSchema = z.object({
    noteId: z.string().uuid('Invalid note ID'),
    fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
    fileSize: z.number().int().positive('File size must be positive').max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
    mimeType: z.string().regex(/^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/, 'Invalid file type. Only images and PDFs are allowed'),
});

/**
 * Validation schema for attachment deletion
 */
export const attachmentDeleteSchema = z.object({
    id: z.string().uuid('Invalid attachment ID'),
});

/**
 * Type for attachment upload request
 */
export type AttachmentUploadRequest = z.infer<typeof attachmentUploadSchema>;

/**
 * Type for attachment delete request
 */
export type AttachmentDeleteRequest = z.infer<typeof attachmentDeleteSchema>;
