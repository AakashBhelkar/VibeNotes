"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
// Password must be at least 8 characters with uppercase, lowercase, and number
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: passwordSchema,
        displayName: zod_1.z.string().min(1).max(100).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
