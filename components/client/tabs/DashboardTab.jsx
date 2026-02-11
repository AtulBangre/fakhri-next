"use client";
import { LayoutDashboard, CheckSquare, Clock, CheckCircle2, Bell, Mail, Headphones } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { mockNotifications } from "@/data/notifications";
import { getTasksByClientId } from "@/data/tasks";
import { getClientById } from "@/data/clients";
import { admins } from "@/data/admins";

const CURRENT_CLIENT_ID = 1; // Mock logged-in client

const ClientDashboardTab = ({ setActiveTab }) => {
    // Fetch data
    const client = getClientById(CURRENT_CLIENT_ID);
    const tasks = getTasksByClientId(CURRENT_CLIENT_ID);
    // Find manager - client.managerId is the FK
    const manager = admins.find(a => a.id === client?.managerId);

    // Calculate stats
    const activeTasksCount = tasks.filter(t => t.status === "in-progress" || t.status === "pending").length;
    const completedTasksCount = tasks.filter(t => t.status === "completed").length;

    // Get recent tasks
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.lastUpdated || b.dueDate) - new Date(a.lastUpdated || a.dueDate))
        .slice(0, 4);

    const clientNotifications = mockNotifications.client || [];

    if (!client) return <div>Loading...</div>;

    const managerInitials = manager ? manager.name.split(' ').map(n => n[0]).join('') : "A";

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-primary text-white rounded-xl p-6">
                <h1 className="font-heading text-2xl font-bold mb-2">Welcome back, {client.name.split(' ')[0]}!</h1>
                <p className="text-white/80">Your account is performing well. Here's your latest overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Plan" value={client.plan} icon={<LayoutDashboard className="h-5 w-5" />} />
                <StatCard title="Plan Valid Until" value="Mar 15, 2026" icon={<Clock className="h-5 w-5" />} />
                <StatCard title="Active Tasks" value={activeTasksCount} icon={<CheckSquare className="h-5 w-5" />} />
                <StatCard title="Completed Tasks" value={completedTasksCount} icon={<CheckCircle2 className="h-5 w-5" />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Account Manager */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-heading font-semibold mb-4">Your Account Manager</h2>
                    {manager ? (
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xl">
                                {managerInitials}
                            </div>
                            <div>
                                <p className="font-medium">{manager.name}</p>
                                <p className="text-sm text-muted-foreground">{manager.role}</p>
                                <a href={`mailto:${manager.email}`} className="text-sm text-primary mt-1 flex items-center gap-1 hover:underline">
                                    <Mail className="h-3 w-3" />
                                    {manager.email}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 text-sm text-muted-foreground">No account manager assigned yet.</div>
                    )}

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
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">{task.eta || task.dueDate}</span>
                                        <StatusBadge status={task.status} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent tasks.</p>
                        )}
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
                    {clientNotifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`} />
                            <div>
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ClientDashboardTab;
