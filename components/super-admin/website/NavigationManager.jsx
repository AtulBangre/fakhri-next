"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function NavigationManager() {
    const [mainNav, setMainNav] = useState([]);
    const [footerData, setFooterData] = useState({ services: [], company: [], support: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/website/content?page=navigation');
            const data = await res.json();
            if (data && data.sections) {
                setMainNav(data.sections.main || []);
                setFooterData(data.sections.footer || { services: [], company: [], support: [] });
            }
        } catch (error) {
            toast.error("Failed to fetch navigation data");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to manage main nav updates
    const handleNavChange = (index, field, value) => {
        const updated = [...mainNav];
        updated[index] = { ...updated[index], [field]: value };
        setMainNav(updated);
    };

    const handleChildNavChange = (parentIndex, childIndex, field, value) => {
        const updated = [...mainNav];
        updated[parentIndex].children[childIndex] = { ...updated[parentIndex].children[childIndex], [field]: value };
        setMainNav(updated);
    };

    const addNavItem = () => {
        setMainNav([...mainNav, { label: "New Link", href: "/" }]);
    };

    const removeNavItem = (index) => {
        const updated = mainNav.filter((_, i) => i !== index);
        setMainNav(updated);
    };

    const addChildNavItem = (parentIndex) => {
        const updated = [...mainNav];
        if (!updated[parentIndex].children) updated[parentIndex].children = [];
        updated[parentIndex].children.push({ label: "Sub Link", href: "/" });
        setMainNav(updated);
    };

    const removeChildNavItem = (parentIndex, childIndex) => {
        const updated = [...mainNav];
        updated[parentIndex].children = updated[parentIndex].children.filter((_, i) => i !== childIndex);
        setMainNav(updated);
    };

    // Helper for footer
    const handleFooterChange = (section, index, field, value) => {
        const updated = { ...footerData };
        updated[section][index] = { ...updated[section][index], [field]: value };
        setFooterData(updated);
    };

    const addFooterItem = (section) => {
        const updated = { ...footerData };
        updated[section] = [...updated[section], { label: "New Link", href: "/" }];
        setFooterData(updated);
    };

    const removeFooterItem = (section, index) => {
        const updated = { ...footerData };
        updated[section] = updated[section].filter((_, i) => i !== index);
        setFooterData(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/website/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: 'navigation',
                    sections: {
                        main: mainNav,
                        footer: footerData
                    }
                })
            });

            if (res.ok) {
                toast.success("Navigation updated successfully!");
                setIsEditing(false);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update navigation");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
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
                <h3 className="text-xl font-bold">Navigation & Footer</h3>
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
                            Edit Menus
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Navigation */}
            <Card>
                <CardHeader>
                    <CardTitle>Main Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mainNav.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-card relative">
                            {isEditing && (
                                <button
                                    onClick={() => removeNavItem(index)}
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex gap-4 items-end mb-2">
                                <div className="space-y-1 flex-1">
                                    <Label className="text-xs text-muted-foreground">Label</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={item.label}
                                        onChange={(e) => handleNavChange(index, "label", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <Label className="text-xs text-muted-foreground">Link (Href)</Label>
                                    <Input
                                        disabled={!isEditing}
                                        value={item.href}
                                        onChange={(e) => handleNavChange(index, "href", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Children / Dropdown */}
                            {item.children && (
                                <div className="ml-8 mt-2 space-y-2 border-l-2 pl-4">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <ChevronDown className="w-3 h-3" /> Dropdown Items
                                    </Label>
                                    {item.children.map((child, childIdx) => (
                                        <div key={childIdx} className="flex gap-2 items-center">
                                            <Input
                                                disabled={!isEditing}
                                                value={child.label}
                                                onChange={(e) => handleChildNavChange(index, childIdx, "label", e.target.value)}
                                                className="h-8 text-sm"
                                                placeholder="Label"
                                            />
                                            <Input
                                                disabled={!isEditing}
                                                value={child.href}
                                                onChange={(e) => handleChildNavChange(index, childIdx, "href", e.target.value)}
                                                className="h-8 text-sm"
                                                placeholder="Href"
                                            />
                                            {isEditing && (
                                                <button onClick={() => removeChildNavItem(index, childIdx)} className="text-destructive">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button size="sm" variant="ghost" onClick={() => addChildNavItem(index)} className="h-7 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add Dropdown Item
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Option to add children if none exist */}
                            {!item.children && isEditing && (
                                <div className="mt-2">
                                    <Button size="sm" variant="ghost" onClick={() => addChildNavItem(index)} className="h-7 text-xs">
                                        <Plus className="w-3 h-3 mr-1" /> Add Dropdown Menu
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <Button onClick={addNavItem} variant="outline" className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Main Menu Item
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Footer Navigation */}
            <h4 className="text-lg font-semibold pt-4">Footer Links</h4>
            <div className="grid gap-6 md:grid-cols-3">
                {Object.keys(footerData).map((sectionKey) => (
                    <Card key={sectionKey}>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base capitalize">{sectionKey}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {footerData[sectionKey].map((link, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        disabled={!isEditing}
                                        value={link.label}
                                        onChange={(e) => handleFooterChange(sectionKey, idx, "label", e.target.value)}
                                        className="h-8 text-sm"
                                        placeholder="Label"
                                    />
                                    <Input
                                        disabled={!isEditing}
                                        value={link.href}
                                        onChange={(e) => handleFooterChange(sectionKey, idx, "href", e.target.value)}
                                        className="h-8 text-sm"
                                        placeholder="Href"
                                    />
                                    {isEditing && (
                                        <button onClick={() => removeFooterItem(sectionKey, idx)} className="text-destructive">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <Button size="sm" variant="ghost" onClick={() => addFooterItem(sectionKey)} className="w-full h-8 flex items-center justify-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Link
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
