"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Building2, Clock } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { ScrollableContainer } from "@/components/ui/scrollable-container";

const TaskDetailsDialog = ({ open, onOpenChange, task }) => {
    if (!task) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
            case "urgent":
                return "destructive";
            case "medium":
                return "secondary";
            case "low":
                return "outline";
            default:
                return "secondary";
        }
    };



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusBadge status={task.status} />
                                <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                                    {task.priority || "Normal"} Priority
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold leading-tight">
                                {task.title}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-xs">
                                <span>ID: {task.taskId || task._id?.toString().slice(-6)}</span>
                                <span>•</span>
                                <span>Created {formatDate(task.createdAt)}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollableContainer className="flex-1 px-6 py-2">
                    <div className="space-y-6">
                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground/80">Description</h4>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md border min-h-[60px]">
                                {task.description || "No description provided."}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</h4>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{task.client?.company || task.client?.name || "N/A"}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</h4>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{task.assignee?.name || task.owner || "Unassigned"}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</h4>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(task.dueDate)}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan For</h4>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Week {task.planForWeek || "N/A"}</span>
                                </div>
                            </div>
                        </div>


                    </div>
                </ScrollableContainer>

                <DialogFooter className="p-6 pt-4 border-t mt-auto">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsDialog;
