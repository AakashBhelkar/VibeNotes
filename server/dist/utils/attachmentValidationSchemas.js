"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentDeleteSchema = exports.attachmentUploadSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for attachment upload
 */
exports.attachmentUploadSchema = zod_1.z.object({
    noteId: zod_1.z.string().uuid('Invalid note ID'),
    fileName: zod_1.z.string().min(1, 'File name is required').max(255, 'File name too long'),
    fileSize: zod_1.z.number().int().positive('File size must be positive').max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
    mimeType: zod_1.z.string().regex(/^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/, 'Invalid file type. Only images and PDFs are allowed'),
});
/**
 * Validation schema for attachment deletion
 */
exports.attachmentDeleteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid attachment ID'),
});
