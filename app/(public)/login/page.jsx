"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, Loader2, ArrowRight, User, Chrome } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Suspense } from "react";

function LoginContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") || "client";
    const callbackUrl = searchParams.get("callbackUrl") || (roleParam === "super-admin" ? "/super-admin/dashboard" : roleParam === "admin" ? "/admin/dashboard" : "/client/dashboard");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Priority 1: Specific callbackUrl from params (e.g. /checkout)
            const paramCallbackUrl = searchParams.get("callbackUrl");
            if (paramCallbackUrl) {
                router.push(paramCallbackUrl);
                return;
            }

            // Priority 2: Dashboard based on actual role
            const dashboardUrl = session.user.role === "super-admin"
                ? "/super-admin/dashboard"
                : session.user.role === "admin"
                    ? "/admin/dashboard"
                    : "/client/dashboard";
            router.push(dashboardUrl);
        }
    }, [status, session, router, searchParams]);


    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Login successful!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (roleParam === "super-admin" || roleParam === "admin") {
            toast.error("Google login is not allowed for administrators");
            return;
        }
        setGoogleLoading(true);
        await signIn("google", { callbackUrl: "/client/dashboard" });
    };

    const isAdminLogin = roleParam === "super-admin" || roleParam === "admin";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F5] p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="mb-8 flex flex-col items-center">
                <Logo className="h-12 w-auto mb-4" />
                <h1 className="text-2xl font-bold font-heading text-foreground">
                    {roleParam === "super-admin" ? "Super Admin Portal" : roleParam === "admin" ? "Admin Access" : "Client Dashboard"}
                </h1>
            </div>

            <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-black/5 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                        {isAdminLogin ? <Shield className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
                        Login
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            Sign In
                        </Button>
                    </form>

                    {!isAdminLogin && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                type="button"
                                className="w-full"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                            >
                                {googleLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Chrome className="mr-2 h-4 w-4" />
                                )}
                                Google
                            </Button>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline font-semibold">
                            Create one now
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to public website
            </Link>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
