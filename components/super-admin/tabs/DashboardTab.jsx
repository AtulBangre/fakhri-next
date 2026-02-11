"use client";
import { Users, CheckSquare, AlertTriangle, IndianRupee } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";

import { recentClients } from "@/data/dashboard";
import { admins } from "@/data/admins";
import { clients } from "@/data/clients";
import { plans } from "@/data/pricingPlans";

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

const DashboardTab = ({ setActiveTab }) => {
    // Calculate Revenue
    const revenueByPlan = plans.map(plan => {
        const planClients = clients.filter(c => c.plan.toLowerCase() === plan.id || c.plan.toLowerCase() === plan.name.toLowerCase());
        const clientCount = planClients.length;
        const priceString = plan.prices.monthly.replace(/[^0-9.]/g, ''); // Remove ₹ and commas
        const price = parseFloat(priceString) || 0;
        const revenue = clientCount * price;

        return {
            name: plan.name,
            revenue: revenue,
            clientCount: clientCount,
            price: plan.prices.monthly
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = revenueByPlan.reduce((acc, curr) => acc + curr.revenue, 0);

    // Calculate Stats
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "active").length;
    const unassignedClients = clients.filter(c => c.manager === "Unassigned").length;

    const stats = [
        {
            title: "Total Clients",
            value: totalClients,
            icon: <Users className="h-5 w-5" />,
            trend: { value: "+12 this month", positive: true }
        },
        {
            title: "Active Plans",
            value: activeClients,
            icon: <CheckSquare className="h-5 w-5" />
        },
        {
            title: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: <IndianRupee className="h-5 w-5" />,
            trend: { value: "+18% vs last month", positive: true }
        },
        {
            title: "Unassigned Clients",
            value: unassignedClients,
            icon: <AlertTriangle className="h-5 w-5" />
        },
    ];

    return (
        <div className="space-y-6">
            {/* Alert Banner */}
            {unassignedClients > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-destructive">Action Required</p>
                            <p className="text-sm text-destructive/80 mt-1">
                                {unassignedClients} client{unassignedClients > 1 ? 's' : ''} {unassignedClients > 1 ? 'have' : 'has'} been unassigned. Please assign an account manager.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                    />
                ))}
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
                        {revenueByPlan.map((plan) => (
                            <div key={plan.name} className="p-4 rounded-lg bg-accent/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{plan.name}</span>
                                    <span className="text-sm text-primary font-semibold">₹{plan.revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${(plan.revenue / totalRevenue) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{plan.clientCount} clients • {plan.price}/mo</p>
                            </div>
                        ))}
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
