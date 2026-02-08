"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, UsersRound, UserCog, CheckSquare,
  DollarSign, Settings, Menu, X, LogOut, Bell, Shield
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import Tabs
import SuperAdminDashboardTab from "@/components/super-admin/tabs/DashboardTab";
import SuperAdminClientsTab from "@/components/super-admin/tabs/ClientsTab";
import SuperAdminTeamsTab from "@/components/super-admin/tabs/TeamsTab";
import SuperAdminAdminsTab from "@/components/super-admin/tabs/AdminsTab";
import SuperAdminTasksTab from "@/components/super-admin/tabs/TasksTab";
import SuperAdminSalesTab from "@/components/super-admin/tabs/SalesTab";
import SuperAdminSettingsTab from "@/components/super-admin/tabs/SettingsTab";


const navigation = [
  { name: "Dashboard", id: "Dashboard", icon: LayoutDashboard },
  { name: "Clients", id: "Clients", icon: Users },
  { name: "Teams", id: "Teams", icon: UsersRound },
  { name: "Admin Users", id: "Admins", icon: UserCog },
  { name: "Tasks", id: "Tasks", icon: CheckSquare },
  { name: "Sales & Revenue", id: "Sales", icon: DollarSign },
  { name: "Settings", id: "Settings", icon: Settings },
];

export default function SuperAdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

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
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Logo variant="white" />
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
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
                  setSidebarOpen(false); // Close mobile sidebar on selection
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
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-medium">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Super Administrator</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10" asChild>
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
            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === "Dashboard" && <SuperAdminDashboardTab setActiveTab={setActiveTab} />}
          {activeTab === "Clients" && <SuperAdminClientsTab />}
          {activeTab === "Teams" && <SuperAdminTeamsTab />}
          {activeTab === "Admins" && <SuperAdminAdminsTab />}
          {activeTab === "Tasks" && <SuperAdminTasksTab />}
          {activeTab === "Sales" && <SuperAdminSalesTab />}
          {activeTab === "Settings" && <SuperAdminSettingsTab />}
        </main>
      </div>
    </div>
  );
}
