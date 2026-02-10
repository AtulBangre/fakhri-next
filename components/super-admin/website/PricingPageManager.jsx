"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
// import { pricingPlans } from "@/data/pricing"; // Removed
import { seoData } from "@/data/company";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PricingPageManager() {
    const [plans, setPlans] = useState([]);
    const [hero, setHero] = useState({ title: "", subtitle: "" });
    const [disclaimer, setDisclaimer] = useState("");
    const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pricingRes, contentRes] = await Promise.all([
                fetch('/api/website/pricing'),
                fetch('/api/website/content?page=pricing')
            ]);

            if (pricingRes.ok) setPlans(await pricingRes.json());
            if (contentRes.ok) {
                const data = await contentRes.json();
                if (data) {
                    if (data.hero) setHero(data.hero);
                    if (data.sections) {
                        setDisclaimer(data.sections.disclaimer || "");
                    }
                    if (data.seo) setSeo(data.seo);
                }
            }
        } catch (error) {
            toast.error("Failed to load pricing data");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanChange = (index, field, value) => {
        const updatedPlans = [...plans];
        updatedPlans[index] = { ...updatedPlans[index], [field]: value };
        setPlans(updatedPlans);
    };

    const handlePriceChange = (index, value) => {
        const updatedPlans = [...plans];
        updatedPlans[index].price = Number(value);
        setPlans(updatedPlans);
    };

    const handleFeatureChange = (planIndex, featureIndex, field, value) => {
        const updatedPlans = [...plans];
        const updatedFeatures = [...updatedPlans[planIndex].features];
        updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], [field]: value };
        updatedPlans[planIndex].features = updatedFeatures;
        setPlans(updatedPlans);
    };

    const addFeature = (planIndex) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features = [
            ...(updatedPlans[planIndex].features || []),
            { text: "New Feature", included: true }
        ];
        setPlans(updatedPlans);
    };

    const removeFeature = (planIndex, featureIndex) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
        setPlans(updatedPlans);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Pricing Plans
            await fetch('/api/website/pricing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plans)
            });

            // Save Pricing Content
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'pricing',
                    hero: hero,
                    sections: {
                        disclaimer: disclaimer
                    },
                    seo: seo
                })
            });

            toast.success("Pricing updated successfully!");
            setIsEditing(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Pricing Management</h3>
                <div className="space-x-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Edit Content
                        </Button>
                    )}
                </div>
            </div>

            {/* Page Header Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Hero Title</Label>
                        <Input
                            disabled={!isEditing}
                            value={hero.title}
                            onChange={(e) => setHero({ ...hero, title: e.target.value })}
                            placeholder="Hero Title (e.g. Transparent Pricing)"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hero Subtitle</Label>
                        <Textarea
                            disabled={!isEditing}
                            value={hero.subtitle}
                            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                            placeholder="Hero Subtitle"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(plans || []).map((plan, index) => (
                    <Card key={plan._id || plan.id || index} className="relative shadow-sm overflow-hidden border-2 transition-all">
                        <CardHeader className={`${plan.highlighted ? 'bg-primary/5' : ''}`}>
                            <CardTitle className="flex justify-between items-center">
                                <Input
                                    disabled={!isEditing}
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                                    className="font-bold border-none bg-transparent p-0 text-lg h-auto focus-visible:ring-0"
                                />
                                {isEditing && (
                                    <input
                                        type="checkbox"
                                        checked={plan.highlighted}
                                        onChange={(e) => handlePlanChange(index, "highlighted", e.target.checked)}
                                        className="w-4 h-4 accent-primary"
                                        title="Highlight Plan"
                                    />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Price (₹ / month)</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={plan.price}
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                    className="text-2xl font-bold"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Subtitle</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={plan.subtitle}
                                    onChange={(e) => handlePlanChange(index, "subtitle", e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t max-h-[400px] overflow-y-auto">
                                <Label className="mb-2 block text-sm font-semibold">Features & Benefits</Label>
                                <ul className="space-y-2">
                                    {(plan.features || []).map((feature, fIndex) => (
                                        <li key={fIndex} className="flex gap-2 items-center bg-muted/30 p-2 rounded">
                                            {isEditing && (
                                                <input
                                                    type="checkbox"
                                                    checked={feature.included !== false}
                                                    onChange={(e) => handleFeatureChange(index, fIndex, "included", e.target.checked)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <Input
                                                    disabled={!isEditing}
                                                    value={feature.text}
                                                    onChange={(e) => handleFeatureChange(index, fIndex, "text", e.target.value)}
                                                    className={`h-7 text-xs border-none bg-transparent p-0 focus-visible:ring-0 ${feature.included === false ? 'line-through opacity-50' : ''}`}
                                                />
                                            </div>
                                            {isEditing && (
                                                <button onClick={() => removeFeature(index, fIndex)} className="text-destructive opacity-0 group-hover:opacity-100 p-1">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addFeature(index)}
                                        className="w-full mt-2 text-primary h-8"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Item
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Disclaimer Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing Disclaimer / Important Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        disabled={!isEditing}
                        value={disclaimer}
                        onChange={(e) => setDisclaimer(e.target.value)}
                        placeholder="e.g. Prices are subject to change based on inventory size..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
                <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                            disabled={!isEditing}
                            value={seo.title}
                            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                            disabled={!isEditing}
                            value={seo.description}
                            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input
                            disabled={!isEditing}
                            value={seo.keywords}
                            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
