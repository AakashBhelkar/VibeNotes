const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        console.log('Checking for existing user...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (existingUser) {
            console.log('✅ Test user already exists');
            // Update password just in case
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.update({
                where: { email: 'test@example.com' },
                data: { password: hashedPassword }
            });
            console.log('✅ Password reset to: password123');
            return;
        }

        console.log('Creating new user...');
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
