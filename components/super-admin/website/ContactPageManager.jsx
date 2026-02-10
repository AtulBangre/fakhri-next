"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, RefreshCw, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ContactPageManager() {
    const [contact, setContact] = useState({
        phone: { primary: "", secondary: "" },
        email: { general: "" },
        address: { full: "", street: "", city: "", zip: "" },
        social: { linkedin: "", facebook: "", instagram: "", twitter: "" },
        hours: { weekdays: "", weekend: "" }
    });
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
            const res = await fetch('/api/website/content?page=contact');
            const data = await res.json();
            if (data) {
                if (data.sections && data.sections.contactInfo) {
                    setContact(data.sections.contactInfo);
                }
                if (data.seo) setSeo(data.seo);
            }
        } catch (error) {
            toast.error("Failed to fetch contact data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Contact Page Content
            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'contact',
                    sections: {
                        contactInfo: contact
                    },
                    seo: seo
                })
            });

            // Also update Global Company Contact Info
            const companyRes = await fetch('/api/website/content?page=company');
            const currentCompany = await companyRes.json();

            await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'company',
                    sections: {
                        ...(currentCompany.sections || {}),
                        contact: contact
                    }
                })
            });

            toast.success("Contact settings updated!");
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Contact Page Details</h3>
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
                            Edit Contact Info
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
                    <h4 className="text-lg font-semibold mb-2">General Information</h4>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Primary Phone</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.phone.primary}
                                onChange={(e) => setContact({ ...contact, phone: { ...contact.phone, primary: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Secondary Phone</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.phone.secondary}
                                onChange={(e) => setContact({ ...contact, phone: { ...contact.phone, secondary: e.target.value } })}
                            />
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground">General Email Badge</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.email.general}
                                onChange={(e) => setContact({ ...contact, email: { ...contact.email, general: e.target.value } })}
                            />
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground">Full Address</Label>
                            <Textarea
                                disabled={!isEditing}
                                value={contact.address.full}
                                onChange={(e) => setContact({ ...contact, address: { ...contact.address, full: e.target.value } })}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Street</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.address.street}
                                onChange={(e) => setContact({ ...contact, address: { ...contact.address, street: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">City</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.address.city}
                                onChange={(e) => setContact({ ...contact, address: { ...contact.address, city: e.target.value } })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Zip</Label>
                            <Input
                                disabled={!isEditing}
                                value={contact.address.zip}
                                onChange={(e) => setContact({ ...contact, address: { ...contact.address, zip: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
                        <h4 className="text-lg font-semibold mb-2">Social Media Links</h4>
                        <div className="space-y-2">
                            <Label>LinkedIn</Label>
                            <Input disabled={!isEditing} value={contact.social.linkedin}
                                onChange={(e) => setContact({ ...contact, social: { ...contact.social, linkedin: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Facebook</Label>
                            <Input disabled={!isEditing} value={contact.social.facebook}
                                onChange={(e) => setContact({ ...contact, social: { ...contact.social, facebook: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input disabled={!isEditing} value={contact.social.instagram}
                                onChange={(e) => setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Twitter/X</Label>
                            <Input disabled={!isEditing} value={contact.social.twitter}
                                onChange={(e) => setContact({ ...contact, social: { ...contact.social, twitter: e.target.value } })} />
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
                        <h4 className="text-lg font-semibold mb-2">Operating Hours</h4>
                        <div className="space-y-2">
                            <Label>Weekdays</Label>
                            <Input disabled={!isEditing} value={contact.hours.weekdays}
                                onChange={(e) => setContact({ ...contact, hours: { ...contact.hours, weekdays: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Weekends</Label>
                            <Input disabled={!isEditing} value={contact.hours.weekend}
                                onChange={(e) => setContact({ ...contact, hours: { ...contact.hours, weekend: e.target.value } })} />
                        </div>
                    </div>
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
