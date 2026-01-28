/**
 * Client-side application constants
 * Centralized location for all magic numbers and configurable values
 */

// Editor configuration
export const EDITOR_CONFIG = {
    /** Auto-save delay in milliseconds */
    AUTO_SAVE_DELAY_MS: 1000,
    /** Maximum note title length */
    MAX_TITLE_LENGTH: 200,
    /** Maximum tags per note */
    MAX_TAGS_PER_NOTE: 10,
} as const;

// Version history configuration
export const VERSION_CONFIG = {
    /** Maximum versions to keep per note */
    MAX_VERSIONS_PER_NOTE: 50,
} as const;

// UI configuration
export const UI_CONFIG = {
    /** Debounce delay for search input */
    SEARCH_DEBOUNCE_MS: 300,
    /** Notification display duration */
    NOTIFICATION_DURATION_MS: 3000,
} as const;
