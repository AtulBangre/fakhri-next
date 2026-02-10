"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "sonner";

export default function CareersPageManager() {
    const [jobs, setJobs] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [hero, setHero] = useState({ title: "", subtitle: "", badge: "" });
    const [cta, setCta] = useState({ title: "", description: "" });
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
            const [careerRes, jobsRes] = await Promise.all([
                fetch('/api/website/content?page=career'),
                fetch('/api/website/jobs')
            ]);

            const careerData = await careerRes.json();
            const jobsData = await jobsRes.json();

            if (careerData) {
                if (careerData.hero) setHero(careerData.hero || { title: "", subtitle: "", badge: "" });
                if (careerData.sections) {
                    setBenefits(careerData.sections.benefits || []);
                    setCta(careerData.sections.cta || { title: "", description: "" });
                }
                if (careerData.seo) setSeo(careerData.seo);
            }

            if (jobsData) {
                setJobs(jobsData);
            }
        } catch (error) {
            toast.error("Failed to fetch careers data");
        } finally {
            setIsLoading(false);
        }
    };

    // Simplistic handling of new job
    const [newJob, setNewJob] = useState({
        id: "new",
        title: "",
        department: "",
        location: "Remote",
        type: "Full-time",
        experience: "",
        description: "",
        requirements: []
    });

    const handleJobChange = (index, field, value) => {
        const updatedJobs = [...jobs];
        updatedJobs[index] = { ...updatedJobs[index], [field]: value };
        setJobs(updatedJobs);
    };

    const addJob = () => {
        if (newJob.title) {
            setJobs([...jobs, { ...newJob, id: `${Date.now()}` }]);
            setNewJob({
                id: "new", title: "", department: "", location: "Remote", type: "Full-time", experience: "", description: "", requirements: []
            });
        }
    };

    const removeJob = (index) => {
        const updatedJobs = jobs.filter((_, i) => i !== index);
        setJobs(updatedJobs);
    };

    const handleBenefitChange = (index, field, value) => {
        const updatedBenefits = [...benefits];
        updatedBenefits[index] = { ...updatedBenefits[index], [field]: value };
        setBenefits(updatedBenefits);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Jobs
            await fetch('/api/website/jobs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobs.map((job, i) => ({ ...job, sortOrder: i })))
            });

            // Save Career Content
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'career',
                    hero,
                    sections: {
                        benefits,
                        cta
                    },
                    seo
                })
            });

            toast.success("Careers page updated successfully!");
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
                <h3 className="text-xl font-bold">Careers Page Management</h3>
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
                </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Career Benefits</h4>
                    {isEditing && (
                        <Button size="sm" onClick={() => setBenefits([...benefits, { title: "New Benefit", description: "" }])}>
                            <Plus className="w-4 h-4 mr-2" /> Add Benefit
                        </Button>
                    )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(benefits || []).map((benefit, index) => (
                        <Card key={benefit.id || benefit._id || index} className="relative group">
                            {isEditing && (
                                <button
                                    onClick={() => setBenefits(benefits.filter((_, i) => i !== index))}
                                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <CardContent className="pt-6 space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-bold">Benefit Title</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={benefit.title}
                                        onChange={(e) => handleBenefitChange(index, "title", e.target.value)}
                                        className="font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-bold">Description</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={benefit.description}
                                        onChange={(e) => handleBenefitChange(index, "description", e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Job Openings Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Open Positions</h4>
                </div>

                <div className="grid gap-6">
                    {(jobs || []).map((job, index) => (
                        <Card key={job._id || job.id || index} className="relative group shadow-sm hover:shadow-md transition-shadow">
                            {isEditing && (
                                <button
                                    onClick={() => removeJob(index)}
                                    className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-destructive/10 z-10"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            <CardContent className="pt-8 grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Job Role</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={job.title}
                                            onChange={(e) => handleJobChange(index, "title", e.target.value)}
                                            className="text-lg font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Department</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.department}
                                                onChange={(e) => handleJobChange(index, "department", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Location</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.location}
                                                onChange={(e) => handleJobChange(index, "location", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Employment Type</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.type}
                                                onChange={(e) => handleJobChange(index, "type", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Experience Reqd.</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.experience}
                                                onChange={(e) => handleJobChange(index, "experience", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Job Summary</Label>
                                        <Textarea
                                            disabled={!isEditing}
                                            value={job.description}
                                            onChange={(e) => handleJobChange(index, "description", e.target.value)}
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Key Requirements (Comma list)</Label>
                                        <Textarea
                                            disabled={!isEditing}
                                            value={Array.isArray(job.requirements) ? job.requirements.join(", ") : ""}
                                            onChange={(e) => {
                                                const reqs = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                                                handleJobChange(index, "requirements", reqs);
                                            }}
                                            rows={2}
                                            placeholder="Requirement 1, Requirement 2..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isEditing && (
                        <div className="bg-muted/30 border-dashed border-2 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => addJob()}>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Post a New Job</h4>
                                <p className="text-sm text-muted-foreground">Click to add a new opening to the Careers page</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Careers CTA Section</CardTitle>
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
