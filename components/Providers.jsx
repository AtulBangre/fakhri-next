"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <SmoothScrollProvider>
                    {children}
                    <Sonner />
                </SmoothScrollProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
