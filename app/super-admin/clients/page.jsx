"use client";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const clients = [
    { id: 1, name: "John Doe", company: "TechGadgets Co", email: "john@techgadgets.com", plan: "Premium", manager: "Sarah Mitchell", status: "active" },
    { id: 2, name: "Emily Smith", company: "BeautyBrand Inc", email: "emily@beautybrand.com", plan: "Platinum", manager: "Sarah Mitchell", status: "active" },
    { id: 3, name: "Michael Brown", company: "HomeEssentials", email: "michael@home.com", plan: "Elite", manager: "Sarah Mitchell", status: "active" },
    { id: 4, name: "Lisa Chen", company: "Fashion Forward", email: "lisa@fashion.com", plan: "Platinum", manager: "Unassigned", status: "pending" },
    { id: 5, name: "Robert Kim", company: "Tech Innovators", email: "robert@tech.com", plan: "Elite", manager: "John Anderson", status: "active" },
    { id: 6, name: "Amanda White", company: "Sports Gear Pro", email: "amanda@sports.com", plan: "Premium", manager: "Emma Wilson", status: "active" },
];
const managers = ["Sarah Mitchell", "John Anderson", "Emma Wilson"];
const SuperAdminClients = () => {
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">Manage all clients and their assignments.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2"/>
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search clients..." className="w-[250px]"/>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Manager"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {managers.map((m) => (<SelectItem key={m} value={m.toLowerCase().replace(' ', '-')}>{m}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Assigned Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (<TableRow key={client.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.email}</TableCell>
                <TableCell>
                  <Badge variant={client.plan === "Platinum" ? "default" : client.plan === "Premium" ? "secondary" : "outline"}>
                    {client.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.manager === "Unassigned" ? (<Select>
                      <SelectTrigger className="w-[160px] h-8 border-destructive">
                        <SelectValue placeholder="Assign Manager"/>
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((m) => (<SelectItem key={m} value={m.toLowerCase().replace(' ', '-')}>{m}</SelectItem>))}
                      </SelectContent>
                    </Select>) : (<Select defaultValue={client.manager.toLowerCase().replace(' ', '-')}>
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((m) => (<SelectItem key={m} value={m.toLowerCase().replace(' ', '-')}>{m}</SelectItem>))}
                      </SelectContent>
                    </Select>)}
                </TableCell>
                <TableCell>
                  <Badge variant={client.status === "active" ? "default" : "outline"}>
                    {client.status === "active" ? "Active" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4"/>
                  </Button>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>
    </div>);
};
export default SuperAdminClients;
