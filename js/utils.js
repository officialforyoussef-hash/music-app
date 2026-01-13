/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Safe querySelector wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element (defaults to document)
 * @returns {Element|null}
 */
function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Safe querySelectorAll wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Optional context element (defaults to document)
 * @returns {NodeList}
 */
function $$(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Safe addEventListener wrapper
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
function on(element, event, handler, options = {}) {
    if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler, options);
    }
}

/**
 * Format seconds to mm:ss
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { $, $$, on, formatTime, clamp, debounce };
}
