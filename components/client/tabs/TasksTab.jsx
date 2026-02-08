"use client";
import { useState, useMemo } from "react";
import { Eye, Filter, X, Calendar, User, CheckCircle } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tasks = [
    { id: 1, title: "Listing Optimization - Product A", service: "Catalog Management", status: "completed", eta: "Jan 20, 2026", completedDate: "Jan 19, 2026", manager: "Sarah Mitchell" },
    { id: 2, title: "PPC Campaign Setup", service: "PPC Management", status: "in-progress", eta: "Jan 25, 2026", completedDate: null, manager: "Sarah Mitchell" },
    { id: 3, title: "A+ Content Design - Product B", service: "A+ Content", status: "in-progress", eta: "Jan 28, 2026", completedDate: null, manager: "John Smith" },
    { id: 4, title: "Brand Registry Application", service: "Brand Registry", status: "pending", eta: "Feb 1, 2026", completedDate: null, manager: "Sarah Mitchell" },
    { id: 5, title: "Competitor Analysis Report", service: "Account Management", status: "completed", eta: "Jan 15, 2026", completedDate: "Jan 14, 2026", manager: "John Smith" },
    { id: 6, title: "Backend Search Terms Update", service: "Catalog Management", status: "completed", eta: "Jan 12, 2026", completedDate: "Jan 12, 2026", manager: "Sarah Mitchell" },
];

// Get unique managers from tasks
const managers = [...new Set(tasks.map(task => task.manager))];

const ClientTasksTab = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Parse date string to Date object
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr);
    };

    // Filter tasks based on selected filters
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Status filter
            if (statusFilter !== "all" && task.status !== statusFilter) {
                return false;
            }

            // Manager filter
            if (managerFilter !== "all" && task.manager !== managerFilter) {
                return false;
            }

            // Date range filter
            const taskDate = parseDate(task.completedDate || task.eta);
            if (dateRange.start && taskDate) {
                const startDate = new Date(dateRange.start);
                if (taskDate < startDate) return false;
            }
            if (dateRange.end && taskDate) {
                const endDate = new Date(dateRange.end);
                if (taskDate > endDate) return false;
            }

            return true;
        });
    }, [statusFilter, managerFilter, dateRange]);

    // Count tasks by status
    const taskCounts = useMemo(() => {
        const inProgress = filteredTasks.filter(t => t.status === "in-progress").length;
        const pending = filteredTasks.filter(t => t.status === "pending").length;
        const completed = filteredTasks.filter(t => t.status === "completed").length;
        return { inProgress, pending, completed };
    }, [filteredTasks]);

    const clearFilters = () => {
        setStatusFilter("all");
        setManagerFilter("all");
        setDateRange({ start: "", end: "" });
    };

    const hasActiveFilters = statusFilter !== "all" || managerFilter !== "all" || dateRange.start || dateRange.end;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Tasks</h1>
                    <p className="text-muted-foreground">View the status of all tasks assigned to your account.</p>
                </div>
                <Button
                    variant={showFilters ? "default" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                            !
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-card rounded-xl border p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Tasks
                        </h3>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Manager Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Manager
                            </label>
                            <select
                                value={managerFilter}
                                onChange={(e) => setManagerFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="all">All Managers</option>
                                {managers.map(manager => (
                                    <option key={manager} value={manager}>{manager}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range - Start */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                From Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        {/* Date Range - End */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                To Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Task Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-yellow-600">{taskCounts.inProgress}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-muted-foreground">{taskCounts.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-primary">{taskCounts.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Manager</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>ETA</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{task.service}</TableCell>
                                    <TableCell className="text-muted-foreground">{task.manager}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={task.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {task.completedDate || task.eta}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No tasks found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Read-only Notice */}
            <div className="bg-accent/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                <p>Tasks are managed by your account manager. Contact them for any task-related requests.</p>
            </div>
        </div>
    );
};

export default ClientTasksTab;
