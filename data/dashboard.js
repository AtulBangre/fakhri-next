// Dashboard Data Collection (computed/aggregated data)
// Super Admin Dashboard Stats
export const superAdminStats = [
    {
        title: "Total Clients",
        value: 156,
        icon: "Users",
        trend: { value: "+12 this month", positive: true }
    },
    {
        title: "Active Plans",
        value: 142,
        icon: "CheckSquare"
    },
    {
        title: "Total Revenue",
        value: "$285K",
        icon: "DollarSign",
        trend: { value: "+18% vs last month", positive: true }
    },
    {
        title: "Unassigned Clients",
        value: 1,
        icon: "AlertTriangle"
    },
];
// Admin Dashboard Stats
export const adminDashboardStats = {
    totalClients: 3,
    activeTasks: 4,
    pendingTasks: 1,
    completedThisWeek: 8
};
// Client Dashboard Info
export const clientDashboardInfo = {
    clientName: "John",
    activePlan: "Premium",
    planValidUntil: "Mar 15, 2026",
    activeTasks: 3,
    completedTasks: 12,
    accountManager: {
        name: "Sarah Mitchell",
        role: "Senior Account Manager",
        email: "sarah@fakhriit.com",
        initials: "SM"
    }
};
// Plan details for client
export const clientPlanDetails = {
    name: "Premium",
    price: 1999,
    startDate: "Dec 15, 2025",
    validUntil: "Mar 15, 2026",
    daysRemaining: 52
};
// Billing summary
export const billingSummary = {
    currentPlan: "Premium",
    monthlyRate: 1999,
    nextPaymentDate: "Feb 15, 2026",
    nextPaymentAmount: 1999,
    totalPaid: 5997,
    invoiceCount: 3,
    paymentMethod: {
        type: "VISA",
        last4: "4242",
        expiry: "12/2027"
    }
};
// Recent clients for super admin
export const recentClients = [
    { id: 1, name: "Alex Turner", company: "Digital Goods LLC", plan: "Premium", assignedTo: "Sarah Mitchell", date: "Jan 20, 2026" },
    { id: 2, name: "Lisa Chen", company: "Fashion Forward", plan: "Platinum", assignedTo: "Unassigned", date: "Jan 19, 2026" },
    { id: 3, name: "Robert Kim", company: "Tech Innovators", plan: "Elite", assignedTo: "John Anderson", date: "Jan 18, 2026" },
];
