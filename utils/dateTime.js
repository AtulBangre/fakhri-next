/**
 * Date/Time Utilities
 * Common date formatting and manipulation functions
 */

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full', 'relative')
 * @returns {string}
 */
export const formatDate = (date, format = 'short') => {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }

    const options = {
        short: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    if (format === 'relative') {
        return getRelativeTime(d);
    }

    return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string}
 */
export const getRelativeTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
export const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
export const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

/**
 * Add months to a date
 * @param {Date|string} date - Starting date
 * @param {number} months - Number of months to add
 * @returns {Date}
 */
export const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

/**
 * Get days remaining until a date
 * @param {Date|string} targetDate - Target date
 * @returns {number}
 */
export const getDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is expired
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isExpired = (date) => {
    return new Date(date) < new Date();
};

/**
 * Get start and end of day
 * @param {Date|string} date - Date
 * @returns {Object} - { startOfDay, endOfDay }
 */
export const getDayBounds = (date) => {
    const d = new Date(date);
    const startOfDay = new Date(d.setHours(0, 0, 0, 0));
    const endOfDay = new Date(d.setHours(23, 59, 59, 999));
    return { startOfDay, endOfDay };
};

/**
 * Get start and end of month
 * @param {Date|string} date - Date
 * @returns {Object} - { startOfMonth, endOfMonth }
 */
export const getMonthBounds = (date) => {
    const d = new Date(date);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
};
