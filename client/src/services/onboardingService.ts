/**
 * Onboarding service to manage first-time user experience
 */

const ONBOARDING_KEY = 'vibenotes_onboarding_completed';
const SAMPLE_NOTES_KEY = 'vibenotes_sample_notes_created';

export const onboardingService = {
    /**
     * Check if user has completed onboarding
     */
    hasCompletedOnboarding(): boolean {
        return localStorage.getItem(ONBOARDING_KEY) === 'true';
    },

    /**
     * Mark onboarding as completed
     */
    completeOnboarding(): void {
        localStorage.setItem(ONBOARDING_KEY, 'true');
    },

    /**
     * Reset onboarding (for testing)
     */
    resetOnboarding(): void {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(SAMPLE_NOTES_KEY);
    },

    /**
     * Check if sample notes have been created
     */
    hasSampleNotes(): boolean {
        return localStorage.getItem(SAMPLE_NOTES_KEY) === 'true';
    },

    /**
     * Mark sample notes as created
     */
    markSampleNotesCreated(): void {
        localStorage.setItem(SAMPLE_NOTES_KEY, 'true');
    },

    /**
     * Check if this is the user's first visit
     */
    isFirstVisit(): boolean {
        return !this.hasCompletedOnboarding();
    },
};
