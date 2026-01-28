import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Connected to database');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Failed to connect', e);
        process.exit(1);
    }
}

main();
