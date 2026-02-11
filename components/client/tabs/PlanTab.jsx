"use client";
import { useState } from "react";
import { CheckCircle2, Star, Plus, ShoppingCart, Zap, Image, Target, TrendingUp, Package, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { servicesCatalog } from "@/data/servicesCatalog";
import { getClientById } from "@/data/clients";
import { plans, planFeatures as allPlanFeatures } from "@/data/pricingPlans";

const CURRENT_CLIENT_ID = 1;

const purchasedAddOns = [
    { id: 1, name: "Extra A+ Content Design", quantity: 2, date: "Jan 10, 2026", status: "completed" },
    { id: 2, name: "PPC Campaign Boost", quantity: 1, date: "Dec 20, 2025", status: "in-progress" },
];

const ClientPlanTab = () => {
    const [activeSubTab, setActiveSubTab] = useState("plan");

    const client = getClientById(CURRENT_CLIENT_ID);

    if (!client) return <div>Loading...</div>;

    // Find current plan details
    const currentPlan = plans.find(p =>
        p.heading?.toLowerCase() === client.plan.toLowerCase() ||
        p.name?.toLowerCase() === client.plan.toLowerCase() ||
        p.id?.toLowerCase() === client.plan.toLowerCase()
    );

    // Map features for the UI
    const planFeatures = allPlanFeatures.map(feature => {
        const planKey = client.plan.toLowerCase();
        const value = feature.values[planKey];
        const isIncluded = feature.included.includes(planKey);

        // Determine display text
        let displayText = feature.text;
        if (value && typeof value === 'string' && value !== 'Basic' && value !== 'Advanced') {
            displayText = `${feature.text} (${value})`;
        }

        return {
            name: displayText,
            included: isIncluded,
            // Mock usage for specific features if needed, or leave undefined
            value: value
        };
    });

    const availableAddOnServices = servicesCatalog
        .filter(s => s.pricing.standard !== null)
        .map(s => ({
            id: s.id,
            name: s.name,
            description: s.shortDescription || "Professional service for your Amazon business.",
            price: `$${s.pricing.standard.price}`,
            priceType: s.pricing.standard.label || "per service",
            icon: Package, // Default icon
            popular: false
        }));

    // Mock dates
    const startDate = client.joinedDate || "Dec 15, 2025";
    const validUntil = "Mar 15, 2026";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">My Plan</h1>
                <p className="text-muted-foreground">View your current plan details and add-on services.</p>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex gap-2 p-1 bg-accent/50 rounded-lg w-fit">
                <button
                    onClick={() => setActiveSubTab("plan")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === "plan"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Current Plan
                </button>
                <button
                    onClick={() => setActiveSubTab("addons")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeSubTab === "addons"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Plus className="h-4 w-4" />
                    Add-on Services
                </button>
            </div>

            {/* Current Plan Tab Content */}
            {activeSubTab === "plan" && (
                <>
                    {/* Current Plan Card */}
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <div className="bg-gradient-primary text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className="bg-white/20 text-white mb-2">Current Plan</Badge>
                                    <h2 className="font-heading text-3xl font-bold">{currentPlan?.name || client.plan}</h2>
                                    <p className="text-white/80 mt-1">{currentPlan?.prices.monthlyUSD || "$0"} / month</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-300 mb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
                                    </div>
                                    <p className="text-sm text-white/80">{currentPlan?.highlighted ? "Most Popular" : "Active Plan"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-semibold">{startDate}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                    <p className="font-semibold">{validUntil}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                                    <p className="font-semibold">52 days</p>
                                </div>
                            </div>

                            <h3 className="font-heading font-semibold mb-4">Included Services</h3>
                            <div className="space-y-3">
                                {planFeatures.map((feature, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className={`h-4 w-4 ${feature.included ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                                        </div>
                                        {!feature.included && (<Badge variant="outline" className="text-xs">Not Included</Badge>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="bg-card rounded-xl border p-6 text-center">
                        <h3 className="font-heading font-semibold mb-2">Need More Features?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upgrade to Platinum for dedicated account manager and 24/7 phone support.
                        </p>
                        <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                            View Upgrade Options
                        </button>
                    </div>
                </>
            )}

            {/* Add-on Services Tab Content */}
            {activeSubTab === "addons" && (
                <>
                    {/* Purchased Add-ons */}
                    {purchasedAddOns.length > 0 && (
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Your Purchased Add-ons
                            </h3>
                            <div className="space-y-3">
                                {purchasedAddOns.map((addon) => (
                                    <div key={addon.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{addon.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Qty: {addon.quantity} • Purchased: {addon.date}
                                            </p>
                                        </div>
                                        <Badge variant={addon.status === "completed" ? "default" : "secondary"}>
                                            {addon.status === "completed" ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available Add-on Services */}
                    <div>
                        <h3 className="font-heading font-semibold mb-4">Available Add-on Services</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {availableAddOnServices.map((service) => {
                                const IconComponent = service.icon;
                                return (
                                    <div
                                        key={service.id}
                                        className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-colors relative"
                                    >
                                        {service.popular && (
                                            <Badge className="absolute -top-2 -right-2 bg-primary">Popular</Badge>
                                        )}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <IconComponent className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{service.name}</h4>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <div>
                                                <span className="font-heading font-bold text-lg text-primary">{service.price}</span>
                                                <span className="text-xs text-muted-foreground ml-1">{service.priceType}</span>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Request CTA */}
                    <div className="bg-gradient-primary rounded-xl p-6 text-white text-center">
                        <h3 className="font-heading font-semibold text-lg mb-2">Need Something Custom?</h3>
                        <p className="text-white/80 text-sm mb-4">
                            Contact your account manager for custom service packages tailored to your needs.
                        </p>
                        <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                            Contact Account Manager
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
export default ClientPlanTab;
