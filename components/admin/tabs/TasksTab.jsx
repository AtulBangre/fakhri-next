"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Eye, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskDetailsDialog from "@/components/dashboard/TaskDetailsDialog";
import { getClients, getTasks, upsertTask, deleteTask, getTeamMembers } from "@/lib/actions/admin";
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



const AdminTasksTab = ({ currentUser }) => {
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);
    const [showViewTask, setShowViewTask] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const fetchTasks = async () => {
        if (!currentUser) return;

        // Don't set loading true here to avoid flickering, or maybe just for table?
        // User said "refresh the table". If we set loading=true, the whole component replaces with spinner (line 267).
        // Better to separate initial loading from refresh loading?
        // Or just let it be fast.

        try {
            const [c, team] = await Promise.all([
                getClients(currentUser.role === 'super-admin' ? {} : { managerId: currentUser._id }),
                getTeamMembers()
            ]);

            const clientIds = c.map(client => client._id);

            // Fetch tasks assigned to me OR tasks for my clients
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
            const uniqueTasks = Array.from(new Map(t.map(item => [String(item._id || item.id), item])).values());

            // Ensure clients have id property for consistency
            setClients(uniqueClients.map(client => ({ ...client, id: client._id })));
            setTeamMembers(team);
            setTasks(uniqueTasks);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to refresh tasks");
        }
    };

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            fetchTasks().finally(() => setLoading(false));
        }
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
        owner: currentUser?.name || "Admin",
        ownerId: currentUser?._id,
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
            const matchesStatus = statusFilter === "all" || task.status?.toLowerCase() === statusFilter.toLowerCase();
            const matchesClient = clientFilter === "all" || task.client?.name?.toLowerCase().includes(clientFilter.toLowerCase());
            const matchesPriority = priorityFilter === "all" || task.priority?.toLowerCase() === priorityFilter.toLowerCase();
            return matchesStatus && matchesClient && matchesPriority;
        });
    }, [statusFilter, clientFilter, priorityFilter, tasks]);

    const resetNewTaskForm = () => {
        setNewTask({
            title: "",
            owner: currentUser?.name || "Admin",
            ownerId: currentUser?._id,
            dueDate: "",
            planForWeek: getCurrentWeek(),
            relatedTo: "",
            description: "",
            isHighPriority: false,
            isCompleted: false
        });
    };

    // Auto-select manager when client is selected
    const handleClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        // Don't auto-reset owner if already set manually, or do? 
        // Current logic: updates owner to currentUser. Let's keep it but maybe we shouldn't purely override if user selected someone else?
        // Actually, let's NOT override owner here to allow user flexibility.
        // let updates = { relatedTo: clientId, owner: currentUser.name };
        let updates = { relatedTo: clientId };
        setNewTask(prev => ({ ...prev, ...updates }));
    };

    // Auto-select manager when client is selected in Edit Task
    const handleEditClientChange = (clientId) => {
        const client = clients.find(c => c.id.toString() === clientId);
        let updates = { relatedTo: clientId };
        setShowEditTask(prev => ({ ...prev, ...updates }));
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.relatedTo) {
            toast.error("Task title and client are required");
            return;
        }

        const selectedClient = clients.find(c => c.id.toString() === newTask.relatedTo);
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
                    id: newTask.ownerId || currentUser._id
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
                    id: showEditTask.assignee?.id || showEditTask.ownerId || currentUser._id
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
                toast.success("Task deleted");
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting task");
        }
    };


    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!currentUser) {
        return <div className="p-6 text-center text-muted-foreground">User information not available.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Tasks</h1>
                    <p className="text-muted-foreground">Manage tasks for your clients.</p>
                </div>
                <Button onClick={() => setShowCreateTask(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
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

            {/* Create Task Form - With "Related To" dropdown */}
            {showCreateTask && (
                <div className="bg-card rounded-xl border p-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-semibold text-lg">Task Information</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground mr-1">Owner:</span>
                                <Select
                                    value={newTask.ownerId}
                                    onValueChange={(id) => {
                                        const member = teamMembers.find(m => m._id === id);
                                        if (member) {
                                            setNewTask(prev => ({ ...prev, ownerId: id, owner: member.name }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-sm">
                                        <SelectValue placeholder={newTask.owner} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map(member => (
                                            <SelectItem key={member._id} value={member._id}>{member.name}</SelectItem>
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
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.company}</SelectItem>
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
                            <TableHead>Owner</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        ) : filteredTasks.map((task, index) => (
                            <TableRow key={task._id ? `${task._id}-${index}` : index}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.category || 'General'}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{task.client?.name || task.client}</TableCell>
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
                                <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => setShowViewTask(task)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            const normalizedTask = {
                                                ...task,
                                                relatedTo: (task.clientId || task.client?.id)?.toString(),
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
                        ))}
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
                                    <span className="text-sm text-muted-foreground mr-1">Owner:</span>
                                    <Select
                                        value={showEditTask.assignee?.id || showEditTask.ownerId || ""}
                                        onValueChange={(id) => {
                                            const member = teamMembers.find(m => m._id === id);
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
                                        <SelectTrigger className="w-[180px] h-8 text-sm">
                                            <SelectValue placeholder={showEditTask.owner} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map(member => (
                                                <SelectItem key={member._id} value={member._id}>{member.name}</SelectItem>
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.company}</SelectItem>
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
        </div >
    );
};

export default AdminTasksTab;
