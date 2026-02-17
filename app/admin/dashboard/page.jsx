"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, CheckSquare, FileText, User, Menu, X, LogOut, Loader2, MessageSquare } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications } from "@/lib/actions/notification";
import { getUsers, getUserByEmail, updateUser } from "@/lib/actions/user";
import useNotificationPolling from "@/hooks/useNotificationPolling";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Tabs
import AdminDashboardTab from "@/components/admin/tabs/DashboardTab";
import AdminClientsTab from "@/components/admin/tabs/ClientsTab";
import AdminTasksTab from "@/components/admin/tabs/TasksTab";
import AdminFilesTab from "@/components/admin/tabs/FilesTab";
import AdminProfileTab from "@/components/admin/tabs/ProfileTab";

const navigation = [
  { name: "Dashboard", id: "Dashboard", icon: LayoutDashboard },
  { name: "My Clients", id: "Clients", icon: Users },
  { name: "Tasks", id: "Tasks", icon: CheckSquare },
  { name: "Files", id: "Files", icon: FileText },
  { name: "Profile", id: "Profile", icon: User },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { subscribeUser, unsubscribeUser } = usePushNotifications(currentUser?._id);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Check for email in search params (for testing/multi-admin support)
        const params = new URLSearchParams(window.location.search);
        const targetEmail = params.get('email') || 'k6263638053@gmail.com';

        // Fetch specific admin
        let admin = await getUserByEmail(targetEmail);

        // Fallback or create if not exists
        if (!admin && targetEmail === 'k6263638053@gmail.com') {
          console.log("Default admin not found, falling back to first available admin");
          const { users } = await getUsers({ role: 'admin', limit: 1 });
          if (users && users.length > 0) {
            admin = users[0];
          }
        }

        if (admin) {
          console.log("Logged in as:", admin.name);
          setCurrentUser(admin);
        }
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Try to match exact ID or case-insensitive name
        const validTab = navigation.find(n =>
          n.id === hash ||
          n.id.toLowerCase() === hash.toLowerCase() ||
          n.name.toLowerCase() === hash.toLowerCase()
        );
        if (validTab) {
          setActiveTab(validTab.id);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time notification polling
  const handleNotificationsUpdate = useCallback((data) => {
    setNotifications(data);
  }, []);

  useNotificationPolling({
    recipientId: currentUser?._id,
    limit: 20,
    interval: 10_000,
    onUpdate: handleNotificationsUpdate,
    enabled: !!currentUser,
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
    if (!currentUser) return;
    try {
      await markAllNotificationsAsRead(currentUser._id);
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
    if (!currentUser) return;
    try {
      await clearAllNotifications(currentUser._id);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleSettingsChange = async (newSettings) => {
    if (!currentUser) return;
    try {
      const oldPushEnabled = currentUser.notificationSettings?.pushNotifications;
      const newPushEnabled = newSettings.pushNotifications;

      setCurrentUser(prev => ({ ...prev, notificationSettings: newSettings }));
      await updateUser(currentUser._id, { notificationSettings: newSettings });

      if (!oldPushEnabled && newPushEnabled) {
        await subscribeUser();
      } else if (oldPushEnabled && !newPushEnabled) {
        await unsubscribeUser();
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  // Navigate to the relevant tab when a notification is clicked
  const handleNotificationClick = (notification) => {
    let targetTab = null;

    if (notification.link) {
      if (notification.link.startsWith('#')) {
        targetTab = notification.link.substring(1);
      } else if (notification.link.includes('tab=')) {
        try {
          const url = new URL(notification.link, 'http://localhost');
          const tab = url.searchParams.get('tab');
          if (tab) {
            targetTab = tab.charAt(0).toUpperCase() + tab.slice(1);
          }
        } catch (e) {
          console.error("Error parsing link:", e);
        }
      }
    }

    if (!targetTab) {
      const typeToTab = {
        task: 'Tasks',
        invoice: 'Clients',
        info: 'Dashboard',
        success: 'Dashboard',
        warning: 'Dashboard',
        error: 'Dashboard',
        feedback: 'Responses',
        contact: 'Responses',
        career: 'Responses'
      };
      targetTab = typeToTab[notification.type] || 'Dashboard';
    }

    const validTab = navigation.find(n => n.id === targetTab || n.id.toLowerCase() === targetTab?.toLowerCase());
    if (validTab) {
      setActiveTab(validTab.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Admin Dashboard...</p>
      </div>
    );
  }

  const userInitials = currentUser?.name?.split(" ").map(n => n[0]).join("") || "AD";

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
            <div className="flex items-center gap-2">
              <Logo variant="white" />
              <Badge variant="outline" className="text-xs border-white/20 text-sidebar-foreground">Admin</Badge>
            </div>
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
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0 text-white">
                <p className="text-sm font-medium truncate">{currentUser?.name || "Admin"}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser?.adminRole || "Account Manager"}</p>
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
              settings={currentUser?.notificationSettings}
              onSettingsChange={handleSettingsChange}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === "Dashboard" && <AdminDashboardTab setActiveTab={setActiveTab} currentUser={currentUser} />}

          {activeTab === "Clients" && <AdminClientsTab currentUser={currentUser} />}
          {activeTab === "Tasks" && <AdminTasksTab currentUser={currentUser} />}
          {activeTab === "Files" && <AdminFilesTab currentUser={currentUser} />}
          {activeTab === "Profile" && <AdminProfileTab currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}
