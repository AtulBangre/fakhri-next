"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AboutPageManager() {
    const [hero, setHero] = useState({ title: "", subtitle: "", badge: "", stats: [] });
    const [overview, setOverview] = useState({ title: "", description: "", points: [], image: "" });
    const [cta, setCta] = useState({ title: "", description: "", primaryBtn: "", secondaryBtn: "" });
    const [team, setTeam] = useState({ core: [], senior: [], members: [] });
    const [timeline, setTimeline] = useState([]);
    const [reasons, setReasons] = useState([]);
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
            const [aboutRes, teamRes] = await Promise.all([
                fetch('/api/website/content?page=about'),
                fetch('/api/website/team')
            ]);

            const aboutData = await aboutRes.json();
            const teamData = await teamRes.json();

            if (aboutData) {
                if (aboutData.hero) setHero(aboutData.hero || { title: "", subtitle: "", badge: "", stats: [] });
                if (aboutData.sections) {
                    setOverview(aboutData.sections.overview || { title: "", description: "", points: [], image: "" });
                    setTimeline(aboutData.sections.timeline || []);
                    setReasons(aboutData.sections.whyChooseUs || []);
                    setCta(aboutData.sections.cta || { title: "", description: "", primaryBtn: "", secondaryBtn: "" });
                }
                if (aboutData.seo) setSeo(aboutData.seo);
            }

            if (teamData) {
                setTeam({
                    core: teamData.filter(m => m.category === 'Core'),
                    senior: teamData.filter(m => m.category === 'Senior'),
                    members: teamData.filter(m => m.category === 'Member')
                });
            }
        } catch (error) {
            toast.error("Failed to fetch about page data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Team
            const teamPayload = [
                ...team.core.map((m, i) => ({ ...m, category: 'Core', sortOrder: i })),
                ...team.senior.map((m, i) => ({ ...m, category: 'Senior', sortOrder: i })),
                ...team.members.map((m, i) => ({ ...m, category: 'Member', sortOrder: i }))
            ];

            await fetch('/api/website/team', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamPayload)
            });

            // Save About Content
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'about',
                    hero: hero,
                    sections: {
                        overview,
                        timeline,
                        whyChooseUs: reasons,
                        cta
                    },
                    seo: seo
                })
            });

            toast.success("About page updated successfully!");
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

    const handleTeamChange = (category, index, field, value) => {
        const updatedTeam = { ...team };
        updatedTeam[category][index] = { ...updatedTeam[category][index], [field]: value };
        setTeam(updatedTeam);
    };

    const addTeamMember = (category) => {
        const updatedTeam = { ...team };
        updatedTeam[category].push({ name: "New Member", designation: "Role", image: "/images/team/default.jpg", description: "" });
        setTeam(updatedTeam);
    };

    const removeTeamMember = (category, index) => {
        const updatedTeam = { ...team };
        updatedTeam[category] = updatedTeam[category].filter((_, i) => i !== index);
        setTeam(updatedTeam);
    };

    const handleReasonChange = (index, field, value) => {
        const updatedReasons = [...reasons];
        updatedReasons[index] = { ...updatedReasons[index], [field]: value };
        setReasons(updatedReasons);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">About Page Content</h3>
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
                    <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Badge</Label>
                            <Input disabled={!isEditing} value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input disabled={!isEditing} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Subtitle</Label>
                            <Textarea disabled={!isEditing} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Label className="block mb-2 text-sm font-semibold">Hero Statistics</Label>
                        <div className="grid gap-4 md:grid-cols-3">
                            {(hero.stats || []).map((stat, index) => (
                                <div key={index} className="space-y-2 border p-3 rounded bg-muted/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium">Stat {index + 1}</span>
                                        {isEditing && (
                                            <button onClick={() => setHero({ ...hero, stats: hero.stats.filter((_, i) => i !== index) })} className="text-destructive text-xs">Remove</button>
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
                                        placeholder="Value"
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
                                        placeholder="Label"
                                        className="text-xs"
                                    />
                                </div>
                            ))}
                            {isEditing && (hero.stats || []).length < 3 && (
                                <Button
                                    variant="outline"
                                    className="h-full border-dashed"
                                    onClick={() => setHero({ ...hero, stats: [...hero.stats, { value: "", label: "" }] })}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Stat
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Company Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input disabled={!isEditing} value={overview.title} onChange={(e) => setOverview({ ...overview, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea disabled={!isEditing} value={overview.description} onChange={(e) => setOverview({ ...overview, description: e.target.value })} rows={5} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input disabled={!isEditing} value={overview.image} onChange={(e) => setOverview({ ...overview, image: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Key Points (Comma separated)</Label>
                                <Textarea
                                    disabled={!isEditing}
                                    value={(overview.points || []).join(', ')}
                                    onChange={(e) => setOverview({ ...overview, points: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card>
                <CardHeader>
                    <CardTitle>Why Choose Us</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {(reasons || []).map((reason, index) => (
                            <div key={reason.id || reason._id || index} className="p-4 border rounded space-y-2 relative group">
                                {isEditing && (
                                    <button onClick={() => setReasons(reasons.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <Label>Reason Title</Label>
                                <Input disabled={!isEditing} value={reason.title} onChange={(e) => handleReasonChange(index, "title", e.target.value)} />
                                <Label>Description</Label>
                                <Textarea disabled={!isEditing} value={reason.description} onChange={(e) => handleReasonChange(index, "description", e.target.value)} rows={2} />
                                <Label>Icon (e.g. Shield, Trophy, Zap)</Label>
                                <Input disabled={!isEditing} value={reason.icon} onChange={(e) => handleReasonChange(index, "icon", e.target.value)} />
                            </div>
                        ))}
                        {isEditing && (
                            <Button variant="outline" className="border-dashed min-h-[150px]" onClick={() => setReasons([...reasons, { title: "", description: "", icon: "Shield" }])}>
                                <Plus className="h-6 w-6 mr-2" /> Add Reason
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Leadership Team */}
            <Card>
                <CardHeader>
                    <CardTitle>Leadership Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="core">
                        <TabsList className="mb-4">
                            <TabsTrigger value="core">Core Team</TabsTrigger>
                            <TabsTrigger value="senior">Senior Team</TabsTrigger>
                            <TabsTrigger value="members">Team Members</TabsTrigger>
                        </TabsList>
                        {["core", "senior", "members"].map((category) => (
                            <TabsContent key={category} value={category}>
                                <div className="grid gap-6 md:grid-cols-2 max-h-[600px] overflow-y-auto pr-2">
                                    {(team[category] || []).map((member, index) => (
                                        <div key={member.id || member._id || index} className="space-y-3 p-4 border rounded relative group bg-muted/5">
                                            {isEditing && (
                                                <button onClick={() => removeTeamMember(category, index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Name</Label>
                                                    <Input disabled={!isEditing} value={member.name} onChange={(e) => handleTeamChange(category, index, "name", e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Designation</Label>
                                                    <Input disabled={!isEditing} value={member.designation} onChange={(e) => handleTeamChange(category, index, "designation", e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Image URL</Label>
                                                <Input disabled={!isEditing} value={member.image} onChange={(e) => handleTeamChange(category, index, "image", e.target.value)} />
                                            </div>
                                            {(category === 'core') && (
                                                <div className="space-y-2">
                                                    <Label>Description (Visible on hover)</Label>
                                                    <Textarea disabled={!isEditing} value={member.description} onChange={(e) => handleTeamChange(category, index, "description", e.target.value)} rows={3} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button variant="ghost" className="h-full border-2 border-dashed min-h-[150px]" onClick={() => addTeamMember(category)}>
                                            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                                            <span>Add Member</span>
                                        </Button>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Timeline Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(timeline || []).map((item, index) => (
                        <div key={item.id || item._id || index} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0 last:pb-0 relative group">
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Year</Label>
                                <Input disabled={!isEditing} value={item.year} onChange={(e) => {
                                    const newTimeline = [...timeline];
                                    newTimeline[index] = { ...newTimeline[index], year: e.target.value };
                                    setTimeline(newTimeline);
                                }} />
                            </div>
                            <div className="col-span-3">
                                <Label className="text-xs text-muted-foreground">Title</Label>
                                <Input disabled={!isEditing} value={item.title} onChange={(e) => {
                                    const newTimeline = [...timeline];
                                    newTimeline[index] = { ...newTimeline[index], title: e.target.value };
                                    setTimeline(newTimeline);
                                }} />
                            </div>
                            <div className="col-span-6">
                                <Label className="text-xs text-muted-foreground">Description</Label>
                                <Textarea disabled={!isEditing} value={item.description} onChange={(e) => {
                                    const newTimeline = [...timeline];
                                    newTimeline[index] = { ...newTimeline[index], description: e.target.value };
                                    setTimeline(newTimeline);
                                }} rows={2} />
                            </div>
                            <div className="col-span-1 flex items-center h-full pt-6">
                                {isEditing && (
                                    <button onClick={() => setTimeline(timeline.filter((_, i) => i !== index))} className="text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isEditing && (
                        <Button variant="outline" className="w-full border-dashed" onClick={() => setTimeline([...timeline, { year: "", title: "", description: "" }])}>
                            <Plus className="h-4 w-4 mr-2" /> Add Milestone
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* CTA Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Call to Action Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>CTA Title</Label>
                            <Input disabled={!isEditing} value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA Description</Label>
                            <Input disabled={!isEditing} value={cta.description} onChange={(e) => setCta({ ...cta, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Button Text</Label>
                            <Input disabled={!isEditing} value={cta.primaryBtn} onChange={(e) => setCta({ ...cta, primaryBtn: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary Button Text</Label>
                            <Input disabled={!isEditing} value={cta.secondaryBtn} onChange={(e) => setCta({ ...cta, secondaryBtn: e.target.value })} />
                        </div>
                    </div>
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
                        <Input disabled={!isEditing} value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea disabled={!isEditing} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input disabled={!isEditing} value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
