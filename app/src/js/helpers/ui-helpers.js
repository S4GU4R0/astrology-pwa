/**
 * UI Helper Functions for Astrodex
 * Loading indicators, progress bars, and toast notifications
 */

/**
 * Shows a loading spinner in an element
 * @param {string} elementId - ID of the element to show spinner in
 * @param {string} message - Loading message to display
 */
function showLoadingSpinner(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Hides/removes the loading spinner from an element
 * @param {string} elementId - ID of the element containing the spinner
 */
function hideLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * Shows a progress bar in an element
 * @param {string} elementId - ID of the element to show progress in
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} message - Optional message to display
 */
function showProgressBar(elementId, percentage, message = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    element.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${clampedPercentage}%"></div>
            <span class="progress-text">${clampedPercentage}%${message ? ' - ' + message : ''}</span>
        </div>
    `;
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast: 'info', 'success', 'warning', 'error'
 */
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ES module exports
export { showLoadingSpinner, hideLoadingSpinner, showProgressBar, showToast };

// Expose globally for legacy code
window.showLoadingSpinner = showLoadingSpinner;
window.hideLoadingSpinner = hideLoadingSpinner;
window.showProgressBar = showProgressBar;
window.showToast = showToast;
