"use client";
import { Users, DollarSign, CheckSquare, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";

import { admins } from "@/data/admins";
import { clients } from "@/data/clients";

// Derive manager stats from the admins collection
const managerStats = admins
    .filter(admin => admin.role === "Account Manager" || admin.role === "Senior Manager" || admin.role === "Team Lead")
    .map(admin => ({
        name: admin.name,
        clients: admin.clients,
        activeTasks: admin.performance?.activeTasks || 0,
        completed: admin.performance?.completedTasks || 0
    }))
    .slice(0, 3); // Show top 3

// Derive recent clients from the clients collection
const recentClients = clients
    .slice(0, 3)
    .map(client => ({
        id: client.id,
        name: client.name,
        company: client.company,
        plan: client.plan,
        assignedTo: client.manager,
        date: client.joinedDate
    }));

const DashboardTab = ({ setActiveTab }) => {
    return (
        <div className="space-y-6">
            {/* Alert Banner */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-destructive">Action Required</p>
                        <p className="text-sm text-destructive/80 mt-1">
                            1 client has been unassigned for more than 24 hours. Please assign an account manager.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Clients" value={156} icon={<Users className="h-5 w-5" />} trend={{ value: "+12 this month", positive: true }} />
                <StatCard title="Active Plans" value={142} icon={<CheckSquare className="h-5 w-5" />} />
                <StatCard title="Total Revenue" value="$285K" icon={<DollarSign className="h-5 w-5" />} trend={{ value: "+18% vs last month", positive: true }} />
                <StatCard title="Unassigned Clients" value={1} icon={<AlertTriangle className="h-5 w-5" />} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Manager Performance */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-4">Manager Performance</h2>
                    <div className="space-y-4">
                        {managerStats.map((manager) => (
                            <div key={manager.name} className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                        {manager.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{manager.name}</p>
                                        <p className="text-xs text-muted-foreground">{manager.clients} clients</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{manager.activeTasks} active</p>
                                    <p className="text-xs text-muted-foreground">{manager.completed} completed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-4">Revenue by Plan</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-accent/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Platinum</span>
                                <span className="text-sm text-primary font-semibold">$159,960</span>
                            </div>
                            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '56%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">40 clients • $3,999/mo</p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Premium</span>
                                <span className="text-sm text-primary font-semibold">$99,950</span>
                            </div>
                            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full" style={{ width: '35%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">50 clients • $1,999/mo</p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Elite</span>
                                <span className="text-sm text-primary font-semibold">$25,974</span>
                            </div>
                            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                                <div className="h-full bg-primary/50 rounded-full" style={{ width: '9%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">26 clients • $999/mo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-heading font-semibold">Recent Clients</h2>
                    <button onClick={() => setActiveTab("Clients")} className="text-sm text-primary hover:underline">View All</button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentClients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="text-muted-foreground">{client.company}</TableCell>
                                <TableCell>
                                    <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                                        {client.plan}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {client.assignedTo === "Unassigned" ? (
                                        <Badge variant="destructive">Unassigned</Badge>
                                    ) : (
                                        client.assignedTo
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{client.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
export default DashboardTab;
