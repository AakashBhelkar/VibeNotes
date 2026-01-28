import Plausible from 'plausible-tracker';

/**
 * Analytics service for privacy-friendly event tracking
 * Uses Plausible Analytics - no cookies, no personal data collection
 */

// Initialize Plausible
const plausible = Plausible({
    domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'vibenotes.app',
    apiHost: import.meta.env.VITE_PLAUSIBLE_API || 'https://plausible.io',
});

export const analyticsService = {
    /**
     * Track page views automatically
     */
    trackPageView() {
        plausible.trackPageview();
    },

    /**
     * Track custom events with optional properties
     */
    trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
        plausible.trackEvent(eventName, { props });
    },

    // Note Operations
    trackNoteCreated(hasTemplate: boolean = false) {
        this.trackEvent('Note Created', { from_template: hasTemplate });
    },

    trackNoteUpdated() {
        this.trackEvent('Note Updated');
    },

    trackNoteDeleted() {
        this.trackEvent('Note Deleted');
    },

    trackNotePinned() {
        this.trackEvent('Note Pinned');
    },

    trackNoteUnpinned() {
        this.trackEvent('Note Unpinned');
    },

    // Search & Filtering
    trackSearch(hasQuery: boolean, hasTagFilter: boolean, hasDateFilter: boolean) {
        this.trackEvent('Search Performed', {
            has_query: hasQuery,
            has_tag_filter: hasTagFilter,
            has_date_filter: hasDateFilter,
        });
    },

    trackTagFilterApplied(tagCount: number) {
        this.trackEvent('Tag Filter Applied', { tag_count: tagCount });
    },

    // Export Operations
    trackExport(format: 'json' | 'markdown' | 'pdf') {
        this.trackEvent('Export Used', { format });
    },

    trackImport(noteCount: number) {
        this.trackEvent('Import Used', { note_count: noteCount });
    },

    // Template Usage
    trackTemplateUsed(templateName: string, isCustom: boolean = false) {
        this.trackEvent('Template Selected', {
            template: templateName,
            is_custom: isCustom,
        });
    },

    trackDailyNoteCreated() {
        this.trackEvent('Daily Note Created');
    },

    // Attachment Operations
    trackAttachmentUploaded(fileType: string, fileSizeKB: number) {
        this.trackEvent('Attachment Uploaded', {
            file_type: fileType,
            file_size_kb: fileSizeKB,
        });
    },

    trackAttachmentDeleted() {
        this.trackEvent('Attachment Deleted');
    },

    // Onboarding
    trackOnboardingCompleted(createdSampleNotes: boolean) {
        this.trackEvent('Onboarding Completed', {
            created_samples: createdSampleNotes,
        });
    },

    trackOnboardingSkipped() {
        this.trackEvent('Onboarding Skipped');
    },

    // Sync Operations
    trackSyncCompleted(noteCount: number) {
        this.trackEvent('Sync Completed', { note_count: noteCount });
    },

    trackSyncFailed() {
        this.trackEvent('Sync Failed');
    },

    // User Actions
    trackLogin() {
        this.trackEvent('User Login');
    },

    trackSignup() {
        this.trackEvent('User Signup');
    },

    trackLogout() {
        this.trackEvent('User Logout');
    },

    // Version History (when implemented)
    trackVersionRestored() {
        this.trackEvent('Version Restored');
    },

    trackVersionHistoryViewed() {
        this.trackEvent('Version History Viewed');
    },
};
