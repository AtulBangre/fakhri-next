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
import { Calendar, User, Building2, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

    const updates = task.updates || [];

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

                <ScrollArea className="flex-1 px-6 py-2">
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

                        <Separator />

                        {/* Task Updates / History */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground/80">Activity & Updates</h4>
                            {updates.length > 0 ? (
                                <div className="relative space-y-0 pl-2 border-l-2 border-muted ml-2">
                                    {[...updates].reverse().map((update, index) => (
                                        <div key={index} className="relative pl-6 pb-6 last:pb-0">
                                            <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground">{update.user || "System"}</span>
                                                    <span className="text-muted-foreground">{formatDate(update.date)}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 bg-muted/20 p-2 rounded-md border mt-1">
                                                    {update.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">No updates yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

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
