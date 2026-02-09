/**
 * Price/Currency Utilities
 * Formatting and calculations for monetary values
 */

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (INR, USD, etc.)
 * @param {string} locale - Locale for formatting
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string}
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Calculate tax amount
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number}
 */
export const calculateTax = (amount, taxRate = 18) => {
    return Math.round((amount * taxRate) / 100);
};

/**
 * Calculate total with tax
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {Object} - { subtotal, tax, total }
 */
export const calculateTotalWithTax = (amount, taxRate = 18) => {
    const subtotal = amount;
    const tax = calculateTax(amount, taxRate);
    const total = subtotal + tax;
    return { subtotal, tax, total };
};

/**
 * Apply discount to amount
 * @param {number} amount - Original amount
 * @param {number} discount - Discount amount or percentage
 * @param {boolean} isPercentage - Whether discount is a percentage
 * @returns {number}
 */
export const applyDiscount = (amount, discount, isPercentage = false) => {
    if (isPercentage) {
        return amount - (amount * discount / 100);
    }
    return Math.max(0, amount - discount);
};

/**
 * Calculate subscription price for period
 * @param {number} monthlyPrice - Monthly price
 * @param {number} months - Number of months
 * @param {number} discountPercent - Discount for longer periods
 * @returns {Object}
 */
export const calculateSubscriptionPrice = (monthlyPrice, months = 1, discountPercent = 0) => {
    const baseTotal = monthlyPrice * months;
    const discount = Math.round((baseTotal * discountPercent) / 100);
    const subtotal = baseTotal - discount;
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    return {
        monthlyPrice,
        months,
        baseTotal,
        discount,
        subtotal,
        tax,
        total,
        effectiveMonthly: Math.round(subtotal / months),
    };
};

/**
 * Parse price string to number
 * @param {string} priceStr - Price string (e.g., "₹15,000")
 * @returns {number}
 */
export const parsePriceString = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    return parseFloat(priceStr.replace(/[^0-9.-]+/g, '')) || 0;
};

/**
 * Convert currency symbol to code
 * @param {string} symbol - Currency symbol
 * @returns {string}
 */
export const symbolToCode = (symbol) => {
    const map = {
        '₹': 'INR',
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
    };
    return map[symbol] || 'INR';
};
