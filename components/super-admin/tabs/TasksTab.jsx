"use client";
import { useState, useEffect, useMemo } from "react";
import { Plus, Eye, Upload, Edit, Clock, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskDetailsDialog from "@/components/dashboard/TaskDetailsDialog";

import { getTasks } from "@/lib/actions/task";
import { getUsers } from "@/lib/actions/user";
import { upsertTask, deleteTask } from "@/lib/actions/admin";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

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
    const [showViewTask, setShowViewTask] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

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
                if (clientsRes.users) {
                    // Normalize client data to ensure consistent id/name access
                    const normalizedClients = clientsRes.users.map(c => ({
                        ...c,
                        id: c._id || c.id
                    }));
                    setClients(normalizedClients);
                }
                if (adminsRes.users) {
                    const normalizedAdmins = adminsRes.users.map(a => ({
                        ...a,
                        id: a._id || a.id
                    }));
                    setManagers(normalizedAdmins);
                }
            } catch (error) {
                console.error("Error loading tasks data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helper to get initials
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
    }

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

    // Filter available clients based on selected manager (owner)
    const availableClients = useMemo(() => {
        if (!newTask.owner) return clients;
        const selectedManager = managers.find(m => m.name === newTask.owner);
        if (!selectedManager) return clients;
        // Filter clients who are assigned to this manager
        // Note: checking both managerId and manager object structure for robustness
        return clients.filter(c =>
            c.managerId === selectedManager.id ||
            (c.manager && c.manager.id === selectedManager.id) ||
            (c.manager && c.manager === selectedManager.id)
        );
    }, [newTask.owner, clients, managers]);

    // Auto-select manager when client is selected
    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        let updates = { relatedTo: clientId };

        if (client) {
            // Try to find the manager for this client
            const managerId = client.managerId || (client.manager?.id) || (typeof client.manager === 'string' ? client.manager : null);
            if (managerId) {
                const manager = managers.find(m => m.id === managerId);
                if (manager) {
                    updates.owner = manager.name;
                }
            }
        }
        setNewTask(prev => ({ ...prev, ...updates }));
    };

    // Filter available clients for Edit Task based on selected manager (owner)
    const editAvailableClients = useMemo(() => {
        if (!showEditTask?.owner) return clients;
        const selectedManager = managers.find(m => m.name === showEditTask.owner);
        if (!selectedManager) return clients;
        return clients.filter(c =>
            c.managerId === selectedManager.id ||
            (c.manager && c.manager.id === selectedManager.id) ||
            (c.manager && c.manager === selectedManager.id)
        );
    }, [showEditTask?.owner, clients, managers]);

    // Auto-select manager when client is selected in Edit Task
    const handleEditClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        let updates = { relatedTo: clientId };

        if (client) {
            const managerId = client.managerId || (client.manager?.id) || (typeof client.manager === 'string' ? client.manager : null);
            if (managerId) {
                const manager = managers.find(m => m.id === managerId);
                if (manager) {
                    updates.owner = manager.name;
                }
            }
        }
        setShowEditTask(prev => ({ ...prev, ...updates }));
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.relatedTo) {
            toast.error("Task title and client are required");
            return;
        }

        const selectedClient = clients.find(c => c.id.toString() === newTask.relatedTo);
        const selectedManager = managers.find(m => m.name === newTask.owner);
        setIsSubmitting(true);

        try {
            const taskPayload = {
                title: newTask.title,
                description: newTask.description,
                status: newTask.isCompleted ? 'Completed' : 'To Do',
                priority: newTask.isHighPriority ? 'High' : 'Medium',
                client: {
                    id: selectedClient?.id,
                    name: selectedClient?.name,
                    company: selectedClient?.company
                },
                clientId: selectedClient?.id,
                assignee: {
                    name: newTask.owner,
                    id: selectedManager?.id
                },
                owner: newTask.owner,
                dueDate: newTask.dueDate,
                planForWeek: newTask.planForWeek,
            };

            const savedTask = await upsertTask(taskPayload);
            if (savedTask) {
                setTasks(prev => [savedTask, ...prev]);
                setShowCreateTask(false);
                resetNewTaskForm();
                toast.success("Task created");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async () => {
        if (!showEditTask.title || !showEditTask.relatedTo) {
            toast.error("Task title and client are required");
            return;
        }

        const selectedClient = clients.find(c => c.id.toString() === showEditTask.relatedTo);
        const selectedManager = managers.find(m => m.name === showEditTask.owner);
        setIsSubmitting(true);

        try {
            const taskPayload = {
                ...showEditTask,
                id: showEditTask._id || showEditTask.id,
                title: showEditTask.title,
                description: showEditTask.description,
                status: showEditTask.status,
                priority: showEditTask.priority,
                client: {
                    id: selectedClient?.id,
                    name: selectedClient?.name,
                    company: selectedClient?.company
                },
                clientId: selectedClient?.id,
                assignee: {
                    name: showEditTask.owner,
                    id: selectedManager?.id
                },
                owner: showEditTask.owner,
                dueDate: showEditTask.dueDate,
                planForWeek: showEditTask.planForWeek,
            };

            const updatedTask = await upsertTask(taskPayload);
            if (updatedTask) {
                setTasks(prev => prev.map(t => (t._id === updatedTask._id || t.id === updatedTask.id) ? updatedTask : t));
                setShowEditTask(null);
                toast.success("Task updated");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const res = await deleteTask(id);
            if (res.success) {
                setTasks(prev => prev.filter(t => (t._id || t.id) !== id));
                toast.success("Task deleted");
                setTaskToDelete(null);
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting task");
        }
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
                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
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

            {/* Create Task Form */}
            {showCreateTask && (
                <div className="bg-card rounded-xl border p-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-semibold text-lg">Task Information</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Assigned To</span>
                                <Select value={newTask.owner} onValueChange={(v) => setNewTask({ ...newTask, owner: v })}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(admin => (
                                            <SelectItem key={admin.id} value={admin.name}>{admin.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setShowCreateTask(false); resetNewTaskForm(); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Task Name */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium w-32 text-right">Task Name</label>
                            <Input
                                className="flex-1"
                                placeholder="Enter task name"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium w-32 text-right">Due Date</label>
                            <Input
                                type="date"
                                className="flex-1"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                        </div>

                        {/* Plan for the week */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium w-32 text-right">Plan for the week</label>
                            <Select value={newTask.planForWeek} onValueChange={(v) => setNewTask({ ...newTask, planForWeek: v })}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select week" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {weekNumbers.map(week => (
                                        <SelectItem key={week.value} value={week.value}>{week.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Related To - Dropdown to select client */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium w-32 text-right">Related To</label>
                            <Select value={newTask.relatedTo} onValueChange={handleClientChange}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClients.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.company || c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-4">
                            <label className="text-sm font-medium w-32 text-right pt-2">Description</label>
                            <textarea
                                className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                rows={3}
                                placeholder="A few words about this task"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium w-32 text-right"></label>
                            <div className="flex-1 space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300"
                                        checked={newTask.isHighPriority}
                                        onChange={(e) => setNewTask({ ...newTask, isHighPriority: e.target.checked })}
                                    />
                                    <span className="text-sm">Mark as High Priority</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300"
                                        checked={newTask.isCompleted}
                                        onChange={(e) => setNewTask({ ...newTask, isCompleted: e.target.checked })}
                                    />
                                    <span className="text-sm">Mark as completed</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={() => { setShowCreateTask(false); resetNewTaskForm(); }}>Cancel</Button>
                        <Button onClick={handleCreateTask} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                            Create Task
                        </Button>
                    </div>
                </div>
            )}

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
                                    <Select
                                        defaultValue={task.status}
                                        onValueChange={async (v) => {
                                            try {
                                                await upsertTask({ id: task._id || task.id, status: v });
                                                setTasks(prev => prev.map(t => (t._id === task._id || t.id === task.id) ? { ...t, status: v } : t));
                                                toast.success("Status updated");
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Failed to update status");
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[130px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="To Do">To Do</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="In Review">In Review</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="On Hold">On Hold</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <Button variant="ghost" size="sm" onClick={() => setShowViewTask(task)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            const normalizedTask = {
                                                ...task,
                                                relatedTo: (task.clientId || task.client?.id)?.toString(),
                                                owner: task.assignee?.name || task.owner,
                                                isHighPriority: task.priority === 'High',
                                                isCompleted: task.status === 'Completed'
                                            };
                                            setShowEditTask(normalizedTask);
                                        }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setTaskToDelete(task._id || task.id)}>
                                            <Trash2 className="h-4 w-4" />
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

            {/* Edit Task Modal */}
            {showEditTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditTask(null)}>
                    <div className="bg-card rounded-xl border p-6 w-full max-w-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-lg">Edit Task</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Assigned To</span>
                                    <Select value={showEditTask.owner || ""} onValueChange={(v) => setShowEditTask({ ...showEditTask, owner: v })}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map(admin => (
                                                <SelectItem key={admin.id} value={admin.name}>{admin.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowEditTask(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Task Name</label>
                                <Input
                                    className="flex-1"
                                    value={showEditTask.title}
                                    onChange={(e) => setShowEditTask({ ...showEditTask, title: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Due Date</label>
                                <Input
                                    type="date"
                                    className="flex-1"
                                    value={showEditTask.dueDate || ""}
                                    onChange={(e) => setShowEditTask({ ...showEditTask, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Plan for the week</label>
                                <Select
                                    value={showEditTask.planForWeek || getCurrentWeek()}
                                    onValueChange={(v) => setShowEditTask({ ...showEditTask, planForWeek: v })}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select week" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {weekNumbers.map(week => (
                                            <SelectItem key={week.value} value={week.value}>{week.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Related To</label>
                                <Select
                                    value={showEditTask.relatedTo}
                                    onValueChange={handleEditClientChange}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editAvailableClients.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.company || c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-start gap-4">
                                <label className="text-sm font-medium w-32 text-right pt-2">Description</label>
                                <textarea
                                    className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    rows={3}
                                    value={showEditTask.description || ""}
                                    onChange={(e) => setShowEditTask({ ...showEditTask, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right"></label>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium mb-1 block">Priority</label>
                                            <Select
                                                value={showEditTask.priority}
                                                onValueChange={(v) => setShowEditTask({ ...showEditTask, priority: v, isHighPriority: v === 'High' })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-medium mb-1 block">Status</label>
                                            <Select
                                                value={showEditTask.status}
                                                onValueChange={(v) => setShowEditTask({ ...showEditTask, status: v, isCompleted: v === 'Completed' })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="To Do">To Do</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                    <SelectItem value="In Review">In Review</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowEditTask(null)}>Cancel</Button>
                            <Button onClick={handleUpdateTask} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeleteTask(taskToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Task
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TaskDetailsDialog
                open={!!showViewTask}
                onOpenChange={(open) => !open && setShowViewTask(null)}
                task={showViewTask}
            />
        </div>
    );
};

export default SuperAdminTasksTab;
