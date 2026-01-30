"use client";
import { Plus, Edit, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
const teams = [
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
const SuperAdminTeams = () => {
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">Organize account managers into teams.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2"/>
          Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (<div key={team.id} className="bg-card rounded-xl border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary"/>
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.clientCount} clients</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Team Lead</p>
              <Badge variant="secondary">{team.lead}</Badge>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Members ({team.members.length})</p>
              <div className="flex flex-wrap gap-2">
                {team.members.map((member) => (<div key={member} className="flex items-center gap-2 px-2 py-1 rounded bg-accent text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member}
                  </div>))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-1"/>
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4"/>
              </Button>
            </div>
          </div>))}
      </div>
    </div>);
};
export default SuperAdminTeams;
