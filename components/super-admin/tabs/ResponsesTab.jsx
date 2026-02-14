"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    Mail,
    Briefcase,
    CheckCircle2,
    XCircle,
    Trash2,
    Loader2,
    RefreshCcw,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getAllResponses, updateResponseStatus, deleteResponse } from "@/lib/actions/responses";
import { toast } from "sonner";
import { format } from "date-fns";

import { ScrollableContainer } from "@/components/ui/scrollable-container";

export default function SuperAdminResponsesTab() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ feedback: [], contacts: [], applications: [] });
    const [refreshing, setRefreshing] = useState(false);

    // View Dialog State
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewType, setViewType] = useState(null); // 'feedback', 'contact', 'career'

    const loadData = async () => {
        try {
            const result = await getAllResponses();
            setData(result);
        } catch (error) {
            console.error("Error loading responses:", error);
            toast.error("Failed to load responses");
        }
    };

    useEffect(() => {
        loadData().finally(() => setLoading(false));
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
        toast.success("Refreshed");
    };

    const handleStatusUpdate = async (type, id, newStatus) => {
        try {
            const res = await updateResponseStatus(type, id, newStatus);
            if (res.success) {
                toast.success("Status updated");
                loadData(); // Reload to reflect changes
                if (selectedItem && selectedItem._id === id) {
                    setSelectedItem(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await deleteResponse(type, id);
            if (res.success) {
                toast.success("Item deleted");
                loadData();
                setSelectedItem(null);
            } else {
                toast.error("Failed to delete item");
            }
        } catch (error) {
            toast.error("Error deleting item");
        }
    };

    const openViewDialog = (item, type) => {
        setSelectedItem(item);
        setViewType(type);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading responses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Responses</h2>
                    <p className="text-muted-foreground">Manage feedback, inquiries, and job applications.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="feedback" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Feedback
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{data.feedback.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Inquiries
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{data.contacts.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="career" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Careers
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{data.applications.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* FEEDBACK TAB */}
                <TabsContent value="feedback" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Feedback</CardTitle>
                            <CardDescription>Feedback submitted by clients from their dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.feedback.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">
                                                <div>{item.clientName}</div>
                                                <div className="text-xs text-muted-foreground">{item.client?.email || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < item.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{item.subject || item.message.substring(0, 30)}...</TableCell>
                                            <TableCell>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'unread' ? "default" : "outline"}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(item, 'feedback')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete('feedback', item._id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.feedback.length === 0 && (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No feedback yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONTACT TAB */}
                <TabsContent value="contact" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Inquiries</CardTitle>
                            <CardDescription>Messages from the public website contact form.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.contacts.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">
                                                <div>{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.email}</div>
                                            </TableCell>
                                            <TableCell>{item.service}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{item.message}</TableCell>
                                            <TableCell>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'new' ? "default" : "outline"}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(item, 'contact')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete('contact', item._id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.contacts.length === 0 && (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No inquiries yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CAREER TAB */}
                <TabsContent value="career" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Applications</CardTitle>
                            <CardDescription>Applications from the careers page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.applications.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="font-medium">{item.fullName}</TableCell>
                                            <TableCell>{item.jobTitle}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{item.email}</div>
                                                <div className="text-xs text-muted-foreground">{item.phone}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'applied' ? "default" : "outline"}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(item, 'career')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete('career', item._id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.applications.length === 0 && (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* DETAIL DIALOG */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2 flex-shrink-0">
                        <DialogTitle>Response Details</DialogTitle>
                        <DialogDescription>
                            {selectedItem && format(new Date(selectedItem.createdAt), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollableContainer className="flex-1 p-6 pt-2 space-y-4">
                        {selectedItem && (
                            <div className="space-y-4">
                                {/* Feedback View */}
                                {viewType === 'feedback' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Client</h4>
                                                <p>{selectedItem.clientName}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Rating</h4>
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>{i < selectedItem.rating ? '★' : '☆'}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground">Message</h4>
                                            <div className="mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                                {selectedItem.message}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            {selectedItem.status === 'unread' && (
                                                <Button onClick={() => handleStatusUpdate('feedback', selectedItem._id, 'read')}>
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Contact View */}
                                {viewType === 'contact' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Name</h4>
                                                <p>{selectedItem.name}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Service</h4>
                                                <p>{selectedItem.service}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Email</h4>
                                                <p>{selectedItem.email}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Phone</h4>
                                                <p>{selectedItem.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground">Company</h4>
                                                <p>{selectedItem.company || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground">Message</h4>
                                            <div className="mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                                {selectedItem.message}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            {selectedItem.status === 'new' && (
                                                <Button onClick={() => handleStatusUpdate('contact', selectedItem._id, 'contacted')}>
                                                    Mark as Contacted
                                                </Button>
                                            )}
                                            {selectedItem.status === 'contacted' && (
                                                <Button variant="outline" onClick={() => handleStatusUpdate('contact', selectedItem._id, 'resolved')}>
                                                    Mark as Resolved
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Career View */}
                                {viewType === 'career' && (
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between border-b pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{selectedItem.fullName}</h3>
                                                <p className="text-muted-foreground">{selectedItem.jobTitle}</p>
                                            </div>
                                            <Badge
                                                className={
                                                    selectedItem.status === 'shortlisted' ? 'bg-green-500 hover:bg-green-600' :
                                                        selectedItem.status === 'rejected' ? 'bg-destructive hover:bg-destructive' :
                                                            'bg-primary hover:bg-primary/90'
                                                }
                                            >
                                                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Contact Info</h4>
                                                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {selectedItem.email}</p>
                                                <p className="flex items-center gap-2"><Button variant="link" className="p-0 h-auto text-foreground font-normal hover:no-underline cursor-default"><span className="flex items-center gap-2"><span className="w-4 flex justify-center">📱</span> {selectedItem.phone || 'N/A'}</span></Button></p>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Applied Date</h4>
                                                <p>{format(new Date(selectedItem.createdAt), 'MMMM dd, yyyy')}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Resume</h4>
                                            <div className="p-4 border rounded-md bg-slate-50 flex items-center justify-between">
                                                <span className="text-sm font-medium truncate max-w-[300px]">
                                                    {selectedItem.resume && (selectedItem.resume.startsWith('http') ? 'Resume Document' : selectedItem.resume)}
                                                </span>
                                                {selectedItem.resume && selectedItem.resume.startsWith('http') ? (
                                                    <Button size="sm" asChild>
                                                        <a href={selectedItem.resume} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Resume
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline" className="opacity-50">Preview Unavailable</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Cover Letter</h4>
                                            <div className="mt-2 p-4 bg-muted/50 rounded-md border whitespace-pre-wrap text-sm leading-relaxed">
                                                {selectedItem.coverLetter || <span className="text-muted-foreground italic">No cover letter provided.</span>}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t mt-6">
                                            {selectedItem.status === 'applied' && (
                                                <Button onClick={() => handleStatusUpdate('career', selectedItem._id, 'reviewing')} className="flex-1">
                                                    Mark as Reviewing
                                                </Button>
                                            )}

                                            <Button
                                                variant={selectedItem.status === 'shortlisted' ? "default" : "outline"}
                                                className={selectedItem.status !== 'shortlisted' ? "text-green-600 border-green-200 hover:bg-green-50 flex-1" : "bg-green-600 hover:bg-green-700 flex-1"}
                                                onClick={() => handleStatusUpdate('career', selectedItem._id, 'shortlisted')}
                                                disabled={selectedItem.status === 'shortlisted'}
                                            >
                                                Shortlist
                                            </Button>

                                            <Button
                                                variant={selectedItem.status === 'rejected' ? "default" : "outline"}
                                                className={selectedItem.status !== 'rejected' ? "text-destructive border-destructive/30 hover:bg-destructive/10 flex-1" : "bg-destructive hover:bg-destructive flex-1"}
                                                onClick={() => handleStatusUpdate('career', selectedItem._id, 'rejected')}
                                                disabled={selectedItem.status === 'rejected'}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollableContainer>
                </DialogContent>
            </Dialog>
        </div>
    );
}
