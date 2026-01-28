import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { AttachmentService, Attachment } from '@/services/attachmentService';

interface AttachmentUploaderProps {
    noteId: string;
    onUploadComplete: (attachment: Attachment) => void;
    onError: (error: string) => void;
}

/**
 * Component for uploading file attachments
 */
export function AttachmentUploader({ noteId, onUploadComplete, onError }: AttachmentUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!AttachmentService.isValidFileType(file)) {
            onError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed.');
            return;
        }

        // Validate file size
        if (!AttachmentService.isValidFileSize(file)) {
            onError('File size exceeds 10MB limit.');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        let progressInterval: ReturnType<typeof setInterval> | null = null;

        try {
            const token = localStorage.getItem('vibenote-token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Simulate progress (since we don't have real progress from axios)
            progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        if (progressInterval) clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await AttachmentService.uploadAttachment(noteId, selectedFile, token);

            if (progressInterval) clearInterval(progressInterval);
            setUploadProgress(100);

            setTimeout(() => {
                onUploadComplete(result.attachment);
                setSelectedFile(null);
                setUploadProgress(0);
                setIsUploading(false);
            }, 500);
        } catch (error) {
            // Clear interval to prevent memory leak
            if (progressInterval) clearInterval(progressInterval);
            setIsUploading(false);
            setUploadProgress(0);
            const message = error instanceof Error ? error.message : 'Failed to upload file';
            onError(message);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                {!selectedFile ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop a file here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Supported: Images (JPEG, PNG, GIF, WebP) and PDFs • Max 10MB
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Select File
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
                            onChange={handleFileInputChange}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            {AttachmentService.isImage(selectedFile.name) ? (
                                <ImageIcon className="h-8 w-8 text-primary" />
                            ) : (
                                <FileText className="h-8 w-8 text-primary" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {AttachmentService.formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            {!isUploading && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancel}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {isUploading && (
                            <div className="space-y-2">
                                <Progress value={uploadProgress} />
                                <p className="text-xs text-center text-muted-foreground">
                                    Uploading... {uploadProgress}%
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex-1"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                            {!isUploading && (
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
