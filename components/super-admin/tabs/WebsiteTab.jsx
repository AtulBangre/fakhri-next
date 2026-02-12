"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Save, X, ChevronRight, FileText, MessageSquare, HelpCircle, Briefcase, Building, Users, DollarSign, List, Shield, Eye, Check, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { ImagePicker } from "@/components/ui/image-picker";

// Import Server Actions
import {
    getCompanyData, updateCompanyData,
    getTeamMembers, upsertTeamMember, deleteTeamMember,
    getPricingPlans, upsertPricingPlan,
    getServices, upsertService, deleteService,
    getCatalogServices, upsertCatalogService, deleteCatalogService,
    getTestimonials, upsertTestimonial, deleteTestimonial,
    getFAQs, upsertFAQ, deleteFAQ,
    getJobs, upsertJob, deleteJob
} from "@/lib/actions/content";
import { getBlogPosts, upsertBlogPost, deleteBlogPost } from "@/lib/actions/blog";

export default function WebsiteTab() {
    const [activeCategory, setActiveCategory] = useState("Company");
    const [loading, setLoading] = useState(true);

    // Data States
    const [companyInfo, setCompanyInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [pricingPlans, setPricingPlans] = useState([]);
    const [services, setServices] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function loadAllData() {
            try {
                const [
                    companyData,
                    teamData,
                    plansData,
                    servicesData,
                    catalogData,
                    testimonialData,
                    faqsData,
                    jobsData,
                    blogData
                ] = await Promise.all([
                    getCompanyData(),
                    getTeamMembers(),
                    getPricingPlans(),
                    getServices(),
                    getCatalogServices(),
                    getTestimonials(),
                    getFAQs(),
                    getJobs(),
                    getBlogPosts()
                ]);

                setCompanyInfo(companyData || {});
                setMembers(teamData || []);
                setPricingPlans(plansData || []);
                setServices(servicesData || []);
                setCatalog(catalogData || []);

                // Add default values for testimonials if needed
                const processedTestimonials = (testimonialData || []).map(t => ({
                    ...t,
                    rating: t.rating || 5,
                    author: t.author || { name: "Anonymous", role: "Client", company: "", handle: "", image: "" },
                    metric: t.metric || { label: "", value: "" }
                }));
                setTestimonials(processedTestimonials);

                // Ensure FAQ categories exist
                const processedFaqs = (faqsData || []).map(f => ({
                    ...f,
                    categories: f.categories || { home: false, pricing: false, dashboard: false }
                }));
                setFaqs(processedFaqs);

                setJobs(jobsData || []);
                setPosts(blogData?.posts || []);

            } catch (error) {
                console.error("Failed to load CMS data:", error);
                toast.error("Failed to load some content data");
            } finally {
                setLoading(false);
            }
        }
        loadAllData();
    }, []);

    const categories = [
        { id: "Company", label: "Company Info", icon: Building },
        { id: "Team", label: "Team Members", icon: Users },
        { id: "Pricing", label: "Pricing Plans", icon: DollarSign },
        { id: "Services", label: "Main Services", icon: Shield },
        { id: "Catalog", label: "Service Catalog", icon: List },
        { id: "Blogs", label: "Blog Posts", icon: FileText },
        { id: "Testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "FAQs", label: "FAQs", icon: HelpCircle },
        { id: "Jobs", label: "Careers", icon: Briefcase },
    ];

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading website content...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Website CMS</h2>
                    <p className="text-muted-foreground">Manage all public-facing content and data with full control.</p>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2 border-b no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeCategory === cat.id
                            ? "border-primary text-primary bg-primary/5"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                {activeCategory === "Company" && <CompanyManager data={companyInfo} onUpdate={setCompanyInfo} />}
                {activeCategory === "Team" && <TeamManager data={members} onUpdate={setMembers} />}
                {activeCategory === "Pricing" && <PricingManager data={pricingPlans} onUpdate={setPricingPlans} />}
                {activeCategory === "Services" && <ServiceManager data={services} onUpdate={setServices} />}
                {activeCategory === "Catalog" && <CatalogManager data={catalog} onUpdate={setCatalog} />}
                {activeCategory === "Blogs" && <BlogManager data={posts} onUpdate={setPosts} />}
                {activeCategory === "Testimonials" && <TestimonialManager data={testimonials} onUpdate={setTestimonials} />}
                {activeCategory === "FAQs" && <FAQManager data={faqs} onUpdate={setFaqs} />}
                {activeCategory === "Jobs" && <JobManager data={jobs} onUpdate={setJobs} />}
            </div>
        </div>
    );
}

// Helper for Array Inputs (Tags, Features, etc.)
function ArrayInput({ values, onChange, label, placeholder }) {
    const handleAdd = () => onChange([...values, ""]);
    const handleChange = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        onChange(newValues);
    };
    const handleRemove = (index) => {
        const newValues = values.filter((_, i) => i !== index);
        onChange(newValues);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {values.map((val, index) => (
                <div key={index} className="flex gap-2">
                    <Input value={val} onChange={(e) => handleChange(index, e.target.value)} placeholder={placeholder} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index)}><X className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="mt-1"><Plus className="h-3 w-3 mr-2" /> Add {label}</Button>
        </div>
    );
}

// 1. Company Manager
// 1. Company Manager
function CompanyManager({ data, onUpdate }) {
    const [formData, setFormData] = useState(data || {
        name: "", tagline: "", established: "", description: "", logo: "",
        contact: { phone: { primary: "", secondary: "" }, email: { info: "", support: "" }, address: { full: "" }, social: { linkedin: "", instagram: "" } },
        mission: "", vision: "", story: { title: "", content: "" }
    });

    useEffect(() => {
        if (data && Object.keys(data).length > 0) setFormData(data);
    }, [data]);

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await updateCompanyData(formData);
            if (updated) {
                onUpdate(updated);
                toast.success("Company information updated successfully");
            } else {
                toast.error("Failed to update company information");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <ImagePicker
                                name="logo"
                                label="Company Logo"
                                value={formData.logo}
                                onChange={(val) => handleChange(null, 'logo', val)}
                            />
                        </div>
                        <div className="grid gap-2"><Label>Company Name</Label><Input value={formData.name} onChange={(e) => handleChange(null, 'name', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Tagline</Label><Input value={formData.tagline} onChange={(e) => handleChange(null, 'tagline', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Established Year</Label><Input value={formData.established} onChange={(e) => handleChange(null, 'established', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => handleChange(null, 'description', e.target.value)} rows={4} /></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Primary Phone</Label><Input value={formData.contact?.phone?.primary} onChange={(e) => handleChange('contact', 'phone', { ...formData.contact.phone, primary: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Secondary Phone</Label><Input value={formData.contact?.phone?.secondary} onChange={(e) => handleChange('contact', 'phone', { ...formData.contact.phone, secondary: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Info Email</Label><Input value={formData.contact?.email?.info} onChange={(e) => handleChange('contact', 'email', { ...formData.contact.email, info: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Support Email</Label><Input value={formData.contact?.email?.support} onChange={(e) => handleChange('contact', 'email', { ...formData.contact.email, support: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Full Address</Label><Textarea value={formData.contact?.address?.full} onChange={(e) => handleChange('contact', 'address', { ...formData.contact.address, full: e.target.value })} /></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Mission & Vision</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2"><Label>Mission</Label><Textarea value={formData.mission} onChange={(e) => handleChange(null, 'mission', e.target.value)} rows={3} /></div>
                        <div className="grid gap-2"><Label>Vision</Label><Textarea value={formData.vision} onChange={(e) => handleChange(null, 'vision', e.target.value)} rows={3} /></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Social Media & Story</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>LinkedIn</Label><Input value={formData.contact?.social?.linkedin} onChange={(e) => handleChange('contact', 'social', { ...formData.contact.social, linkedin: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Instagram</Label><Input value={formData.contact?.social?.instagram} onChange={(e) => handleChange('contact', 'social', { ...formData.contact.social, instagram: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Story Title</Label><Input value={formData.story?.title} onChange={(e) => handleChange('story', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Story Content</Label><Textarea value={formData.story?.content} onChange={(e) => handleChange('story', 'content', e.target.value)} rows={3} /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// 2. Team Manager
// 2. Team Manager
function TeamManager({ data, onUpdate }) {
    const [members, setMembers] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setMembers(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (id) => {
        if (confirm("Delete team member?")) {
            setIsLoading(true);
            try {
                const res = await deleteTeamMember(id);
                if (res.success) {
                    const updated = members.filter(m => m._id !== id && m.id !== id);
                    setMembers(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting member");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newMember = {
            id: currentMember ? (currentMember._id || currentMember.id) : undefined,
            name: formData.get("name"),
            role: formData.get("role"),
            category: formData.get("category"),
            email: formData.get("email"),
            image: formData.get("image") || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            description: formData.get("description"),
            order: Number(formData.get("order")) || members.length + 1
        };

        try {
            const savedMember = await upsertTeamMember(newMember);
            if (savedMember) {
                let updatedMembers;
                if (currentMember) {
                    updatedMembers = members.map(m => (m._id === savedMember._id || m.id === savedMember.id) ? savedMember : m);
                } else {
                    updatedMembers = [...members, savedMember];
                }
                setMembers(updatedMembers);
                onUpdate(updatedMembers);
                toast.success(currentMember ? "Updated" : "Added");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save team member");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => { setCurrentMember(null); setIsViewMode(false); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Member</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{members.map(m => (
                        <TableRow key={m._id || m.id}>
                            <TableCell className="font-medium flex items-center gap-2"><img src={m.image} className="w-8 h-8 rounded-full object-cover" />{m.name}</TableCell>
                            <TableCell>{m.role}</TableCell><TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentMember(m); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentMember(m); setIsViewMode(false); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(m._id || m.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Member" : currentMember ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-center"><img src={currentMember?.image || undefined} className="w-24 h-24 rounded-full object-cover" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Name</Label><p>{currentMember?.name}</p></div><div><Label>Role</Label><p>{currentMember?.role}</p></div>
                                <div><Label>Category</Label><Badge>{currentMember?.category}</Badge></div><div><Label>Email</Label><p>{currentMember?.email}</p></div>
                                <div className="col-span-2"><Label>Description</Label><p className="text-sm text-muted-foreground">{currentMember?.description}</p></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={currentMember?.name} required /></div>
                                <div className="grid gap-2"><Label>Role</Label><Input name="role" defaultValue={currentMember?.role} required /></div>
                            </div>
                            <div className="grid gap-2"><Label>Category</Label><Select name="category" defaultValue={currentMember?.category || "Core Leadership"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Core Leadership">Core Leadership</SelectItem><SelectItem value="Senior Management">Senior Management</SelectItem><SelectItem value="Rising Stars">Rising Stars</SelectItem></SelectContent></Select></div>
                            <div className="grid gap-2"><Label>Email</Label><Input name="email" defaultValue={currentMember?.email} /></div>
                            <div className="grid gap-2">
                                <ImagePicker name="image" label="Profile Image" value={currentMember?.image} />
                            </div>
                            <div className="grid gap-2"><Label>Description</Label><Textarea name="description" defaultValue={currentMember?.description} /></div>
                            <div className="grid gap-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentMember?.order} /></div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 3. Pricing Manager
// 3. Pricing Manager
function PricingManager({ data, onUpdate }) {
    const [pricingData, setPricingData] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setPricingData(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const updatedPlan = {
            id: currentPlan ? (currentPlan._id || currentPlan.id) : undefined,
            name: formData.get("name"),
            subtitle: formData.get("subtitle"),
            prices: { monthly: formData.get("monthly"), monthlyUSD: formData.get("monthly") },
            description: formData.get("description"),
            cta: formData.get("cta"),
            period: formData.get("period"),
            highlighted: formData.get("highlighted") === "on",
            planId: currentPlan && currentPlan.planId ? currentPlan.planId : (formData.get("name") || "").toLowerCase().replace(/\s+/g, '-')
        };

        try {
            const savedPlan = await upsertPricingPlan(updatedPlan);
            if (savedPlan) {
                const updatedList = pricingData.map(p =>
                    (p._id === savedPlan._id || p.id === savedPlan.id || p.planId === savedPlan.planId) ? savedPlan : p
                );

                // If not found in map (because it's theoretically new, although UI seems to only allow editing existing for now, but assume adding possible too)
                if (!updatedList.find(p => p._id === savedPlan._id)) {
                    updatedList.push(savedPlan);
                }

                setPricingData(updatedList);
                onUpdate(updatedList);
                toast.success("Updated");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to update plan");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                {pricingData.map((plan) => (
                    <Card key={plan._id || plan.id || plan.planId} className={plan.highlighted ? "border-primary ring-1 ring-primary" : ""}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div><CardTitle>{plan.name}</CardTitle><CardDescription>{plan.subtitle}</CardDescription></div>
                                {plan.highlighted && <Badge>Popular</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><div className="text-3xl font-bold">{plan.prices?.monthly}</div><div className="text-sm text-muted-foreground">{plan.period}</div></div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => { setCurrentPlan(plan); setIsViewMode(false); setIsDialogOpen(true); }}>Edit</Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentPlan(plan); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Plan" : "Edit Plan"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-between"><div><h3 className="text-lg font-bold">{currentPlan?.name}</h3><p className="text-muted-foreground">{currentPlan?.subtitle}</p></div>{currentPlan?.highlighted && <Badge>Popular</Badge>}</div>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg"><div><Label>Monthly Price</Label><p className="font-mono">{currentPlan?.prices?.monthly}</p></div></div>
                            <div><Label>Description</Label><p>{currentPlan?.description}</p></div><div><Label>CTA Text</Label><p>{currentPlan?.cta}</p></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={currentPlan?.name} required /></div><div className="grid gap-2"><Label>Subtitle</Label><Input name="subtitle" defaultValue={currentPlan?.subtitle} /></div></div>
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Monthly Price (e.g. ₹20,000)</Label><Input name="monthly" defaultValue={currentPlan?.prices?.monthly} required /></div></div>
                            <div className="grid gap-2"><Label>Description</Label><Textarea name="description" defaultValue={currentPlan?.description} /></div>
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>CTA Text</Label><Input name="cta" defaultValue={currentPlan?.cta} /></div><div className="grid gap-2"><Label>Period</Label><Input name="period" defaultValue={currentPlan?.period} /></div></div>
                            <div className="flex items-center space-x-2"><Checkbox id="highlighted" name="highlighted" defaultChecked={currentPlan?.highlighted} /><Label htmlFor="highlighted">Highlight as Popular</Label></div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 4. Catalog Manager
// 4. Catalog Manager
function CatalogManager({ data, onUpdate }) {
    const [services, setServices] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setServices(data);
    }, [data]);

    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newService = {
            id: currentService ? (currentService._id || currentService.id) : undefined,
            name: formData.get("name"),
            category: formData.get("category"),
            serviceId: currentService && currentService.serviceId ? currentService.serviceId : `cat-${Date.now()}`,
            pricing: {
                standard: formData.get("stdPrice") ? { price: Number(formData.get("stdPrice")), label: formData.get("stdLabel") } : null,
                priority: formData.get("prioPrice") ? { price: Number(formData.get("prioPrice")), label: formData.get("prioLabel") } : null
            }
        };

        try {
            const savedService = await upsertCatalogService(newService);
            if (savedService) {
                let updatedServices;
                if (currentService) {
                    updatedServices = services.map(s => (s._id === savedService._id || s.id === savedService.id) ? savedService : s);
                } else {
                    updatedServices = [...services, savedService];
                }
                setServices(updatedServices);
                onUpdate(updatedServices);
                toast.success(currentService ? "Updated" : "Added");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save catalog item");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete catalog item?")) {
            setIsLoading(true);
            try {
                const res = await deleteCatalogService(id);
                if (res.success) {
                    const updated = services.filter(s => s._id !== id && s.id !== id);
                    setServices(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting item");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" onChange={(e) => setSearch(e.target.value)} /><Button onClick={() => { setCurrentService(null); setIsViewMode(false); setIsDialogOpen(true); }}>Add Item</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Standard</TableHead><TableHead>Priority (2 hr) </TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{services.filter(s => s.name?.toLowerCase().includes(search.toLowerCase())).map(s => (
                        <TableRow key={s._id || s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell><TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                            <TableCell>{s.pricing?.standard ? `₹${s.pricing.standard.price}` : "-"}</TableCell><TableCell>{s.pricing?.priority ? `₹${s.pricing.priority.price}` : "-"}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentService(s); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentService(s); setIsViewMode(false); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s._id || s.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Item" : "Edit/Add Item"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div><Label>Name</Label><p>{currentService?.name}</p></div><div><Label>Category</Label><Badge>{currentService?.category}</Badge></div>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded text-center">
                                <div><Label>Standard</Label><p className="text-xl font-bold">{currentService?.pricing?.standard ? `₹${currentService?.pricing.standard.price}` : "N/A"}</p><p className="text-xs text-muted-foreground">{currentService?.pricing?.standard?.label}</p></div>
                                <div><Label>Priority</Label><p className="text-xl font-bold text-amber-600">{currentService?.pricing?.priority ? `₹${currentService?.pricing.priority.price}` : "N/A"}</p><p className="text-xs text-muted-foreground">{currentService?.pricing?.priority?.label}</p></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={currentService?.name} required /></div>
                            <div className="grid gap-2"><Label>Category</Label><Input name="category" defaultValue={currentService?.category} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Standard Price</Label><Input type="number" name="stdPrice" defaultValue={currentService?.pricing?.standard?.price} /><Input name="stdLabel" defaultValue={currentService?.pricing?.standard?.label || "Detailed"} placeholder="Label" /></div>
                                <div className="space-y-2"><Label>Priority Price</Label><Input type="number" name="prioPrice" defaultValue={currentService?.pricing?.priority?.price} /><Input name="prioLabel" defaultValue={currentService?.pricing?.priority?.label || "Within 2 Hours"} placeholder="Label" /></div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
    ]
};

// 5. Blog Manager
function BlogManager({ data, onUpdate }) {
    const [posts, setPosts] = useState(Array.isArray(data) ? data : []);

    // Sync with parent data if it's fetched asynchronously
    useEffect(() => {
        if (Array.isArray(data)) {
            setPosts(data);
            setAvailableCategories(Array.from(new Set(data.map(p => p.category))));
        }
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [tags, setTags] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");

    // Loading State
    const [isLoading, setIsLoading] = useState(false);

    // Category Management
    const [availableCategories, setAvailableCategories] = useState(
        Array.from(new Set((Array.isArray(data) ? data : []).map(p => p.category)))
    );
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");

    // Thumbnail Management
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    useEffect(() => {
        if (!currentPost && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, currentPost]);

    const handleOpen = (post, view) => {
        setCurrentPost(post);
        setIsViewMode(view);
        setTags(post?.tags || []);
        setContent(post?.content || "");
        setTitle(post?.title || "");
        setSlug(post?.slug || "");
        setSelectedCategory(post?.category && availableCategories.includes(post.category) ? post.category : (post?.category ? "Other" : ""));
        setCustomCategory(post?.category && !availableCategories.includes(post.category) ? post.category : "");
        setThumbnailUrl(post?.thumbnail || "");
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete blog post?")) {
            setIsLoading(true);
            try {
                const res = await deleteBlogPost(id);
                if (res.success) {
                    const updated = posts.filter(p => p._id !== id && p.id !== id);
                    setPosts(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting post");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const finalCategory = selectedCategory === "Other" ? customCategory : selectedCategory;
        if (selectedCategory === "Other" && customCategory && !availableCategories.includes(customCategory)) {
            setAvailableCategories([...availableCategories, customCategory]);
        }

        const newPost = {
            id: currentPost ? (currentPost._id || currentPost.id) : undefined,
            title: title,
            excerpt: formData.get("excerpt"),
            category: finalCategory,
            date: currentPost?.date || new Date().toLocaleDateString(),
            publishDate: currentPost?.publishDate || new Date().toISOString().split('T')[0],
            readTime: formData.get("readTime"),
            slug: slug,
            thumbnail: thumbnailUrl,
            tags: tags,
            author: { name: formData.get("authorName"), role: formData.get("authorRole"), image: formData.get("authorImage") },
            content: content
        };

        try {
            const savedPost = await upsertBlogPost(newPost);
            if (savedPost) {
                let updatedPosts;
                if (currentPost) {
                    updatedPosts = posts.map(p => (p._id === savedPost._id || p.id === savedPost.id) ? savedPost : p);
                } else {
                    updatedPosts = [savedPost, ...posts];
                }
                setPosts(updatedPosts);
                onUpdate(updatedPosts);

                toast.success(currentPost ? "Updated" : "Created");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save blog post");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => handleOpen(null, false)}>Add Post</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Author</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{posts.map(p => (
                        <TableRow key={p._id || p.id}>
                            <TableCell className="font-medium max-w-xs truncate">{p.title}</TableCell><TableCell><Badge variant="outline">{p.category}</Badge></TableCell><TableCell>{p.author?.name}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(p, true)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(p, false)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p._id || p.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Post" : "Edit Post"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <img src={currentPost?.thumbnail || undefined} alt="cover" className="w-full h-40 object-cover rounded-md" />
                            <h2 className="text-xl font-bold">{currentPost?.title}</h2>
                            <div className="flex gap-2 text-sm text-muted-foreground"><span>{currentPost?.date}</span><span>•</span><span>{currentPost?.readTime}</span><span>•</span><span>{currentPost?.author?.name}</span></div>
                            <div className="flex gap-2">{currentPost?.tags?.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                            <p className="italic border-l-4 border-primary pl-4">{currentPost?.excerpt}</p>
                            <div className="space-y-2"><h4 className="font-semibold">Content</h4><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentPost?.content }} /></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Main Content Application */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2"><Label>Title</Label><Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Enter post title" className="text-lg font-medium" /></div>
                                        <div className="space-y-2"><Label>Slug</Label><Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-muted" readOnly /></div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <div className="h-[500px] mb-12">
                                            <ReactQuill
                                                theme="snow"
                                                value={content}
                                                onChange={setContent}
                                                className="h-full flex flex-col"
                                                modules={quillModules}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-6">
                                        <Label>Excerpt</Label>
                                        <Textarea name="excerpt" defaultValue={currentPost?.excerpt} placeholder="Brief summary of the post..." rows={3} />
                                    </div>
                                </div>

                                {/* Sidebar Settings */}
                                <div className="space-y-6">
                                    {/* Publishing Settings */}
                                    <Card>
                                        <CardHeader className="py-3 bg-muted/30"><CardTitle className="text-base">Publishing</CardTitle></CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                                    <SelectContent>
                                                        {availableCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                        <SelectItem value="Other">Other (Add New)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {selectedCategory === "Other" && (
                                                    <Input
                                                        placeholder="Enter new category"
                                                        value={customCategory}
                                                        onChange={(e) => setCustomCategory(e.target.value)}
                                                        className="mt-2 animate-in fade-in"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-2"><Label>Read Time</Label><Input name="readTime" defaultValue={currentPost?.readTime} placeholder="e.g. 5 min read" /></div>
                                            <ArrayInput values={tags} onChange={setTags} label="Tags" placeholder="Add tag..." />
                                        </CardContent>
                                    </Card>

                                    {/* Author Settings */}
                                    <Card>
                                        <CardHeader className="py-3 bg-muted/30"><CardTitle className="text-base">Author Details</CardTitle></CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2"><Label>Name</Label><Input name="authorName" defaultValue={currentPost?.author?.name} /></div>
                                            <div className="space-y-2"><Label>Role</Label><Input name="authorRole" defaultValue={currentPost?.author?.role} /></div>
                                            <div className="space-y-2"><Label>Profile Image</Label><ImagePicker name="authorImage" label="Author Image" value={currentPost?.author?.image} /></div>
                                        </CardContent>
                                    </Card>

                                    {/* Thumbnail Settings */}
                                    <Card>
                                        <CardHeader className="py-3 bg-muted/30"><CardTitle className="text-base">Featured Image</CardTitle></CardHeader>
                                        <CardContent className="p-4">
                                            <ImagePicker
                                                name="thumbnail"
                                                label="Thumbnail"
                                                value={thumbnailUrl}
                                                onChange={setThumbnailUrl}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            <DialogFooter className="sticky bottom-0 bg-background py-2 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 6. Service Manager
function ServiceManager({ data, onUpdate }) {
    const [services, setServices] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setServices(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [features, setFeatures] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = (service, view) => {
        setCurrentService(service);
        setIsViewMode(view);
        setFeatures(service?.features || []);
        setBenefits(service?.benefits || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete service?")) {
            setIsLoading(true);
            try {
                const res = await deleteService(id);
                if (res.success) {
                    const updated = services.filter(s => s._id !== id && s.id !== id);
                    setServices(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting service");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newService = {
            id: currentService ? (currentService._id || currentService.id) : undefined,
            serviceId: currentService && currentService.serviceId ? currentService.serviceId : (formData.get("title") || "").toLowerCase().replace(/\s+/g, '-'),
            title: formData.get("title"),
            shortDescription: formData.get("shortDescription"),
            fullDescription: formData.get("fullDescription"),
            icon: formData.get("icon"),
            category: formData.get("category"),
            features: features,
            benefits: benefits,
            order: Number(formData.get("order")) || services.length + 1
        };

        try {
            const savedService = await upsertService(newService);
            if (savedService) {
                let updatedServices;
                if (currentService) {
                    updatedServices = services.map(s => (s._id === savedService._id || s.id === savedService.id) ? savedService : s);
                } else {
                    updatedServices = [...services, savedService];
                }
                setServices(updatedServices);
                onUpdate(updatedServices);
                toast.success(currentService ? "Updated" : "Added");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save service");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => handleOpen(null, false)}>Add Service</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Icon</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{services.map(s => (
                        <TableRow key={s._id || s.id}>
                            <TableCell className="font-medium">{s.title}</TableCell><TableCell><Badge variant="outline">{s.category}</Badge></TableCell><TableCell><code className="text-xs bg-muted px-1 rounded">{s.icon}</code></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(s, true)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(s, false)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s._id || s.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Service" : "Edit Service"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div><h3 className="text-xl font-bold">{currentService?.title}</h3><Badge variant="secondary" className="mt-1">{currentService?.category}</Badge></div>
                                <div className="p-2 bg-muted rounded-full"><Shield className="w-6 h-6" /></div>
                            </div>
                            <p className="text-muted-foreground">{currentService?.shortDescription}</p>
                            <div className="prose prose-sm max-w-none"><h4 className="font-semibold">Full Description</h4><p>{currentService?.fullDescription}</p></div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><h4 className="font-semibold mb-2">Features</h4><ul className="list-disc pl-5 text-sm space-y-1">{currentService?.features?.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
                                <div><h4 className="font-semibold mb-2">Benefits</h4><ul className="list-disc pl-5 text-sm space-y-1">{currentService?.benefits?.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Title</Label><Input name="title" defaultValue={currentService?.title} required /></div>
                                <div className="grid gap-2"><Label>Icon Name (Lucide)</Label><Input name="icon" defaultValue={currentService?.icon} placeholder="e.g. Shield" /></div>
                            </div>
                            <div className="grid gap-2"><Label>Category</Label><Select name="category" defaultValue={currentService?.category}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent><SelectItem value="Account Services">Account Services</SelectItem><SelectItem value="Listing & Content">Listing & Content</SelectItem><SelectItem value="Operations">Operations</SelectItem><SelectItem value="Growth">Growth</SelectItem></SelectContent></Select></div>
                            <div className="grid gap-2"><Label>Short Description</Label><Textarea name="shortDescription" defaultValue={currentService?.shortDescription} rows={2} /></div>
                            <div className="grid gap-2"><Label>Full Description</Label><Textarea name="fullDescription" defaultValue={currentService?.fullDescription} rows={4} /></div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <ArrayInput values={features} onChange={setFeatures} label="Features" placeholder="Add feature..." />
                                <ArrayInput values={benefits} onChange={setBenefits} label="Benefits" placeholder="Add benefit..." />
                            </div>
                            <div className="grid gap-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentService?.order} /></div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 7. Testimonial Manager
function TestimonialManager({ data, onUpdate }) {
    const [testimonials, setTestimonials] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setTestimonials(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = (t, view) => {
        // Ensure author object exists
        const testimonial = t ? {
            ...t,
            author: t.author || { name: "", role: "", company: "", handle: "", image: "" },
            metric: t.metric || { label: "", value: "" }
        } : null;
        setCurrentTestimonial(testimonial);
        setIsViewMode(view);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete testimonial?")) {
            setIsLoading(true);
            try {
                const res = await deleteTestimonial(id);
                if (res.success) {
                    const updated = testimonials.filter(t => t._id !== id && t.id !== id);
                    setTestimonials(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting testimonial");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newTestimonial = {
            id: currentTestimonial ? (currentTestimonial._id || currentTestimonial.id) : undefined,
            quote: formData.get("quote"),
            rating: Number(formData.get("rating")),
            featured: formData.get("featured") === "on",
            author: {
                name: formData.get("authorName"),
                role: formData.get("authorRole"),
                company: formData.get("authorCompany"),
                handle: formData.get("authorHandle"),
                image: formData.get("authorImage") || "https://randomuser.me/api/portraits/men/32.jpg"
            },
            metric: {
                value: formData.get("metricValue"),
                label: formData.get("metricLabel")
            },
            order: Number(formData.get("order")) || testimonials.length + 1
        };

        try {
            const savedTestimonial = await upsertTestimonial(newTestimonial);
            if (savedTestimonial) {
                // Ensure helper structures exist for UI consistency
                savedTestimonial.author = savedTestimonial.author || {};
                savedTestimonial.metric = savedTestimonial.metric || {};

                let updatedTestimonials;
                if (currentTestimonial) {
                    updatedTestimonials = testimonials.map(t => (t._id === savedTestimonial._id || t.id === savedTestimonial.id) ? savedTestimonial : t);
                } else {
                    updatedTestimonials = [...testimonials, savedTestimonial];
                }
                setTestimonials(updatedTestimonials);
                onUpdate(updatedTestimonials);
                toast.success(currentTestimonial ? "Updated" : "Added");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save testimonial");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => handleOpen(null, false)}>Add Testimonial</Button></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                    <Card key={t._id || t.id} className="relative group hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-4">
                                <img src={t.author?.image || undefined} className="w-12 h-12 rounded-full object-cover" />
                                <div><h4 className="font-semibold">{t.author?.name}</h4><p className="text-xs text-muted-foreground">{t.author?.role}, {t.author?.company}</p></div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm italic text-muted-foreground line-clamp-3">"{t.quote}"</p>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex text-yellow-500">{[...Array(t.rating || 5)].map((_, i) => <span key={i}>★</span>)}</div>
                                {t.metric?.value && <Badge variant="secondary">{t.metric.value} {t.metric.label}</Badge>}
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button variant="ghost" size="sm" onClick={() => handleOpen(t, false)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(t._id || t.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Testimonial" : "Edit Testimonial"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4"><img src={currentTestimonial?.author?.image || undefined} className="w-16 h-16 rounded-full" /><div><h4 className="text-lg font-bold">{currentTestimonial?.author?.name}</h4><p>{currentTestimonial?.author?.role}, {currentTestimonial?.author?.company}</p></div></div>
                            <p className="text-xl italic font-serif">"{currentTestimonial?.quote}"</p>
                            <div className="flex gap-4"><div><Label>Rating</Label><div className="flex text-yellow-500">{[...Array(currentTestimonial?.rating || 5)].map((_, i) => <span key={i}>★</span>)}</div></div>{currentTestimonial?.metric?.value && <div><Label>Metric</Label><Badge>{currentTestimonial?.metric.value} {currentTestimonial?.metric.label}</Badge></div>}</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2"><Label>Quote</Label><Textarea name="quote" defaultValue={currentTestimonial?.quote} required /></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Author Name</Label><Input name="authorName" defaultValue={currentTestimonial?.author?.name} required /></div>
                                <div className="space-y-2"><Label>Role</Label><Input name="authorRole" defaultValue={currentTestimonial?.author?.role} /></div>
                                <div className="space-y-2"><Label>Company</Label><Input name="authorCompany" defaultValue={currentTestimonial?.author?.company} /></div>
                                <div className="space-y-2"><Label>Handle (Twitter/Li)</Label><Input name="authorHandle" defaultValue={currentTestimonial?.author?.handle} /></div>
                            </div>
                            <div className="space-y-2">
                                <ImagePicker
                                    name="authorImage"
                                    label="Author Image"
                                    value={currentTestimonial?.author?.image}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Metric Value</Label><Input name="metricValue" defaultValue={currentTestimonial?.metric?.value} placeholder="e.g. +200%" /></div>
                                <div className="space-y-2"><Label>Metric Label</Label><Input name="metricLabel" defaultValue={currentTestimonial?.metric?.label} placeholder="e.g. Growth" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" name="rating" min="1" max="5" defaultValue={currentTestimonial?.rating || 5} /></div>
                                <div className="space-y-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentTestimonial?.order} /></div>
                            </div>
                            <div className="flex items-center space-x-2"><Checkbox id="featured" name="featured" defaultChecked={currentTestimonial?.featured} /><Label htmlFor="featured">Feature on Home Page</Label></div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 8. FAQ Manager
function FAQManager({ data, onUpdate }) {
    const [faqs, setFaqs] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setFaqs(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = (f, view) => {
        // Ensure categories object exists
        const faq = f ? {
            ...f,
            categories: f.categories || { home: false, pricing: false, dashboard: false }
        } : null;
        setCurrentFaq(faq);
        setIsViewMode(view);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete FAQ?")) {
            setIsLoading(true);
            try {
                const res = await deleteFAQ(id);
                if (res.success) {
                    const updated = faqs.filter(f => f._id !== id && f.id !== id);
                    setFaqs(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting FAQ");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newFaq = {
            id: currentFaq ? (currentFaq._id || currentFaq.id) : undefined,
            question: formData.get("question"),
            answer: formData.get("answer"),
            categories: {
                home: formData.get("cat_home") === "on",
                pricing: formData.get("cat_pricing") === "on",
                dashboard: formData.get("cat_dashboard") === "on"
            },
            order: Number(formData.get("order")) || faqs.length + 1
        };

        try {
            const savedFaq = await upsertFAQ(newFaq);
            if (savedFaq) {
                // Ensure helper structures exist for UI consistency
                savedFaq.categories = savedFaq.categories || { home: false, pricing: false, dashboard: false };

                let updatedFaqs;
                if (currentFaq) {
                    updatedFaqs = faqs.map(f => (f._id === savedFaq._id || f.id === savedFaq.id) ? savedFaq : f);
                } else {
                    updatedFaqs = [...faqs, savedFaq];
                }
                setFaqs(updatedFaqs);
                onUpdate(updatedFaqs);
                toast.success(currentFaq ? "Updated" : "Added");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save FAQ");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Add FAQ</Button></div>
            <div className="grid md:grid-cols-2 gap-4">
                {faqs.map((f, i) => (
                    <div key={f._id || f.id || i} className="p-4 rounded-lg border bg-card flex justify-between group">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">{f.question}</h4>
                                <div className="flex gap-1">
                                    {f.categories?.home && <Badge variant="secondary" className="text-xs">Home</Badge>}
                                    {f.categories?.pricing && <Badge variant="secondary" className="text-xs">Pricing</Badge>}
                                    {f.categories?.dashboard && <Badge variant="secondary" className="text-xs">Dashboard</Badge>}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{f.answer}</p>
                        </div>
                        <div className="flex gap-1 items-start pl-4">
                            <Button variant="ghost" size="icon" onClick={() => handleOpen(f, true)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpen(f, false)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(f._id || f.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View FAQ" : "Edit FAQ"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold">{currentFaq?.question}</h3>
                            <p className="text-muted-foreground">{currentFaq?.answer}</p>
                            <div className="flex gap-2">
                                {currentFaq?.categories?.home && <Badge>Home</Badge>}
                                {currentFaq?.categories?.pricing && <Badge>Pricing</Badge>}
                                {currentFaq?.categories?.dashboard && <Badge>Dashboard</Badge>}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2"><Label>Question</Label><Input name="question" defaultValue={currentFaq?.question} required /></div>
                            <div className="space-y-2"><Label>Answer</Label><Textarea name="answer" defaultValue={currentFaq?.answer} required /></div>
                            <div className="space-y-2">
                                <Label>Show On:</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_home" name="cat_home" defaultChecked={currentFaq?.categories?.home} /><Label htmlFor="cat_home">Home</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_pricing" name="cat_pricing" defaultChecked={currentFaq?.categories?.pricing} /><Label htmlFor="cat_pricing">Pricing</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_dashboard" name="cat_dashboard" defaultChecked={currentFaq?.categories?.dashboard} /><Label htmlFor="cat_dashboard">Dashboard</Label></div>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentFaq?.order} /></div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 9. Job Manager
function JobManager({ data, onUpdate }) {
    const [jobs, setJobs] = useState(Array.isArray(data) ? data : []);

    useEffect(() => {
        if (Array.isArray(data)) setJobs(data);
    }, [data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [requirements, setRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = (j, view) => {
        setCurrentJob(j);
        setIsViewMode(view);
        setRequirements(j?.requirements || []);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete job posting?")) {
            setIsLoading(true);
            try {
                const res = await deleteJob(id);
                if (res.success) {
                    const updated = jobs.filter(j => j._id !== id && j.id !== id);
                    setJobs(updated);
                    onUpdate(updated);
                    toast.success("Deleted");
                } else {
                    toast.error("Failed to delete");
                }
            } catch (error) {
                toast.error("Error deleting job");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const newJob = {
            id: currentJob ? (currentJob._id || currentJob.id) : undefined,
            title: formData.get("title"),
            department: formData.get("department"),
            location: formData.get("location"),
            type: formData.get("type"),
            experience: formData.get("experience"),
            description: formData.get("description"),
            requirements: requirements
        };

        try {
            const savedJob = await upsertJob(newJob);
            if (savedJob) {
                let updatedJobs;
                if (currentJob) {
                    updatedJobs = jobs.map(j => (j._id === savedJob._id || j.id === savedJob.id) ? savedJob : j);
                } else {
                    updatedJobs = [...jobs, savedJob];
                }
                setJobs(updatedJobs);
                onUpdate(updatedJobs);
                toast.success(currentJob ? "Updated" : "Created");
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to save job");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Post Job</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Position</TableHead><TableHead>Department</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{jobs.map(j => (
                        <TableRow key={j._id || j.id}>
                            <TableCell className="font-medium">{j.title}</TableCell><TableCell>{j.department}</TableCell><TableCell><Badge variant="secondary">{j.type}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(j, true)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(j, false)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(j._id || j.id)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Job" : "Edit Job"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start"><div><h2 className="text-xl font-bold">{currentJob?.title}</h2><p className="text-muted-foreground">{currentJob?.department} • {currentJob?.location}</p></div><Badge>{currentJob?.type}</Badge></div>
                            <div><Label>Description</Label><p className="text-sm">{currentJob?.description}</p></div>
                            <div><Label>Requirements</Label><ul className="list-disc pl-4 text-sm">{currentJob?.requirements?.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Title</Label><Input name="title" defaultValue={currentJob?.title} required /></div><div className="space-y-2"><Label>Department</Label><Input name="department" defaultValue={currentJob?.department} required /></div></div>
                            <div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Location</Label><Input name="location" defaultValue={currentJob?.location} required /></div><div className="space-y-2"><Label>Type</Label><Input name="type" defaultValue={currentJob?.type} required /></div><div className="space-y-2"><Label>Experience</Label><Input name="experience" defaultValue={currentJob?.experience} /></div></div>
                            <div className="space-y-2"><Label>Description</Label><Textarea name="description" defaultValue={currentJob?.description} rows={3} /></div>
                            <ArrayInput values={requirements} onChange={setRequirements} label="Requirements" placeholder="Requirement..." />
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
