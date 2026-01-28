/**
 * Application constants and configuration values
 * Centralized location for all magic numbers and configurable values
 */

// Storage limits
export const STORAGE_CONFIG = {
    /** Maximum file size for uploads (10MB) */
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
    /** Maximum total storage per user (100MB) */
    MAX_STORAGE_PER_USER_BYTES: 100 * 1024 * 1024,
    /** Maximum total storage per user in MB */
    MAX_STORAGE_PER_USER_MB: 100,
    /** Allowed MIME types for uploads */
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ],
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
    /** JWT token expiration time */
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    /** JWT issuer claim */
    JWT_ISSUER: 'vibenotes-server',
    /** Rate limit window in milliseconds (15 minutes) */
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    /** Maximum requests per rate limit window */
    RATE_LIMIT_MAX_REQUESTS: 10,
} as const;

// Pagination defaults
export const PAGINATION_CONFIG = {
    /** Default page size */
    DEFAULT_PAGE_SIZE: 50,
    /** Maximum page size */
    MAX_PAGE_SIZE: 100,
} as const;
