"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Eye, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, getTasks, upsertTask } from "@/lib/actions/admin";
import { toast } from "sonner";

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const managers = ["Sarah Mitchell", "John Anderson", "Emma Wilson"];

const AdminTasksTab = () => {
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [c, t] = await Promise.all([getClients(), getTasks()]);
                // Ensure clients have id property for consistency
                setClients(c.map(client => ({ ...client, id: client._id })));
                setTasks(t);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load tasks");
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
        owner: "Sarah Mitchell",
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
            owner: "Sarah Mitchell",
            dueDate: "",
            planForWeek: getCurrentWeek(),
            relatedTo: "",
            description: "",
            isHighPriority: false,
            isCompleted: false
        });
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.relatedTo) {
            toast.error("Task title and client are required");
            return;
        }

        const selectedClient = clients.find(c => c.id.toString() === newTask.relatedTo);

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
                    name: newTask.owner
                },
                owner: newTask.owner,
                dueDate: newTask.dueDate,
                planForWeek: newTask.planForWeek,
                taskId: `TSK-${Date.now().toString().slice(-6)}`
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
        }
    };


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
                                <span className="text-sm text-muted-foreground">Owner</span>
                                <Select value={newTask.owner} onValueChange={(v) => setNewTask({ ...newTask, owner: v })}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
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
                            <Select value={newTask.relatedTo} onValueChange={(v) => setNewTask({ ...newTask, relatedTo: v })}>
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
                        <Button onClick={handleCreateTask}>
                            <Save className="h-4 w-4 mr-1" />
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
                        ) : filteredTasks.map((task) => (
                            <TableRow key={task._id || task.id}>
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
                                    <Select defaultValue={task.status} disabled >
                                        <SelectTrigger className="w-[130px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="To Do">To Do</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
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
                                    <span className="text-sm text-muted-foreground">Owner</span>
                                    <Select defaultValue={showEditTask.owner}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
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
                                <Input className="flex-1" defaultValue={showEditTask.title} />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Due Date</label>
                                <Input type="date" className="flex-1" defaultValue="" />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right">Plan for the week</label>
                                <Select defaultValue={showEditTask.planForWeek || getCurrentWeek()}>
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
                                <Select defaultValue={showEditTask.clientId?.toString()}>
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
                                    defaultValue={showEditTask.description}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium w-32 text-right"></label>
                                <div className="flex-1 space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300"
                                            defaultChecked={showEditTask.isHighPriority}
                                        />
                                        <span className="text-sm">Mark as High Priority</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300"
                                            defaultChecked={showEditTask.isCompleted}
                                        />
                                        <span className="text-sm">Mark as completed</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowEditTask(null)}>Cancel</Button>
                            <Button onClick={() => setShowEditTask(null)}>
                                <Save className="h-4 w-4 mr-1" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasksTab;
