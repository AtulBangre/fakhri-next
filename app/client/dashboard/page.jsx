"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LayoutDashboard, CreditCard, CheckSquare, FileText, Receipt, User, Menu, X, LogOut, HelpCircle, Loader2 } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/client/WhatsAppButton";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications } from "@/lib/actions/notification";
import { getUsers, getUserByEmail, getUserById, updateUser } from "@/lib/actions/user";
import useNotificationPolling from "@/hooks/useNotificationPolling";

// Tabs
import ClientDashboardTab from "@/components/client/tabs/DashboardTab";
import ClientPlanTab from "@/components/client/tabs/PlanTab";
import ClientTasksTab from "@/components/client/tabs/TasksTab";
import ClientFilesTab from "@/components/client/tabs/FilesTab";
import ClientBillingTab from "@/components/client/tabs/BillingTab";
import ClientProfileTab from "@/components/client/tabs/ProfileTab";
import ClientSupportTab from "@/components/client/tabs/SupportTab";

const navigation = [
  { name: "Dashboard", id: "Dashboard", icon: LayoutDashboard },
  { name: "My Plan", id: "Plan", icon: CreditCard },
  { name: "Tasks", id: "Tasks", icon: CheckSquare },
  { name: "Files", id: "Files", icon: FileText },
  { name: "Billing", id: "Billing", icon: Receipt },
  { name: "Support", id: "Support", icon: HelpCircle },
  { name: "Profile", id: "Profile", icon: User },
];

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [managerPhone, setManagerPhone] = useState("");
  const [managerName, setManagerName] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch specific client: Alex
        let currentUser = await getUserByEmail('alex@digitalgoods.com');

        // Fallback or create if not exists
        if (!currentUser) {
          console.log("Alex not found, falling back to first client");
          const { users } = await getUsers({ role: 'client', limit: 1 });
          if (users && users.length > 0) {
            currentUser = users[0];
          }
        }

        if (currentUser) {
          setUser(currentUser);

          // Fetch the client's manager (admin) phone number for WhatsApp
          if (currentUser.managerId) {
            try {
              const managerUser = await getUserById(currentUser.managerId);
              if (managerUser) {
                if (managerUser.name) {
                  setManagerName(managerUser.name);
                }
                if (managerUser.phone) {
                  // Ensure the phone number has country code (default India +91)
                  const phone = managerUser.phone.startsWith('+')
                    ? managerUser.phone.replace(/[^0-9]/g, '')
                    : managerUser.phone.replace(/[^0-9]/g, '');
                  setManagerPhone(phone);
                }
              }
            } catch (err) {
              console.error('Error fetching manager phone:', err);
            }
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Real-time notification polling
  const handleNotificationsUpdate = useCallback((data) => {
    setNotifications(data);
  }, []);

  useNotificationPolling({
    recipientId: user?._id,
    limit: 20,
    interval: 10_000,
    onUpdate: handleNotificationsUpdate,
    enabled: !!user,
  });

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true, isRead: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user._id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await clearAllNotifications(user._id);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleSettingsChange = async (newSettings) => {
    if (!user) return;
    try {
      setUser(prev => ({ ...prev, notificationSettings: newSettings }));
      await updateUser(user._id, { notificationSettings: newSettings });
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  // Navigate to the relevant tab when a notification is clicked
  const handleNotificationClick = (notification) => {
    let targetTab = null;

    // Parse link hash (e.g., #Tasks -> Tasks)
    if (notification.link && notification.link.startsWith('#')) {
      targetTab = notification.link.substring(1);
    }

    // Fallback: map notification type to tab
    if (!targetTab) {
      const typeToTab = {
        task: 'Tasks',
        invoice: 'Billing',
        info: 'Dashboard',
        success: 'Dashboard',
        warning: 'Dashboard',
        error: 'Dashboard',
      };
      targetTab = typeToTab[notification.type] || 'Dashboard';
    }

    // Validate the tab exists in navigation
    const validTab = navigation.find(n => n.id === targetTab);
    if (validTab) {
      setActiveTab(validTab.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  const userInitials = user?.name?.split(" ").map(n => n[0]).join("") || "CL";

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Logo variant="white" />
            <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium bg-white text-black text-sm">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0 text-white">
                <p className="text-sm font-medium truncate">{user?.name || "Client"}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate uppercase">{user?.plan || "Basic"} Plan</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white" asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar width on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar - Sticky */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-heading font-semibold">
              {navigation.find(n => n.id === activeTab)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDeleteNotification}
              onClearAll={handleClearAll}
              settings={user?.notificationSettings}
              onSettingsChange={handleSettingsChange}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === "Dashboard" && <ClientDashboardTab setActiveTab={setActiveTab} currentUser={user} />}
          {activeTab === "Plan" && <ClientPlanTab currentUser={user} />}
          {activeTab === "Tasks" && <ClientTasksTab currentUser={user} />}
          {activeTab === "Files" && <ClientFilesTab currentUser={user} />}
          {activeTab === "Billing" && <ClientBillingTab currentUser={user} />}
          {activeTab === "Support" && <ClientSupportTab currentUser={user} />}
          {activeTab === "Profile" && <ClientProfileTab currentUser={user} />}
        </main>
      </div>

      {/* Floating WhatsApp Button */}
      {managerPhone && (
        <WhatsAppButton
          phoneNumber={managerPhone}
          message={`Hi ${managerName || 'there'}! This is ${user?.name || 'your client'}. I need assistance with my account.`}
        />
      )}
    </div>
  );
}

