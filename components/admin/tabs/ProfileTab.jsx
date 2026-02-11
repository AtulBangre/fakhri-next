"use client";
import { Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admins } from "@/data/admins";
import { getClientsByManagerId } from "@/data/clients";
import { getTasksByManagerId } from "@/data/tasks";

const CURRENT_ADMIN_ID = 1;

const AdminProfileTab = () => {
    const admin = admins.find(a => a.id === CURRENT_ADMIN_ID);
    const myClients = getClientsByManagerId(CURRENT_ADMIN_ID);
    const myTasks = getTasksByManagerId(CURRENT_ADMIN_ID);

    if (!admin) return <div>Loading...</div>;

    const initials = admin.name.split(" ").map(n => n[0]).join("");
    const activeTasksCount = myTasks.filter(t => t.status === "in-progress").length;
    const completedTasksCount = myTasks.filter(t => t.status === "completed").length;

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
                            <p className="text-white/80">{admin.role}</p>
                            <p className="text-sm text-white/60">Team Member since {admin.joinedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue={admin.name.split(" ")[0]} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={admin.name.split(" ")[1]} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" defaultValue={admin.email} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" defaultValue={admin.phone} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="role" value={admin.role} readOnly className="pl-10 bg-accent/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clients">Assigned Clients</Label>
                            <Input id="clients" value={`${myClients.length} clients`} readOnly className="bg-accent/50" />
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
                    <p className="text-2xl font-heading font-bold">{myClients.length}</p>
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
