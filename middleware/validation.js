/**
 * Validation Middleware
 * Request validation and sanitization
 */

import { apiError } from '@/utils/apiResponse';
import { validateRequired, isValidEmail, isValidPhone, isValidObjectId, sanitizeString } from '@/utils/validation';

/**
 * Validate request body against schema
 * @param {Object} body - Request body
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export const validateBody = (body, schema) => {
    const errors = {};
    const sanitized = {};

    for (const [field, rules] of Object.entries(schema)) {
        let value = body[field];

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors[field] = rules.message || `${field} is required`;
            continue;
        }

        // Skip optional fields that are not provided
        if (value === undefined || value === null) {
            continue;
        }

        // Type validation
        if (rules.type) {
            switch (rules.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors[field] = `${field} must be a string`;
                        continue;
                    }
                    value = sanitizeString(value);
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors[field] = `${field} must be a number`;
                        continue;
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors[field] = `${field} must be a boolean`;
                        continue;
                    }
                    break;
                case 'email':
                    if (!isValidEmail(value)) {
                        errors[field] = 'Please provide a valid email address';
                        continue;
                    }
                    value = value.toLowerCase().trim();
                    break;
                case 'phone':
                    if (value && !isValidPhone(value)) {
                        errors[field] = 'Please provide a valid phone number';
                        continue;
                    }
                    break;
                case 'objectId':
                    if (!isValidObjectId(value)) {
                        errors[field] = `${field} must be a valid ID`;
                        continue;
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        errors[field] = `${field} must be an array`;
                        continue;
                    }
                    break;
            }
        }

        // Min length
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            errors[field] = `${field} must be at least ${rules.minLength} characters`;
            continue;
        }

        // Max length
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
            errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
            continue;
        }

        // Min value
        if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
            errors[field] = `${field} must be at least ${rules.min}`;
            continue;
        }

        // Max value
        if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
            errors[field] = `${field} must not exceed ${rules.max}`;
            continue;
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
            continue;
        }

        sanitized[field] = value;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data: sanitized,
    };
};

/**
 * Create validation middleware for API routes
 * @param {Object} schema - Validation schema
 * @returns {Function}
 */
export const withValidation = (schema) => {
    return async (body) => {
        const result = validateBody(body, schema);

        if (!result.isValid) {
            return {
                valid: false,
                response: apiError('Validation failed', 400, result.errors),
            };
        }

        return {
            valid: true,
            data: result.data,
        };
    };
};

// Common validation schemas
export const schemas = {
    login: {
        email: { required: true, type: 'email' },
        password: { required: true, type: 'string', minLength: 6 },
    },
    register: {
        name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
        email: { required: true, type: 'email' },
        password: { required: true, type: 'string', minLength: 6 },
        phone: { required: false, type: 'phone' },
        company: { required: false, type: 'string', maxLength: 200 },
    },
    contactMessage: {
        name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
        email: { required: true, type: 'email' },
        phone: { required: false, type: 'phone' },
        company: { required: false, type: 'string', maxLength: 200 },
        service: { required: false, type: 'string' },
        subject: { required: false, type: 'string', minLength: 5, maxLength: 200 },
        message: { required: true, type: 'string', minLength: 10, maxLength: 5000 },
        category: { required: false, type: 'string', enum: ['general', 'sales', 'support', 'partnership', 'career', 'feedback', 'other'] },
    },
    createOrder: {
        planId: { required: true, type: 'string' },
        billingName: { required: true, type: 'string' },
        billingEmail: { required: true, type: 'email' },
        billingPhone: { required: true, type: 'phone' },
    },
    updateUser: {
        name: { required: false, type: 'string', minLength: 2, maxLength: 100 },
        phone: { required: false, type: 'phone' },
        company: { required: false, type: 'string', maxLength: 200 },
    },
    createTask: {
        title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
        description: { required: false, type: 'string', maxLength: 2000 },
        clientId: { required: true, type: 'objectId' },
        service: { required: true, type: 'string' },
        priority: { required: false, type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
        dueDate: { required: false, type: 'string' },
    },
};
