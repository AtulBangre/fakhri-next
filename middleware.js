import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Role-based access control
        if (path.startsWith("/super-admin") && token?.role !== "super-admin") {
            return NextResponse.redirect(new URL("/login?role=super-admin", req.url));
        }

        if (path.startsWith("/admin") && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/login?role=admin", req.url));
        }

        if (path.startsWith("/client") && token?.role !== "client") {
            return NextResponse.redirect(new URL("/login?role=client", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/super-admin/:path*",
        "/admin/:path*",
        "/client/:path*",
    ],
};
