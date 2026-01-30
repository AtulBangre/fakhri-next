// Team & Admin Management Collection
// Admin users
export const admins = [
    {
        id: 1,
        name: "Sarah Mitchell",
        email: "sarah@fakhriit.com",
        role: "Account Manager",
        team: "Marketing Team",
        clients: 3,
        enabled: true,
        joinedDate: "Jan 2024"
    },
    {
        id: 2,
        name: "John Anderson",
        email: "john@fakhriit.com",
        role: "Account Manager",
        team: "Marketing Team",
        clients: 4,
        enabled: true,
        joinedDate: "Mar 2024"
    },
    {
        id: 3,
        name: "Emma Wilson",
        email: "emma@fakhriit.com",
        role: "Senior Manager",
        team: "Enterprise Team",
        clients: 2,
        enabled: true,
        joinedDate: "Feb 2023"
    },
    {
        id: 4,
        name: "David Lee",
        email: "david@fakhriit.com",
        role: "Account Manager",
        team: "Enterprise Team",
        clients: 3,
        enabled: true,
        joinedDate: "Jun 2024"
    },
    {
        id: 5,
        name: "Michael Chen",
        email: "michael@fakhriit.com",
        role: "Team Lead",
        team: "Growth Team",
        clients: 3,
        enabled: false,
        joinedDate: "Sep 2023"
    },
];
// Teams
export const teams = [
    {
        id: 1,
        name: "Marketing Team",
        members: ["Sarah Mitchell", "John Anderson"],
        clientCount: 7,
        lead: "Sarah Mitchell"
    },
    {
        id: 2,
        name: "Enterprise Team",
        members: ["Emma Wilson", "David Lee"],
        clientCount: 5,
        lead: "Emma Wilson"
    },
    {
        id: 3,
        name: "Growth Team",
        members: ["Michael Chen"],
        clientCount: 3,
        lead: "Michael Chen"
    },
];
// Manager performance stats
export const managerStats = [
    { name: "Sarah Mitchell", clients: 3, activeTasks: 4, completed: 47 },
    { name: "John Anderson", clients: 4, activeTasks: 6, completed: 52 },
    { name: "Emma Wilson", clients: 2, activeTasks: 3, completed: 38 },
];
// Manager names list for dropdowns
export const managerNames = ["Sarah Mitchell", "John Anderson", "Emma Wilson", "David Lee", "Michael Chen"];
// Activity log
export const recentActivity = [
    { action: "Task completed", user: "Sarah Mitchell", task: "Listing Optimization", time: "2 hours ago" },
    { action: "Status updated", user: "John Anderson", task: "PPC Campaign Setup", time: "5 hours ago" },
    { action: "File uploaded", user: "Emma Wilson", task: "Account Audit", time: "1 day ago" },
];
// Current logged-in admin profile (mock)
export const currentAdmin = {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah@fakhriit.com",
    role: "Account Manager",
    team: "Marketing Team",
    clients: 3,
    enabled: true,
    joinedDate: "Jan 2024"
};
// Admin stats for profile
export const adminProfileStats = {
    assignedClients: 3,
    tasksCompleted: 47,
    clientSatisfaction: "98%"
};
