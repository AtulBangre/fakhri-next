/**
 * Error Handling Middleware
 * Centralized error handling for API routes
 */

import { apiError } from '@/utils/apiResponse';

/**
 * Error types
 */
export const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    PAYMENT_ERROR: 'PAYMENT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, statusCode = 500, type = ErrorTypes.INTERNAL_ERROR, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Create specific error types
 */
export const createError = {
    validation: (message, errors = null) =>
        new ApiError(message, 400, ErrorTypes.VALIDATION_ERROR, errors),

    unauthorized: (message = 'Unauthorized') =>
        new ApiError(message, 401, ErrorTypes.AUTHENTICATION_ERROR),

    forbidden: (message = 'Forbidden') =>
        new ApiError(message, 403, ErrorTypes.AUTHORIZATION_ERROR),

    notFound: (resource = 'Resource') =>
        new ApiError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND_ERROR),

    duplicate: (field = 'Record') =>
        new ApiError(`${field} already exists`, 409, ErrorTypes.DUPLICATE_ERROR),

    database: (message = 'Database error') =>
        new ApiError(message, 500, ErrorTypes.DATABASE_ERROR),

    payment: (message = 'Payment processing failed') =>
        new ApiError(message, 402, ErrorTypes.PAYMENT_ERROR),

    internal: (message = 'Internal server error') =>
        new ApiError(message, 500, ErrorTypes.INTERNAL_ERROR),
};

/**
 * Handle and format errors for API response
 * @param {Error} error - Error to handle
 * @returns {Response}
 */
export const handleError = (error) => {
    console.error('API Error:', error);

    // Handle known API errors
    if (error instanceof ApiError) {
        return apiError(error.message, error.statusCode, error.errors);
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
        });
        return apiError('Validation failed', 400, errors);
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return apiError(`${field} already exists`, 409);
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
        return apiError('Invalid ID format', 400);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return apiError('Invalid token', 401);
    }

    if (error.name === 'TokenExpiredError') {
        return apiError('Token expired', 401);
    }

    // Default internal server error
    return apiError(
        process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        500
    );
};

/**
 * Async handler wrapper for API routes
 * Catches errors and passes them to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function}
 */
export const asyncHandler = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            return handleError(error);
        }
    };
};
