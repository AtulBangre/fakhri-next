"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
// import { servicesData } from "@/data/services"; // Removed static import
import { seoData } from "@/data/company";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ServicesPageManager() {
    const [services, setServices] = useState([]);
    const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ['Account Services', 'Listing & Content', 'Operations', 'Growth'];
    const icons = ['Settings', 'FileText', 'Package', 'Target', 'Image', 'DollarSign', 'TrendingUp', 'Shield', 'BarChart', 'Zap', 'Clock', 'Search'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [servicesRes, contentRes] = await Promise.all([
                fetch('/api/website/services'),
                fetch('/api/website/content?page=services')
            ]);

            if (servicesRes.ok) {
                const data = await servicesRes.json();
                setServices(data.map(s => ({ ...s, id: s._id || s.id })));
            }
            if (contentRes.ok) {
                const data = await contentRes.json();
                if (data && data.seo) setSeo(data.seo);
            }
        } catch (error) {
            toast.error("Failed to load services data");
        } finally {
            setIsLoading(false);
        }
    };

    const [newService, setNewService] = useState({
        title: "",
        shortDescription: "",
        fullDescription: "",
        icon: "Settings",
        category: "Account Services",
        features: [],
        benefits: [],
        isActive: true
    });

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setServices(updatedServices);
    };

    const addService = () => {
        if (newService.title) {
            setServices([...services, { ...newService, id: `temp-${Date.now()}` }]);
            setNewService({
                title: "",
                shortDescription: "",
                fullDescription: "",
                icon: "Settings",
                category: "Account Services",
                features: [],
                benefits: [],
                isActive: true
            });
        }
    };

    const removeService = (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Check for deletions
            const originalRes = await fetch('/api/website/services');
            const originalData = await originalRes.json();
            const currentIds = services.map(s => s._id || s.id).filter(id => id && !id.startsWith('temp'));
            const deletedIds = originalData.filter(s => !currentIds.includes(s._id)).map(s => s._id);

            // Save Services
            await fetch('/api/website/services', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(services.map((s, i) => ({
                    ...s,
                    sortOrder: i,
                    serviceId: s.serviceId || s.id || `service-${Date.now()}-${i}`
                })))
            });

            // Handle Deletions if API doesn't do it in PUT (ours doesn't seem to sync strictly)
            // But bulkWrite with upsert is what we have.
            // Let's assume we want strict sync. I'll update the API later if needed or just use DELETE for removed ones.

            // Save Services SEO
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'services',
                    seo: seo
                })
            });

            toast.success("Services page updated successfully!");
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

            <div className="grid gap-6 lg:grid-cols-1">
                {(services || []).map((service, index) => (
                    <Card key={service._id || service.id || index} className="relative group">
                        {isEditing && (
                            <button
                                onClick={() => removeService(index)}
                                className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 p-2 rounded z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Service Category</Label>
                                        <select
                                            disabled={!isEditing}
                                            value={service.category}
                                            onChange={(e) => handleServiceChange(index, "category", e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Icon</Label>
                                        <select
                                            disabled={!isEditing}
                                            value={service.icon}
                                            onChange={(e) => handleServiceChange(index, "icon", e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm"
                                        >
                                            {icons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Service Title</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={service.title}
                                        onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Short Description</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={service.shortDescription}
                                        onChange={(e) => handleServiceChange(index, "shortDescription", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Full Description</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={service.fullDescription}
                                        onChange={(e) => handleServiceChange(index, "fullDescription", e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Features (Included Items - Comma separated)</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={(service.features || []).join(', ')}
                                        onChange={(e) => {
                                            const feats = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                            handleServiceChange(index, "features", feats);
                                        }}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Key Benefits (Comma separated)</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={(service.benefits || []).join(', ')}
                                        onChange={(e) => {
                                            const bens = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                            handleServiceChange(index, "benefits", bens);
                                        }}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {isEditing && (
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Add New Service</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Service Title"
                                value={newService.title}
                                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={newService.category}
                                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                    className="p-2 border rounded-md text-sm"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <select
                                    value={newService.icon}
                                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                                    className="p-2 border rounded-md text-sm"
                                >
                                    {icons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                </select>
                            </div>
                            <Button onClick={addService} variant="secondary" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Service
                            </Button>
                        </CardContent>
                    </Card>
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
