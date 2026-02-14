"use client";
import { useState, useMemo, useEffect } from "react";
import {
    Download, FileText, Image, FileSpreadsheet, Eye, Upload,
    Calendar, X, Loader2, Trash2, CheckCircle2, UserPlus,
    Search, Filter, MoreVertical, File as FileIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFiles, getClients, uploadFiles, deleteFile } from "@/lib/actions/admin";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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

const AdminFilesTab = ({ currentUser }) => {
    const [files, setFiles] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [selectedClientIds, setSelectedClientIds] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [filesData, clientsData] = await Promise.all([
                getFiles(),
                getClients()
            ]);
            setFiles(filesData);
            setClients(clientsData.filter(c => c.role === 'client'));
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load files and clients");
        } finally {
            setLoading(false);
        }
    }

    // Filter files
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            // Search filter
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // Date filter
            const fileDate = new Date(file.date || file.createdAt);
            if (dateRange.start) {
                const startDate = new Date(dateRange.start);
                if (fileDate < startDate) return false;
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                if (fileDate > endDate) return false;
            }
            return true;
        });
    }, [dateRange, files, searchQuery]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const toggleClientSelection = (clientId) => {
        setSelectedClientIds(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleUploadSubmit = async () => {
        if (!fileToUpload) {
            toast.error("Please select a file to upload");
            return;
        }
        if (selectedClientIds.length === 0) {
            toast.error("Please select at least one client");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);

            const selectedClientsData = clients
                .filter(c => selectedClientIds.includes(c._id))
                .map(c => ({ id: c._id, name: c.name }));

            formData.append('clients', JSON.stringify(selectedClientsData));
            formData.append('uploadedBy', currentUser?.name || 'Admin');

            const result = await uploadFiles(formData);

            if (result.success) {
                toast.success(`Successfully uploaded and shared with ${selectedClientIds.length} client(s)`);
                setIsUploadOpen(false);
                setFileToUpload(null);
                setSelectedClientIds([]);
                // Reload files
                const updatedFiles = await getFiles();
                setFiles(updatedFiles);
            } else {
                toast.error(result.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (id) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const result = await deleteFile(id);
            if (result.success) {
                toast.success("File deleted successfully");
                setFiles(prev => prev.filter(f => f._id !== id));
            } else {
                toast.error(result.error || "Failed to delete file");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

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
                <p className="text-muted-foreground">Loading file management...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold mb-2">Files & Deliverables</h1>
                    <p className="text-muted-foreground">Upload and share documents with your clients.</p>
                </div>

                {/* Upload Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload & Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Upload New File</DialogTitle>
                            <DialogDescription>
                                Select a file from your device and choose which clients should receive it.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="file-upload">Choose File</Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                {fileToUpload && (
                                    <p className="text-xs text-muted-foreground">
                                        Selected: {fileToUpload.name} ({(fileToUpload.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            {/* Client Selection */}
                            <div className="space-y-2">
                                <Label>Recipient Clients</Label>
                                <div className="border rounded-lg overflow-hidden bg-accent/30">
                                    <div className="p-2 border-b bg-accent/50 flex items-center justify-between">
                                        <span className="text-xs font-medium">Select Clients</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px]"
                                            onClick={() => setSelectedClientIds(clients.map(c => c._id))}
                                        >
                                            Select All
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-[200px]">
                                        <div className="p-2 space-y-1">
                                            {clients.map((client) => (
                                                <div
                                                    key={client._id}
                                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`client-${client._id}`}
                                                        checked={selectedClientIds.includes(client._id)}
                                                        onCheckedChange={() => toggleClientSelection(client._id)}
                                                    />
                                                    <label
                                                        htmlFor={`client-${client._id}`}
                                                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                                                    >
                                                        {client.name}
                                                        <span className="text-xs text-muted-foreground block font-normal">
                                                            {client.company || 'Personal'}
                                                        </span>
                                                    </label>
                                                </div>
                                            ))}
                                            {clients.length === 0 && (
                                                <div className="py-10 text-center text-muted-foreground">
                                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">No clients found to share with.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    {selectedClientIds.length} client(s) selected
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleUploadSubmit}
                                disabled={uploading || !fileToUpload || selectedClientIds.length === 0}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Send to Clients
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2 space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by file name or client..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Date From</Label>
                    <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Date To</Label>
                    <Input
                        type="date"
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
                            <TableHead>Recipient Client</TableHead>
                            <TableHead>Size & Type</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
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
                                                <span className="font-medium truncate max-w-[200px]" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                    v{file.version || '1.0'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{file.clientName}</span>
                                            <span className="text-xs text-muted-foreground opacity-70">Client ID: ...{String(file.clientId).slice(-4)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 font-medium bg-background">
                                                {getFileTypeLabel(file.type)}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{file.size}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{file.uploadedBy}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {file.date || new Date(file.createdAt).toLocaleDateString()}
                                        </div>
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:text-destructive"
                                                onClick={() => handleDeleteFile(file._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                                        <p className="text-lg font-medium">No files found</p>
                                        <p className="text-sm opacity-70">Try adjusting your filters or upload a new file.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View/Preview Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedFile?.name}</DialogTitle>
                        <DialogDescription>
                            File shared with {selectedFile?.clientName} on {selectedFile?.date}
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

export default AdminFilesTab;
