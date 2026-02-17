"use client";

import { useState, useMemo, useEffect } from "react";
import { Eye, Filter, X, Calendar, User, CheckCircle, Loader2 } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTasks } from "@/lib/actions/task";
import { getUsers } from "@/lib/actions/user";
import { toast } from "sonner";
import TaskDetailsDialog from "@/components/dashboard/TaskDetailsDialog";
import { NoPlanState } from "@/components/client/NoPlanState";

const ClientTasksTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [showViewTask, setShowViewTask] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    useEffect(() => {
        const loadTasksData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getTasks({ clientId: currentUser._id, limit: 50 });
                setTasks(response.tasks || []);
            } catch (error) {
                console.error("Error loading client tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTasksData();
    }, [currentUser]);

    // Get unique managers from tasks
    const managers = useMemo(() => {
        const unique = [...new Set(tasks.map(task => task.assignee?.name).filter(Boolean))];
        return unique;
    }, [tasks]);

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
            if (managerFilter !== "all" && task.assignee?.name !== managerFilter) {
                return false;
            }

            // Date range filter
            const taskDate = parseDate(task.dueDate || task.updatedAt);
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
    }, [statusFilter, managerFilter, dateRange, tasks]);

    // Count tasks by status
    const taskCounts = useMemo(() => {
        const inProgress = tasks.filter(t => t.status === "In Progress").length;
        const review = tasks.filter(t => t.status === "In Review").length;
        const completed = tasks.filter(t => t.status === "Completed").length;
        const todo = tasks.filter(t => t.status === "To Do").length;
        return { inProgress, review, completed, todo };
    }, [tasks]);

    const clearFilters = () => {
        setStatusFilter("all");
        setManagerFilter("all");
        setDateRange({ start: "", end: "" });
    };

    const hasActiveFilters = statusFilter !== "all" || managerFilter !== "all" || dateRange.start || dateRange.end;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading tasks...</p>
            </div>
        );
    }

    if (!currentUser?.plan && tasks.length === 0) {
        return (
            <NoPlanState
                title="Manage Your Projects"
                message="To access task management and track your project progress, please choose a subscription plan."
            />
        );
    }

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
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="In Review">In Review</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>

                        {/* Manager Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Assigned To
                            </label>
                            <select
                                value={managerFilter}
                                onChange={(e) => setManagerFilter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="all">Everyone</option>
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
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-blue-600">{taskCounts.todo}</p>
                    <p className="text-sm text-muted-foreground">To Do</p>
                </div>
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-amber-600">{taskCounts.inProgress}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-purple-600">{taskCounts.review}</p>
                    <p className="text-sm text-muted-foreground">In Review</p>
                </div>
                <div className="p-4 rounded-xl bg-card border text-center">
                    <p className="text-2xl font-heading font-bold text-green-600">{taskCounts.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TableRow key={task._id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{task.category || "General"}</TableCell>
                                    <TableCell className="text-muted-foreground">{task.assignee?.name || "Unassigned"}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={task.status} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setShowViewTask(task)}>
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

            <TaskDetailsDialog
                open={!!showViewTask}
                onOpenChange={(open) => !open && setShowViewTask(null)}
                task={showViewTask}
            />
        </div>
    );
};

export default ClientTasksTab;
