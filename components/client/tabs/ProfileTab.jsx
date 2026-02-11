"use client";
import { Mail, Phone, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClientById } from "@/data/clients";
import { admins } from "@/data/admins";

const CURRENT_CLIENT_ID = 1;

const ClientProfileTab = () => {
    const client = getClientById(CURRENT_CLIENT_ID);
    const manager = admins.find(a => a.id === client?.managerId);

    if (!client) return <div>Loading...</div>;

    const initials = client.name.split(" ").map(n => n[0]).join("");
    const managerInitials = manager ? manager.name.split(" ").map(n => n[0]).join("") : "SM";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-primary p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-heading font-bold">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">{client.name}</h2>
                            <p className="text-white/80">{client.plan} Plan Member</p>
                            <p className="text-sm text-white/60">Member since {client.joinedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={client.name.split(" ")[0]} readOnly className="bg-accent/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={client.name.split(" ")[1] || ""} readOnly className="bg-accent/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" value={client.email} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" value={client.phone} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="company" value={client.company} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="location" value={client.location || "USA"} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button>Request Profile Update</Button>
                    </div>
                </div>
            </div>

            {/* Account Manager Contact */}
            <div className="bg-card rounded-xl border p-6">
                <h3 className="font-heading font-semibold mb-4">Need to Update Your Profile?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Contact your account manager to request any changes to your profile information.
                </p>
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
