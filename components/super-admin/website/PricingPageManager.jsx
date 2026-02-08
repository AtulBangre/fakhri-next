"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, RefreshCw } from "lucide-react";
import { pricingPlans } from "@/data/pricing";
import { seoData } from "@/data/company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PricingPageManager() {
    const [plans, setPlans] = useState(pricingPlans);
    const [seo, setSeo] = useState(seoData.pricing || { title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);

    const handlePlanChange = (index, field, value) => {
        const updatedPlans = [...plans];
        updatedPlans[index][field] = value;
        setPlans(updatedPlans);
    };

    const handlePriceChange = (index, value) => {
        const updatedPlans = [...plans];
        updatedPlans[index].prices.monthly = value;
        setPlans(updatedPlans);
    };

    const handleFeatureChange = (planIndex, featureIndex, value) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features[featureIndex].text = value;
        setPlans(updatedPlans);
    };

    const handleFeatureIncludedChange = (planIndex, featureIndex, value) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features[featureIndex].included = value;
        setPlans(updatedPlans);
    };

    const addFeature = (planIndex) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features.push({ text: "New Feature", value: true, included: true });
        setPlans(updatedPlans);
    };

    const removeFeature = (planIndex, featureIndex) => {
        const updatedPlans = [...plans];
        updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
        setPlans(updatedPlans);
    };

    const handleSave = () => {
        console.log("Saving Pricing Page Data:", { plans, seo });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Pricing Plans</h3>
                <div className="space-x-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Edit Plans
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, index) => (
                    <div key={plan.id} className="bg-card p-6 rounded-xl border relative shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Plan Name</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                                    className="font-bold text-lg"
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
                            <div>
                                <Label className="text-xs text-muted-foreground">Monthly Price (₹)</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={plan.prices.monthly}
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Description</Label>
                                <Textarea
                                    disabled={!isEditing}
                                    value={plan.description}
                                    onChange={(e) => handlePlanChange(index, "description", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="pt-4 border-t h-[300px] overflow-y-auto">
                                <Label className="mb-2 block text-sm font-semibold">Features</Label>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex gap-2 items-center">
                                            <div className="flex-1">
                                                <Input
                                                    disabled={!isEditing}
                                                    value={feature.text}
                                                    onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)}
                                                    className={`h-8 text-sm ${!feature.included ? 'opacity-50' : ''}`}
                                                />
                                            </div>
                                            {isEditing && (
                                                <>
                                                    <input
                                                        type="checkbox"
                                                        checked={feature.included}
                                                        onChange={(e) => handleFeatureIncludedChange(index, fIndex, e.target.checked)}
                                                        className="w-4 h-4"
                                                    />
                                                    <button
                                                        onClick={() => removeFeature(index, fIndex)}
                                                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => addFeature(index)}
                                        className="w-full mt-2 text-primary"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Feature
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
