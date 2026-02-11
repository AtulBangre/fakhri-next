"use client";
import { Users, CheckSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { admins } from "@/data/admins";
import { getClientsByManagerId } from "@/data/clients";
import { getTasksByManagerId } from "@/data/tasks";

// Mock logged-in admin ID
const CURRENT_ADMIN_ID = 1;

const AdminDashboardTab = ({ setActiveTab }) => {
    const admin = admins.find(a => a.id === CURRENT_ADMIN_ID);
    const myClients = getClientsByManagerId(CURRENT_ADMIN_ID);
    const myTasks = getTasksByManagerId(CURRENT_ADMIN_ID);

    // Calculate stats
    const activeTasksCount = myTasks.filter(t => t.status === "in-progress").length;
    const pendingTasksCount = myTasks.filter(t => t.status === "pending").length;
    const completedTasksCount = myTasks.filter(t => t.status === "completed").length;

    // Get recent tasks (limit 4)
    const recentTasks = [...myTasks]
        .sort((a, b) => new Date(b.lastUpdated || b.dueDate) - new Date(a.lastUpdated || a.dueDate))
        .slice(0, 4);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-primary text-white rounded-xl p-6">
                <h1 className="font-heading text-2xl font-bold mb-2">Welcome, {admin?.name.split(' ')[0]}!</h1>
                <p className="text-white/80">You have {activeTasksCount + pendingTasksCount} active tasks and {myClients.length} assigned clients.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Clients" value={myClients.length} icon={<Users className="h-5 w-5" />} />
                <StatCard title="Active Tasks" value={activeTasksCount} icon={<CheckSquare className="h-5 w-5" />} />
                <StatCard title="Pending Tasks" value={pendingTasksCount} icon={<Clock className="h-5 w-5" />} />
                <StatCard title="Completed Total" value={completedTasksCount} icon={<CheckCircle2 className="h-5 w-5" />} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold">Recent Tasks</h2>
                        <button onClick={() => setActiveTab("Tasks")} className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.client}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"} className="text-xs">
                                            {task.priority || "Medium"}
                                        </Badge>
                                        <StatusBadge status={task.status} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent tasks found.</p>
                        )}
                    </div>
                </div>

                {/* My Clients */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-semibold">My Clients</h2>
                        <button onClick={() => setActiveTab("Clients")} className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {myClients.map((client) => (
                            <div key={client.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                        {client.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">{client.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{client.plan}</Badge>
                                    <span className="text-xs text-muted-foreground">{client.activeTasks} tasks</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">Pending Actions</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            You have {pendingTasksCount} tasks pending and {myClients.filter(c => c.status === 'pending').length} pending client approvals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboardTab;
