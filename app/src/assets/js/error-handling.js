/**
 * Error Handling Utilities for Astrodex
 * Provides validation, error handling, and user-friendly error display
 */

/**
 * Validates birth data inputs
 * @param {string} name - Person's name
 * @param {string} date - Birth date (YYYY-MM-DD format)
 * @param {string} time - Birth time (HH:MM format)
 * @param {string} location - Birth location
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateBirthData(name, date, time, location) {
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!date) {
        errors.push('Birth date is required');
    } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            errors.push('Invalid date format');
        } else {
            const year = dateObj.getFullYear();
            if (year < 1800 || year > new Date().getFullYear()) {
                errors.push('Birth year must be between 1800 and current year');
            }
        }
    }

    if (!time) {
        errors.push('Birth time is required');
    } else {
        const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timePattern.test(time)) {
            errors.push('Invalid time format (use HH:MM)');
        }
    }

    if (!location || location.trim().length === 0) {
        errors.push('Birth location is required');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Handles geocoding errors with user-friendly messages
 * @param {Error} error - The geocoding error
 * @returns {string} - User-friendly error message
 */
function handleGeocodingError(error) {
    if (!navigator.onLine) {
        return 'No internet connection. Please check your network and try again.';
    }
    if (error.message && error.message.includes('not found')) {
        return 'Location not found. Please try a different location name.';
    }
    return 'Unable to geocode location. Please check the location name and try again.';
}

/**
 * Handles calculation errors with context
 * @param {Error} error - The calculation error
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
function handleCalculationError(error, context = 'calculation') {
    console.error(`Calculation error in ${context}:`, error);
    if (error.message && error.message.includes('invalid date')) {
        return `Invalid date provided for ${context}. Please check your birth date and time.`;
    }
    return `Error during ${context}. Please check your input data and try again.`;
}

/**
 * Handles localStorage errors
 * @param {Error} error - The storage error
 * @returns {string} - User-friendly error message
 */
function handleStorageError(error) {
    console.error('Storage error:', error);
    if (error.name === 'QuotaExceededError') {
        return 'Browser storage is full. Please clear some data.';
    }
    return 'Unable to save data to browser storage.';
}

/**
 * Displays an error message using toast notifications
 * @param {string} message - Error message to display
 * @param {string} type - Error type: 'error', 'warning', 'info'
 */
function showError(message, type = 'error') {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        console.error(message);
    }
}
