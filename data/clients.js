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
        joinedDate: "Jan 15, 2026",
        // Extended fields for admin dashboard
        salesManager: "David Sales",
        spCentralRequestId: "REQ-1001",
        marketplace: "Amazon US",
        userPermission: "Full Access",
        accountAccessUrl: "https://sellercentral.amazon.com",
        leadSource: "LinkedIn",
        listingManager: "Emily Listings"
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

export const getClientsByManager = (managerName) => {
    return clients.filter(c => c.manager === managerName);
};

export const getUnassignedClients = () => {
    return clients.filter(c => c.manager === "Unassigned");
};
