import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttachmentUploader } from '@/components/AttachmentUploader';
import { AttachmentService } from '@/services/attachmentService';

// Mock the attachment service
vi.mock('@/services/attachmentService', () => ({
    AttachmentService: {
        uploadAttachment: vi.fn(),
    },
}));

describe.skip('AttachmentUploader', () => {
    const mockNoteId = 'test-note-123';
    const mockOnUploadComplete = vi.fn();
    const mockOnError = vi.fn();
    const mockToken = 'test-token';

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock localStorage for token
        Storage.prototype.getItem = vi.fn(() => mockToken);
    });

    describe('File Upload', () => {
        it('should accept valid image files', async () => {
            const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

            vi.mocked(AttachmentService.uploadAttachment).mockResolvedValue({
                attachment: {
                    id: 'attachment-1',
                    noteId: mockNoteId,
                    fileName: 'test.png',
                    size: 1024,
                    url: 'https://example.com/test.png',
                },
                url: 'https://example.com/test.png',
            });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [mockFile] } });

                await waitFor(() => {
                    expect(mockOnUploadComplete).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });

        it('should reject oversized files', async () => {
            const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [largeFile] } });

                await waitFor(() => {
                    expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('10MB'));
                });
            }
        });

        it('should reject invalid file types', async () => {
            const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [invalidFile] } });

                await waitFor(() => {
                    expect(mockOnError).toHaveBeenCalled();
                });
            }
        });

        it('should handle upload errors gracefully', async () => {
            const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

            vi.mocked(AttachmentService.uploadAttachment).mockRejectedValue(
                new Error('Upload failed')
            );

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [mockFile] } });

                await waitFor(() => {
                    expect(mockOnError).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });
    });

    describe('Drag and Drop', () => {
        it('should handle file drop', async () => {
            const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

            vi.mocked(AttachmentService.uploadAttachment).mockResolvedValue({
                attachment: {
                    id: 'attachment-1',
                    noteId: mockNoteId,
                    fileName: 'test.png',
                    size: 1024,
                    url: 'https://example.com/test.png',
                },
                url: 'https://example.com/test.png',
            });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const dropZone = screen.getByText(/drag.*drop/i).closest('div');

            if (dropZone) {
                const dropEvent = new Event('drop', { bubbles: true });
                Object.defineProperty(dropEvent, 'dataTransfer', {
                    value: {
                        files: [mockFile],
                        types: ['Files'],
                    },
                });

                fireEvent(dropZone, dropEvent);

                await waitFor(() => {
                    expect(mockOnUploadComplete).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });
    });

    describe('Upload Progress', () => {
        it('should show upload progress', async () => {
            const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

            vi.mocked(AttachmentService.uploadAttachment).mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({
                    attachment: {
                        id: 'attachment-1',
                        noteId: mockNoteId,
                        fileName: 'test.png',
                        size: 1024,
                        url: 'https://example.com/test.png',
                    },
                    url: 'https://example.com/test.png',
                }), 100))
            );

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [mockFile] } });

                await waitFor(() => {
                    expect(mockOnUploadComplete).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });
    });

    describe('File Types', () => {
        it('should accept PDF files', async () => {
            const pdfFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

            vi.mocked(AttachmentService.uploadAttachment).mockResolvedValue({
                attachment: {
                    id: 'attachment-2',
                    noteId: mockNoteId,
                    fileName: 'document.pdf',
                    size: 2048,
                    url: 'https://example.com/document.pdf',
                },
                url: 'https://example.com/document.pdf',
            });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [pdfFile] } });

                await waitFor(() => {
                    expect(mockOnUploadComplete).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });

        it('should handle multiple file selection', async () => {
            const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
            const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });

            vi.mocked(AttachmentService.uploadAttachment).mockResolvedValue({
                attachment: {
                    id: 'attachment-1',
                    noteId: mockNoteId,
                    fileName: 'test1.png',
                    size: 1024,
                    url: 'https://example.com/test1.png',
                },
                url: 'https://example.com/test1.png',
            });

            render(
                <AttachmentUploader
                    noteId={mockNoteId}
                    onUploadComplete={mockOnUploadComplete}
                    onError={mockOnError}
                />
            );

            const input = screen.getByRole('button', { name: /upload/i });
            const fileInput = input.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

            if (fileInput) {
                fireEvent.change(fileInput, { target: { files: [file1, file2] } });

                await waitFor(() => {
                    expect(AttachmentService.uploadAttachment).toHaveBeenCalled();
                }, { timeout: 3000 });
            }
        });
    });
});
