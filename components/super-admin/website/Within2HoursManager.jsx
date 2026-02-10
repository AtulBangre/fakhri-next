"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Within2HoursManager() {
    const [services, setServices] = useState([]);
    const [info, setInfo] = useState({ title: "", subtitle: "", badge: "" });
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
            const [contentRes, productsRes] = await Promise.all([
                fetch('/api/website/content?page=within2hours'),
                fetch('/api/website/within2hours')
            ]);

            const contentData = await contentRes.json();
            const productsData = await productsRes.json();

            if (contentData) {
                if (contentData.sections && contentData.sections.info) {
                    setInfo(contentData.sections.info);
                }
                if (contentData.seo) setSeo(contentData.seo);
            }

            if (productsData) {
                setServices(productsData.map(p => ({
                    ...p,
                    id: p._id,
                    name: p.name,
                    price: p.price,
                    category: p.category
                })));
            }
        } catch (error) {
            toast.error("Failed to fetch within 2 hours data");
        } finally {
            setIsLoading(false);
        }
    };

    // Simplistic handling of new service
    const [newService, setNewService] = useState({
        id: "new",
        name: "",
        price: "",
        category: "Urgent"
    });

    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setServices(updatedServices);
    };

    const addService = () => {
        if (newService.name && newService.price) {
            setServices([...services, { ...newService, id: `${Date.now()}` }]);
            setNewService({
                id: "new", name: "", price: "", category: "Urgent"
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
            // Map services to DB Product structure
            const products = services.map((s, i) => ({
                ...(s.id && !s.id.toString().startsWith('new') && s.id.length > 10 ? { _id: s.id } : {}),
                name: s.name,
                price: parseFloat(s.price),
                category: s.category || "Urgent",
                sortOrder: i,
                isWithin2Hours: true
            }));

            // Save Products
            await fetch('/api/website/within2hours', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(products)
            });

            // Save Page Content
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'within2hours',
                    sections: {
                        info: info
                    },
                    seo: seo
                })
            });

            toast.success("Content updated!");
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Within 2 Hours Service Page</h3>
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
                            Edit Content
                        </Button>
                    )}
                </div>
            </div>

            {/* General Info Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Badge</Label>
                        <Input
                            disabled={!isEditing}
                            value={info.badge}
                            onChange={(e) => setInfo({ ...info, badge: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            disabled={!isEditing}
                            value={info.title}
                            onChange={(e) => setInfo({ ...info, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            disabled={!isEditing}
                            value={info.description}
                            onChange={(e) => setInfo({ ...info, description: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Services List Section */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Service Pricing List</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                        <Card key={service.id} className="relative">
                            {isEditing && (
                                <button
                                    onClick={() => removeService(index)}
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-2 rounded z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <CardContent className="pt-6 space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Service Name</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={service.name}
                                        onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                                        className="font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Price ($)</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={service.price}
                                            onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Category</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={service.category}
                                            onChange={(e) => handleServiceChange(index, "category", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isEditing && (
                        <div className="bg-muted/30 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                            <h4 className="font-medium text-muted-foreground">Add New Service</h4>
                            <div className="w-full space-y-2">
                                <Input
                                    placeholder="Service Name"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Price"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Category"
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                    />
                                </div>
                                <Button onClick={addService} variant="secondary" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Service
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
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
