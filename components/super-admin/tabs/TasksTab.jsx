"use client";
import { useState, useEffect, useMemo, useRef } from "react";
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
import { upsertTask, deleteTask, getTeamMembers, getClients } from "@/lib/actions/admin";
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
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import * as XLSX from "xlsx";

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

    // Bulk Upload State
    const [showBulkPreview, setShowBulkPreview] = useState(false);
    const [bulkTasks, setBulkTasks] = useState([]);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTasks = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            // We can optimize to fetch only tasks if we want "refresh table only"
            // But to be consistent with "loadData", I'll fetch everything or at least tasks.
            // User asked "refresh the table only". Table depends on `tasks`.
            // But `tasks` might depend on `clients` / `team` for names if not populated?
            // `tasks` usually comes populated from `getTasks`.
            // Let's refetch everything to be safe but lightweight.

            const [tasksRes, clientsRes, teamRes] = await Promise.all([
                getTasks({}),
                getClients({}),
                getTeamMembers()
            ]);

            if (tasksRes.tasks) setTasks(tasksRes.tasks);
            // Updating clients/managers is also good in case users changed
            if (clientsRes) {
                const normalizedClients = clientsRes.map(c => ({
                    ...c,
                    id: c._id || c.id
                }));
                setClients(normalizedClients);
            }
            if (teamRes) {
                const normalizedAdmins = teamRes.map(a => ({
                    ...a,
                    id: a._id || a.id
                }));
                setManagers(normalizedAdmins);
            }
        } catch (error) {
            console.error("Error loading tasks data:", error);
            toast.error("Failed to refresh tasks");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(true);
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
        ownerId: "",
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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, managerFilter, priorityFilter]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const resetNewTaskForm = () => {
        setNewTask({
            title: "",
            owner: "",
            ownerId: "",
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
        if (!newTask.ownerId && !newTask.owner) return clients;
        // Filter clients who are assigned to this manager ownerId or name
        return clients.filter(c =>
            c.managerId === newTask.ownerId ||
            (c.manager && c.manager.id === newTask.ownerId) ||
            (c.manager && c.manager === newTask.ownerId) ||
            (c.manager === newTask.owner) ||
            (c.manager && c.manager.name === newTask.owner)
        );
    }, [newTask.ownerId, newTask.owner, clients]);

    // Auto-select manager when client is selected
    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        let updates = { relatedTo: clientId };

        if (client) {
            // Try to find the manager for this client
            const managerIdOrName = client.managerId || (client.manager?.id) || (typeof client.manager === 'string' ? client.manager : null);
            if (managerIdOrName) {
                let manager = managers.find(m => m.id === managerIdOrName);
                if (!manager) {
                    manager = managers.find(m => m.name === managerIdOrName);
                }

                if (manager) {
                    updates.owner = manager.name;
                    updates.ownerId = manager.id;
                }
            }
        }
        setNewTask(prev => ({ ...prev, ...updates }));
    };

    // Filter available clients for Edit Task based on selected manager (owner)
    const editAvailableClients = useMemo(() => {
        const ownerId = showEditTask?.ownerId || showEditTask?.assignee?.id;
        const ownerName = showEditTask?.owner || showEditTask?.assignee?.name;

        if (!ownerId && !ownerName) return clients;
        return clients.filter(c =>
            c.managerId === ownerId ||
            (c.manager && c.manager.id === ownerId) ||
            (c.manager && c.manager === ownerId) ||
            (c.manager === ownerName) ||
            (c.manager && c.manager.name === ownerName)
        );
    }, [showEditTask?.ownerId, showEditTask?.assignee?.id, showEditTask?.owner, showEditTask?.assignee?.name, clients]);

    // Auto-select manager when client is selected in Edit Task
    const handleEditClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        let updates = { relatedTo: clientId };

        if (client) {
            const managerIdOrName = client.managerId || (client.manager?.id) || (typeof client.manager === 'string' ? client.manager : null);
            if (managerIdOrName) {
                let manager = managers.find(m => m.id === managerIdOrName);
                if (!manager) {
                    manager = managers.find(m => m.name === managerIdOrName);
                }

                if (manager) {
                    updates.owner = manager.name;
                    updates.ownerId = manager.id;
                    updates.assignee = { name: manager.name, id: manager.id };
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
                    id: newTask.ownerId
                },
                owner: newTask.owner,
                dueDate: newTask.dueDate,
                planForWeek: newTask.planForWeek,
            };

            const savedTask = await upsertTask(taskPayload);
            if (savedTask) {
                await fetchTasks();
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
                    id: showEditTask.ownerId || showEditTask.assignee?.id
                },
                owner: showEditTask.owner,
                dueDate: showEditTask.dueDate,
                planForWeek: showEditTask.planForWeek || getCurrentWeek(),
            };

            const updatedTask = await upsertTask(taskPayload);
            if (updatedTask) {
                await fetchTasks();
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
                await fetchTasks();
                setTaskToDelete(null);
                toast.success("Task deleted");
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting task");
        }
    };

    // Bulk Upload Handlers
    const normalizeStatus = (status) => {
        const s = (status || "").toLowerCase().trim();
        if (s.includes("do") || s.includes("todo")) return "To Do";
        if (s.includes("progress")) return "In Progress";
        if (s.includes("review")) return "In Review";
        if (s.includes("complete") || s.includes("done")) return "Completed";
        if (s.includes("hold")) return "On Hold";
        return "To Do";
    };

    const normalizePriority = (priority) => {
        const p = (priority || "").toLowerCase().trim();
        if (p === "high" || p === "urgent") return "High";
        if (p === "low") return "Low";
        return "Medium";
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Map excel data to task format
                const mappedTasks = jsonData.map(row => {
                    const normalizedRow = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().trim()] = row[key];
                    });

                    return {
                        title: normalizedRow['title'] || normalizedRow['task name'] || "Untitled Task",
                        description: normalizedRow['description'] || "",
                        status: normalizeStatus(normalizedRow['status']),
                        priority: normalizePriority(normalizedRow['priority']),
                        dueDate: normalizedRow['due date'] || normalizedRow['duedate'] || "",
                        planForWeek: normalizedRow['week'] || normalizedRow['plan for week'] || getCurrentWeek(),
                        clientName: normalizedRow['client'] || normalizedRow['related to'] || "",
                        ownerName: normalizedRow['owner'] || normalizedRow['manager'] || normalizedRow['assignee'] || ""
                    };
                });

                setBulkTasks(mappedTasks);
                setShowBulkPreview(true);
            } catch (error) {
                console.error("Error parsing Excel:", error);
                toast.error("Failed to parse Excel file");
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsArrayBuffer(file);
    };

    const handleBulkUploadConfirm = async () => {
        if (bulkTasks.length === 0) return;
        setIsBulkUploading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            if (clients.length === 0) {
                console.error("No clients loaded in state. Cannot perform bulk upload.");
                toast.error("Client data not loaded. Please refresh the page.");
                setIsBulkUploading(false);
                return;
            }

            for (const task of bulkTasks) {
                const searchName = (task.clientName || "").toLowerCase().trim();

                const client = clients.find(c => {
                    const nameMatch = c.name && c.name.toLowerCase().trim() === searchName;
                    const companyMatch = c.company && c.company.toLowerCase().trim() === searchName;
                    return nameMatch || companyMatch;
                });

                const manager = managers.find(m =>
                    m.name && m.name.toLowerCase().trim() === (task.ownerName || "").toLowerCase().trim()
                );

                if (!client) {
                    console.error(`Client NOT FOUND for: "${task.clientName}"`);
                    console.log(`Current Clients in memory (${clients.length}):`, clients.map(c => `"${c.name}" / "${c.company}"`).join(' | '));
                    failCount++;
                    continue;
                }

                const taskPayload = {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    planForWeek: task.planForWeek ? String(task.planForWeek) : getCurrentWeek(),
                    clientId: client.id,
                    client: {
                        id: client.id,
                        name: client.name,
                        company: client.company
                    },
                    owner: manager ? manager.name : (task.ownerName || "Unassigned"),
                    assignee: manager ? { name: manager.name, id: manager.id } : null,
                    ownerId: manager ? manager.id : null
                };

                try {
                    const result = await upsertTask(taskPayload);
                    if (result) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    console.error("Failed to create specific task", err);
                    failCount++;
                }
            }

            if (successCount > 0) toast.success(`Bulk upload complete: ${successCount} tasks created`);
            if (failCount > 0) toast.error(`${failCount} tasks failed. Check console for details.`);

            setShowBulkPreview(false);
            setBulkTasks([]);
            fetchTasks();
        } catch (error) {
            console.error("Bulk upload error:", error);
            toast.error("Bulk upload failed");
        } finally {
            setIsBulkUploading(false);
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
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Upload Tasks
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden" onClick={() => setShowCreateTask(false)}>
                    <ScrollableContainer className="bg-card rounded-xl border p-6 animate-in slide-in-from-top-2 w-full max-w-2xl" maxHeight="90vh" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-lg">Task Information</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Assigned To</span>
                                    <Select
                                        value={newTask.ownerId}
                                        onValueChange={(id) => {
                                            const member = managers.find(m => m.id === id);
                                            if (member) {
                                                setNewTask(prev => ({ ...prev, ownerId: id, owner: member.name }));
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={newTask.owner || "Select Manager"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map(admin => (
                                                <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
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
                    </ScrollableContainer>
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
                        {paginatedTasks.length > 0 ? paginatedTasks.map((task, index) => (
                            <TableRow key={task._id ? `${task._id}-${index}` : index}>
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
                                                await fetchTasks();
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
                                                ownerId: task.assignee?.id,
                                                isHighPriority: task.priority === 'High',
                                                isCompleted: task.status === 'Completed',
                                                planForWeek: task.planForWeek || getCurrentWeek()
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
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(p => p - 1);
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    totalPages <= 7 ||
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === currentPage}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(page);
                                                }}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (
                                    (page === currentPage - 2 && currentPage > 3) ||
                                    (page === currentPage + 2 && currentPage < totalPages - 2)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) setCurrentPage(p => p + 1);
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}



            {/* Bulk Preview Modal */}
            {
                showBulkPreview && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBulkPreview(false)}>
                        <ScrollableContainer className="bg-card rounded-xl border p-6 w-full max-w-4xl animate-in zoom-in-95" maxHeight="90vh" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-heading font-semibold text-lg">Preview Bulk Tasks ({bulkTasks.length})</h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowBulkPreview(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="border rounded-md overflow-hidden mb-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Client (CSV)</TableHead>
                                            <TableHead>Manager (CSV)</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Due Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bulkTasks.slice(0, 10).map((task, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>
                                                    {task.clientName}
                                                    {!clients.find(c =>
                                                        (c.name?.toLowerCase().trim() === task.clientName?.toLowerCase().trim()) ||
                                                        (c.company?.toLowerCase().trim() === task.clientName?.toLowerCase().trim())
                                                    ) && (
                                                            <span className="text-destructive ml-1 text-xs">(Not Found)</span>
                                                        )}
                                                </TableCell>
                                                <TableCell>
                                                    {task.ownerName}
                                                    {!managers.find(m => m.name?.toLowerCase() === task.ownerName?.toLowerCase()) && task.ownerName && (
                                                        <span className="text-warning ml-1 text-xs">(Not Found)</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{task.status}</TableCell>
                                                <TableCell>{task.priority}</TableCell>
                                                <TableCell>{task.dueDate}</TableCell>
                                            </TableRow>
                                        ))}
                                        {bulkTasks.length > 10 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                    ... and {bulkTasks.length - 10} more rows
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowBulkPreview(false)}>Cancel</Button>
                                <Button onClick={handleBulkUploadConfirm} disabled={isBulkUploading}>
                                    {isBulkUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                                    Upload {bulkTasks.length} Tasks
                                </Button>
                            </div>
                        </ScrollableContainer>
                    </div>
                )
            }


            {/* Edit Task Modal */}
            {
                showEditTask && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditTask(null)}>
                        <ScrollableContainer className="bg-card rounded-xl border p-6 w-full max-w-2xl animate-in zoom-in-95" maxHeight="90vh" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-heading font-semibold text-lg">Edit Task</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Assigned To</span>
                                        <Select
                                            value={showEditTask.ownerId || showEditTask.assignee?.id || ""}
                                            onValueChange={(id) => {
                                                const member = managers.find(m => m.id === id);
                                                if (member) {
                                                    setShowEditTask(prev => ({
                                                        ...prev,
                                                        ownerId: id,
                                                        owner: member.name,
                                                        assignee: { ...prev.assignee, id: id, name: member.name }
                                                    }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={showEditTask.owner || "Select Manager"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {managers.map(admin => (
                                                    <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
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
                        </ScrollableContainer>
                    </div>
                )
            }

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
