"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";

// Sub-components
import HomePageManager from "../website/HomePageManager";
import AboutPageManager from "../website/AboutPageManager";
import ServicesPageManager from "../website/ServicesPageManager";
import PricingPageManager from "../website/PricingPageManager";
import ContactPageManager from "../website/ContactPageManager";
import BlogManager from "../website/BlogManager";
import CareersPageManager from "../website/CareersPageManager";
import FAQManager from "../website/FAQManager";
import TestimonialsManager from "../website/TestimonialsManager";
import Within2HoursManager from "../website/Within2HoursManager";
import NavigationManager from "../website/NavigationManager";

export default function WebsiteManagementTab() {
    const [activePage, setActivePage] = useState("home");

    const renderContent = () => {
        switch (activePage) {
            case "home":
                return <HomePageManager />;
            case "about":
                return <AboutPageManager />;
            case "services":
                return <ServicesPageManager />;
            case "pricing":
                return <PricingPageManager />;
            case "contact":
                return <ContactPageManager />;
            case "blog":
                return <BlogManager />;
            case "careers":
                return <CareersPageManager />;
            case "faq":
                return <FAQManager />;
            case "testimonials":
                return <TestimonialsManager />;
            case "within2hours":
                return <Within2HoursManager />;
            case "navigation":
                return <NavigationManager />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <Layout className="w-12 h-12 mb-4" />
                        <p>Select a page to manage content.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-heading">Website Content Management</h2>
                    <p className="text-muted-foreground">Manage dynamic content for your public facing pages.</p>
                </div>
            </div>

            {/* Sub-Navigation for Pages */}
            <div className="flex overflow-x-auto border-b pb-1 gap-2">
                {[
                    { id: "home", label: "Home Page" },
                    { id: "about", label: "About Us" },
                    { id: "services", label: "Services" },
                    { id: "pricing", label: "Pricing" },
                    { id: "contact", label: "Contact" },
                    { id: "blog", label: "Blog" },
                    { id: "careers", label: "Careers" },
                    { id: "faq", label: "FAQ" },
                    { id: "testimonials", label: "Testimonials" },
                    { id: "within2hours", label: "Within 2 Hours" },
                    { id: "navigation", label: "Navigation" },
                ].map((page) => (
                    <Button
                        key={page.id}
                        variant={activePage === page.id ? "default" : "ghost"}
                        onClick={() => setActivePage(page.id)}
                        className={`rounded-none border-b-2 bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent ${activePage === page.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {page.label}
                    </Button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-background rounded-lg border p-6 min-h-[500px]">
                {renderContent()}
            </div>
        </div>
    );
}
