"use client";
import { LayoutDashboard, CheckSquare, Clock, CheckCircle2, Bell, Mail, Headphones } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";

const recentTasks = [
    { id: 1, title: "Listing Optimization - Product A", status: "completed", eta: "Completed" },
    { id: 2, title: "PPC Campaign Setup", status: "in-progress", eta: "Jan 25, 2026" },
    { id: 3, title: "A+ Content Design", status: "in-progress", eta: "Jan 28, 2026" },
    { id: 4, title: "Brand Registry Application", status: "pending", eta: "Feb 1, 2026" },
];
const notifications = [
    { id: 1, message: "Your PPC campaign has been optimized", time: "2 hours ago" },
    { id: 2, message: "New file uploaded: Product Images v2", time: "5 hours ago" },
    { id: 3, message: "Account health check completed", time: "1 day ago" },
];

const ClientDashboardTab = ({ setActiveTab }) => {
    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-primary text-white rounded-xl p-6">
                <h1 className="font-heading text-2xl font-bold mb-2">Welcome back, John!</h1>
                <p className="text-white/80">Your account is performing well. Here's your latest overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Plan" value="Premium" icon={<LayoutDashboard className="h-5 w-5" />} />
                <StatCard title="Plan Valid Until" value="Mar 15, 2026" icon={<Clock className="h-5 w-5" />} />
                <StatCard title="Active Tasks" value={3} icon={<CheckSquare className="h-5 w-5" />} />
                <StatCard title="Completed Tasks" value={12} icon={<CheckCircle2 className="h-5 w-5" />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Account Manager */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-4">Your Account Manager</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xl">
                            SM
                        </div>
                        <div>
                            <p className="font-medium">Sarah Mitchell</p>
                            <p className="text-sm text-muted-foreground">Senior Account Manager</p>
                            <a href="mailto:sarah@fakhriit.com" className="text-sm text-primary mt-1 flex items-center gap-1 hover:underline">
                                <Mail className="h-3 w-3" />
                                sarah@fakhriit.com
                            </a>
                        </div>
                    </div>
                    {/* Support Email */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Headphones className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Need Support?</p>
                                <a href="mailto:support@fakhriit.com" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                                    <Mail className="h-3 w-3" />
                                    support@fakhriit.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Summary */}
                <div className="bg-card rounded-xl border p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold">Recent Tasks</h2>
                        <button onClick={() => setActiveTab("Tasks")} className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {recentTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">{task.eta}</span>
                                    <StatusBadge status={task.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-semibold">Notifications</h2>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div>
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ClientDashboardTab;
