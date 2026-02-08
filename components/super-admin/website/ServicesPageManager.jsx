"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { servicesData } from "@/data/services";
import { seoData } from "@/data/company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ServicesPageManager() {
    const [services, setServices] = useState(servicesData);
    const [seo, setSeo] = useState(seoData.services || { title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Added state

    // ... newService state skipped

    const [newService, setNewService] = useState({
        id: "new-service",
        title: "",
        shortDescription: "",
        fullDescription: "",
        icon: "Box",
        features: [],
        benefits: []
    });

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setServices(updatedServices);
    };

    const addService = () => {
        if (newService.title) {
            setServices([...services, { ...newService, id: `service-${Date.now()}` }]);
            // Reset new service form
            setNewService({ id: "new", title: "", shortDescription: "", fullDescription: "", icon: "Box", features: [], benefits: [] });
        }
    };

    const removeService = (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            console.log("Saving Services Page Data:", { services, seo });
            setIsSaving(false);
            setIsEditing(false);
            toast.success("Services page updated successfully!");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Services Page Content</h3>
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {services.map((service, index) => (
                    <div key={service.id || index} className="bg-card p-6 rounded-xl border relative group shadow-sm flex flex-col h-full">
                        {isEditing && (
                            <button
                                onClick={() => removeService(index)}
                                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="mb-4 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <span className="text-xs font-bold">{service.icon}</span>
                        </div>
                        <div className="space-y-3 flex-1">
                            <div>
                                <Label className="text-xs text-muted-foreground">Service Title</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={service.title}
                                    onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                                    className="mt-1 font-semibold"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Short Description</Label>
                                <Textarea
                                    disabled={!isEditing}
                                    value={service.shortDescription}
                                    onChange={(e) => handleServiceChange(index, "shortDescription", e.target.value)}
                                    className="mt-1 text-sm text-muted-foreground"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Full Description</Label>
                                <Textarea
                                    disabled={!isEditing}
                                    value={service.fullDescription}
                                    onChange={(e) => handleServiceChange(index, "fullDescription", e.target.value)}
                                    className="mt-1 text-sm text-muted-foreground"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {isEditing && (
                    <div className="bg-muted/30 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                        <h4 className="font-medium text-muted-foreground">Add New Service</h4>
                        <div className="w-full space-y-2">
                            <Input
                                placeholder="Service Title"
                                value={newService.title}
                                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                            />
                            <Input
                                placeholder="Short Description"
                                value={newService.shortDescription}
                                onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                            />
                            <Button onClick={addService} variant="secondary" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Service
                            </Button>
                        </div>
                    </div>
                )}
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
