"use client";
import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, CreditCard, CheckSquare, FileText, Receipt, User, Menu, X, LogOut, Bell } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";

// Tabs
import ClientDashboardTab from "@/components/client/tabs/DashboardTab";
import ClientPlanTab from "@/components/client/tabs/PlanTab";
import ClientTasksTab from "@/components/client/tabs/TasksTab";
import ClientFilesTab from "@/components/client/tabs/FilesTab";
import ClientBillingTab from "@/components/client/tabs/BillingTab";
import ClientProfileTab from "@/components/client/tabs/ProfileTab";

const navigation = [
  { name: "Dashboard", id: "Dashboard", icon: LayoutDashboard },
  { name: "My Plan", id: "Plan", icon: CreditCard },
  { name: "Tasks", id: "Tasks", icon: CheckSquare },
  { name: "Files", id: "Files", icon: FileText },
  { name: "Billing", id: "Billing", icon: Receipt },
  { name: "Profile", id: "Profile", icon: User },
];

export default function ClientDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen flex bg-[#F4F4F5]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Logo variant="white" /> {/* Assuming Logo can handle white variant or dark bg */}
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium bg-white text-black">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Premium Plan</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-heading font-semibold">
              {navigation.find(n => n.id === activeTab)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === "Dashboard" && <ClientDashboardTab setActiveTab={setActiveTab} />}
          {activeTab === "Plan" && <ClientPlanTab />}
          {activeTab === "Tasks" && <ClientTasksTab />}
          {activeTab === "Files" && <ClientFilesTab />}
          {activeTab === "Billing" && <ClientBillingTab />}
          {activeTab === "Profile" && <ClientProfileTab />}
        </main>
      </div>
    </div>
  );
}
