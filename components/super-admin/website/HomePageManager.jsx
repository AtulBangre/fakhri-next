"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Loader2, Trash2, Plus, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function HomePageManager() {
    // Hero section – stored in PageContent(page:'home').hero
    const [hero, setHero] = useState({
        badge: "",
        title: "",
        subtitle: "",
        ctaText: "",
        ctaLink: "",
        stats: []
    });

    // Trust Badges – stored in PageContent(page:'home').sections.badges
    const [badges, setBadges] = useState([]);

    // Services Preview heading – stored in PageContent(page:'home').sections.servicesPreview
    const [servicesPreview, setServicesPreview] = useState({
        badge: "",
        title: "",
        description: ""
    });

    // Why Choose Us – stored in PageContent(page:'home').sections.whyChooseUs
    const [whyChooseUs, setWhyChooseUs] = useState({
        badge: "",
        title: "",
        description: "",
        features: [],
        overlayTitle: "",
        overlayDescription: ""
    });

    // CTA section – stored in PageContent(page:'home').sections.cta
    const [cta, setCta] = useState({
        title: "",
        description: ""
    });

    // Testimonials heading – stored in PageContent(page:'home').sections.testimonialsHeading
    const [testimonialsHeading, setTestimonialsHeading] = useState({
        badge: "",
        title: "",
        description: ""
    });

    // SEO – stored in PageContent(page:'home').seo
    const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        hero: true,
        badges: true,
        servicesPreview: true,
        whyChooseUs: true,
        cta: true,
        testimonials: true,
        seo: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/website/content?page=home');
            const data = await res.json();

            if (data) {
                // Hero
                if (data.hero) {
                    setHero({
                        badge: data.hero.badge || "",
                        title: data.hero.title || "",
                        subtitle: data.hero.subtitle || "",
                        ctaText: data.hero.ctaText || "",
                        ctaLink: data.hero.ctaLink || "",
                        stats: data.hero.stats || []
                    });
                }
                // SEO
                if (data.seo) {
                    setSeo({
                        title: data.seo.title || "",
                        description: data.seo.description || "",
                        keywords: data.seo.keywords || ""
                    });
                }

                // Sections
                const sections = data.sections || {};

                // Badges
                if (sections.badges) {
                    setBadges(Array.isArray(sections.badges) ? sections.badges : []);
                }

                // Services Preview
                if (sections.servicesPreview) {
                    setServicesPreview({
                        badge: sections.servicesPreview.badge || "",
                        title: sections.servicesPreview.title || "",
                        description: sections.servicesPreview.description || ""
                    });
                }

                // Why Choose Us
                if (sections.whyChooseUs) {
                    const wcu = sections.whyChooseUs;
                    setWhyChooseUs({
                        badge: wcu.badge || "",
                        title: wcu.title || "",
                        description: wcu.description || "",
                        features: Array.isArray(wcu.features) ? wcu.features : (Array.isArray(wcu) ? wcu : []),
                        overlayTitle: wcu.overlayTitle || "",
                        overlayDescription: wcu.overlayDescription || ""
                    });
                }

                // CTA
                if (sections.cta) {
                    setCta({
                        title: sections.cta.title || "",
                        description: sections.cta.description || ""
                    });
                }

                // Testimonials heading
                if (sections.testimonialsHeading) {
                    setTestimonialsHeading({
                        badge: sections.testimonialsHeading.badge || "",
                        title: sections.testimonialsHeading.title || "",
                        description: sections.testimonialsHeading.description || ""
                    });
                }
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
            const res = await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'home',
                    hero: hero,
                    seo: seo,
                    sections: {
                        badges: badges,
                        servicesPreview: servicesPreview,
                        whyChooseUs: whyChooseUs,
                        cta: cta,
                        testimonialsHeading: testimonialsHeading,
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success("Home page updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchData(); // Re-fetch to discard changes
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const SectionHeader = ({ id, title, description, icon }) => (
        <CardHeader className="cursor-pointer select-none" onClick={() => toggleSection(id)}>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">{title}</CardTitle>
                    {description && <CardDescription className="mt-1">{description}</CardDescription>}
                </div>
                {expandedSections[id] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
        </CardHeader>
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-3 border-b">
                <div>
                    <h3 className="text-xl font-bold">Home Page Management</h3>
                    <p className="text-sm text-muted-foreground">Manage all sections of the public homepage</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> Save All Changes</>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={fetchData}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Content
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* ===== HERO SECTION ===== */}
            <Card>
                <SectionHeader id="hero" title="Hero Section" description="The main banner area visitors see first" />
                {expandedSections.hero && (
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
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
                                    placeholder="e.g. Your No.1 Growth Partner for Amazon Success"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle / Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={hero.subtitle}
                                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                placeholder="Briefly describe what you do"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>CTA Button Text</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={hero.ctaText}
                                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                                    placeholder="e.g. Start Your Journey"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CTA Button Link</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={hero.ctaLink}
                                    onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                                    placeholder="e.g. /contact"
                                />
                            </div>
                        </div>

                        {/* Hero Stats */}
                        <div className="pt-4">
                            <Label className="block mb-2 text-sm font-semibold">Hero Statistics (max 3)</Label>
                            <div className="grid gap-4 md:grid-cols-3">
                                {(hero.stats || []).map((stat, index) => (
                                    <div key={index} className="space-y-2 border p-3 rounded-lg bg-muted/20">
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
                                        />
                                    </div>
                                ))}
                                {isEditing && (hero.stats || []).length < 3 && (
                                    <Button
                                        variant="outline"
                                        className="h-full min-h-[120px] border-dashed"
                                        onClick={() => setHero({ ...hero, stats: [...(hero.stats || []), { value: "", label: "" }] })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Stat
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== TRUST BADGES ===== */}
            <Card>
                <SectionHeader id="badges" title="Trust Badges" description="Quick company facts shown below the hero" />
                {expandedSections.badges && (
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {badges.map((badge, index) => (
                                <div key={index} className="space-y-2 border p-3 rounded-lg bg-muted/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium">Badge {index + 1}</span>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => setBadges(badges.filter((_, i) => i !== index))}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        disabled={!isEditing}
                                        value={badge.title}
                                        onChange={(e) => {
                                            const updated = [...badges];
                                            updated[index] = { ...updated[index], title: e.target.value };
                                            setBadges(updated);
                                        }}
                                        placeholder="Title (e.g. 2016)"
                                    />
                                    <Input
                                        disabled={!isEditing}
                                        value={badge.subtitle}
                                        onChange={(e) => {
                                            const updated = [...badges];
                                            updated[index] = { ...updated[index], subtitle: e.target.value };
                                            setBadges(updated);
                                        }}
                                        placeholder="Subtitle (e.g. Founded)"
                                    />
                                </div>
                            ))}
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="h-full min-h-[100px] border-dashed"
                                    onClick={() => setBadges([...badges, { title: "", subtitle: "" }])}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Badge
                                </Button>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== SERVICES PREVIEW ===== */}
            <Card>
                <SectionHeader id="servicesPreview" title="Services Preview" description="Heading text for the services section on home page" />
                {expandedSections.servicesPreview && (
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Badge Text</Label>
                            <Input
                                disabled={!isEditing}
                                value={servicesPreview.badge}
                                onChange={(e) => setServicesPreview({ ...servicesPreview, badge: e.target.value })}
                                placeholder="e.g. Our Services"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input
                                disabled={!isEditing}
                                value={servicesPreview.title}
                                onChange={(e) => setServicesPreview({ ...servicesPreview, title: e.target.value })}
                                placeholder="e.g. Complete Amazon Seller Solutions"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Section Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={servicesPreview.description}
                                onChange={(e) => setServicesPreview({ ...servicesPreview, description: e.target.value })}
                                placeholder="Brief description of your services"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== WHY CHOOSE US ===== */}
            <Card>
                <SectionHeader id="whyChooseUs" title="Why Choose Us" description="Key selling points displayed on home page" />
                {expandedSections.whyChooseUs && (
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Badge Text</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={whyChooseUs.badge}
                                    onChange={(e) => setWhyChooseUs({ ...whyChooseUs, badge: e.target.value })}
                                    placeholder="e.g. Why Choose Us"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={whyChooseUs.title}
                                    onChange={(e) => setWhyChooseUs({ ...whyChooseUs, title: e.target.value })}
                                    placeholder="e.g. We're Your Growth Partners"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Section Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={whyChooseUs.description}
                                onChange={(e) => setWhyChooseUs({ ...whyChooseUs, description: e.target.value })}
                                placeholder="Why customers should choose you"
                                rows={3}
                            />
                        </div>

                        {/* Features list */}
                        <div className="pt-2">
                            <Label className="block mb-2 text-sm font-semibold">Feature Bullet Points</Label>
                            <div className="space-y-3">
                                {(whyChooseUs.features || []).map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                                        <Input
                                            disabled={!isEditing}
                                            value={feature}
                                            onChange={(e) => {
                                                const updated = [...whyChooseUs.features];
                                                updated[index] = e.target.value;
                                                setWhyChooseUs({ ...whyChooseUs, features: updated });
                                            }}
                                            placeholder="Feature point"
                                            className="flex-1"
                                        />
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive shrink-0"
                                                onClick={() => {
                                                    const updated = whyChooseUs.features.filter((_, i) => i !== index);
                                                    setWhyChooseUs({ ...whyChooseUs, features: updated });
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-dashed"
                                        onClick={() => setWhyChooseUs({ ...whyChooseUs, features: [...(whyChooseUs.features || []), ""] })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Feature
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Overlay text */}
                        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
                            <div className="space-y-2">
                                <Label>Image Overlay Title</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={whyChooseUs.overlayTitle}
                                    onChange={(e) => setWhyChooseUs({ ...whyChooseUs, overlayTitle: e.target.value })}
                                    placeholder="e.g. Trusted by 500+ Sellers"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Image Overlay Description</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={whyChooseUs.overlayDescription}
                                    onChange={(e) => setWhyChooseUs({ ...whyChooseUs, overlayDescription: e.target.value })}
                                    placeholder="e.g. Join the network of successful Amazon brands."
                                />
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== CTA SECTION ===== */}
            <Card>
                <SectionHeader id="cta" title="Call to Action (CTA)" description="The call-to-action banner near the bottom" />
                {expandedSections.cta && (
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>CTA Title</Label>
                            <Input
                                disabled={!isEditing}
                                value={cta.title}
                                onChange={(e) => setCta({ ...cta, title: e.target.value })}
                                placeholder="e.g. Ready to Accelerate Your Amazon Growth?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={cta.description}
                                onChange={(e) => setCta({ ...cta, description: e.target.value })}
                                placeholder="Compelling CTA description"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== TESTIMONIALS HEADING ===== */}
            <Card>
                <SectionHeader id="testimonials" title="Testimonials Heading" description="Section heading for the testimonials area" />
                {expandedSections.testimonials && (
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Badge Text</Label>
                            <Input
                                disabled={!isEditing}
                                value={testimonialsHeading.badge}
                                onChange={(e) => setTestimonialsHeading({ ...testimonialsHeading, badge: e.target.value })}
                                placeholder="e.g. Testimonials"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input
                                disabled={!isEditing}
                                value={testimonialsHeading.title}
                                onChange={(e) => setTestimonialsHeading({ ...testimonialsHeading, title: e.target.value })}
                                placeholder="e.g. Loved by Amazon Sellers"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Section Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={testimonialsHeading.description}
                                onChange={(e) => setTestimonialsHeading({ ...testimonialsHeading, description: e.target.value })}
                                placeholder="Brief description for testimonials"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ===== SEO ===== */}
            <Card>
                <SectionHeader id="seo" title="SEO Settings" description="Meta tags for search engine optimization" />
                {expandedSections.seo && (
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Input
                                disabled={!isEditing}
                                value={seo.title}
                                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                placeholder="Page title for search engines"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={seo.description}
                                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                placeholder="Page description for search engines"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Keywords</Label>
                            <Input
                                disabled={!isEditing}
                                value={seo.keywords}
                                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                                placeholder="Comma-separated keywords"
                            />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
