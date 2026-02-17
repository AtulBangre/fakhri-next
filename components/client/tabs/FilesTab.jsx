"use client";
import { useState, useMemo, useEffect } from "react";
import {
    Download, FileText, Image, FileSpreadsheet, Eye,
    Calendar, X, Loader2, File as FileIcon, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFilesByClientId } from "@/lib/actions/file";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { NoPlanState } from "@/components/client/NoPlanState";

const getFileIcon = (type) => {
    switch (type) {
        case "pdf":
            return <FileText className="h-5 w-5 text-red-500" />;
        case "excel":
            return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
        case "image":
            return <Image className="h-5 w-5 text-blue-500" />;
        default:
            return <FileIcon className="h-5 w-5 text-muted-foreground" />;
    }
};

const getFileTypeLabel = (type) => {
    switch (type) {
        case "pdf": return "PDF";
        case "excel": return "Excel";
        case "image": return "Image";
        default: return "File";
    }
};

const ClientFilesTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [allFiles, setAllFiles] = useState([]);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const loadFilesData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getFilesByClientId(currentUser._id, { limit: 100 });
                setAllFiles(response.files || []);
            } catch (error) {
                console.error("Error loading client files:", error);
                toast.error("Failed to load files");
            } finally {
                setLoading(false);
            }
        };

        loadFilesData();
    }, [currentUser]);

    // Filter files
    const filteredFiles = useMemo(() => {
        return allFiles.filter(file => {
            // Search filter
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // Date filter
            const fileDate = new Date(file.createdAt);
            if (dateRange.start) {
                const startDate = new Date(dateRange.start);
                if (fileDate < startDate) return false;
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (fileDate > endDate) return false;
            }
            return true;
        });
    }, [dateRange, allFiles, searchQuery]);

    const handleDownload = (file) => {
        if (!file.url) {
            toast.error("Download URL not available");
            return;
        }
        window.open(file.url, '_blank');
    };

    const handlePreview = (file) => {
        setSelectedFile(file);
        setIsViewOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your files...</p>
            </div>
        );
    }

    if (!currentUser?.plan) {
        return (
            <NoPlanState
                title="Project Files & Assets"
                message="Once you start a project with us, this is where you'll find all your project files and deliverables."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Files & Deliverables</h1>
                    <p className="text-muted-foreground">Download and view documents shared by your account manager.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2 space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by file name..."
                            className="pl-10 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">From Date</Label>
                    <Input
                        type="date"
                        className="h-10"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">To Date</Label>
                    <Input
                        type="date"
                        className="h-10"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>
            </div>

            {/* Files Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader className="bg-accent/30">
                        <TableRow>
                            <TableHead>File Details</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Received On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <TableRow key={file._id} className="hover:bg-accent/20 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium truncate max-w-[200px] lg:max-w-[400px]" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                    v{file.version || '1.0'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 font-medium bg-background">
                                            {getFileTypeLabel(file.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {file.size}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {file.uploadedBy || 'Manager'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {file.date || new Date(file.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handlePreview(file)}
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDownload(file)}
                                            >
                                                <Download className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileIcon className="h-12 w-12 opacity-10" />
                                        <p className="text-lg font-medium">No files available</p>
                                        <p className="text-sm opacity-70">Your account manager hasn't shared any files with you yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Read-only Notice */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold">Secure File Storage</h4>
                    <p className="text-xs text-muted-foreground">
                        All deliverables and documents are securely stored and accessible 24/7.
                        If you need to send files to us, please use the Support tab or contact your manager.
                    </p>
                </div>
            </div>

            {/* View/Preview Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedFile?.name}</DialogTitle>
                        <DialogDescription>
                            Received on {selectedFile?.date || new Date(selectedFile?.createdAt).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center bg-accent/20 rounded-xl border-2 border-dashed border-accent">
                        {selectedFile?.type === 'image' ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-sm">
                                <img
                                    src={selectedFile.url}
                                    alt={selectedFile.name}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-10">
                                <div className="w-20 h-20 bg-card rounded-2xl border shadow-sm flex items-center justify-center mx-auto">
                                    {getFileIcon(selectedFile?.type)}
                                </div>
                                <div>
                                    <p className="font-semibold">{selectedFile?.name}</p>
                                    <p className="text-sm text-muted-foreground uppercase">{getFileTypeLabel(selectedFile?.type)} • {selectedFile?.size}</p>
                                </div>
                                <p className="text-xs text-muted-foreground max-w-sm px-10">
                                    Preview is not available for this file type. Please download the file to view its contents.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        <Button onClick={() => handleDownload(selectedFile)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientFilesTab;
