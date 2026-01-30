"use client";
import { useState } from "react";
import { CheckCircle2, Star, Plus, ShoppingCart, Zap, Image, Target, TrendingUp, Package, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const planFeatures = [
    { name: "Full Account Management", included: true },
    { name: "Advanced PPC Management", included: true },
    { name: "A+ Content Design (3 products)", included: true, used: 2, total: 3 },
    { name: "Brand Registry Support", included: true },
    { name: "Weekly Performance Reports", included: true },
    { name: "Priority Email Support (24h)", included: true },
    { name: "Up to 5 Product Categories", included: true, used: 3, total: 5 },
    { name: "Competitor Analysis", included: true },
    { name: "24/7 Phone Support", included: false },
    { name: "Dedicated Account Manager", included: false },
];

const addOnServices = [
    {
        id: 1,
        name: "Extra A+ Content Design",
        description: "Additional A+ Content design for more products beyond your plan limit.",
        price: "$199",
        priceType: "per product",
        icon: Image,
        popular: true
    },
    {
        id: 2,
        name: "Product Photography",
        description: "Professional Amazon-ready product photography with white background.",
        price: "$299",
        priceType: "per product",
        icon: Image,
        popular: false
    },
    {
        id: 3,
        name: "PPC Campaign Boost",
        description: "Intensive one-time PPC optimization and strategy review.",
        price: "$499",
        priceType: "one-time",
        icon: Target,
        popular: true
    },
    {
        id: 4,
        name: "Additional Product Category",
        description: "Expand your catalog with management for an additional category.",
        price: "$149",
        priceType: "per month",
        icon: Package,
        popular: false
    },
    {
        id: 5,
        name: "Video Content Creation",
        description: "Professional product video for your Amazon listing.",
        price: "$599",
        priceType: "per video",
        icon: Zap,
        popular: false
    },
    {
        id: 6,
        name: "Brand Storefront Design",
        description: "Custom Amazon Brand Storefront design and setup.",
        price: "$799",
        priceType: "one-time",
        icon: TrendingUp,
        popular: true
    },
    {
        id: 7,
        name: "Competitor Analysis Report",
        description: "Deep-dive competitor analysis with actionable insights.",
        price: "$349",
        priceType: "per report",
        icon: FileText,
        popular: false
    },
    {
        id: 8,
        name: "FBA Reimbursement Audit",
        description: "Comprehensive audit to recover lost FBA reimbursements.",
        price: "15%",
        priceType: "of recovered amount",
        icon: DollarSign,
        popular: false
    },
];

const purchasedAddOns = [
    { id: 1, name: "Extra A+ Content Design", quantity: 2, date: "Jan 10, 2026", status: "completed" },
    { id: 2, name: "PPC Campaign Boost", quantity: 1, date: "Dec 20, 2025", status: "in-progress" },
];

const ClientPlanTab = () => {
    const [activeSubTab, setActiveSubTab] = useState("plan");

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
                                    <h2 className="font-heading text-3xl font-bold">Premium</h2>
                                    <p className="text-white/80 mt-1">$1,999 / month</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-300 mb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
                                    </div>
                                    <p className="text-sm text-white/80">Most Popular</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-semibold">Dec 15, 2025</p>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                    <p className="font-semibold">Mar 15, 2026</p>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/50">
                                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                                    <p className="font-semibold">52 days</p>
                                </div>
                            </div>

                            <h3 className="font-heading font-semibold mb-4">Included Services</h3>
                            <div className="space-y-3">
                                {planFeatures.map((feature) => (
                                    <div key={feature.name} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className={`h-4 w-4 ${feature.included ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                                        </div>
                                        {feature.used !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <Progress value={(feature.used / feature.total) * 100} className="w-20 h-2" />
                                                <span className="text-xs text-muted-foreground">{feature.used}/{feature.total}</span>
                                            </div>
                                        )}
                                        {!feature.included && (<Badge variant="outline">Platinum Only</Badge>)}
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
                            {addOnServices.map((service) => {
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
                                                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
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
