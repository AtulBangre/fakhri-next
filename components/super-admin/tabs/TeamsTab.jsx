"use client";
import { useState } from "react";
import { Plus, Edit, Users, Trash2, Eye, X, Crown, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { teams as teamsData } from "@/data/teams";
import { admins } from "@/data/admins";

// Enrich teams data with full member details
const teams = teamsData.map(team => {
    // Get full member objects
    const members = (team.memberIds || [])
        .map(id => admins.find(a => a.id === id))
        .filter(Boolean)
        .map(member => ({
            ...member,
            phone: member.phone || "+1 (555) 000-0000" // Fallback phone
        }));

    // Get lead object
    const lead = admins.find(a => a.id === team.leadId) || members[0] || {
        name: "Unknown",
        role: "N/A",
        phone: ""
    };

    return {
        ...team,
        members,
        lead,
        // Ensure clientCount is accurate based on members
        clientCount: members.reduce((sum, m) => sum + (m.clients || 0), 0)
    };
});

const SuperAdminTeamsTab = () => {
    const [viewingTeam, setViewingTeam] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Teams</h1>
                    <p className="text-muted-foreground">Organize account managers into teams.</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                </Button>
            </div>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <div key={team.id} className="bg-card rounded-xl border p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-heading font-semibold">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">{team.members.length} members</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Team Lead</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                    {team.lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{team.lead.name}</p>
                                    <Badge variant="secondary" className="text-xs">{team.lead.role}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Members ({team.members.length})</p>
                            <div className="flex -space-x-2">
                                {team.members.slice(0, 4).map((member) => (
                                    <div
                                        key={member.id}
                                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
                                        title={member.name}
                                    >
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                ))}
                                {team.members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-accent border-2 border-card flex items-center justify-center text-xs font-medium">
                                        +{team.members.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setViewingTeam(team)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Team Members Modal */}
            {viewingTeam && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl border shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-primary text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading text-xl font-bold">{viewingTeam.name}</h2>
                                        <p className="text-white/80 text-sm">{viewingTeam.members.length} members • {viewingTeam.clientCount} clients</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => setViewingTeam(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <h3 className="font-heading font-semibold mb-4">Team Members</h3>
                            <div className="space-y-3">
                                {viewingTeam.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${member.id === viewingTeam.lead.id ? 'bg-primary/5 border-primary/20' : 'bg-accent/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{member.name}</p>
                                                    {member.id === viewingTeam.lead.id && (
                                                        <Badge className="bg-primary text-primary-foreground text-xs">
                                                            <Crown className="h-3 w-3 mr-1" />
                                                            Team Lead
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="mt-1">{member.role}</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{member.phone}</span>
                                            </div>
                                            <p className="text-primary font-medium mt-1">{member.clients} clients</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setViewingTeam(null)}>
                                Close
                            </Button>
                            <Button>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Team
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminTeamsTab;

