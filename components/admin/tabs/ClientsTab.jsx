"use client";
import { useState, useMemo } from "react";
import {
    Plus, Eye, X, Mail, Phone, Building2, CreditCard,
    CheckSquare, StickyNote, Edit, Save, Calendar, User,
    Filter, ChevronDown, ChevronUp, Clock, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { clientsData, tasksData, notesData, managers } from "@/data/admin-clients";

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const AdminClientsTab = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeView, setActiveView] = useState("tasks");
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);
    const [showAddNote, setShowAddNote] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Task filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [ownerFilter, setOwnerFilter] = useState("all");

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

    // Filter clients
    const filteredClients = useMemo(() => {
        return clientsData.filter(client =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Get tasks for selected client
    const clientTasks = useMemo(() => {
        if (!selectedClient) return [];
        let tasks = tasksData.filter(task => task.clientId === selectedClient.id);

        if (statusFilter !== "all") {
            tasks = tasks.filter(t => t.status === statusFilter);
        }
        if (priorityFilter !== "all") {
            tasks = tasks.filter(t => t.priority.toLowerCase() === priorityFilter);
        }
        if (ownerFilter !== "all") {
            tasks = tasks.filter(t => t.owner === ownerFilter);
        }

        return tasks;
    }, [selectedClient, statusFilter, priorityFilter, ownerFilter]);

    // Get notes for selected client
    const clientNotes = useMemo(() => {
        if (!selectedClient) return [];
        return notesData.filter(note => note.clientId === selectedClient.id);
    }, [selectedClient]);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setActiveView("tasks");
        setShowCreateTask(false);
        setShowEditTask(null);
        setShowAddNote(false);
    };

    const handleBackToList = () => {
        setSelectedClient(null);
        setActiveView("tasks");
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

    const handleCreateTask = () => {
        console.log("Creating task for client:", selectedClient.name, newTask);
        setShowCreateTask(false);
        resetNewTaskForm();
    };

    const handleAddNote = () => {
        console.log("Adding note:", newNote);
        setShowAddNote(false);
        setNewNote("");
    };

    const handleSendMail = () => {
        console.log(`Sending mail to ${selectedClient.email} from Manager`);
        console.log("Subject:", mailSubject);
        console.log("Body:", mailBody);
        setShowMailForm(false);
        setMailSubject("");
        setMailBody("");
    };

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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
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
                                            {managers.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
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
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientTasks.length > 0 ? clientTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">{task.service}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{task.owner}</TableCell>
                                                <TableCell>
                                                    <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select defaultValue={task.status}>
                                                        <SelectTrigger className="w-[130px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setShowEditTask(task)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
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
                                    {tasksData.filter(t => t.clientId === selectedClient.id && t.status === "in-progress").length}
                                </p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                            <div className="p-3 bg-gray-500/10 rounded-lg">
                                <p className="text-xl font-bold text-gray-600">
                                    {tasksData.filter(t => t.clientId === selectedClient.id && t.status === "pending").length}
                                </p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <p className="text-xl font-bold text-green-600">
                                    {tasksData.filter(t => t.clientId === selectedClient.id && t.status === "completed").length}
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
                                <div className="flex-1 px-3 py-2 bg-muted/50 rounded-lg border text-sm">
                                    {selectedClient.company}
                                </div>
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

export default AdminClientsTab;
