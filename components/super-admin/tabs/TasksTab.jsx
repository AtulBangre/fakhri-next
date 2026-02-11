"use client";
import { useState, useEffect, useMemo } from "react";
import { Plus, Eye, Upload, Edit, Clock, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getTasks } from "@/lib/actions/task";
import { getUsers } from "@/lib/actions/user";

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const SuperAdminTasksTab = () => {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [tasksRes, clientsRes, adminsRes] = await Promise.all([
                    getTasks({}),
                    getUsers({ role: 'client' }),
                    getUsers({ role: 'admin' })
                ]);

                if (tasksRes.tasks) setTasks(tasksRes.tasks);
                if (clientsRes.users) setClients(clientsRes.users);
                if (adminsRes.users) setManagers(adminsRes.users.map(u => u.name));
            } catch (error) {
                console.error("Error loading tasks data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Get current week number
    const getCurrentWeek = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.ceil(diff / oneWeek).toString();
    };

    // New task form
    const [newTask, setNewTask] = useState({
        title: "",
        owner: "",
        dueDate: "",
        planForWeek: getCurrentWeek(),
        relatedTo: "", // Client ID
        description: "",
        isHighPriority: false,
        isCompleted: false
    });

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.client?.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.client?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesManager = managerFilter === "all" || (task.assignee?.name || "").includes(managerFilter);
            const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter.toLowerCase();
            return matchesSearch && matchesStatus && matchesManager && matchesPriority;
        });
    }, [searchQuery, statusFilter, managerFilter, priorityFilter, tasks]);

    const resetNewTaskForm = () => {
        setNewTask({
            title: "",
            owner: "",
            dueDate: "",
            planForWeek: getCurrentWeek(),
            relatedTo: "",
            description: "",
            isHighPriority: false,
            isCompleted: false
        });
    };

    const handleCreateTask = () => {
        console.log("Creating task:", newTask);
        setShowCreateTask(false);
        resetNewTaskForm();
    };

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Tasks</h1>
                    <p className="text-muted-foreground">View and manage all tasks across the platform.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Deliverable
                    </Button>
                    <Button onClick={() => setShowCreateTask(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Input
                    placeholder="Search tasks..."
                    className="w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="to do">To Do</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="in review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Manager" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Managers</SelectItem>
                        {managers.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Manager</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                            <TableRow key={task._id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.category || "General"}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{task.client?.company || task.client?.name || "N/A"}</TableCell>
                                <TableCell className="text-muted-foreground">{task.assignee?.name || "Unassigned"}</TableCell>
                                <TableCell>
                                    <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"}>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={task.status} />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-sm">{task.dueDate || "No date"}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "Never"}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setShowEditTask(task)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    No tasks found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SuperAdminTasksTab;
