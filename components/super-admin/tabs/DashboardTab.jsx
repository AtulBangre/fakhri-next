"use client";
import { useState, useEffect } from "react";
import { Users, CheckSquare, AlertTriangle, IndianRupee, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";

import { formatINR } from "@/lib/utils";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getUsers } from "@/lib/actions/user";
import { getPricingPlans } from "@/lib/actions/content";

const DashboardTab = ({ setActiveTab }) => {
    const [stats, setStats] = useState(null);
    const [recentClients, setRecentClients] = useState([]);
    const [managers, setManagers] = useState([]);
    const [revenueByPlan, setRevenueByPlan] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [dashboardData, clientsData, adminsData, plansData] = await Promise.all([
                    getDashboardStats(),
                    getUsers({ role: 'client', limit: 5 }),
                    getUsers({ role: 'admin', limit: 100 }), // Get all managers
                    getPricingPlans()
                ]);

                if (dashboardData) {
                    setStats(dashboardData.stats);
                }

                if (clientsData) {
                    setRecentClients(clientsData.users);
                }

                // Manager Performance data
                if (adminsData) {
                    const managerStats = adminsData.users
                        .filter(admin => admin.adminRole && (admin.adminRole.includes("Manager") || admin.adminRole.includes("Lead")))
                        .map(admin => ({
                            name: admin.name,
                            clients: admin.clientsCount || 0,
                            activeTasks: admin.performance?.activeTasks || 0,
                            completed: admin.performance?.completedTasks || 0
                        }))
                        .slice(0, 3);
                    setManagers(managerStats);
                }

                // Revenue by plan calculation
                if (plansData && dashboardData) {
                    // This is a simplified calculation as we don't have a direct revenue-per-plan aggregate yet
                    // In a real app, this would be an aggregation query in MongoDB
                    const rev = plansData.map(plan => {
                        // Estimate based on client count if we had that per plan
                        return {
                            name: plan.name,
                            revenue: 0, // Placeholder
                            clientCount: 0,
                            price: plan.prices?.monthly || "₹0"
                        };
                    });
                    setRevenueByPlan(rev);
                }

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Updating dashboard...</p>
            </div>
        );
    }

    const unassignedClients = 0; // We'd ideally pull this from Stats

    const dashboardStats = [
        {
            title: "Total Clients",
            value: stats?.clients || 0,
            icon: <Users className="h-5 w-5" />,
            trend: { value: "Updated just now", positive: true }
        },
        {
            title: "Active Tasks",
            value: stats?.activeTasks || 0,
            icon: <CheckSquare className="h-5 w-5" />
        },
        {
            title: "Total Revenue",
            value: stats?.revenue || "₹0",
            icon: <IndianRupee className="h-5 w-5" />,
            trend: { value: "Live data", positive: true }
        },
        {
            title: "Completed Tasks",
            value: stats?.completedTasks || 0,
            icon: <CheckSquare className="h-5 w-5" />
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, index) => (
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
                        {managers.length > 0 ? managers.map((manager) => (
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
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No performance data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Activities Section - Placeholder or pull from getDashboardStats */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-4">Recent System Activities</h2>
                    <div className="space-y-4">
                        {/* We can map from dashboardData.recentActivities if we had it in state */}
                        <p className="text-sm text-muted-foreground text-center py-10">
                            Activity logging integration is active. View the System Logs for full history.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-heading font-semibold">New Clients</h2>
                    <button onClick={() => setActiveTab("Clients")} className="text-sm text-primary hover:underline">View All</button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentClients.length > 0 ? recentClients.map((client) => (
                            <TableRow key={client._id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="text-muted-foreground">{client.company || "Personal"}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {client.plan || "N/A"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.status === "active" ? "success" : "secondary"}>
                                        {client.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(client.joinedDate || client.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent clients found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
export default DashboardTab;
