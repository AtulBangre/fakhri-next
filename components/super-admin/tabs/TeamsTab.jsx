"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Users, Trash2, Eye, X, Crown, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getTeams } from "@/lib/actions/team";

const SuperAdminTeamsTab = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingTeam, setViewingTeam] = useState(null);

    useEffect(() => {
        async function loadTeams() {
            setLoading(true);
            const data = await getTeams();
            if (data) {
                // Formatting data if needed to match the UI expectations
                const formattedTeams = data.map(team => ({
                    ...team,
                    members: team.memberIds || [],
                    lead: team.leadId || { name: "N/A", email: "" },
                    clientCount: 0 // We'd need to aggregate this or have it in the model
                }));
                setTeams(formattedTeams);
            }
            setLoading(false);
        }
        loadTeams();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Loading teams...</p>
            </div>
        );
    }

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
                {teams.length > 0 ? teams.map((team) => (
                    <div key={team._id} className="bg-card rounded-xl border p-6">
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
                                    {team.lead?.name?.split(' ').map(n => n[0]).join('') || "N"}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{team.lead?.name || "Unassigned"}</p>
                                    <Badge variant="secondary" className="text-xs">{team.lead?.adminRole || "Lead"}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Members ({team.members.length})</p>
                            <div className="flex -space-x-2">
                                {team.members.length > 0 ? team.members.slice(0, 4).map((member, idx) => (
                                    <div
                                        key={member._id || idx}
                                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
                                        title={member.name}
                                    >
                                        {member.name?.split(' ').map(n => n[0]).join('') || "?"}
                                    </div>
                                )) : (
                                    <span className="text-xs text-muted-foreground italic">No members assigned</span>
                                )}
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
                )) : (
                    <div className="col-span-full py-20 text-center bg-card rounded-xl border">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-heading font-semibold">No teams found</h3>
                        <p className="text-sm text-muted-foreground">Get started by creating your first team.</p>
                    </div>
                )}
            </div>

            {/* View Team Members Modal */}
            {viewingTeam && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl border shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
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
                                {viewingTeam.members.length > 0 ? viewingTeam.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${member._id === viewingTeam.lead?._id ? 'bg-primary/5 border-primary/20' : 'bg-accent/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {member.name?.split(' ').map(n => n[0]).join('') || "?"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{member.name}</p>
                                                    {member._id === viewingTeam.lead?._id && (
                                                        <Badge className="bg-primary text-primary-foreground text-xs">
                                                            <Crown className="h-3 w-3 mr-1" />
                                                            Team Lead
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="mt-1">{member.adminRole || "Member"}</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{member.email}</span>
                                            </div>
                                            <p className="text-primary font-medium mt-1">{member.clientsCount || 0} clients</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground text-center py-10 italic">No members found in this team.</p>
                                )}
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

