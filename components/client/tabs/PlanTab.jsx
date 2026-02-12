"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Star, Plus, ShoppingCart, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/lib/actions/user";
import { getPricingPlans, getCatalogServices } from "@/lib/actions/content";

const ClientPlanTab = () => {
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState("plan");
    const [client, setClient] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [catalogServices, setCatalogServices] = useState([]);

    useEffect(() => {
        const loadPlanData = async () => {
            setLoading(true);
            try {
                // Fetch first client for demo purposes
                const { users } = await getUsers({ role: 'client', limit: 1 });
                if (users && users.length > 0) {
                    setClient(users[0]);
                }

                const plansData = await getPricingPlans();
                setAllPlans(plansData);

                const servicesData = await getCatalogServices();
                setCatalogServices(servicesData);
            } catch (error) {
                console.error("Error loading plan data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPlanData();
    }, []);

    // Find current plan details
    const currentPlan = useMemo(() => {
        if (!client || !allPlans.length) return null;
        return allPlans.find(p =>
            p.name?.toLowerCase() === client.plan?.toLowerCase() ||
            p._id === client.plan
        );
    }, [client, allPlans]);

    // Available Add-on Services from Catalog
    const availableAddOnServices = useMemo(() => {
        return catalogServices.map(s => ({
            id: s._id,
            name: s.name,
            description: s.description || "Professional service for your Amazon business.",
            price: s.price ? `₹${s.price}` : "Custom",
            priceType: s.priceType || "per service",
            icon: Package,
            popular: s.isPopular || false
        }));
    }, [catalogServices]);

    // Mock dates
    const startDate = client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A";
    const validUntil = client?.createdAt ? new Date(new Date(client.createdAt).setMonth(new Date(client.createdAt).getMonth() + 1)).toLocaleDateString() : "N/A";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading plan details...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="bg-card rounded-xl border p-12 text-center">
                <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
                <p className="text-muted-foreground">We couldn't load your plan details. Please contact support.</p>
            </div>
        );
    }

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
                                    <h2 className="font-heading text-3xl font-bold uppercase">{currentPlan?.name || client.plan || "No Plan"}</h2>
                                    <p className="text-white/80 mt-1">₹{currentPlan?.price || 0} / month</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-300 mb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
                                    </div>
                                    <p className="text-sm text-white/80">{currentPlan?.isPopular ? "Most Popular" : "Active Plan"}</p>
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
                                    <p className="text-sm text-muted-foreground">Account Status</p>
                                    <p className="font-semibold capitalize text-primary">{client.status || "Active"}</p>
                                </div>
                            </div>

                            <h3 className="font-heading font-semibold mb-4">Included Services</h3>
                            <div className="space-y-3">
                                {currentPlan?.features?.length > 0 ? (
                                    currentPlan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span>{feature}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Contact support for list of included services.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="bg-card rounded-xl border p-6 text-center">
                        <h3 className="font-heading font-semibold mb-2">Need More Features?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upgrade your plan to get dedicated support and more features.
                        </p>
                        <Button className="px-6 py-2">
                            View Upgrade Options
                        </Button>
                    </div>
                </>
            )}

            {/* Add-on Services Tab Content */}
            {activeSubTab === "addons" && (
                <>
                    {/* Available Add-on Services */}
                    <div>
                        <h3 className="font-heading font-semibold mb-4 text-lg">Available Add-on Services</h3>
                        {availableAddOnServices.length > 0 ? (
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
                        ) : (
                            <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground">
                                No add-on services available at the moment.
                            </div>
                        )}
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
