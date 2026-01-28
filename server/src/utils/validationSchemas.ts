import { z } from 'zod';

// Password must be at least 8 characters with uppercase, lowercase, and number
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

export const signupSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: passwordSchema,
        displayName: z.string().min(1).max(100).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});
