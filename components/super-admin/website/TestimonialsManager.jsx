"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TestimonialsManager() {
    const [detailedTestimonials, setDetailedTestimonials] = useState([]);
    const [socialProof, setSocialProof] = useState([]);
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
            const [testRes, contentRes] = await Promise.all([
                fetch('/api/website/testimonials'),
                fetch('/api/website/content?page=testimonials')
            ]);

            if (testRes.ok) {
                const data = await testRes.json();
                const detailed = data.filter(t => !t.clientDesignation?.startsWith('@'));
                const social = data.filter(t => t.clientDesignation?.startsWith('@'));

                setDetailedTestimonials(detailed.map(t => ({
                    ...t,
                    id: t._id,
                    name: t.clientName,
                    role: t.clientDesignation,
                    company: t.clientCompany,
                    metric: t.metric || { label: "", value: "" }
                })));

                setSocialProof(social.map(t => ({
                    ...t,
                    id: t._id,
                    name: t.clientName,
                    handle: t.clientDesignation,
                    quote: t.content,
                    image: t.clientImage
                })));
            }

            if (contentRes.ok) {
                const content = await contentRes.json();
                if (content && content.seo) setSeo(content.seo);
            }
        } catch (error) {
            toast.error("Failed to load testimonials");
        } finally {
            setIsLoading(false);
        }
    };

    // Testimonial templates
    const [newDetailed, setNewDetailed] = useState({ name: "", role: "", company: "", content: "", rating: 5, metric: { label: "", value: "" } });
    const [newSocial, setNewSocial] = useState({ name: "", handle: "", quote: "", image: "" });

    const handleDetailedChange = (index, field, value) => {
        const updated = [...detailedTestimonials];
        if (field.includes("metric.")) {
            const metricKey = field.split(".")[1];
            if (!updated[index].metric) updated[index].metric = { label: "", value: "" };
            updated[index].metric[metricKey] = value;
        } else {
            updated[index][field] = value;
        }
        setDetailedTestimonials(updated);
    };

    const handleSocialChange = (index, field, value) => {
        const updated = [...socialProof];
        updated[index][field] = value;
        setSocialProof(updated);
    };

    const removeDetailed = (index) => {
        const updated = detailedTestimonials.filter((_, i) => i !== index);
        setDetailedTestimonials(updated);
    };

    const removeSocial = (index) => {
        const updated = socialProof.filter((_, i) => i !== index);
        setSocialProof(updated);
    };

    const addDetailed = () => {
        if (newDetailed.name && newDetailed.content) {
            setDetailedTestimonials([...detailedTestimonials, { ...newDetailed, id: `${Date.now()}` }]);
            setNewDetailed({ name: "", role: "", company: "", content: "", rating: 5, metric: { label: "", value: "" } });
        }
    };

    const addSocial = () => {
        if (newSocial.name && newSocial.quote) {
            setSocialProof([...socialProof, { ...newSocial, id: `${Date.now()}` }]);
            setNewSocial({ name: "", handle: "", quote: "", image: "" });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Map back to DB structure
            const detailed = detailedTestimonials.map((t, i) => ({
                _id: t.id && !t.id.toString().startsWith('17') ? t.id : undefined,
                clientName: t.name,
                clientDesignation: t.role,
                clientCompany: t.company,
                content: t.content,
                rating: t.rating || 5,
                metric: t.metric,
                sortOrder: i,
                isActive: true
            }));

            const social = socialProof.map((t, i) => ({
                _id: t.id && !t.id.toString().startsWith('17') ? t.id : undefined,
                clientName: t.name,
                clientDesignation: t.handle,
                clientImage: t.image,
                content: t.quote,
                rating: 5,
                sortOrder: 100 + i,
                isActive: true
            }));

            const allTestimonials = [...detailed, ...social];

            // Save Testimonials
            await fetch('/api/website/testimonials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allTestimonials)
            });

            // Save Content (SEO)
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'testimonials',
                    seo: seo
                })
            });

            toast.success("Testimonials updated!");
            setIsEditing(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save testimonials");
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
                <h3 className="text-xl font-bold">Testimonials Management</h3>
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

            {/* Detailed Testimonials Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Detailed Client Stories</h4>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {detailedTestimonials.map((item, index) => (
                        <Card key={item.id || index} className="relative group">
                            {isEditing && (
                                <button
                                    onClick={() => removeDetailed(index)}
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-2 rounded z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <CardContent className="pt-6 space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Client Name</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={item.name}
                                        onChange={(e) => handleDetailedChange(index, "name", e.target.value)}
                                        className="font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Role</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={item.role}
                                            onChange={(e) => handleDetailedChange(index, "role", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Company</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={item.company}
                                            onChange={(e) => handleDetailedChange(index, "company", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Content</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={item.content}
                                        onChange={(e) => handleDetailedChange(index, "content", e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Metric Label</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={item.metric.label}
                                            onChange={(e) => handleDetailedChange(index, "metric.label", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Metric Value</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={item.metric.value}
                                            onChange={(e) => handleDetailedChange(index, "metric.value", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isEditing && (
                        <div className="bg-muted/30 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                            <h4 className="font-medium text-muted-foreground">Add New Story</h4>
                            <div className="w-full space-y-2">
                                <Input placeholder="Name" value={newDetailed.name} onChange={(e) => setNewDetailed({ ...newDetailed, name: e.target.value })} />
                                <Textarea placeholder="Content" value={newDetailed.content} onChange={(e) => setNewDetailed({ ...newDetailed, content: e.target.value })} />
                                <Button onClick={addDetailed} variant="secondary" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" /> Add Story
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Proof Section */}
            <div className="space-y-4 pt-8 border-t">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Social Proof (Marquee)</h4>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {socialProof.map((item, index) => (
                        <Card key={index} className="relative group">
                            {isEditing && (
                                <button
                                    onClick={() => removeSocial(index)}
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-2 rounded z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            disabled={!isEditing}
                                            value={item.name}
                                            onChange={(e) => handleSocialChange(index, "name", e.target.value)}
                                            className="h-7 text-sm font-medium p-1"
                                        />
                                        <Input
                                            disabled={!isEditing}
                                            value={item.handle}
                                            onChange={(e) => handleSocialChange(index, "handle", e.target.value)}
                                            className="h-6 text-xs text-muted-foreground p-1 mt-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Quote</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={item.quote}
                                        onChange={(e) => handleSocialChange(index, "quote", e.target.value)}
                                        rows={3}
                                        className="text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isEditing && (
                        <div className="bg-muted/30 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center space-y-4">
                            <h4 className="font-medium text-muted-foreground">Add Social Proof</h4>
                            <div className="w-full space-y-2">
                                <Input placeholder="Name" value={newSocial.name} onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })} />
                                <Input placeholder="Handle (e.g. @username)" value={newSocial.handle} onChange={(e) => setNewSocial({ ...newSocial, handle: e.target.value })} />
                                <Button onClick={addSocial} variant="secondary" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" /> Add Item
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
