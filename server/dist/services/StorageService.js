"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Storage service for handling file uploads to local filesystem
 * (Replaces Supabase Storage for simplified local development)
 */
class StorageService {
    constructor() {
        // Store files in 'uploads' directory in the server root
        this.uploadDir = path_1.default.join(__dirname, '../../uploads');
        this.baseUrl = process.env.API_URL || 'http://localhost:3001';
        // Ensure upload directory exists
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    /**
     * Generate a unique file name
     */
    generateFileName(userId, noteId, fileName) {
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        return `${userId}_${noteId}_${timestamp}_${sanitizedFileName}`;
    }
    /**
     * Upload a file to local storage
     */
    async uploadFile(userId, noteId, fileName, fileBuffer, mimeType) {
        const uniqueFileName = this.generateFileName(userId, noteId, fileName);
        const filePath = path_1.default.join(this.uploadDir, uniqueFileName);
        console.log('StorageService: Uploading file to:', filePath);
        console.log('StorageService: Upload directory:', this.uploadDir);
        try {
            await fs_1.default.promises.writeFile(filePath, fileBuffer);
            // Return the full URL to the file
            const url = `${this.baseUrl}/uploads/${uniqueFileName}`;
            return {
                url,
                path: uniqueFileName,
            };
        }
        catch (error) {
            console.error('StorageService: Write failed:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to upload file: ${message}`);
        }
    }
    /**
     * Delete a file from local storage
     */
    async deleteFile(fileName) {
        const filePath = path_1.default.join(this.uploadDir, fileName);
        try {
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete file: ${message}`);
        }
    }
    /**
     * Get a signed URL (Not needed for local storage, returns public URL)
     */
    async getSignedUrl(fileName, expiresIn = 3600) {
        return `${this.baseUrl}/uploads/${fileName}`;
    }
    /**
     * Check if bucket exists (No-op for local storage)
     */
    async ensureBucketExists() {
        // No-op
    }
}
exports.StorageService = StorageService;
