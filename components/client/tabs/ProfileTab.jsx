"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Building, MapPin, Loader2, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsers, getUserById } from "@/lib/actions/user";
import { submitProfileUpdateRequest, getPendingRequestForUser } from "@/lib/actions/profile-requests";
import { toast } from "sonner";

const ClientProfileTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [manager, setManager] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [pendingRequest, setPendingRequest] = useState(null);

    useEffect(() => {
        const loadProfileData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                setClient(currentUser);
                setFormData({
                    name: currentUser.name || "",
                    phone: currentUser.phone || "",
                    company: currentUser.company || "",
                    location: currentUser.location || "",
                });

                if (currentUser.managerId) {
                    const managerData = await getUserById(currentUser.managerId);
                    setManager(managerData);
                } else if (currentUser.manager) {
                    setManager(typeof currentUser.manager === 'object' ? currentUser.manager : { name: currentUser.manager });
                }

                // Check for pending requests
                const pReq = await getPendingRequestForUser(currentUser._id);
                setPendingRequest(pReq);
            } catch (error) {
                console.error("Error loading profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [currentUser]);

    const handleSave = async () => {
        try {
            const res = await submitProfileUpdateRequest(client._id, formData);
            if (res.success) {
                setIsEditing(false);
                toast.success("Profile update request sent to admin");
                // Force delay for consistency
                setTimeout(async () => {
                    const pReq = await getPendingRequestForUser(client._id);
                    setPendingRequest(pReq);
                }, 1000);
            } else {
                toast.error("Failed to send update request: " + res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: client.name || "",
            phone: client.phone || "",
            company: client.company || "",
            location: client.location || ""
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="bg-card rounded-xl border p-12 text-center">
                <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
                <p className="text-muted-foreground">We couldn't load your profile details. Please contact support.</p>
            </div>
        );
    }

    const initials = client.name?.split(" ").map(n => n[0]).join("") || "CL";
    const managerInitials = manager?.name?.split(" ").map(n => n[0]).join("") || "SM";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} disabled={!!pendingRequest}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            {pendingRequest && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold italic">
                        !
                    </div>
                    <div>
                        <p className="font-medium">Pending Update Request</p>
                        <p className="text-sm opacity-90">An update request for your profile is currently pending admin approval. You cannot make further changes until it is processed.</p>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-primary p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-heading font-bold">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">{client.name}</h2>
                            <p className="text-white/80 uppercase">{client.plan || "No Plan"} Plan Member</p>
                            <p className="text-sm text-white/60">Member since {new Date(client.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={isEditing ? formData.name : (client.name || "")}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-accent/50" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" value={client.email || ""} readOnly className="pl-10 bg-accent/50" />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    value={isEditing ? formData.phone : (client.phone || "N/A")}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`pl-10 ${!isEditing ? "bg-accent/50" : ""}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="company"
                                    value={isEditing ? formData.company : (client.company || "N/A")}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`pl-10 ${!isEditing ? "bg-accent/50" : ""}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    value={isEditing ? formData.location : (client.location || "N/A")}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`pl-10 ${!isEditing ? "bg-accent/50" : ""}`}
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-4 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Manager Contact */}
            <div className="bg-card rounded-xl border p-6">
                <h3 className="font-heading font-semibold mb-4">Account Manager</h3>
                {manager ? (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">
                            {managerInitials}
                        </div>
                        <div>
                            <p className="font-medium">{manager.name}</p>
                            <p className="text-sm text-primary">{manager.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-lg bg-accent/50 text-muted-foreground">
                        No account manager assigned.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientProfileTab;
