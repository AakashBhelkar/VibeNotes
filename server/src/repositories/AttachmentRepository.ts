import { PrismaClient, Attachment } from '@prisma/client';

/**
 * Repository for attachment data access
 */
export class AttachmentRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Create a new attachment record
     */
    async create(data: {
        noteId: string;
        url: string;
        fileName: string;
        size: number;
    }): Promise<Attachment> {
        return this.prisma.attachment.create({
            data,
        });
    }

    /**
     * Get attachment by ID
     */
    async findById(id: string): Promise<Attachment | null> {
        return this.prisma.attachment.findUnique({
            where: { id },
        });
    }

    /**
     * Get all attachments for a note
     */
    async findByNoteId(noteId: string): Promise<Attachment[]> {
        return this.prisma.attachment.findMany({
            where: { noteId },
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Delete an attachment
     */
    async delete(id: string): Promise<Attachment> {
        return this.prisma.attachment.delete({
            where: { id },
        });
    }

    /**
     * Delete all attachments for a note
     */
    async deleteByNoteId(noteId: string): Promise<{ count: number }> {
        return this.prisma.attachment.deleteMany({
            where: { noteId },
        });
    }

    /**
     * Get total attachment size for a user
     */
    async getTotalSizeByUserId(userId: string): Promise<number> {
        const result = await this.prisma.attachment.aggregate({
            where: {
                note: {
                    userId,
                },
            },
            _sum: {
                size: true,
            },
        });

        return result._sum.size || 0;
    }
}
