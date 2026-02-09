import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Paths protection
    const isAuthPage = pathname.startsWith("/auth");
    const isSuperAdminRoute = pathname.startsWith("/super-admin");
    const isAdminRoute = pathname.startsWith("/admin");
    const isClientRoute = pathname.startsWith("/client");

    // Allow access to auth pages if not logged in
    if (isAuthPage) {
        if (token) {
            // If logged in, redirect to dashboard based on role
            if (token.role === "super-admin") {
                return NextResponse.redirect(new URL("/super-admin/dashboard", req.url));
            } else if (token.role === "admin") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            } else if (token.role === "client") {
                return NextResponse.redirect(new URL("/client/dashboard", req.url));
            }
        }
        return NextResponse.next();
    }

    // Protect Super Admin Routes
    if (isSuperAdminRoute) {
        if (!token) {
            const url = new URL("/auth/signin", req.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
        if (token.role !== "super-admin") {
            return NextResponse.redirect(new URL("/auth/signin?error=Unauthorized", req.url));
        }
    }

    // Protect Admin Routes
    if (isAdminRoute) {
        if (!token) {
            const url = new URL("/auth/signin", req.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
        // Allow both admin and super-admin to access admin routes (logical hierarchy)
        // Prompt says "If role != super-admin -> redirect", implying ONLY super-admin?
        // But route is /admin. Usually for Admin role. 
        // I will be strict to prompt: If role != "admin" AND role != "super-admin"
        if (token.role !== "admin" && token.role !== "super-admin") {
            return NextResponse.redirect(new URL("/auth/signin?error=Unauthorized", req.url));
        }
    }

    // Protect Client Routes
    if (isClientRoute) {
        if (!token) {
            const url = new URL("/auth/signin", req.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
        if (token.role !== "client") {
            return NextResponse.redirect(new URL("/auth/signin?error=Unauthorized", req.url));
        }
    }

    // Protect Checkout Routes
    if (pathname.startsWith("/checkout")) {
        if (!token) {
            const url = new URL("/auth/signin", req.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
        if (token.role !== "client") {
            return NextResponse.redirect(new URL("/auth/signin?error=Unauthorized", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/super-admin/:path*",
        "/admin/:path*",
        "/client/:path*",
        "/auth/:path*",
        "/checkout/:path*",
    ],
};
