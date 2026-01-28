import fs from 'fs';
import path from 'path';

/**
 * Storage service for handling file uploads to local filesystem
 * (Replaces Supabase Storage for simplified local development)
 */
export class StorageService {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        // Store files in 'uploads' directory in the server root
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.baseUrl = process.env.API_URL || 'http://localhost:3001';

        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Generate a unique file name
     */
    private generateFileName(userId: string, noteId: string, fileName: string): string {
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        return `${userId}_${noteId}_${timestamp}_${sanitizedFileName}`;
    }

    /**
     * Upload a file to local storage
     */
    async uploadFile(
        userId: string,
        noteId: string,
        fileName: string,
        fileBuffer: Buffer,
        mimeType: string
    ): Promise<{ url: string; path: string }> {
        const uniqueFileName = this.generateFileName(userId, noteId, fileName);
        const filePath = path.join(this.uploadDir, uniqueFileName);

        try {
            await fs.promises.writeFile(filePath, fileBuffer);

            // Return the full URL to the file
            const url = `${this.baseUrl}/uploads/${uniqueFileName}`;

            return {
                url,
                path: uniqueFileName,
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to upload file: ${message}`);
        }
    }

    /**
     * Delete a file from local storage
     */
    async deleteFile(fileName: string): Promise<void> {
        const filePath = path.join(this.uploadDir, fileName);

        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete file: ${message}`);
        }
    }

    /**
     * Get a signed URL (Not needed for local storage, returns public URL)
     */
    async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
        return `${this.baseUrl}/uploads/${fileName}`;
    }

    /**
     * Check if bucket exists (No-op for local storage)
     */
    async ensureBucketExists(): Promise<void> {
        // No-op
    }
}
