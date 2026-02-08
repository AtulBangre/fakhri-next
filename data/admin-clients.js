export const clientsData = [
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
        salesManager: "David Sales",
        spCentralRequestId: "REQ-1001",
        marketplace: "Amazon US",
        userPermission: "Full Access",
        accountAccessUrl: "https://sellercentral.amazon.com",
        leadSource: "LinkedIn",
        listingManager: "Emily Listings"
    },
    { id: 2, name: "Emily Smith", company: "BeautyBrand Inc", email: "emily@beautybrand.com", phone: "+1 (555) 234-5678", plan: "Platinum", activeTasks: 2, status: "active", joinDate: "Nov 20, 2025" },
    { id: 3, name: "Michael Brown", company: "HomeEssentials", email: "michael@homeessentials.com", phone: "+1 (555) 345-6789", plan: "Elite", activeTasks: 1, status: "active", joinDate: "Dec 5, 2025" },
];

export const tasksData = [
    { id: 1, title: "PPC Campaign Setup", clientId: 1, service: "PPC Management", priority: "High", status: "in-progress", dueDate: "Jan 25, 2026", owner: "Sarah Mitchell", description: "Set up and optimize PPC campaigns for product launch", planForWeek: "6", isHighPriority: true, isCompleted: false },
    { id: 2, title: "Listing Optimization - Product A", clientId: 1, service: "Catalog Management", priority: "Medium", status: "completed", dueDate: "Jan 20, 2026", owner: "Sarah Mitchell", description: "Optimize product listings for better visibility", planForWeek: "5", isHighPriority: false, isCompleted: true },
    { id: 3, title: "A+ Content Design - Product B", clientId: 2, service: "A+ Content", priority: "Medium", status: "in-progress", dueDate: "Jan 28, 2026", owner: "Sarah Mitchell", description: "Design A+ content for product B", planForWeek: "7", isHighPriority: false, isCompleted: false },
    { id: 4, title: "Brand Registry Application", clientId: 3, service: "Brand Registry", priority: "High", status: "pending", dueDate: "Feb 1, 2026", owner: "John Anderson", description: "Apply for Amazon Brand Registry", planForWeek: "6", isHighPriority: true, isCompleted: false },
    { id: 5, title: "Competitor Analysis Report", clientId: 1, service: "Account Management", priority: "Low", status: "completed", dueDate: "Jan 14, 2026", owner: "Sarah Mitchell", description: "Analyze top competitors and provide recommendations", planForWeek: "3", isHighPriority: false, isCompleted: true },
];

export const notesData = [
    { id: 1, clientId: 1, author: "Sarah Mitchell", date: "Jan 18, 2026", content: "Client requested priority on PPC campaigns. Discussed budget allocation for Q1." },
    { id: 2, clientId: 1, author: "John Anderson", date: "Jan 15, 2026", content: "Completed initial consultation. Client has 50 SKUs to optimize." },
    { id: 3, clientId: 2, author: "Sarah Mitchell", date: "Jan 16, 2026", content: "Client wants focus on beauty category. Seasonal campaigns discussed." },
    { id: 4, clientId: 3, author: "Emma Wilson", date: "Jan 10, 2026", content: "Brand registry documents received. Processing application." },
];

export const managers = ["Sarah Mitchell", "John Anderson", "Emma Wilson"];
