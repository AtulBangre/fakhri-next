"use client";
import { useState, useMemo, useEffect } from "react";
import {
    Plus, Eye, X, Mail, Phone, Building2, CreditCard,
    CheckSquare, StickyNote, Edit, Save, Calendar, User,
    Filter, ChevronDown, ChevronUp, Clock, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, getTasks, upsertTask, deleteTask, getNotes, upsertNote, getAdmins } from "@/lib/actions/admin";
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
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const AdminClientsTab = ({ currentUser }) => {
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedClient, setSelectedClient] = useState(null);
    const [activeView, setActiveView] = useState("tasks");
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);
    const [showAddNote, setShowAddNote] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Task filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");

    useEffect(() => {
        async function loadData() {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [c, a] = await Promise.all([
                    getClients(currentUser.role === 'super-admin' ? {} : { managerId: currentUser._id }),
                    getAdmins()
                ]);
                const clientIds = c.map(client => client._id);

                const taskFilter = currentUser.role === 'super-admin'
                    ? {}
                    : {
                        $or: [
                            { 'assignee.id': currentUser._id },
                            { clientId: { $in: clientIds } }
                        ]
                    };

                const t = await getTasks(taskFilter);

                // Deduplicate data to avoid key errors
                const uniqueClients = Array.from(new Map(c.map(item => [String(item._id), item])).values());
                const uniqueAdmins = Array.from(new Map(a.map(item => [String(item._id), item])).values());
                const uniqueTasks = Array.from(new Map(t.map(item => [String(item._id || item.id), item])).values());

                const clientsWithCounts = uniqueClients.map(client => {
                    const clientTasks = uniqueTasks.filter(task => task.client?.id === client._id || task.clientId === client._id);
                    const activeCount = clientTasks.filter(task => task.status !== 'Completed').length;
                    return { ...client, activeTasks: activeCount, id: client._id }; // Ensure id property exists
                });
                setClients(clientsWithCounts);
                setTasks(uniqueTasks);
                setAdmins(uniqueAdmins);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load clients");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [currentUser]);

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
        owner: currentUser?.name || "Admin", // Default

        dueDate: "",
        planForWeek: getCurrentWeek(),
        description: "",
        isHighPriority: false,
        isCompleted: false
    });

    // New note
    const [newNote, setNewNote] = useState("");

    // Mail Form State
    const [showMailForm, setShowMailForm] = useState(false);
    const [mailSubject, setMailSubject] = useState("");
    const [mailBody, setMailBody] = useState("");

    // Mock managers for now


    // Filter clients
    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            (client.name && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, clients]);

    // Get tasks for selected client
    const clientTasks = useMemo(() => {
        if (!selectedClient) return [];
        // Match by client ID (mongo _id or string id)
        let t = tasks.filter(task =>
            (task.client?.id === selectedClient._id) ||
            (task.clientId === selectedClient._id) ||
            (task.client?.id === selectedClient.id)
        );

        if (statusFilter !== "all") {
            t = t.filter(task => task.status?.toLowerCase() === statusFilter.toLowerCase());
        }
        if (priorityFilter !== "all") {
            t = t.filter(task => task.priority?.toLowerCase() === priorityFilter.toLowerCase());
        }
        if (ownerFilter !== "all") {
            t = t.filter(task => task.assignee?.name === ownerFilter || task.owner === ownerFilter);
        }

        return t;
    }, [selectedClient, statusFilter, priorityFilter, ownerFilter, tasks]);

    // Get notes for selected client
    const clientNotes = useMemo(() => {
        return notes;
    }, [notes]);

    const handleClientClick = async (client) => {
        // Normalize ID usage
        const clientWithId = { ...client, id: client._id || client.id };
        setSelectedClient(clientWithId);
        setActiveView("tasks");
        setShowCreateTask(false);
        setShowEditTask(null);
        setShowAddNote(false);

        // Fetch Notes
        try {
            const clientNotes = await getNotes(clientWithId.id);
            setNotes(clientNotes);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load notes");
        }
    };

    const handleBackToList = () => {
        setSelectedClient(null);
        setActiveView("tasks");
        setNotes([]);
    };

    const resetNewTaskForm = () => {
        setNewTask({
            title: "",
            owner: "Sarah Mitchell",
            dueDate: "",
            planForWeek: getCurrentWeek(),
            description: "",
            isHighPriority: false,
            isCompleted: false
        });
    };

    const handleCreateTask = async () => {
        if (!newTask.title) {
            toast.error("Task title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const taskPayload = {
                title: newTask.title,
                description: newTask.description,
                status: newTask.isCompleted ? 'Completed' : 'To Do',
                priority: newTask.isHighPriority ? 'High' : 'Medium',
                client: {
                    id: selectedClient.id,
                    name: selectedClient.name,
                    company: selectedClient.company
                },
                clientId: selectedClient.id, // redundancy for easier query
                assignee: {
                    name: newTask.owner,
                    id: currentUser._id
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
            } else {
                toast.error("Failed to create task");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async () => {
        if (!showEditTask.title) {
            toast.error("Task title is required");
            return;
        }

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
                    id: selectedClient.id,
                    name: selectedClient.name,
                    company: selectedClient.company
                },
                clientId: selectedClient.id,
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
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting task");
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            const notePayload = {
                clientId: selectedClient.id,
                author: "Sarah Mitchell", // current user mock
                content: newNote,
                date: new Date()
            };

            const savedNote = await upsertNote(notePayload);
            if (savedNote) {
                setNotes(prev => [savedNote, ...prev]);
                setShowAddNote(false);
                setNewNote("");
                toast.success("Note added");
            } else {
                toast.error("Failed to add note");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error adding note");
        }
    };

    const handleSendMail = () => {
        toast.success(`Mail sent to ${selectedClient.email}`);
        setShowMailForm(false);
        setMailSubject("");
        setMailBody("");
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!currentUser) {
        return <div className="p-6 text-center text-muted-foreground">User information not available.</div>;
    }

    // Client List View
    if (!selectedClient) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-heading text-2xl font-bold mb-2">My Clients</h1>
                        <p className="text-muted-foreground">Manage your assigned clients and their accounts.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-3">
                    <Input
                        placeholder="Search clients..."
                        className="max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Clients Table */}
                <div className="bg-card rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Active Tasks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleClientClick(client)}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {client.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium">{client.name}</p>
                                                <p className="text-xs text-muted-foreground">{client.company}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                                            {client.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{client.activeTasks}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === "active" ? "default" : "outline"} className="bg-green-500/10 text-green-600 border-green-500/20">
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClientClick(client); }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    // Client Detail View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleBackToList}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h1 className="font-heading text-2xl font-bold">{selectedClient.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeView === "tasks" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveView("tasks")}
                    >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Tasks
                    </Button>
                    <Button
                        variant={activeView === "notes" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveView("notes")}
                    >
                        <StickyNote className="h-4 w-4 mr-1" />
                        Notes
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMailForm(true)}
                    >
                        <Mail className="h-4 w-4 mr-1" />
                        Mail
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Side - Tasks or Notes */}
                <div className="lg:col-span-2 space-y-4">
                    {activeView === "tasks" ? (
                        <>
                            {/* Task Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="To Do">To Do</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priority</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Managers</SelectItem>
                                            {admins.map(admin => (
                                                <SelectItem key={admin._id} value={admin.name}>{admin.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setShowCreateTask(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Task
                                </Button>
                            </div>

                            {/* Create Task Form */}
                            {showCreateTask && (
                                <div className="bg-card rounded-xl border p-6 animate-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-heading font-semibold text-lg">Task Information</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Owner</span>
                                                <Select value={newTask.owner} onValueChange={(v) => setNewTask({ ...newTask, owner: v })}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {admins.map(admin => (
                                                            <SelectItem key={admin._id} value={admin.name}>{admin.name}</SelectItem>
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

                                        {/* Plan for the week - Week Numbers 1-52 */}
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

                                        {/* Related To - Auto-selected */}
                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium w-32 text-right">Related To</label>
                                            <div className="flex-1 px-3 py-2 bg-muted/50 rounded-lg border text-sm">
                                                {selectedClient.company}
                                                <span className="text-muted-foreground ml-2">(Auto-selected)</span>
                                            </div>
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
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientTasks.length > 0 ? clientTasks.map((task, index) => (
                                            <TableRow key={`${task._id || task.id}-${index}`}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">{task.category || 'General'}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{task.owner}</TableCell>
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
                                                                console.error("Failed to update status", error);
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
                                                <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => {
                                                            const normalizedTask = {
                                                                ...task,
                                                                relatedTo: (task.clientId || task.client?.id)?.toString(),
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
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No tasks found for this client.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Notes View */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-semibold">Client Notes</h3>
                                <Button onClick={() => setShowAddNote(true)}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Note
                                </Button>
                            </div>

                            {/* Add Note Form */}
                            {showAddNote && (
                                <div className="bg-card rounded-xl border p-4 animate-in slide-in-from-top-2">
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        rows={3}
                                        placeholder="Add a note about this client..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button variant="outline" size="sm" onClick={() => setShowAddNote(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleAddNote}>
                                            <Save className="h-4 w-4 mr-1" />
                                            Save Note
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Notes List */}
                            <div className="space-y-4">
                                {clientNotes.length > 0 ? clientNotes.map((note) => (
                                    <div key={note.id} className="bg-card rounded-xl border p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                    {note.author.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-medium text-sm">{note.author}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{note.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{note.content}</p>
                                    </div>
                                )) : (
                                    <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground">
                                        No notes yet. Add the first note for this client.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side - Client Details */}
                <div className="space-y-4">
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xl">
                                {selectedClient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h2 className="font-heading font-semibold text-lg">{selectedClient.name}</h2>
                                <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedClient.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedClient.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <Badge variant={selectedClient.plan === "Platinum" ? "default" : selectedClient.plan === "Premium" ? "secondary" : "outline"}>
                                    {selectedClient.plan} Plan
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined {selectedClient.joinDate}</span>
                            </div>

                            {/* Extended Details (Read Only) */}
                            <div className="pt-4 border-t space-y-3">
                                <h4 className="font-medium text-sm text-foreground/80">Additional Details</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                    <div className="text-muted-foreground">Sales Manager:</div>
                                    <div className="font-medium truncate">{selectedClient.salesManager || "-"}</div>

                                    <div className="text-muted-foreground">SP Central Req ID:</div>
                                    <div className="font-medium truncate">{selectedClient.spCentralRequestId || "-"}</div>

                                    <div className="text-muted-foreground">Marketplace:</div>
                                    <div className="font-medium truncate">{selectedClient.marketplace || "-"}</div>

                                    <div className="text-muted-foreground">User Permission:</div>
                                    <div className="font-medium truncate">{selectedClient.userPermission || "-"}</div>

                                    <div className="text-muted-foreground">Account Access:</div>
                                    <div className="font-medium truncate">
                                        {selectedClient.accountAccessUrl ? (
                                            <a href={selectedClient.accountAccessUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                Link
                                            </a>
                                        ) : "-"}
                                    </div>

                                    <div className="text-muted-foreground">Lead Source:</div>
                                    <div className="font-medium truncate">{selectedClient.leadSource || "-"}</div>

                                    <div className="text-muted-foreground">Listing Manager:</div>
                                    <div className="font-medium truncate">{selectedClient.listingManager || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Summary */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-heading font-semibold mb-4">Task Summary</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <p className="text-xl font-bold text-yellow-600">
                                    {tasks.filter(t => (t.clientId === selectedClient.id || t.client?.id === selectedClient.id) && ["in-progress", "In Progress"].includes(t.status)).length}
                                </p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                            <div className="p-3 bg-gray-500/10 rounded-lg">
                                <p className="text-xl font-bold text-gray-600">
                                    {tasks.filter(t => (t.clientId === selectedClient.id || t.client?.id === selectedClient.id) && ["pending", "To Do", "To-Do"].includes(t.status)).length}
                                </p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <p className="text-xl font-bold text-green-600">
                                    {tasks.filter(t => (t.clientId === selectedClient.id || t.client?.id === selectedClient.id) && ["completed", "Completed"].includes(t.status)).length}
                                </p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" onClick={() => { setActiveView("tasks"); setShowCreateTask(true); }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Task
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => { setActiveView("notes"); setShowAddNote(true); }}>
                                <StickyNote className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mail Modal */}
            {showMailForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMailForm(false)}>
                    <div className="bg-card rounded-xl border p-6 w-full max-w-lg animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-lg">Send Email to Client</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowMailForm(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">To:</label>
                                <Input value={selectedClient.email} disabled className="bg-muted" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">From:</label>
                                <Input value="Manager (manager@company.com)" disabled className="bg-muted" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Subject:</label>
                                <Input
                                    placeholder="Enter subject"
                                    value={mailSubject}
                                    onChange={(e) => setMailSubject(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Message:</label>
                                <textarea
                                    className="px-3 py-2 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
                                    placeholder="Type your message here..."
                                    value={mailBody}
                                    onChange={(e) => setMailBody(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowMailForm(false)}>Cancel</Button>
                            <Button onClick={handleSendMail}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {showEditTask && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditTask(null)}>
                    <div className="bg-card rounded-xl border p-6 w-full max-w-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-lg">Edit Task</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Owner</span>
                                    <Select value={showEditTask.owner} onValueChange={(v) => setShowEditTask({ ...showEditTask, owner: v })}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {admins.map(admin => (
                                                <SelectItem key={admin._id} value={admin.name}>{admin.name}</SelectItem>
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
                                <div className="flex-1 px-3 py-2 bg-muted/50 rounded-lg border text-sm">
                                    {selectedClient.company}
                                </div>
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
        </div>
    );
};

export default AdminClientsTab;
