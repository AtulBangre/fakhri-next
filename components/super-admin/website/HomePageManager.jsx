"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function HomePageManager() {
    // aligning with data/company.js structure
    const [generalData, setGeneralData] = useState({ name: "", tagline: "", description: "", mission: "", stats: [] });
    const [hero, setHero] = useState({ badge: "", title: "", subtitle: "", stats: [] });
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
            const [homeRes, companyRes] = await Promise.all([
                fetch('/api/website/content?page=home'),
                fetch('/api/website/content?page=company')
            ]);

            const homeData = await homeRes.json();
            const companyData = await companyRes.json();

            if (homeData) {
                if (homeData.seo) setSeo(homeData.seo);
                if (homeData.hero) setHero(homeData.hero || { badge: "", title: "", subtitle: "", stats: [] });
            }
            if (companyData && companyData.sections) {
                setGeneralData(companyData.sections.info || { name: "", tagline: "", description: "", mission: "", stats: [] });
            }
        } catch (error) {
            toast.error("Failed to fetch home page data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Home Content (Hero + SEO)
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'home',
                    hero: hero,
                    seo: seo
                })
            });

            // Save Company Info
            const companyRes = await fetch('/api/website/content?page=company');
            const currentCompany = await companyRes.json();

            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'company',
                    sections: {
                        ...(currentCompany.sections || {}),
                        info: generalData,
                    }
                })
            });

            toast.success("Home page updated successfully!");
            setIsEditing(false);
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

            {/* Hero Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section (Public Home)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Badge Text</Label>
                        <Input
                            disabled={!isEditing}
                            value={hero.badge}
                            onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                            placeholder="e.g. Amazon Gold Partner"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Main Title</Label>
                        <Input
                            disabled={!isEditing}
                            value={hero.title}
                            onChange={(e) => setHero({ ...hero, title: e.target.value })}
                            placeholder="e.g. Your No.1 Growth Partner"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle / Description</Label>
                        <Textarea
                            disabled={!isEditing}
                            value={hero.subtitle}
                            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                            placeholder="Briefly describe what you do"
                        />
                    </div>

                    <div className="pt-4">
                        <Label className="block mb-2 text-sm font-semibold">Hero Statistics</Label>
                        <div className="grid gap-4 md:grid-cols-3">
                            {(hero.stats || []).map((stat, index) => (
                                <div key={index} className="space-y-2 border p-3 rounded bg-muted/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium">Stat {index + 1}</span>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => {
                                                    const newStats = hero.stats.filter((_, i) => i !== index);
                                                    setHero({ ...hero, stats: newStats });
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        disabled={!isEditing}
                                        value={stat.value}
                                        onChange={(e) => {
                                            const newStats = [...hero.stats];
                                            newStats[index] = { ...newStats[index], value: e.target.value };
                                            setHero({ ...hero, stats: newStats });
                                        }}
                                        placeholder="Value (e.g. 500+)"
                                        className="text-xs"
                                    />
                                    <Input
                                        disabled={!isEditing}
                                        value={stat.label}
                                        onChange={(e) => {
                                            const newStats = [...hero.stats];
                                            newStats[index] = { ...newStats[index], label: e.target.value };
                                            setHero({ ...hero, stats: newStats });
                                        }}
                                        placeholder="Label (e.g. Clients Served)"
                                        className="text-xs"
                                    />
                                </div>
                            ))}
                            {isEditing && (hero.stats || []).length < 3 && (
                                <Button
                                    variant="outline"
                                    className="h-full border-dashed"
                                    onClick={() => setHero({ ...hero, stats: [...(hero.stats || []), { value: "", label: "" }] })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Stat
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* General Info Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Information (Internal/Footer)</CardTitle>
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
                    <CardTitle>Additional Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {(generalData.stats || []).map((stat, index) => (
                            <div key={index} className="space-y-2 border p-3 rounded">
                                <Label className="flex justify-between">
                                    <span>Stat {index + 1}</span>
                                    {isEditing && (
                                        <button onClick={() => {
                                            const newStats = generalData.stats.filter((_, i) => i !== index);
                                            setGeneralData({ ...generalData, stats: newStats });
                                        }} className="text-destructive text-xs">Remove</button>
                                    )}
                                </Label>
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
                        {isEditing && (
                            <Button variant="outline" className="border-dashed" onClick={() => setGeneralData({ ...generalData, stats: [...generalData.stats, { value: "", label: "" }] })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Extra Stat
                            </Button>
                        )}
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
