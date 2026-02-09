/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

/**
 * Success response helper
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const successResponse = (data = null, message = 'Success', statusCode = 200) => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Error response helper
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Validation errors or additional error info
 */
export const errorResponse = (message = 'Error', statusCode = 500, errors = null) => {
    return {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Pagination response helper
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
export const paginatedResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        timestamp: new Date().toISOString(),
    };
};

/**
 * NextResponse helpers for API routes
 */
import { NextResponse } from 'next/server';

export const apiSuccess = (data = null, message = 'Success', statusCode = 200) => {
    return NextResponse.json(successResponse(data, message, statusCode), { status: statusCode });
};

export const apiError = (message = 'Error', statusCode = 500, errors = null) => {
    return NextResponse.json(errorResponse(message, statusCode, errors), { status: statusCode });
};

export const apiPaginated = (data, page, limit, total, statusCode = 200) => {
    return NextResponse.json(paginatedResponse(data, page, limit, total), { status: statusCode });
};
