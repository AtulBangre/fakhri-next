/**
 * Authentication Middleware
 * Verify and validate user authentication
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { apiError } from '@/utils/apiResponse';

/**
 * Get the current session
 * @returns {Promise<Object|null>}
 */
export const getSession = async () => {
    return await getServerSession(authOptions);
};

/**
 * Require authentication middleware
 * Returns the session or an error response
 */
export const requireAuth = async () => {
    const session = await getSession();

    if (!session || !session.user) {
        return {
            authenticated: false,
            error: apiError('Unauthorized. Please login to continue.', 401),
        };
    }

    return {
        authenticated: true,
        session,
        user: session.user,
    };
};

/**
 * Require specific role(s) middleware
 * @param {string|string[]} allowedRoles - Role(s) that are allowed
 */
export const requireRole = async (allowedRoles) => {
    const auth = await requireAuth();

    if (!auth.authenticated) {
        return auth;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(auth.user.role)) {
        return {
            authenticated: true,
            authorized: false,
            error: apiError('Forbidden. You do not have permission to access this resource.', 403),
        };
    }

    return {
        authenticated: true,
        authorized: true,
        session: auth.session,
        user: auth.user,
    };
};

/**
 * Check if user is super admin
 */
export const requireSuperAdmin = async () => {
    return await requireRole('super-admin');
};

/**
 * Check if user is admin or super admin
 */
export const requireAdmin = async () => {
    return await requireRole(['super-admin', 'admin']);
};

/**
 * Check if user is client
 */
export const requireClient = async () => {
    return await requireRole('client');
};

/**
 * Get user from session with full details
 */
export const getCurrentUser = async () => {
    const session = await getSession();

    if (!session || !session.user) {
        return null;
    }

    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        company: session.user.company,
        planName: session.user.planName,
        image: session.user.image,
    };
};
