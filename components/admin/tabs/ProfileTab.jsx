"use client";
import { useState, useEffect } from "react";
import { Mail, Phone, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClients, getTasks } from "@/lib/actions/admin";

const AdminProfileTab = ({ currentUser }) => {
    const [admin, setAdmin] = useState(null);
    const [clientCount, setClientCount] = useState(0);
    const [activeTasksCount, setActiveTasksCount] = useState(0);
    const [completedTasksCount, setCompletedTasksCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [clients, tasks] = await Promise.all([
                    getClients({ managerId: currentUser._id }),
                    getTasks({ 'assignee.id': currentUser._id })
                ]);

                setAdmin(currentUser);
                setClientCount(clients.length);

                // Tasks are already filtered by API
                setActiveTasksCount(tasks.filter(t => ["in-progress", "In Progress"].includes(t.status)).length);
                setCompletedTasksCount(tasks.filter(t => ["completed", "Completed"].includes(t.status)).length);
            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [currentUser]);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    }

    if (!admin) {
        return <div className="p-6 text-center text-muted-foreground">User information not available.</div>;
    }

    const initials = admin.name ? admin.name.split(" ").map(n => n[0]).join("") : "A";
    const joinedDate = admin.joinedDate
        ? new Date(admin.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'N/A';

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
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">{admin.name}</h2>
                            <p className="text-white/80">{admin.adminRole || 'Account Manager'}</p>
                            <p className="text-sm text-white/60">Team Member since {joinedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue={admin.name?.split(" ")[0] || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={admin.name?.split(" ")[1] || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" defaultValue={admin.email || ''} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" defaultValue={admin.phone || ''} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="role" value={admin.adminRole || 'Account Manager'} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clients">Assigned Clients</Label>
                            <Input id="clients" value={`${clientCount} clients`} readOnly className="bg-accent/50" />
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
                    <p className="text-2xl font-heading font-bold">{clientCount}</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-heading font-bold">{completedTasksCount}</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                    <p className="text-2xl font-heading font-bold">{activeTasksCount}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileTab;
