"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
exports.getConfig = getConfig;
const zod_1 = require("zod");
/**
 * Environment variable validation schema
 * Validates required environment variables on server startup
 */
const envSchema = zod_1.z.object({
    // Required variables
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    // Optional variables with defaults
    PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(65535))
        .default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    API_URL: zod_1.z.string().default('http://localhost:3001'),
});
/**
 * Validates environment variables and returns typed config
 * Throws an error with details if validation fails
 */
function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        const errors = result.error.errors
            .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
            .join('\n');
        throw new Error(`Environment validation failed:\n${errors}`);
    }
    return result.data;
}
// Export validated config (lazy initialization)
let _config = null;
function getConfig() {
    if (!_config) {
        _config = validateEnv();
    }
    return _config;
}
