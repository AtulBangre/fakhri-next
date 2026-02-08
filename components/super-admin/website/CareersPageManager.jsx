"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { jobPositions, careerBenefits } from "@/data/career";
import { seoData } from "@/data/company";

export default function CareersPageManager() {
    const [jobs, setJobs] = useState(jobPositions);
    const [benefits, setBenefits] = useState(careerBenefits);
    const [seo, setSeo] = useState(seoData.career || { title: "", description: "", keywords: "" });
    const [isEditing, setIsEditing] = useState(false);

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

    const handleSave = () => {
        console.log("Saving Careers Page Data:", { jobs, benefits, seo });
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Careers Page Content</h3>
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

            {/* Benefits Section */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Career Benefits</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6 space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Title</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={benefit.title}
                                        onChange={(e) => handleBenefitChange(index, "title", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <Textarea
                                        disabled={!isEditing}
                                        value={benefit.description}
                                        onChange={(e) => handleBenefitChange(index, "description", e.target.value)}
                                        rows={2}
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
                    {jobs.map((job, index) => (
                        <Card key={job.id} className="relative group">
                            {isEditing && (
                                <button
                                    onClick={() => removeJob(index)}
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-2 rounded z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Job Title</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={job.title}
                                            onChange={(e) => handleJobChange(index, "title", e.target.value)}
                                            className="font-semibold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Department</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.department}
                                                onChange={(e) => handleJobChange(index, "department", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Location</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.location}
                                                onChange={(e) => handleJobChange(index, "location", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Type</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.type}
                                                onChange={(e) => handleJobChange(index, "type", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Experience</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={job.experience}
                                                onChange={(e) => handleJobChange(index, "experience", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <Textarea
                                            disabled={!isEditing}
                                            value={job.description}
                                            onChange={(e) => handleJobChange(index, "description", e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Requirements (Comma separated for demo)</Label>
                                        <Textarea
                                            disabled={!isEditing}
                                            value={job.requirements.join(", ")}
                                            onChange={(e) => {
                                                const reqs = e.target.value.split(",").map(s => s.trim());
                                                handleJobChange(index, "requirements", reqs);
                                            }}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {isEditing && (
                        <div className="bg-muted/30 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                            <h4 className="font-medium text-muted-foreground">Add New Position</h4>
                            <div className="w-full max-w-md space-y-2">
                                <Input
                                    placeholder="Job Title"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                                <Button onClick={addJob} variant="secondary" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Position
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
