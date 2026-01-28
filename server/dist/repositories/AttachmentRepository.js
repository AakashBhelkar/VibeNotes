"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentRepository = void 0;
/**
 * Repository for attachment data access
 */
class AttachmentRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a new attachment record
     */
    async create(data) {
        return this.prisma.attachment.create({
            data,
        });
    }
    /**
     * Get attachment by ID
     */
    async findById(id) {
        return this.prisma.attachment.findUnique({
            where: { id },
        });
    }
    /**
     * Get all attachments for a note
     */
    async findByNoteId(noteId) {
        return this.prisma.attachment.findMany({
            where: { noteId },
            orderBy: { id: 'asc' },
        });
    }
    /**
     * Delete an attachment
     */
    async delete(id) {
        return this.prisma.attachment.delete({
            where: { id },
        });
    }
    /**
     * Delete all attachments for a note
     */
    async deleteByNoteId(noteId) {
        return this.prisma.attachment.deleteMany({
            where: { noteId },
        });
    }
    /**
     * Get total attachment size for a user
     */
    async getTotalSizeByUserId(userId) {
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
exports.AttachmentRepository = AttachmentRepository;
