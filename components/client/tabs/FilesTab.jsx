"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, FileText, Image, FileSpreadsheet, Eye, Calendar, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFilesByClientId } from "@/lib/actions/file";
import { getUsers } from "@/lib/actions/user";

const getFileIcon = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes("pdf") || t?.includes("document")) return <FileText className="h-5 w-5 text-red-500" />;
    if (t?.includes("excel") || t?.includes("sheet") || t?.includes("csv")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (t?.includes("image") || t?.includes("png") || t?.includes("jpg")) return <Image className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-muted-foreground" />;
};

const getFileTypeLabel = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes("pdf")) return "PDF";
    if (t?.includes("excel") || t?.includes("sheet")) return "Excel";
    if (t?.includes("image")) return "Image";
    return type || "File";
};

const ClientFilesTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [allFiles, setAllFiles] = useState([]);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

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
            } finally {
                setLoading(false);
            }
        };

        loadFilesData();
    }, [currentUser]);

    // Parse date string to Date object
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr);
    };

    // Filter files based on date range
    const filteredFiles = useMemo(() => {
        return allFiles.filter(file => {
            const fileDate = parseDate(file.createdAt);
            if (dateRange.start && fileDate) {
                const startDate = new Date(dateRange.start);
                if (fileDate < startDate) return false;
            }
            if (dateRange.end && fileDate) {
                const endDate = new Date(dateRange.end);
                // Set to end of day
                endDate.setHours(23, 59, 59, 999);
                if (fileDate > endDate) return false;
            }
            return true;
        });
    }, [dateRange, allFiles]);

    const hasActiveFilters = dateRange.start || dateRange.end;

    const clearFilters = () => {
        setDateRange({ start: "", end: "" });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading files...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Files & Deliverables</h1>
                <p className="text-muted-foreground">Access all files and deliverables for your account.</p>
            </div>

            {/* Date Filter */}
            <div className="bg-card rounded-xl border p-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Filter by Date:
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">From:</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-1.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">To:</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-1.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* File Stats */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Showing {filteredFiles.length} of {allFiles.length} files
            </div>

            {/* Files Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <TableRow key={file._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.type)}
                                            <span className="font-medium truncate max-w-[200px] lg:max-w-[300px]" title={file.name}>
                                                {file.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {getFileTypeLabel(file.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{file.size}</TableCell>
                                    <TableCell className="text-muted-foreground">{file.uploadedBy || file.adminName || "System"}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Preview</span>
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={file.url} download={file.name}>
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No files found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Read-only Notice */}
            <div className="bg-accent/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                <p>Files are uploaded by your account manager. Contact them if you need additional files.</p>
            </div>
        </div>
    );
};

export default ClientFilesTab;
