"use client";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const admins = [
    { id: 1, name: "Sarah Mitchell", email: "sarah@fakhriit.com", role: "Account Manager", team: "Marketing Team", clients: 3, enabled: true },
    { id: 2, name: "John Anderson", email: "john@fakhriit.com", role: "Account Manager", team: "Marketing Team", clients: 4, enabled: true },
    { id: 3, name: "Emma Wilson", email: "emma@fakhriit.com", role: "Senior Manager", team: "Enterprise Team", clients: 2, enabled: true },
    { id: 4, name: "David Lee", email: "david@fakhriit.com", role: "Account Manager", team: "Enterprise Team", clients: 3, enabled: true },
    { id: 5, name: "Michael Chen", email: "michael@fakhriit.com", role: "Team Lead", team: "Growth Team", clients: 3, enabled: false },
];

const SuperAdminAdminsTab = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Admin Users</h1>
                    <p className="text-muted-foreground">Manage account managers and their access.</p>
                </div>
                <Button>
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
                        {admins.map((admin) => (
                            <TableRow key={admin.id}>
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
                                    <Badge variant={admin.role === "Senior Manager" || admin.role === "Team Lead" ? "default" : "secondary"}>
                                        {admin.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{admin.team}</TableCell>
                                <TableCell>{admin.clients}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch defaultChecked={admin.enabled} />
                                        <span className="text-sm text-muted-foreground">
                                            {admin.enabled ? "Active" : "Disabled"}
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Change Team</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SuperAdminAdminsTab;
