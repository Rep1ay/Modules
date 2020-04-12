/**
 * Result of the dashboard validation service.
 */
export interface ValidationResult {
    /**
     * Whether the value was correct.
     */
    isValid: boolean;
    /**
     * Error message in case the value wasn't valid.
     */
    errorMessage?: string;
}