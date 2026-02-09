/**
 * Rate Limiting Middleware
 * Protect API endpoints from abuse
 */

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 60000);
}

/**
 * Rate limit configuration
 */
export const rateLimitConfig = {
    // Default limits
    default: { windowMs: 60000, max: 100 }, // 100 requests per minute

    // Strict limits for sensitive endpoints
    auth: { windowMs: 300000, max: 5 }, // 5 attempts per 5 minutes

    // API limits
    api: { windowMs: 60000, max: 60 }, // 60 requests per minute

    // Contact form
    contact: { windowMs: 3600000, max: 5 }, // 5 submissions per hour
};

/**
 * Check rate limit
 * @param {string} identifier - Unique identifier (IP, userId, etc.)
 * @param {string} endpoint - Endpoint being accessed
 * @param {Object} config - Rate limit configuration
 * @returns {Object} - Rate limit status
 */
export const checkRateLimit = (identifier, endpoint = 'default', config = null) => {
    const limitConfig = config || rateLimitConfig[endpoint] || rateLimitConfig.default;
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        record = {
            count: 1,
            resetTime: now + limitConfig.windowMs,
        };
        rateLimitStore.set(key, record);

        return {
            allowed: true,
            remaining: limitConfig.max - 1,
            resetTime: record.resetTime,
        };
    }

    record.count++;
    rateLimitStore.set(key, record);

    if (record.count > limitConfig.max) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime,
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
        };
    }

    return {
        allowed: true,
        remaining: limitConfig.max - record.count,
        resetTime: record.resetTime,
    };
};

/**
 * Get rate limit headers
 * @param {Object} limitStatus - Rate limit status
 * @returns {Object}
 */
export const getRateLimitHeaders = (limitStatus) => {
    return {
        'X-RateLimit-Remaining': limitStatus.remaining.toString(),
        'X-RateLimit-Reset': new Date(limitStatus.resetTime).toISOString(),
        ...(limitStatus.retryAfter && { 'Retry-After': limitStatus.retryAfter.toString() }),
    };
};

/**
 * Rate limit middleware for API routes
 * @param {Request} request - Incoming request
 * @param {string} endpoint - Endpoint type
 * @returns {Object|null} - Error response if rate limited, null otherwise
 */
export const withRateLimit = async (request, endpoint = 'default') => {
    // Get identifier (IP address or user ID)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    const limitStatus = checkRateLimit(ip, endpoint);

    if (!limitStatus.allowed) {
        const { NextResponse } = await import('next/server');
        return NextResponse.json(
            {
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: limitStatus.retryAfter,
            },
            {
                status: 429,
                headers: getRateLimitHeaders(limitStatus),
            }
        );
    }

    return null;
};
