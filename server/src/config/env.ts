import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates required environment variables on server startup
 */
const envSchema = z.object({
    // Required variables
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

    // Optional variables with defaults
    PORT: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(65535))
        .default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    API_URL: z.string().default('http://localhost:3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed config
 * Throws an error with details if validation fails
 */
export function validateEnv(): EnvConfig {
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
let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
    if (!_config) {
        _config = validateEnv();
    }
    return _config;
}
