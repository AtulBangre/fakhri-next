"use client";
import { Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminProfileTab = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-primary p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-heading font-bold">
                            SM
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">Sarah Mitchell</h2>
                            <p className="text-white/80">Account Manager</p>
                            <p className="text-sm text-white/60">Team Member since Oct 2024</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="Sarah" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Mitchell" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" defaultValue="sarah@fakhriit.com" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" defaultValue="+1 (555) 987-6543" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="role" value="Account Manager" readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clients">Assigned Clients</Label>
                            <Input id="clients" value="3 clients" readOnly className="bg-accent/50" />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border p-6">
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-heading font-bold">3</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-heading font-bold">47</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                    <p className="text-2xl font-heading font-bold">4</p>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileTab;
