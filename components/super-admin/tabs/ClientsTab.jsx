"use client";
import { useState, useMemo } from "react";
import {
    Plus, Eye, X, Mail, Phone, Building2, CreditCard,
    CheckSquare, StickyNote, Edit, Save, Calendar, User,
    Filter, ChevronDown, ChevronUp, Clock, ArrowLeft, UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample Data
const clientsData = [
    {
        id: 1,
        name: "John Doe",
        company: "TechGadgets Co",
        email: "john@techgadgets.com",
        phone: "+1 (555) 123-4567",
        plan: "Premium",
        activeTasks: 3,
        status: "active",
        joinDate: "Oct 15, 2025",
        manager: "Sarah Mitchell",
        salesManager: "David Sales",
        spCentralRequestId: "REQ-1001",
        marketplace: "Amazon US",
        userPermission: "Full Access",
        accountAccessUrl: "https://sellercentral.amazon.com",
        leadSource: "LinkedIn",
        listingManager: "Emily Listings"
    },
    { id: 2, name: "Emily Smith", company: "BeautyBrand Inc", email: "emily@beautybrand.com", phone: "+1 (555) 234-5678", plan: "Platinum", activeTasks: 2, status: "active", joinDate: "Nov 20, 2025", manager: "Sarah Mitchell" },
    { id: 3, name: "Michael Brown", company: "HomeEssentials", email: "michael@homeessentials.com", phone: "+1 (555) 345-6789", plan: "Elite", activeTasks: 1, status: "active", joinDate: "Dec 5, 2025", manager: "John Anderson" },
    { id: 4, name: "Lisa Chen", company: "Fashion Forward", email: "lisa@fashion.com", phone: "+1 (555) 456-7890", plan: "Platinum", activeTasks: 0, status: "pending", joinDate: "Jan 2, 2026", manager: "Unassigned" },
    { id: 5, name: "Robert Kim", company: "Tech Innovators", email: "robert@tech.com", phone: "+1 (555) 567-8901", plan: "Elite", activeTasks: 2, status: "active", joinDate: "Dec 15, 2025", manager: "John Anderson" },
    { id: 6, name: "Amanda White", company: "Sports Gear Pro", email: "amanda@sports.com", phone: "+1 (555) 678-9012", plan: "Premium", activeTasks: 1, status: "active", joinDate: "Nov 30, 2025", manager: "Emma Wilson" },
];

const tasksData = [
    { id: 1, title: "PPC Campaign Setup", clientId: 1, service: "PPC Management", priority: "High", status: "in-progress", dueDate: "Jan 25, 2026", owner: "Sarah Mitchell", description: "Set up and optimize PPC campaigns for product launch", planForWeek: "this-week", reminder: true, isHighPriority: true, isCompleted: false },
    { id: 2, title: "Listing Optimization - Product A", clientId: 1, service: "Catalog Management", priority: "Medium", status: "completed", dueDate: "Jan 20, 2026", owner: "Sarah Mitchell", description: "Optimize product listings for better visibility", planForWeek: "none", reminder: false, isHighPriority: false, isCompleted: true },
    { id: 3, title: "A+ Content Design - Product B", clientId: 2, service: "A+ Content", priority: "Medium", status: "in-progress", dueDate: "Jan 28, 2026", owner: "Sarah Mitchell", description: "Design A+ content for product B", planForWeek: "next-week", reminder: true, isHighPriority: false, isCompleted: false },
    { id: 4, title: "Brand Registry Application", clientId: 3, service: "Brand Registry", priority: "High", status: "pending", dueDate: "Feb 1, 2026", owner: "John Anderson", description: "Apply for Amazon Brand Registry", planForWeek: "this-week", reminder: true, isHighPriority: true, isCompleted: false },
    { id: 5, title: "Competitor Analysis Report", clientId: 1, service: "Account Management", priority: "Low", status: "completed", dueDate: "Jan 14, 2026", owner: "Sarah Mitchell", description: "Analyze top competitors and provide recommendations", planForWeek: "none", reminder: false, isHighPriority: false, isCompleted: true },
    { id: 6, title: "Product Photography Review", clientId: 5, service: "Catalog Management", priority: "Medium", status: "in-progress", dueDate: "Jan 30, 2026", owner: "John Anderson", description: "Review and approve product photography", planForWeek: "this-week", reminder: true, isHighPriority: false, isCompleted: false },
    { id: 7, title: "Advertising Strategy", clientId: 6, service: "PPC Management", priority: "High", status: "pending", dueDate: "Feb 5, 2026", owner: "Emma Wilson", description: "Develop Q1 advertising strategy", planForWeek: "next-week", reminder: true, isHighPriority: true, isCompleted: false },
];

const notesData = [
    { id: 1, clientId: 1, author: "Sarah Mitchell", date: "Jan 18, 2026", content: "Client requested priority on PPC campaigns. Discussed budget allocation for Q1." },
    { id: 2, clientId: 1, author: "John Anderson", date: "Jan 15, 2026", content: "Completed initial consultation. Client has 50 SKUs to optimize." },
    { id: 3, clientId: 2, author: "Sarah Mitchell", date: "Jan 16, 2026", content: "Client wants focus on beauty category. Seasonal campaigns discussed." },
    { id: 4, clientId: 3, author: "John Anderson", date: "Jan 10, 2026", content: "Brand registry documents received. Processing application." },
    { id: 5, clientId: 5, author: "John Anderson", date: "Jan 12, 2026", content: "Client expanding to EU markets. Need to prepare localized content." },
    { id: 6, clientId: 6, author: "Emma Wilson", date: "Jan 14, 2026", content: "Sports equipment line launching in February. High priority." },
];

const managers = ["Sarah Mitchell", "John Anderson", "Emma Wilson"];

// Generate week numbers 1-52
const weekNumbers = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Week ${i + 1}`
}));

const SuperAdminClientsTab = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeView, setActiveView] = useState("tasks"); // "tasks" or "notes"
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(null);
    const [showAddNote, setShowAddNote] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // List filters
    const [planFilter, setPlanFilter] = useState("all");
    const [managerFilter, setManagerFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Task filters
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
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


    // Mail Form State
    const [showMailForm, setShowMailForm] = useState(false);
    const [mailSubject, setMailSubject] = useState("");
    const [mailBody, setMailBody] = useState("");

    // Add Client State
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientData, setNewClientData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        plan: "Premium",
        manager: "Unassigned",
        salesManager: "",
        spCentralRequestId: "",
        marketplace: "",
        userPermission: "",
        accountAccessUrl: "",
        leadSource: "",
        listingManager: ""
    });

    // Edit Client State
    const [showEditClient, setShowEditClient] = useState(false);
    const [editClientData, setEditClientData] = useState(null);

    // New note
    const [newNote, setNewNote] = useState("");

    // Filter clients
    const filteredClients = useMemo(() => {
        return clientsData.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPlan = planFilter === "all" || client.plan.toLowerCase() === planFilter;
            const matchesManager = managerFilter === "all" ||
                (managerFilter === "unassigned" && client.manager === "Unassigned") ||
                client.manager === managerFilter;
            const matchesStatus = statusFilter === "all" || client.status === statusFilter;
            return matchesSearch && matchesPlan && matchesManager && matchesStatus;
        });
    }, [searchQuery, planFilter, managerFilter, statusFilter]);

    // Get tasks for selected client
    const clientTasks = useMemo(() => {
        if (!selectedClient) return [];
        let tasks = tasksData.filter(task => task.clientId === selectedClient.id);

        if (taskStatusFilter !== "all") {
            tasks = tasks.filter(t => t.status === taskStatusFilter);
        }
        if (priorityFilter !== "all") {
            tasks = tasks.filter(t => t.priority.toLowerCase() === priorityFilter);
        }
        if (ownerFilter !== "all") {
            tasks = tasks.filter(t => t.owner === ownerFilter);
        }

        return tasks;
    }, [selectedClient, taskStatusFilter, priorityFilter, ownerFilter]);

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
        setShowEditClient(false);
        setEditClientData(null);
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
        console.log(`Sending mail to ${selectedClient.email} from Super Admin`);
        console.log("Subject:", mailSubject);
        console.log("Body:", mailBody);
        setShowMailForm(false);
        setMailSubject("");
        setMailBody("");
    };

    const handleAddClient = () => {
        console.log("Adding new client:", newClientData);
        setShowAddClient(false);
        // Reset form
        setNewClientData({
            name: "",
            company: "",
            email: "",
            phone: "",
            plan: "Premium",
            manager: "Unassigned",
            salesManager: "",
            spCentralRequestId: "",
            marketplace: "",
            userPermission: "",
            accountAccessUrl: "",
            leadSource: "",
            listingManager: ""
        });
    };

    const handleEditClick = () => {
        setEditClientData({ ...selectedClient });
        setShowEditClient(true);
    };

    const handleSaveClient = () => {
        console.log("Saving client updates:", editClientData);
        // Mock update
        const updatedClient = { ...selectedClient, ...editClientData };
        setSelectedClient(updatedClient);
        setShowEditClient(false);
    };

    // Client List View
    if (!selectedClient) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-heading text-2xl font-bold mb-2">Clients</h1>
                        <p className="text-muted-foreground">Manage all clients and their assignments.</p>
                    </div>
                    <Button onClick={() => setShowAddClient(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <Input
                        placeholder="Search clients..."
                        className="w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={managerFilter} onValueChange={setManagerFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Managers</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {managers.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clients Table */}
                <div className="bg-card rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Assigned Manager</TableHead>
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
                                    <TableCell>
                                        <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                                            {client.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {client.manager === "Unassigned" ? (
                                            <Badge variant="outline" className="border-destructive text-destructive">
                                                Unassigned
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">{client.manager}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{client.activeTasks}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === "active" ? "default" : "outline"}
                                            className={client.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}>
                                            {client.status === "active" ? "Active" : "Pending"}
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

                {/* Add Client Modal (List View) */}
                {
                    showAddClient && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddClient(false)}>
                            <div className="bg-card rounded-xl border p-6 w-full max-w-4xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-heading font-semibold text-lg">Add New Client</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAddClient(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Core Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium border-b pb-2">Core Information</h4>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Contact Name</label>
                                            <Input value={newClientData.name} onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })} placeholder="e.g. John Doe" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Company Name</label>
                                            <Input value={newClientData.company} onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })} placeholder="e.g. Tech Corp" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <Input type="email" value={newClientData.email} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} placeholder="john@example.com" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input value={newClientData.phone} onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Plan</label>
                                            <Select value={newClientData.plan} onValueChange={(v) => setNewClientData({ ...newClientData, plan: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                                    <SelectItem value="Premium">Premium</SelectItem>
                                                    <SelectItem value="Elite">Elite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Assigned Manager</label>
                                            <Select value={newClientData.manager} onValueChange={(v) => setNewClientData({ ...newClientData, manager: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                    {managers.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium border-b pb-2">Additional Details</h4>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Sales Manager</label>
                                            <Input value={newClientData.salesManager} onChange={(e) => setNewClientData({ ...newClientData, salesManager: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">SP Central Request ID</label>
                                            <Input value={newClientData.spCentralRequestId} onChange={(e) => setNewClientData({ ...newClientData, spCentralRequestId: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Marketplace</label>
                                            <Input value={newClientData.marketplace} onChange={(e) => setNewClientData({ ...newClientData, marketplace: e.target.value })} placeholder="e.g. Amazon US" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">User Permission</label>
                                            <Input value={newClientData.userPermission} onChange={(e) => setNewClientData({ ...newClientData, userPermission: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Account Access URL</label>
                                            <Input value={newClientData.accountAccessUrl} onChange={(e) => setNewClientData({ ...newClientData, accountAccessUrl: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Lead Source</label>
                                            <Input value={newClientData.leadSource} onChange={(e) => setNewClientData({ ...newClientData, leadSource: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Listing Manager</label>
                                            <Input value={newClientData.listingManager} onChange={(e) => setNewClientData({ ...newClientData, listingManager: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setShowAddClient(false)}>Cancel</Button>
                                    <Button onClick={handleAddClient}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Client
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
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
                        onClick={handleEditClick}
                    >
                        <UserCog className="h-4 w-4 mr-1" />
                        Edit
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
                                    <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
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

                            {/* Create Task Form - No "Related To" since client is already selected */}
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
                                <UserCog className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {selectedClient.manager === "Unassigned" ? (
                                        <Badge variant="outline" className="border-destructive text-destructive">Unassigned</Badge>
                                    ) : selectedClient.manager}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined {selectedClient.joinDate}</span>
                            </div>

                            {/* Extended Details */}
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
                                <Input value="Super Admin (admin@company.com)" disabled className="bg-muted" />
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


            {/* Edit Client Modal */}
            {showEditClient && editClientData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditClient(false)}>
                    <div className="bg-card rounded-xl border p-6 w-full max-w-4xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-lg">Edit Client: {editClientData.name}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowEditClient(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Core Info */}
                            <div className="space-y-4">
                                <h4 className="font-medium border-b pb-2">Core Information</h4>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Contact Name</label>
                                    <Input value={editClientData.name} onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input value={editClientData.company} onChange={(e) => setEditClientData({ ...editClientData, company: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input type="email" value={editClientData.email} onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input value={editClientData.phone} onChange={(e) => setEditClientData({ ...editClientData, phone: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Plan</label>
                                    <Select value={editClientData.plan} onValueChange={(v) => setEditClientData({ ...editClientData, plan: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Platinum">Platinum</SelectItem>
                                            <SelectItem value="Premium">Premium</SelectItem>
                                            <SelectItem value="Elite">Elite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Assigned Manager</label>
                                    <Select value={editClientData.manager || "Unassigned"} onValueChange={(v) => setEditClientData({ ...editClientData, manager: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unassigned">Unassigned</SelectItem>
                                            {managers.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-4">
                                <h4 className="font-medium border-b pb-2">Additional Details</h4>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Sales Manager</label>
                                    <Input value={editClientData.salesManager || ""} onChange={(e) => setEditClientData({ ...editClientData, salesManager: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">SP Central Request ID</label>
                                    <Input value={editClientData.spCentralRequestId || ""} onChange={(e) => setEditClientData({ ...editClientData, spCentralRequestId: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Marketplace</label>
                                    <Input value={editClientData.marketplace || ""} onChange={(e) => setEditClientData({ ...editClientData, marketplace: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">User Permission</label>
                                    <Input value={editClientData.userPermission || ""} onChange={(e) => setEditClientData({ ...editClientData, userPermission: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Account Access URL</label>
                                    <Input value={editClientData.accountAccessUrl || ""} onChange={(e) => setEditClientData({ ...editClientData, accountAccessUrl: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Lead Source</label>
                                    <Input value={editClientData.leadSource || ""} onChange={(e) => setEditClientData({ ...editClientData, leadSource: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Listing Manager</label>
                                    <Input value={editClientData.listingManager || ""} onChange={(e) => setEditClientData({ ...editClientData, listingManager: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowEditClient(false)}>Cancel</Button>
                            <Button onClick={handleSaveClient}>
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

export default SuperAdminClientsTab;
