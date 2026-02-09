/**
 * ID Generation Utilities
 * Consistent ID generation across the application
 */

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'USR', 'ORD', 'TXN')
 * @param {number} count - Current count for sequential numbering
 * @returns {string}
 */
export const generateId = (prefix, count) => {
    return `${prefix}-${count.toString().padStart(6, '0')}`;
};

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of the string
 * @returns {string}
 */
export const generateRandomString = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate invoice number
 * @param {Date} date - Invoice date
 * @param {number} sequence - Sequence number
 * @returns {string}
 */
export const generateInvoiceNumber = (date = new Date(), sequence = 1) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `INV-${year}${month}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Generate order number
 * @param {number} sequence - Sequence number
 * @returns {string}
 */
export const generateOrderNumber = (sequence = 1) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ORD-${timestamp}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Generate transaction ID
 * @returns {string}
 */
export const generateTransactionId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = generateRandomString(8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string}
 */
export const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Generate file name with timestamp
 * @param {string} originalName - Original file name
 * @returns {string}
 */
export const generateFileName = (originalName) => {
    const timestamp = Date.now();
    const random = generateRandomString(6);
    const ext = originalName.split('.').pop();
    const name = originalName.replace(`.${ext}`, '');
    const slug = generateSlug(name);
    return `${slug}-${timestamp}-${random}.${ext}`;
};
