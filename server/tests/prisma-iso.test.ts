import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Prisma Isolation', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should connect', async () => {
        const count = await prisma.user.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });
});
