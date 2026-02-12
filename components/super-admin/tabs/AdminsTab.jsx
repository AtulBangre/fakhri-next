"use client";
import { useState, useEffect } from "react";
import { Plus, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { upsertAdmin, deleteAdmin, toggleAdminStatus, getAdmins } from "@/lib/actions/admin";
import { getTeams } from "@/lib/actions/team";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const SuperAdminAdminsTab = () => {
    const [admins, setAdmins] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        adminRole: "Account Manager",
        team: "",
        status: "active",
        password: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [adminsData, teamsData] = await Promise.all([
                getAdmins(),
                getTeams()
            ]);

            if (adminsData) {
                setAdmins(adminsData);
            }
            if (teamsData) {
                setTeams(teamsData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load admin data");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                name: admin.name,
                email: admin.email,
                phone: admin.phone || "",
                adminRole: admin.adminRole || "Account Manager",
                team: admin.team || "",
                status: admin.status || "active",
                password: "" // Keep password empty on edit
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                adminRole: "Account Manager",
                team: "",
                status: "active",
                password: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = { ...formData };
            if (editingAdmin) {
                data._id = editingAdmin._id;
                // If editing and password is empty, don't update it
                if (!data.password) {
                    delete data.password;
                }
            } else {
                // For new admins, password might be required
                if (!data.password) {
                    toast.error("Password is required for new admin");
                    setIsSubmitting(false);
                    return;
                }
            }

            await upsertAdmin(data);
            toast.success(editingAdmin ? "Admin updated successfully" : "Admin created successfully");
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error("Error saving admin:", error);
            toast.error(error.message || "Failed to save admin");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteAdmin(id);
            if (result.success) {
                toast.success("Admin removed successfully");
                loadData();
            } else {
                toast.error(result.error || "Failed to remove admin");
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
            toast.error("An error occurred while removing admin");
        }
    };

    const handleStatusToggle = async (adminId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "disabled" : "active";
        try {
            await toggleAdminStatus(adminId, newStatus);
            toast.success(`Admin status updated to ${newStatus}`);
            // Optimistic update or reload
            setAdmins(admins.map(a => a._id === adminId ? { ...a, status: newStatus } : a));
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Loading admin users...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Admin Users</h1>
                    <p className="text-muted-foreground">Manage account managers and their access.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                </Button>
            </div>

            {/* Admin Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Admin</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Clients</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.length > 0 ? admins.map((admin) => (
                            <TableRow key={admin._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                            {admin.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium">{admin.name}</p>
                                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={(admin.adminRole || admin.role) === "Senior Manager" || (admin.adminRole || admin.role) === "Team Lead" ? "default" : "secondary"}>
                                        {admin.adminRole || admin.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{admin.teamName || admin.team || "N/A"}</TableCell>
                                <TableCell>{admin.clientsCount || 0}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={admin.status === "active"}
                                            onCheckedChange={() => handleStatusToggle(admin._id, admin.status)}
                                        />
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {admin.status || "active"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenModal(admin)}>Edit</DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        className="text-destructive font-medium"
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        Remove
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Admin User?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove <strong>{admin.name}</strong>? This action will permanently delete their account and access.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(admin._id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No admin users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Admin Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{editingAdmin ? "Edit Admin" : "Add New Admin"}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the admin account manager.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={!!editingAdmin}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{editingAdmin ? "New Password (Optional)" : "Password"}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingAdmin}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                    value={formData.adminRole}
                                    onValueChange={(value) => setFormData({ ...formData, adminRole: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Account Manager">Account Manager</SelectItem>
                                        <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                                        <SelectItem value="Team Lead">Team Lead</SelectItem>
                                        <SelectItem value="Sales Head">Sales Head</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Team</Label>
                                <Select
                                    value={formData.team}
                                    onValueChange={(value) => setFormData({ ...formData, team: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Team</SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team._id} value={team.name}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingAdmin ? "Save Changes" : "Create Admin"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SuperAdminAdminsTab;
