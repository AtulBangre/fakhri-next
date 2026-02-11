"use client";
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Save, X, ChevronRight, FileText, MessageSquare, HelpCircle, Briefcase, Building, Users, DollarSign, List, Shield, Eye, Check, GripVertical } from "lucide-react";
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

// Import Initial Data
import { allBlogPosts } from "@/data/allBlogPosts";
import { allServices } from "@/data/allServices";
import { allTestimonials } from "@/data/allTestimonials";
import { allFAQs } from "@/data/allFAQs";
import { jobPositions } from "@/data/jobs";
import { companyData } from "@/data/company";
import { teammembers } from "@/data/teammembers";
import { plans } from "@/data/pricingPlans";
import { servicesCatalog } from "@/data/servicesCatalog";

export default function WebsiteTab() {
    const [activeCategory, setActiveCategory] = useState("Company");

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
                {activeCategory === "Company" && <CompanyManager data={companyData} />}
                {activeCategory === "Team" && <TeamManager data={teammembers} />}
                {activeCategory === "Pricing" && <PricingManager data={plans} />}
                {activeCategory === "Services" && <ServiceManager data={allServices} />}
                {activeCategory === "Catalog" && <CatalogManager data={servicesCatalog} />}
                {activeCategory === "Blogs" && <BlogManager data={allBlogPosts} />}
                {activeCategory === "Testimonials" && <TestimonialManager data={allTestimonials} />}
                {activeCategory === "FAQs" && <FAQManager data={allFAQs} />}
                {activeCategory === "Jobs" && <JobManager data={jobPositions} />}
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
function CompanyManager({ data }) {
    const [formData, setFormData] = useState(data);

    const handleChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => { toast.success("Company information updated successfully"); };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-end"><Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Changes</Button></div>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
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
                            <div className="grid gap-2"><Label>Primary Phone</Label><Input value={formData.contact.phone.primary} onChange={(e) => handleChange('contact', 'phone', { ...formData.contact.phone, primary: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Secondary Phone</Label><Input value={formData.contact.phone.secondary} onChange={(e) => handleChange('contact', 'phone', { ...formData.contact.phone, secondary: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Info Email</Label><Input value={formData.contact.email.info} onChange={(e) => handleChange('contact', 'email', { ...formData.contact.email, info: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Support Email</Label><Input value={formData.contact.email.support} onChange={(e) => handleChange('contact', 'email', { ...formData.contact.email, support: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Full Address</Label><Textarea value={formData.contact.address.full} onChange={(e) => handleChange('contact', 'address', { ...formData.contact.address, full: e.target.value })} /></div>
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
                            <div className="grid gap-2"><Label>LinkedIn</Label><Input value={formData.contact.social.linkedin} onChange={(e) => handleChange('contact', 'social', { ...formData.contact.social, linkedin: e.target.value })} /></div>
                            <div className="grid gap-2"><Label>Instagram</Label><Input value={formData.contact.social.instagram} onChange={(e) => handleChange('contact', 'social', { ...formData.contact.social, instagram: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Story Title</Label><Input value={formData.story.title} onChange={(e) => handleChange('story', 'title', e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Story Content</Label><Textarea value={formData.story.content} onChange={(e) => handleChange('story', 'content', e.target.value)} rows={3} /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// 2. Team Manager
function TeamManager({ data }) {
    const [members, setMembers] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleDelete = (id) => { if (confirm("Delete team member?")) { setMembers(members.filter(m => m.id !== id)); toast.success("Deleted"); } };
    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newMember = {
            id: currentMember ? currentMember.id : Date.now(),
            name: formData.get("name"), role: formData.get("role"), category: formData.get("category"), email: formData.get("email"),
            image: formData.get("image") || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            description: formData.get("description"), order: Number(formData.get("order")) || members.length + 1
        };
        if (currentMember) { setMembers(members.map(m => m.id === currentMember.id ? newMember : m)); toast.success("Updated"); } else { setMembers([...members, newMember]); toast.success("Added"); }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => { setCurrentMember(null); setIsViewMode(false); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Member</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{members.map(m => (
                        <TableRow key={m.id}>
                            <TableCell className="font-medium flex items-center gap-2"><img src={m.image} className="w-8 h-8 rounded-full object-cover" />{m.name}</TableCell>
                            <TableCell>{m.role}</TableCell><TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentMember(m); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentMember(m); setIsViewMode(false); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isViewMode ? "View Member" : currentMember ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-center"><img src={currentMember?.image} className="w-24 h-24 rounded-full object-cover" /></div>
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
                            <div className="grid gap-2"><Label>Image URL</Label><Input name="image" defaultValue={currentMember?.image} /></div>
                            <div className="grid gap-2"><Label>Description</Label><Textarea name="description" defaultValue={currentMember?.description} /></div>
                            <div className="grid gap-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentMember?.order} /></div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 3. Pricing Manager
function PricingManager({ data }) {
    const [pricingData, setPricingData] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const updated = {
            ...currentPlan, name: formData.get("name"), subtitle: formData.get("subtitle"),
            prices: { monthly: formData.get("monthly"), monthlyUSD: formData.get("monthlyUSD") },
            description: formData.get("description"), cta: formData.get("cta"), period: formData.get("period"),
            highlighted: formData.get("highlighted") === "on"
        };
        setPricingData(pricingData.map(p => p.id === currentPlan.id ? updated : p));
        toast.success("Updated"); setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                {pricingData.map((plan) => (
                    <Card key={plan.id} className={plan.highlighted ? "border-primary ring-1 ring-primary" : ""}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div><CardTitle>{plan.name}</CardTitle><CardDescription>{plan.subtitle}</CardDescription></div>
                                {plan.highlighted && <Badge>Popular</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><div className="text-3xl font-bold">{plan.prices.monthly}</div><div className="text-sm text-muted-foreground">{plan.prices.monthlyUSD} / {plan.period}</div></div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => { setCurrentPlan(plan); setIsViewMode(false); setIsDialogOpen(true); }}>Edit</Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentPlan(plan); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isViewMode ? "View Plan" : "Edit Plan"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex justify-between"><div><h3 className="text-lg font-bold">{currentPlan?.name}</h3><p className="text-muted-foreground">{currentPlan?.subtitle}</p></div>{currentPlan?.highlighted && <Badge>Popular</Badge>}</div>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg"><div><Label>Monthly (INR)</Label><p className="font-mono">{currentPlan?.prices.monthly}</p></div><div><Label>Monthly (USD)</Label><p className="font-mono">{currentPlan?.prices.monthlyUSD}</p></div></div>
                            <div><Label>Description</Label><p>{currentPlan?.description}</p></div><div><Label>CTA Text</Label><p>{currentPlan?.cta}</p></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={currentPlan?.name} required /></div><div className="grid gap-2"><Label>Subtitle</Label><Input name="subtitle" defaultValue={currentPlan?.subtitle} /></div></div>
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Price (INR)</Label><Input name="monthly" defaultValue={currentPlan?.prices.monthly} required /></div><div className="grid gap-2"><Label>Price (USD)</Label><Input name="monthlyUSD" defaultValue={currentPlan?.prices.monthlyUSD} required /></div></div>
                            <div className="grid gap-2"><Label>Description</Label><Textarea name="description" defaultValue={currentPlan?.description} /></div>
                            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>CTA Text</Label><Input name="cta" defaultValue={currentPlan?.cta} /></div><div className="grid gap-2"><Label>Period</Label><Input name="period" defaultValue={currentPlan?.period} /></div></div>
                            <div className="flex items-center space-x-2"><Checkbox id="highlighted" name="highlighted" defaultChecked={currentPlan?.highlighted} /><Label htmlFor="highlighted">Highlight as Popular</Label></div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 4. Catalog Manager
function CatalogManager({ data }) {
    const [services, setServices] = useState(data);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newService = {
            id: currentService ? currentService.id : `cat-${Date.now()}`,
            name: formData.get("name"), category: formData.get("category"),
            pricing: {
                standard: formData.get("stdPrice") ? { price: Number(formData.get("stdPrice")), label: formData.get("stdLabel") } : null,
                priority: formData.get("prioPrice") ? { price: Number(formData.get("prioPrice")), label: formData.get("prioLabel") } : null
            }
        };
        if (currentService) { setServices(services.map(s => s.id === currentService.id ? newService : s)); toast.success("Updated"); } else { setServices([...services, newService]); toast.success("Added"); }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" onChange={(e) => setSearch(e.target.value)} /><Button onClick={() => { setCurrentService(null); setIsViewMode(false); setIsDialogOpen(true); }}>Add Item</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Standard</TableHead><TableHead>Priority (2 hr) </TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{services.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell><TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                            <TableCell>{s.pricing.standard ? `$${s.pricing.standard.price}` : "-"}</TableCell><TableCell>{s.pricing.priority ? `$${s.pricing.priority.price}` : "-"}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentService(s); setIsViewMode(true); setIsDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { setCurrentService(s); setIsViewMode(false); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setServices(services.filter(x => x.id !== s.id))}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isViewMode ? "View Item" : "Edit/Add Item"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div><Label>Name</Label><p>{currentService?.name}</p></div><div><Label>Category</Label><Badge>{currentService?.category}</Badge></div>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded text-center">
                                <div><Label>Standard</Label><p className="text-xl font-bold">{currentService?.pricing.standard ? `$${currentService?.pricing.standard.price}` : "N/A"}</p><p className="text-xs text-muted-foreground">{currentService?.pricing.standard?.label}</p></div>
                                <div><Label>Priority</Label><p className="text-xl font-bold text-amber-600">{currentService?.pricing.priority ? `$${currentService?.pricing.priority.price}` : "N/A"}</p><p className="text-xs text-muted-foreground">{currentService?.pricing.priority?.label}</p></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-2"><Label>Name</Label><Input name="name" defaultValue={currentService?.name} required /></div>
                            <div className="grid gap-2"><Label>Category</Label><Input name="category" defaultValue={currentService?.category} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Standard Price</Label><Input type="number" name="stdPrice" defaultValue={currentService?.pricing.standard?.price} /><Input name="stdLabel" defaultValue={currentService?.pricing.standard?.label || "Detailed"} placeholder="Label" /></div>
                                <div className="space-y-2"><Label>Priority Price</Label><Input type="number" name="prioPrice" defaultValue={currentService?.pricing.priority?.price} /><Input name="prioLabel" defaultValue={currentService?.pricing.priority?.label || "Within 2 Hours"} placeholder="Label" /></div>
                            </div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 5. Blog Manager
function BlogManager({ data }) {
    const [posts, setPosts] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [tags, setTags] = useState([]);

    const handleOpen = (post, view) => {
        setCurrentPost(post); setIsViewMode(view); setTags(post?.tags || []); setIsDialogOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newPost = {
            id: currentPost ? currentPost.id : Date.now(),
            title: formData.get("title"), excerpt: formData.get("excerpt"), category: formData.get("category"),
            date: currentPost?.date || new Date().toLocaleDateString(), publishDate: formData.get("publishDate"),
            readTime: formData.get("readTime"), slug: formData.get("slug"), thumbnail: formData.get("thumbnail"),
            tags: tags,
            author: { name: formData.get("authorName"), role: formData.get("authorRole"), image: formData.get("authorImage") },
            content: { introduction: formData.get("intro"), conclusion: formData.get("conclusion") } // Simplified content structure
        };
        if (currentPost) { setPosts(posts.map(p => p.id === currentPost.id ? { ...p, ...newPost } : p)); toast.success("Updated"); } else { setPosts([newPost, ...posts]); toast.success("Created"); }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between"><Input placeholder="Search..." className="max-w-sm" /><Button onClick={() => handleOpen(null, false)}>Add Post</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Author</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{posts.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium max-w-xs truncate">{p.title}</TableCell><TableCell><Badge variant="outline">{p.category}</Badge></TableCell><TableCell>{p.author?.name}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(p, true)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(p, false)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setPosts(posts.filter(x => x.id !== p.id))}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Post" : "Edit Post"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <img src={currentPost?.thumbnail} alt="cover" className="w-full h-40 object-cover rounded-md" />
                            <h2 className="text-xl font-bold">{currentPost?.title}</h2>
                            <div className="flex gap-2 text-sm text-muted-foreground"><span>{currentPost?.date}</span><span>•</span><span>{currentPost?.readTime}</span><span>•</span><span>{currentPost?.author?.name}</span></div>
                            <div className="flex gap-2">{currentPost?.tags?.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                            <p className="italic border-l-4 border-primary pl-4">{currentPost?.excerpt}</p>
                            <div className="space-y-2"><h4 className="font-semibold">Introduction</h4><p className="text-sm">{currentPost?.content?.introduction}</p></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Title</Label><Input name="title" defaultValue={currentPost?.title} required /></div>
                                <div className="space-y-2"><Label>Slug</Label><Input name="slug" defaultValue={currentPost?.slug} /></div>
                            </div>
                            <div className="space-y-2"><Label>Excerpt</Label><Textarea name="excerpt" defaultValue={currentPost?.excerpt} /></div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={currentPost?.category} /></div>
                                <div className="space-y-2"><Label>Read Time</Label><Input name="readTime" defaultValue={currentPost?.readTime} /></div>
                                <div className="space-y-2"><Label>Publish Date</Label><Input name="publishDate" defaultValue={currentPost?.publishDate} type="date" /></div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 border p-4 rounded">
                                <div className="space-y-2"><Label>Author Name</Label><Input name="authorName" defaultValue={currentPost?.author?.name} /></div>
                                <div className="space-y-2"><Label>Author Role</Label><Input name="authorRole" defaultValue={currentPost?.author?.role} /></div>
                                <div className="space-y-2"><Label>Author Image</Label><Input name="authorImage" defaultValue={currentPost?.author?.image} /></div>
                            </div>
                            <div className="space-y-2"><Label>Thumbnail URL</Label><Input name="thumbnail" defaultValue={currentPost?.thumbnail} /></div>
                            <ArrayInput values={tags} onChange={setTags} label="Tags" placeholder="Add tag..." />
                            <div className="space-y-2"><Label>Introduction</Label><Textarea name="intro" defaultValue={currentPost?.content?.introduction} rows={3} /></div>
                            <div className="space-y-2"><Label>Conclusion</Label><Textarea name="conclusion" defaultValue={currentPost?.content?.conclusion} rows={3} /></div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 6. Service Manager
function ServiceManager({ data }) {
    const [services, setServices] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [features, setFeatures] = useState([]);
    const [benefits, setBenefits] = useState([]);

    const handleOpen = (s, view) => {
        setCurrentService(s); setIsViewMode(view); setFeatures(s?.features || []); setBenefits(s?.benefits || []); setIsDialogOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newService = {
            id: currentService ? currentService.id : `s-${Date.now()}`,
            title: formData.get("title"), category: formData.get("category"), icon: formData.get("icon"),
            shortDescription: formData.get("shortDescription"), fullDescription: formData.get("fullDescription"),
            features, benefits, order: Number(formData.get("order"))
        };
        if (currentService) { setServices(services.map(s => s.id === currentService.id ? newService : s)); toast.success("Updated"); } else { setServices([...services, newService]); toast.success("Created"); }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Add Service</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Short Desc</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{services.map(s => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.title}</TableCell><TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">{s.shortDescription}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(s, true)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(s, false)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setServices(services.filter(x => x.id !== s.id))}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{isViewMode ? "View Service" : "Edit Service"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4"><div className="p-2 bg-muted rounded"><Shield className="w-6 h-6" /></div><div><h3 className="text-xl font-bold">{currentService?.title}</h3><Badge>{currentService?.category}</Badge></div></div>
                            <div><Label>Short Description</Label><p>{currentService?.shortDescription}</p></div>
                            <div><Label>Full Description</Label><p className="text-sm text-muted-foreground">{currentService?.fullDescription}</p></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border p-4 rounded"><h4 className="font-semibold mb-2">Features</h4><ul className="list-disc pl-4 text-sm">{currentService?.features?.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
                                <div className="border p-4 rounded"><h4 className="font-semibold mb-2">Benefits</h4><ul className="list-disc pl-4 text-sm">{currentService?.benefits?.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Title</Label><Input name="title" defaultValue={currentService?.title} required /></div><div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={currentService?.category} /></div></div>
                            <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Icon</Label><Input name="icon" defaultValue={currentService?.icon} placeholder="Icon Name" /></div><div className="space-y-2"><Label>Order</Label><Input type="number" name="order" defaultValue={currentService?.order} /></div></div>
                            <div className="space-y-2"><Label>Short Description</Label><Textarea name="shortDescription" defaultValue={currentService?.shortDescription} /></div>
                            <div className="space-y-2"><Label>Full Description</Label><Textarea name="fullDescription" defaultValue={currentService?.fullDescription} rows={4} /></div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <ArrayInput values={features} onChange={setFeatures} label="Features" placeholder="Feature..." />
                                <ArrayInput values={benefits} onChange={setBenefits} label="Benefits" placeholder="Benefit..." />
                            </div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 7. Testimonial Manager
function TestimonialManager({ data }) {
    const [testimonials, setTestimonials] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleOpen = (t, view) => { setCurrentTestimonial(t); setIsViewMode(view); setIsDialogOpen(true); };
    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newT = {
            id: currentTestimonial ? currentTestimonial.id : `t-${Date.now()}`,
            content: formData.get("content"), category: formData.get("category"), rating: Number(formData.get("rating")),
            type: formData.get("type"), featured: formData.get("featured") === "on",
            metric: { label: formData.get("metricLabel"), value: formData.get("metricValue") },
            author: { name: formData.get("authorName"), company: formData.get("company"), role: formData.get("role"), handle: formData.get("handle") }
        };
        if (currentTestimonial) { setTestimonials(testimonials.map(t => t.id === currentTestimonial.id ? { ...t, ...newT } : t)); } else { setTestimonials([newT, ...testimonials]); }
        setIsDialogOpen(false); toast.success("Saved");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Add Testimonial</Button></div>
            <div className="grid md:grid-cols-2 gap-4">
                {testimonials.map(t => (
                    <div key={t.id} className="p-4 rounded-lg border bg-card flex flex-col justify-between group relative">
                        <div>
                            <div className="flex justify-between mb-2">
                                <div><span className="font-semibold block">{t.author?.name}</span><span className="text-xs text-muted-foreground">{t.author?.role || t.author?.company}</span></div>
                                <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded shadow-sm"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(t, true)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(t, false)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTestimonials(testimonials.filter(x => x.id !== t.id))}><Trash2 className="h-4 w-4" /></Button></div>
                            </div>
                            <p className="text-sm italic line-clamp-3 mb-2">"{t.content}"</p>
                            <div className="flex gap-2">{Array(t.rating || 5).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isViewMode ? "View" : "Edit"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full overflow-hidden"><img src={currentTestimonial?.author?.image || "https://github.com/shadcn.png"} className="w-full h-full object-cover" /></div>
                                <div><h4 className="font-bold">{currentTestimonial?.author?.name}</h4><p className="text-sm">{currentTestimonial?.author?.role} @ {currentTestimonial?.author?.company}</p></div>
                            </div>
                            <p className="italic text-lg">"{currentTestimonial?.content}"</p>
                            <div className="grid grid-cols-2 gap-4 text-center border p-2 rounded"><div><p className="text-xs text-muted-foreground">Rating</p><p>{currentTestimonial?.rating}/5</p></div><div><p className="text-xs text-muted-foreground">Metric</p><p>{currentTestimonial?.metric?.value} {currentTestimonial?.metric?.label}</p></div></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Author Name</Label><Input name="authorName" defaultValue={currentTestimonial?.author?.name} required /></div>
                                <div className="space-y-2"><Label>Role</Label><Input name="role" defaultValue={currentTestimonial?.author?.role} /></div>
                                <div className="space-y-2"><Label>Company</Label><Input name="company" defaultValue={currentTestimonial?.author?.company} /></div>
                                <div className="space-y-2"><Label>Social Handle</Label><Input name="handle" defaultValue={currentTestimonial?.author?.handle} placeholder="@handle" /></div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Type</Label><Select name="type" defaultValue={currentTestimonial?.type || "detailed"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="detailed">Detailed</SelectItem><SelectItem value="social">Social</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={currentTestimonial?.category} /></div>
                                <div className="space-y-2"><Label>Rating</Label><Input type="number" name="rating" defaultValue={currentTestimonial?.rating || 5} max={5} min={1} /></div>
                            </div>
                            <div className="space-y-2"><Label>Content</Label><Textarea name="content" defaultValue={currentTestimonial?.content} required /></div>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Metric Value</Label><Input name="metricValue" defaultValue={currentTestimonial?.metric?.value} placeholder="+50%" /></div><div className="space-y-2"><Label>Metric Label</Label><Input name="metricLabel" defaultValue={currentTestimonial?.metric?.label} placeholder="Sales Growth" /></div></div>
                            <div className="flex items-center gap-2"><Checkbox id="featured" name="featured" defaultChecked={currentTestimonial?.featured} /><Label htmlFor="featured">Featured Testimonial</Label></div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 8. FAQ Manager
function FAQManager({ data }) {
    const [faqs, setFaqs] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleOpen = (f, view) => { setCurrentFaq(f); setIsViewMode(view); setIsDialogOpen(true); };
    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newFaq = {
            id: currentFaq ? currentFaq.id : `faq-${Date.now()}`,
            question: formData.get("question"),
            answer: formData.get("answer"),
            categories: {
                home: formData.get("cat_home") === "on",
                pricing: formData.get("cat_pricing") === "on",
                dashboard: formData.get("cat_dashboard") === "on"
            }
        };
        if (currentFaq) { setFaqs(faqs.map(f => f.id === currentFaq.id ? newFaq : f)); } else { setFaqs([...faqs, newFaq]); }
        setIsDialogOpen(false); toast.success("Saved");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Add FAQ</Button></div>
            <div className="space-y-2">
                {faqs.map((f, i) => (
                    <div key={f.id || i} className="p-4 rounded-lg border bg-card flex justify-between group">
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 items-start">
                            <Button variant="ghost" size="icon" onClick={() => handleOpen(f, true)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpen(f, false)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setFaqs(faqs.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isViewMode ? "View FAQ" : "Edit FAQ"}</DialogTitle></DialogHeader>
                    {isViewMode ? (
                        <div className="space-y-4">
                            <h3 className="font-bold">{currentFaq?.question}</h3>
                            <p>{currentFaq?.answer}</p>
                            <div className="flex gap-2">
                                {currentFaq?.categories?.home && <Badge>Home</Badge>}
                                {currentFaq?.categories?.pricing && <Badge>Pricing</Badge>}
                                {currentFaq?.categories?.dashboard && <Badge>Dashboard</Badge>}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2"><Label>Question</Label><Input name="question" defaultValue={currentFaq?.question} required /></div>
                            <div className="space-y-2"><Label>Answer</Label><Textarea name="answer" defaultValue={currentFaq?.answer} required rows={4} /></div>
                            <div className="space-y-2">
                                <Label>Display On</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_home" name="cat_home" defaultChecked={currentFaq?.categories?.home} /><Label htmlFor="cat_home">Home</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_pricing" name="cat_pricing" defaultChecked={currentFaq?.categories?.pricing} /><Label htmlFor="cat_pricing">Pricing</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="cat_dashboard" name="cat_dashboard" defaultChecked={currentFaq?.categories?.dashboard} /><Label htmlFor="cat_dashboard">Dashboard</Label></div>
                                </div>
                            </div>
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// 9. Job Manager
function JobManager({ data }) {
    const [jobs, setJobs] = useState(data);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [requirements, setRequirements] = useState([]);

    const handleOpen = (j, view) => { setCurrentJob(j); setIsViewMode(view); setRequirements(j?.requirements || []); setIsDialogOpen(true); };
    const handleSave = (e) => {
        e.preventDefault(); const formData = new FormData(e.target);
        const newJob = {
            id: currentJob ? currentJob.id : `${Date.now()}`,
            title: formData.get("title"), department: formData.get("department"), location: formData.get("location"),
            type: formData.get("type"), experience: formData.get("experience"),
            description: formData.get("description"), requirements: requirements
        };
        if (currentJob) { setJobs(jobs.map(j => j.id === currentJob.id ? newJob : j)); toast.success("Updated"); } else { setJobs([...jobs, newJob]); toast.success("Created"); }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => handleOpen(null, false)}>Post Job</Button></div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader><TableRow><TableHead>Position</TableHead><TableHead>Department</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{jobs.map(j => (
                        <TableRow key={j.id}>
                            <TableCell className="font-medium">{j.title}</TableCell><TableCell>{j.department}</TableCell><TableCell><Badge variant="secondary">{j.type}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(j, true)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpen(j, false)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setJobs(jobs.filter(x => x.id !== j.id))}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
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
                            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
