import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // Check if test user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (existingUser) {
            console.log('✅ Test user already exists');
            console.log('Email: test@example.com');
            console.log('Password: password123');
            return;
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: hashedPassword,
                displayName: 'Test User'
            }
        });

        console.log('✅ Test user created successfully!');
        console.log('Email: test@example.com');
        console.log('Password: password123');
        console.log('User ID:', user.id);
    } catch (error) {
        console.error('❌ Error creating test user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
