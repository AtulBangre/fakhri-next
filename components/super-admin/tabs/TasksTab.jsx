"use client";
import { useState, useMemo } from "react";
import { Plus, Eye, Upload, Edit, Clock, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const clients = [
    { id: 1, name: "John Doe", company: "TechGadgets Co" },
    { id: 2, name: "Emily Smith", company: "BeautyBrand Inc" },
    { id: 3, name: "Michael Brown", company: "HomeEssentials" },
    { id: 4, name: "Robert Kim", company: "Tech Innovators" },
    { id: 5, name: "Amanda White", company: "Sports Gear Pro" },
];

const tasksData = [
    { id: 1, title: "PPC Campaign Setup", client: "John Doe", clientId: 1, manager: "Sarah Mitchell", service: "PPC Management", priority: "High", status: "in-progress", dueDate: "Jan 25, 2026", lastUpdated: "2 hours ago", description: "Set up and optimize PPC campaigns", planForWeek: "this-week", reminder: true, isHighPriority: true, isCompleted: false },
    { id: 2, title: "A+ Content Design", client: "Emily Smith", clientId: 2, manager: "Sarah Mitchell", service: "A+ Content", priority: "Medium", status: "in-progress", dueDate: "Jan 28, 2026", lastUpdated: "5 hours ago", description: "Design A+ content", planForWeek: "next-week", reminder: true, isHighPriority: false, isCompleted: false },
    { id: 3, title: "Brand Registry", client: "Michael Brown", clientId: 3, manager: "Sarah Mitchell", service: "Brand Registry", priority: "High", status: "pending", dueDate: "Feb 1, 2026", lastUpdated: "1 day ago", description: "Apply for brand registry", planForWeek: "this-week", reminder: true, isHighPriority: true, isCompleted: false },
    { id: 4, title: "Listing Optimization", client: "Robert Kim", clientId: 4, manager: "John Anderson", service: "Catalog", priority: "Low", status: "completed", dueDate: "Jan 20, 2026", lastUpdated: "2 days ago", description: "Optimize product listings", planForWeek: "none", reminder: false, isHighPriority: false, isCompleted: true },
    { id: 5, title: "Account Audit", client: "Amanda White", clientId: 5, manager: "Emma Wilson", service: "Account Management", priority: "Medium", status: "completed", dueDate: "Jan 18, 2026", lastUpdated: "4 days ago", description: "Perform account audit", planForWeek: "none", reminder: false, isHighPriority: false, isCompleted: true },
];

const managers = ["Sarah Mitchell", "John Anderson", "Emma Wilson"];

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const SuperAdminTasksTab = () => {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

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
        return tasksData.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.client.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || task.status === statusFilter;
            const matchesManager = managerFilter === "all" || task.manager.includes(managerFilter.split(' ')[0] || managerFilter);
            const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter;
            return matchesSearch && matchesStatus && matchesManager && matchesPriority;
        });
    }, [searchQuery, statusFilter, managerFilter, priorityFilter]);

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

    const handleCreateTask = () => {
        console.log("Creating task:", newTask);
        setShowCreateTask(false);
        resetNewTaskForm();
    };

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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
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
                            <TableHead>Manager</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.service}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{task.client}</TableCell>
                                <TableCell className="text-muted-foreground">{task.manager}</TableCell>
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
                                        <p className="text-sm">{task.dueDate}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.lastUpdated}
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Audit Log Preview */}
            <div className="bg-card rounded-xl border p-6">
                <h3 className="font-heading font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[
                        { action: "Task completed", user: "Sarah Mitchell", task: "Listing Optimization", time: "2 hours ago" },
                        { action: "Status updated", user: "John Anderson", task: "PPC Campaign Setup", time: "5 hours ago" },
                        { action: "File uploaded", user: "Emma Wilson", task: "Account Audit", time: "1 day ago" },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                    {log.user.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm"><span className="font-medium">{log.user}</span> - {log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.task}</p>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                    ))}
                </div>
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
                                    <Select defaultValue={showEditTask.manager}>
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

export default SuperAdminTasksTab;
