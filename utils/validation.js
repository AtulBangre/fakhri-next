/**
 * Validation Utilities
 * Common validation functions for data integrity
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with strength score and messages
 */
export const validatePassword = (password) => {
    const result = {
        isValid: false,
        score: 0,
        messages: [],
    };

    if (!password || password.length < 6) {
        result.messages.push('Password must be at least 6 characters');
        return result;
    }

    result.score += 1;

    if (password.length >= 8) {
        result.score += 1;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        result.score += 1;
    } else {
        result.messages.push('Consider using both uppercase and lowercase letters');
    }

    if (/\d/.test(password)) {
        result.score += 1;
    } else {
        result.messages.push('Consider adding numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.score += 1;
    } else {
        result.messages.push('Consider adding special characters');
    }

    result.isValid = result.score >= 1;
    return result;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string}
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateRequired = (data, requiredFields) => {
    const errors = {};

    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            errors[field] = `${field} is required`;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate price/amount format
 * @param {number} amount - Amount to validate
 * @returns {boolean}
 */
export const isValidAmount = (amount) => {
    return typeof amount === 'number' && amount >= 0 && isFinite(amount);
};

/**
 * Validate date format
 * @param {string|Date} date - Date to validate
 * @returns {boolean}
 */
export const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
