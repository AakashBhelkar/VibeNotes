import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Attachment {
    id: string;
    noteId: string;
    url: string;
    fileName: string;
    size: number;
}

export interface StorageUsage {
    usage: {
        totalBytes: number;
        totalMB: number;
    };
    limit: {
        totalBytes: number;
        totalMB: number;
    };
}

/**
 * Service for managing note attachments
 */
export class AttachmentService {
    /**
     * Upload a file attachment to a note
     */
    static async uploadAttachment(
        noteId: string,
        file: File,
        token: string
    ): Promise<{ attachment: Attachment; url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('noteId', noteId);

        const response = await axios.post(
            `${API_URL}/api/attachments/upload`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    }

    /**
     * Get all attachments for a note
     */
    static async getAttachmentsByNoteId(
        noteId: string,
        token: string
    ): Promise<Attachment[]> {
        const response = await axios.get(
            `${API_URL}/api/attachments/note/${noteId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return response.data.attachments;
    }

    /**
     * Delete an attachment
     */
    static async deleteAttachment(
        attachmentId: string,
        token: string
    ): Promise<void> {
        await axios.delete(
            `${API_URL}/api/attachments/${attachmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
    }

    /**
     * Get user's storage usage
     */
    static async getStorageUsage(token: string): Promise<StorageUsage> {
        const response = await axios.get(
            `${API_URL}/api/attachments/storage/usage`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return response.data;
    }

    /**
     * Format file size to human-readable format
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        if (bytes < 0) return 'Invalid size';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.min(
            Math.floor(Math.log(bytes) / Math.log(k)),
            sizes.length - 1
        );

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Check if file type is allowed
     */
    static isValidFileType(file: File): boolean {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        return allowedTypes.includes(file.type);
    }

    /**
     * Check if file size is within limit
     */
    static isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    /**
     * Get file type icon
     */
    static getFileTypeIcon(fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return '🖼️';
            case 'pdf':
                return '📄';
            default:
                return '📎';
        }
    }

    /**
     * Check if file is an image
     */
    static isImage(fileName: string): boolean {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    }
}
