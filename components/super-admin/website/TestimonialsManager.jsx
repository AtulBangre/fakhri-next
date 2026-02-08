"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { testimonials, socialTestimonials } from "@/data/testimonials";

export default function TestimonialsManager() {
    const [detailedTestimonials, setDetailedTestimonials] = useState(testimonials);
    const [socialProof, setSocialProof] = useState(socialTestimonials);
    const [isEditing, setIsEditing] = useState(false);

    // Testimonial templates
    const [newDetailed, setNewDetailed] = useState({ name: "", role: "", company: "", content: "", rating: 5, metric: { label: "", value: "" } });
    const [newSocial, setNewSocial] = useState({ name: "", handle: "", quote: "", image: "" });

    const handleDetailedChange = (index, field, value) => {
        const updated = [...detailedTestimonials];
        if (field.includes("metric.")) {
            const metricKey = field.split(".")[1];
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
            setSocialProof([...socialProof, { ...newSocial }]);
            setNewSocial({ name: "", handle: "", quote: "", image: "" });
        }
    };

    const handleSave = () => {
        console.log("Saving Testimonials Data:", { testimonials: detailedTestimonials, socialTestimonials: socialProof });
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Testimonials Management</h3>
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

            {/* Detailed Testimonials Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Detailed Client Stories</h4>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {detailedTestimonials.map((item, index) => (
                        <Card key={item.id} className="relative group">
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
                </div>
            </div>
        </div>
    );
}
