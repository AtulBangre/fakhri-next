"use client";
import { TrendingUp, TrendingDown, Users, IndianRupee } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatINR } from "@/lib/utils";
import { clients } from "@/data/clients";
import { plans } from "@/data/pricingPlans";

// Helper to get price value from string (e.g. "$199" -> 199)
const getPriceValue = (priceStr) => {
    if (!priceStr) return 0;
    // Remove non-numeric characters except decimal point
    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
};

// Calculate revenue based on active clients and their plans
const calculateRevenue = () => {
    let totalRevenue = 0;
    const revenueByPlan = {
        platinum: { count: 0, revenue: 0, price: 0 },
        premium: { count: 0, revenue: 0, price: 0 },
        elite: { count: 0, revenue: 0, price: 0 }
    };

    // Get plan prices
    plans.forEach(plan => {
        const key = plan.id.toLowerCase();
        if (revenueByPlan[key]) {
            // Using monthly price for calculation standard, fallback to 0
            revenueByPlan[key].price = getPriceValue(plan.prices.monthly);
        }
    });

    clients.forEach(client => {
        if (client.status === "active") {
            const planKey = client.plan.toLowerCase();
            if (revenueByPlan[planKey]) {
                revenueByPlan[planKey].count++;
                revenueByPlan[planKey].revenue += revenueByPlan[planKey].price;
                totalRevenue += revenueByPlan[planKey].price;
            }
        }
    });

    return { totalRevenue, revenueByPlan };
};

const { totalRevenue, revenueByPlan } = calculateRevenue();

// Mock monthly data - In a real app, this would come from historical records
const monthlyData = [
    { month: "Jan", revenue: totalRevenue, clients: clients.length },
    { month: "Dec", revenue: totalRevenue * 0.92, clients: clients.length - 2 },
    { month: "Nov", revenue: totalRevenue * 0.85, clients: clients.length - 5 },
    { month: "Oct", revenue: totalRevenue * 0.78, clients: clients.length - 8 },
];

// Get top clients based on plan value (simulated revenue)
const topClients = clients
    .filter(c => c.status === "active")
    .map(client => {
        const planKey = client.plan.toLowerCase();
        const revenue = revenueByPlan[planKey]?.price || 0;
        return {
            name: client.name,
            company: client.company,
            plan: client.plan,
            revenue: `₹${revenue.toLocaleString()}`,
            rawRevenue: revenue,
            since: new Date(client.joinedDate).getFullYear().toString()
        };
    })
    .sort((a, b) => b.rawRevenue - a.rawRevenue)
    .slice(0, 5);

const SuperAdminSalesTab = () => {
    const totalClients = clients.filter(c => c.status === "active").length;
    const avgRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

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
                    title="Total Revenue (Jan)"
                    value={`₹${formatINR(totalRevenue)}`}
                    icon={<IndianRupee className="h-5 w-5" />}
                    trend={{ value: "+8.6% vs Dec", positive: true }}
                />
                <StatCard
                    title="MRR"
                    value={`₹${formatINR(totalRevenue)}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                    title="Avg. Revenue per Client"
                    value={`₹${avgRevenue.toFixed(0)}`}
                    icon={<Users className="h-5 w-5" />}
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
                        {Object.entries(revenueByPlan).map(([plan, data]) => {
                            const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
                            const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

                            return (
                                <div key={plan}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={plan === 'platinum' ? 'default' : plan === 'premium' ? 'secondary' : 'outline'}>
                                                {planName}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">{data.count} clients</span>
                                        </div>
                                        <span className="font-semibold">₹{data.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${plan === 'platinum' ? 'bg-primary' : plan === 'premium' ? 'bg-primary/70' : 'bg-primary/50'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-6">Monthly Trend</h2>
                    <div className="space-y-4">
                        {monthlyData.map((data, i) => (
                            <div key={data.month} className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                                <div>
                                    <p className="font-medium">{data.month} 2026</p>
                                    <p className="text-sm text-muted-foreground">{data.clients} clients</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₹{(data.revenue / 1000).toFixed(1)}K</p>
                                    {i > 0 && (
                                        <p className={`text-xs ${monthlyData[i - 1].revenue < data.revenue ? 'text-green-600' : 'text-red-600'}`}>
                                            {monthlyData[i - 1].revenue < data.revenue ? '↑' : '↓'}
                                            {Math.abs(((data.revenue - monthlyData[i - 1].revenue) / monthlyData[i - 1].revenue) * 100).toFixed(1)}%
                                        </p>
                                    )}
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
                    {topClients.map((client, i) => (
                        <div key={client.name} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">Client since {client.since}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                                    {client.plan}
                                </Badge>
                                <span className="font-semibold text-primary">{client.revenue}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSalesTab;
