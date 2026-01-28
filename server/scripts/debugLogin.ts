import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugLogin() {
    try {
        console.log('🔍 Debugging Login Issue...\n');

        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (!user) {
            console.log('❌ User not found in database');
            console.log('Creating test user...');

            const hashedPassword = await bcrypt.hash('password123', 10);
            const newUser = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: hashedPassword,
                    displayName: 'Test User'
                }
            });

            console.log('✅ Test user created');
            console.log('User ID:', newUser.id);
            console.log('Email:', newUser.email);
            return;
        }

        console.log('✅ User found in database');
        console.log('User ID:', user.id);
        console.log('Email:', user.email);
        console.log('Display Name:', user.displayName);
        console.log('Password Hash:', user.password.substring(0, 20) + '...');

        // 2. Test password comparison
        console.log('\n🔐 Testing password comparison...');
        const testPassword = 'password123';
        const isValid = await bcrypt.compare(testPassword, user.password);

        if (isValid) {
            console.log('✅ Password comparison successful');
            console.log('Test password "password123" matches the stored hash');
        } else {
            console.log('❌ Password comparison failed');
            console.log('The stored hash does not match "password123"');
            console.log('\n🔧 Updating password to "password123"...');

            const newHash = await bcrypt.hash('password123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHash }
            });

            console.log('✅ Password updated successfully');
        }

        // 3. Verify the update
        const updatedUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (updatedUser) {
            const finalCheck = await bcrypt.compare('password123', updatedUser.password);
            console.log('\n✅ Final verification:', finalCheck ? 'PASS' : 'FAIL');
        }

        console.log('\n📋 Login Credentials:');
        console.log('Email: test@example.com');
        console.log('Password: password123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLogin();
