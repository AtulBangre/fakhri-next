"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { companyData, seoData } from "@/data/company";

export default function HomePageManager() {
    // aligning with data/company.js structure
    const [generalData, setGeneralData] = useState(companyData);
    const [seo, setSeo] = useState(seoData.home || { title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Saving Home Page Data (effectively Company Data):", { ...generalData, seo });
            setIsSaving(false);
            setIsEditing(false);
            toast.success("Home page updated successfully!");
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Home & Company Settings</h3>
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

            {/* General Info Section */}
            <Card>
                <CardHeader>
                    <CardTitle>General Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                                disabled={!isEditing}
                                value={generalData.name}
                                onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                disabled={!isEditing}
                                value={generalData.tagline}
                                onChange={(e) => setGeneralData({ ...generalData, tagline: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={generalData.description}
                                onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Mission</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={generalData.mission}
                                onChange={(e) => setGeneralData({ ...generalData, mission: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Key Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {generalData.stats.map((stat, index) => (
                            <div key={index} className="space-y-2 border p-3 rounded">
                                <Label>Stat {index + 1}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        disabled={!isEditing}
                                        value={stat.value}
                                        onChange={(e) => {
                                            const newStats = [...generalData.stats];
                                            newStats[index] = { ...newStats[index], value: e.target.value };
                                            setGeneralData({ ...generalData, stats: newStats });
                                        }}
                                        placeholder="Value"
                                    />
                                    <Input
                                        disabled={!isEditing}
                                        value={stat.label}
                                        onChange={(e) => {
                                            const newStats = [...generalData.stats];
                                            newStats[index] = { ...newStats[index], label: e.target.value };
                                            setGeneralData({ ...generalData, stats: newStats });
                                        }}
                                        placeholder="Label"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
                <CardHeader>
                    <CardTitle>SEO Settings (Home)</CardTitle>
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
