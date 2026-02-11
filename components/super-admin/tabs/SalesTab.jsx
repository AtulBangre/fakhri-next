"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, IndianRupee, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatINR } from "@/lib/utils";

import { getDashboardStats } from "@/lib/actions/dashboard";
import { getUsers } from "@/lib/actions/user";
import { getPricingPlans } from "@/lib/actions/content";

const SuperAdminSalesTab = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [revenueByPlan, setRevenueByPlan] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalClients: 0,
        avgRevenue: 0
    });

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [dashboardData, clientsData, plansData] = await Promise.all([
                    getDashboardStats(),
                    getUsers({ role: 'client', status: 'active', limit: 100 }),
                    getPricingPlans()
                ]);

                if (dashboardData) {
                    setStats(dashboardData.stats);
                    const rev = parseFloat(dashboardData.stats.revenue.replace(/[^0-9.]/g, '')) || 0;
                    setSummary(prev => ({ ...prev, totalRevenue: rev }));
                }

                if (clientsData && plansData) {
                    // Calculate revenue by plan
                    const planStats = plansData.map(plan => {
                        const count = clientsData.users.filter(c => c.plan === plan.name).length;
                        const price = parseFloat(plan.prices?.monthly?.replace(/[^0-9.]/g, '')) || 0;
                        const revenue = count * price;
                        return {
                            name: plan.name,
                            count,
                            revenue,
                            price
                        };
                    });
                    setRevenueByPlan(planStats);

                    // Top Clients
                    const sortedClients = clientsData.users
                        .map(client => {
                            const plan = plansData.find(p => p.name === client.plan);
                            const revenue = parseFloat(plan?.prices?.monthly?.replace(/[^0-9.]/g, '')) || 0;
                            return {
                                ...client,
                                revenue: revenue
                            };
                        })
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);
                    setTopClients(sortedClients);

                    const activeCount = clientsData.total || clientsData.users.length;
                    const totalRev = planStats.reduce((sum, p) => sum + p.revenue, 0);

                    setSummary({
                        totalRevenue: totalRev,
                        totalClients: activeCount,
                        avgRevenue: activeCount > 0 ? totalRev / activeCount : 0
                    });
                }
            } catch (error) {
                console.error("Error loading sales data:", error);
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
                <p className="text-muted-foreground">Loading sales data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Sales & Revenue</h1>
                    <p className="text-muted-foreground">Track revenue and sales performance.</p>
                </div>
                <Select defaultValue="2026">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={`₹${formatINR(summary.totalRevenue)}`}
                    icon={<IndianRupee className="h-5 w-5" />}
                    trend={{ value: "+8.6% vs Dec", positive: true }}
                />
                <StatCard
                    title="Active Clients"
                    value={summary.totalClients.toString()}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="Avg. Revenue per Client"
                    value={`₹${formatINR(summary.avgRevenue)}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                    title="Churn Rate"
                    value="2.1%"
                    icon={<TrendingDown className="h-5 w-5" />}
                    trend={{ value: "-0.3% vs Dec", positive: true }}
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue by Plan */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-6">Revenue by Plan</h2>
                    <div className="space-y-6">
                        {revenueByPlan.length > 0 ? revenueByPlan.map((plan) => {
                            const percentage = summary.totalRevenue > 0 ? (plan.revenue / summary.totalRevenue) * 100 : 0;

                            return (
                                <div key={plan.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={plan.name === 'Platinum' ? 'default' : plan.name === 'Premium' ? 'secondary' : 'outline'}>
                                                {plan.name}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">{plan.count} clients</span>
                                        </div>
                                        <span className="font-semibold">₹{plan.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-primary`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-muted-foreground text-center py-10 italic">No plan data available</p>
                        )}
                    </div>
                </div>

                {/* Monthly Trend - Mock for now as we don't have time-series revenue yet */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-6">Monthly Trend</h2>
                    <div className="space-y-4">
                        {[
                            { month: "Jan", revenue: summary.totalRevenue, clients: summary.totalClients },
                            { month: "Dec", revenue: summary.totalRevenue * 0.9, clients: Math.max(0, summary.totalClients - 2) },
                            { month: "Nov", revenue: summary.totalRevenue * 0.8, clients: Math.max(0, summary.totalClients - 4) }
                        ].map((data, i) => (
                            <div key={data.month} className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                                <div>
                                    <p className="font-medium">{data.month} 2026</p>
                                    <p className="text-sm text-muted-foreground">{data.clients} clients</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₹{(data.revenue / 1000).toFixed(1)}K</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Clients */}
            <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading font-semibold mb-4">Top Clients by Revenue</h2>
                <div className="space-y-3">
                    {topClients.length > 0 ? topClients.map((client, i) => (
                        <div key={client._id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">{client.company || "Personal"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                                    {client.plan || "N/A"}
                                </Badge>
                                <span className="font-semibold text-primary">₹{client.revenue.toLocaleString()}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center py-10 italic">No client data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSalesTab;
