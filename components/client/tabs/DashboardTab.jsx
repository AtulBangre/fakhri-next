"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, CheckSquare, Clock, CheckCircle2, Bell, Mail, Headphones, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { getTasks } from "@/lib/actions/task";
import { getUserById, getUsers } from "@/lib/actions/user";
import { getNotifications } from "@/lib/actions/notification";

const ClientDashboardTab = ({ setActiveTab, currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [manager, setManager] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                setClient(currentUser);

                // Fetch tasks for this client
                const tasksResponse = await getTasks({ clientId: currentUser._id, limit: 10 });
                setTasks(tasksResponse.tasks || []);

                // Fetch notifications
                const notifs = await getNotifications({ recipientId: currentUser._id, limit: 10 });
                setNotifications(notifs || []);

                // Fetch manager if assigned
                if (currentUser.managerId) {
                    const managerData = await getUserById(currentUser.managerId);
                    setManager(managerData);
                } else if (currentUser.manager) {
                    // Fallback if manager is stored as a string or object
                    setManager(typeof currentUser.manager === 'object' ? currentUser.manager : { name: currentUser.manager });
                }
            } catch (error) {
                console.error("Error loading client dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="bg-card rounded-xl border p-12 text-center">
                <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
                <p className="text-muted-foreground">We couldn't load your account details. Please contact support.</p>
            </div>
        );
    }

    // Calculate stats
    const activeTasksCount = tasks.filter(t => ["To Do", "In Progress", "In Review"].includes(t.status)).length;
    const completedTasksCount = tasks.filter(t => t.status === "Completed").length;

    // Get recent tasks
    const recentTasks = tasks.slice(0, 4);

    const managerInitials = manager?.name ? manager.name.split(' ').map(n => n[0]).join('') : "A";

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-primary text-white rounded-xl p-6">
                <h1 className="font-heading text-2xl font-bold mb-2">Welcome back, {client.name.split(' ')[0]}!</h1>
                <p className="text-white/80">Your account is performing well. Here's your latest overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Plan" value={client.plan || "Free"} icon={<LayoutDashboard className="h-5 w-5" />} />
                <StatCard title="Status" value={client.status || "Active"} icon={<Clock className="h-5 w-5" />} />
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
                                <p className="text-sm text-muted-foreground">{manager.adminRole || manager.role || "Manager"}</p>
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
                                <div key={task._id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : (task.eta || 'No date')}</span>
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

            {/* Notifications Section */}
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-semibold">Recent Notifications</h2>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                    {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                            <div key={notification._id} className="flex items-start gap-3 py-3 border-b last:border-0">
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notification.read ? 'bg-gray-300' : 'bg-primary'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboardTab;
