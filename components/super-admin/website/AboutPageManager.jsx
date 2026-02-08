"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { aboutHero, companyOverview, leadershipTeam, timelineData, whyChooseUs } from "@/data/about";
import { seoData } from "@/data/company";

export default function AboutPageManager() {
    const [hero, setHero] = useState(aboutHero);
    const [overview, setOverview] = useState(companyOverview);
    const [team, setTeam] = useState(leadershipTeam);
    const [timeline, setTimeline] = useState(timelineData);
    const [reasons, setReasons] = useState(whyChooseUs);
    const [seo, setSeo] = useState(seoData.about || { title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            console.log("Saving About Page Data:", { hero, overview, team, timeline, reasons, seo });
            setIsSaving(false);
            setIsEditing(false);
            toast.success("About page updated successfully!");
        }, 1000);
    };

    const handleTeamChange = (category, index, field, value) => {
        const updatedTeam = { ...team };
        updatedTeam[category][index] = { ...updatedTeam[category][index], [field]: value };
        setTeam(updatedTeam);
    };

    const addTeamMember = (category) => {
        const updatedTeam = { ...team };
        updatedTeam[category].push({ name: "New Member", designation: "Role", image: "", description: "" });
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
                    <div className="space-y-2">
                        <Label>Badge</Label>
                        <Input disabled={!isEditing} value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input disabled={!isEditing} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea disabled={!isEditing} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
                    </div>
                </CardContent>
            </Card>

            {/* Company Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input disabled={!isEditing} value={overview.title} onChange={(e) => setOverview({ ...overview, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea disabled={!isEditing} value={overview.description} onChange={(e) => setOverview({ ...overview, description: e.target.value })} rows={4} />
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
                        {reasons.map((reason, index) => (
                            <div key={index} className="p-4 border rounded space-y-2">
                                <Label>Reason Title</Label>
                                <Input disabled={!isEditing} value={reason.title} onChange={(e) => handleReasonChange(index, "title", e.target.value)} />
                                <Label>Description</Label>
                                <Textarea disabled={!isEditing} value={reason.description} onChange={(e) => handleReasonChange(index, "description", e.target.value)} rows={2} />
                                <Label>Icon (Lucide Name)</Label>
                                <Input disabled={!isEditing} value={reason.icon} onChange={(e) => handleReasonChange(index, "icon", e.target.value)} />
                            </div>
                        ))}
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
                                <div className="grid gap-6 md:grid-cols-2">
                                    {team[category].map((member, index) => (
                                        <div key={index} className="space-y-3 p-4 border rounded relative group">
                                            {isEditing && (
                                                <button onClick={() => removeTeamMember(category, index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input disabled={!isEditing} value={member.name} onChange={(e) => handleTeamChange(category, index, "name", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Designation</Label>
                                                <Input disabled={!isEditing} value={member.designation} onChange={(e) => handleTeamChange(category, index, "designation", e.target.value)} />
                                            </div>
                                            {(category === 'core') && (
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea disabled={!isEditing} value={member.description} onChange={(e) => handleTeamChange(category, index, "description", e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button variant="ghost" className="h-full border-2 border-dashed" onClick={() => addTeamMember(category)}>
                                            <Plus className="w-8 h-8 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Company Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {timeline.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Year</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={item.year}
                                    onChange={(e) => {
                                        const newTimeline = [...timeline];
                                        newTimeline[index] = { ...newTimeline[index], year: e.target.value };
                                        setTimeline(newTimeline);
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <Label className="text-xs text-muted-foreground">Title</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={item.title}
                                    onChange={(e) => {
                                        const newTimeline = [...timeline];
                                        newTimeline[index] = { ...newTimeline[index], title: e.target.value };
                                        setTimeline(newTimeline);
                                    }}
                                />
                            </div>
                            <div className="col-span-7">
                                <Label className="text-xs text-muted-foreground">Description</Label>
                                <Textarea
                                    disabled={!isEditing}
                                    value={item.description}
                                    onChange={(e) => {
                                        const newTimeline = [...timeline];
                                        newTimeline[index] = { ...newTimeline[index], description: e.target.value };
                                        setTimeline(newTimeline);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
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
