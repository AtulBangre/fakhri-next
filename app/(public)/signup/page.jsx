"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Suspense } from "react";

function SignupContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Priority 1: Specific callbackUrl from params
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
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            toast.success("Account created successfully! Please login.");
            router.push("/login?role=client");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F5] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="mb-8 flex flex-col items-center">
                <Logo className="h-12 w-auto mb-4" />
                <h1 className="text-2xl font-bold font-heading text-foreground">
                    Create Client Account
                </h1>
            </div>

            <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-black/5 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        Sign Up
                    </CardTitle>
                    <CardDescription>
                        Fill in your details to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-10"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
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
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
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
                            Create Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-semibold">
                            Log in
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

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <SignupContent />
        </Suspense>
    );
}
