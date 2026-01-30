// Clients Collection
// Master client list
export const clients = [
    {
        id: 1,
        name: "John Doe",
        company: "TechGadgets Co",
        email: "john@techgadgets.com",
        phone: "+1 (555) 123-4567",
        plan: "Premium",
        activeTasks: 3,
        status: "active",
        manager: "Sarah Mitchell",
        joinedDate: "Jan 15, 2026"
    },
    {
        id: 2,
        name: "Emily Smith",
        company: "BeautyBrand Inc",
        email: "emily@beautybrand.com",
        phone: "+1 (555) 234-5678",
        plan: "Platinum",
        activeTasks: 2,
        status: "active",
        manager: "Sarah Mitchell",
        joinedDate: "Dec 20, 2025"
    },
    {
        id: 3,
        name: "Michael Brown",
        company: "HomeEssentials",
        email: "michael@homeessentials.com",
        phone: "+1 (555) 345-6789",
        plan: "Elite",
        activeTasks: 1,
        status: "active",
        manager: "Sarah Mitchell",
        joinedDate: "Jan 10, 2026"
    },
    {
        id: 4,
        name: "Lisa Chen",
        company: "Fashion Forward",
        email: "lisa@fashion.com",
        plan: "Platinum",
        phone: "+1 (555) 456-7890",
        activeTasks: 0,
        status: "pending",
        manager: "Unassigned",
        joinedDate: "Jan 19, 2026"
    },
    {
        id: 5,
        name: "Robert Kim",
        company: "Tech Innovators",
        email: "robert@tech.com",
        phone: "+1 (555) 567-8901",
        plan: "Elite",
        activeTasks: 2,
        status: "active",
        manager: "John Anderson",
        joinedDate: "Jan 18, 2026"
    },
    {
        id: 6,
        name: "Amanda White",
        company: "Sports Gear Pro",
        email: "amanda@sports.com",
        phone: "+1 (555) 678-9012",
        plan: "Premium",
        activeTasks: 1,
        status: "active",
        manager: "Emma Wilson",
        joinedDate: "Jan 5, 2026"
    },
    {
        id: 7,
        name: "Alex Turner",
        company: "Digital Goods LLC",
        email: "alex@digitalgoods.com",
        phone: "+1 (555) 789-0123",
        plan: "Premium",
        activeTasks: 2,
        status: "active",
        manager: "Sarah Mitchell",
        joinedDate: "Jan 20, 2026"
    },
];
// All tasks across the platform
export const allTasks = [
    {
        id: 1,
        title: "PPC Campaign Setup",
        client: "John Doe",
        manager: "Sarah Mitchell",
        service: "PPC Management",
        priority: "High",
        status: "in-progress",
        eta: "Jan 25, 2026",
        lastUpdated: "2 hours ago"
    },
    {
        id: 2,
        title: "A+ Content Design - Product B",
        client: "Emily Smith",
        manager: "Sarah Mitchell",
        service: "A+ Content",
        priority: "Medium",
        status: "in-progress",
        eta: "Jan 28, 2026",
        lastUpdated: "5 hours ago"
    },
    {
        id: 3,
        title: "Brand Registry Application",
        client: "Michael Brown",
        manager: "Sarah Mitchell",
        service: "Brand Registry",
        priority: "High",
        status: "pending",
        eta: "Feb 1, 2026",
        lastUpdated: "1 day ago"
    },
    {
        id: 4,
        title: "Listing Optimization - Product A",
        client: "John Doe",
        manager: "Sarah Mitchell",
        service: "Catalog Management",
        priority: "Low",
        status: "completed",
        eta: "Jan 20, 2026",
        completedDate: "Jan 19, 2026",
        lastUpdated: "2 days ago"
    },
    {
        id: 5,
        title: "Competitor Analysis Report",
        client: "John Doe",
        manager: "Sarah Mitchell",
        service: "Account Management",
        priority: "Low",
        status: "completed",
        eta: "Jan 15, 2026",
        completedDate: "Jan 14, 2026",
        lastUpdated: "5 days ago"
    },
    {
        id: 6,
        title: "Backend Search Terms Update",
        client: "Emily Smith",
        manager: "Sarah Mitchell",
        service: "Catalog Management",
        priority: "Medium",
        status: "completed",
        eta: "Jan 12, 2026",
        completedDate: "Jan 12, 2026",
        lastUpdated: "7 days ago"
    },
    {
        id: 7,
        title: "Listing Optimization",
        client: "Robert Kim",
        manager: "John Anderson",
        service: "Catalog",
        priority: "Low",
        status: "completed",
        eta: "Jan 20, 2026",
        lastUpdated: "2 days ago"
    },
    {
        id: 8,
        title: "Account Audit",
        client: "Amanda White",
        manager: "Emma Wilson",
        service: "Account Management",
        priority: "Medium",
        status: "completed",
        eta: "Jan 18, 2026",
        lastUpdated: "4 days ago"
    },
];
// Files collection
export const files = [
    {
        id: 1,
        name: "Product A - A+ Content Final.pdf",
        client: "John Doe",
        type: "pdf",
        size: "2.4 MB",
        version: "v2.0",
        uploadedBy: "Sarah Mitchell",
        date: "Jan 19, 2026"
    },
    {
        id: 2,
        name: "PPC Campaign Report - Week 3.xlsx",
        client: "John Doe",
        type: "excel",
        size: "856 KB",
        version: "v1.0",
        uploadedBy: "Sarah Mitchell",
        date: "Jan 18, 2026"
    },
    {
        id: 3,
        name: "Product Images - Main.zip",
        client: "Emily Smith",
        type: "image",
        size: "15.2 MB",
        version: "v2.0",
        uploadedBy: "Design Team",
        date: "Jan 15, 2026"
    },
    {
        id: 4,
        name: "Competitor Analysis Report.pdf",
        client: "John Doe",
        type: "pdf",
        size: "1.8 MB",
        version: "v1.0",
        uploadedBy: "Sarah Mitchell",
        date: "Jan 14, 2026"
    },
    {
        id: 5,
        name: "Brand Guidelines.pdf",
        client: "Emily Smith",
        type: "pdf",
        size: "4.2 MB",
        version: "v1.0",
        uploadedBy: "Design Team",
        date: "Jan 10, 2026"
    },
];
// Client invoices
export const invoices = [
    {
        id: "INV-2026-001",
        date: "Jan 15, 2026",
        amount: "$1,999.00",
        status: "paid",
        dueDate: "Jan 15, 2026"
    },
    {
        id: "INV-2025-012",
        date: "Dec 15, 2025",
        amount: "$1,999.00",
        status: "paid",
        dueDate: "Dec 15, 2025"
    },
    {
        id: "INV-2025-011",
        date: "Nov 15, 2025",
        amount: "$1,999.00",
        status: "paid",
        dueDate: "Nov 15, 2025"
    },
];
// Client notifications
export const clientNotifications = [
    { id: 1, message: "Your PPC campaign has been optimized", time: "2 hours ago" },
    { id: 2, message: "New file uploaded: Product Images v2", time: "5 hours ago" },
    { id: 3, message: "Account health check completed", time: "1 day ago" },
];
// Helper functions to filter data
export const getClientsByManager = (managerName) => {
    return clients.filter(c => c.manager === managerName);
};
export const getTasksByClient = (clientName) => {
    return allTasks.filter(t => t.client === clientName);
};
export const getTasksByManager = (managerName) => {
    return allTasks.filter(t => t.manager === managerName);
};
export const getFilesByClient = (clientName) => {
    return files.filter(f => f.client === clientName);
};
export const getUnassignedClients = () => {
    return clients.filter(c => c.manager === "Unassigned");
};
