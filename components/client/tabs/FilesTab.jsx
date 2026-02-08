"use client";
import { useState, useMemo } from "react";
import { Download, FileText, Image, FileSpreadsheet, Eye, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const files = [
    { id: 1, name: "Product A - A+ Content Final.pdf", type: "pdf", size: "2.4 MB", version: "v2.0", uploadedBy: "Sarah Mitchell", date: "Jan 19, 2026" },
    { id: 2, name: "PPC Campaign Report - Week 3.xlsx", type: "excel", size: "856 KB", version: "v1.0", uploadedBy: "Sarah Mitchell", date: "Jan 18, 2026" },
    { id: 3, name: "Product Images - Main.zip", type: "image", size: "15.2 MB", version: "v2.0", uploadedBy: "Design Team", date: "Jan 15, 2026" },
    { id: 4, name: "Competitor Analysis Report.pdf", type: "pdf", size: "1.8 MB", version: "v1.0", uploadedBy: "Sarah Mitchell", date: "Jan 14, 2026" },
    { id: 5, name: "Brand Guidelines.pdf", type: "pdf", size: "4.2 MB", version: "v1.0", uploadedBy: "Design Team", date: "Jan 10, 2026" },
];

const getFileIcon = (type) => {
    switch (type) {
        case "pdf":
            return <FileText className="h-5 w-5 text-red-500" />;
        case "excel":
            return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
        case "image":
            return <Image className="h-5 w-5 text-blue-500" />;
        default:
            return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
};

const getFileTypeLabel = (type) => {
    switch (type) {
        case "pdf":
            return "PDF";
        case "excel":
            return "Excel";
        case "image":
            return "Image";
        default:
            return "File";
    }
};

const ClientFilesTab = () => {
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Parse date string to Date object
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr);
    };

    // Filter files based on date range
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const fileDate = parseDate(file.date);
            if (dateRange.start && fileDate) {
                const startDate = new Date(dateRange.start);
                if (fileDate < startDate) return false;
            }
            if (dateRange.end && fileDate) {
                const endDate = new Date(dateRange.end);
                if (fileDate > endDate) return false;
            }
            return true;
        });
    }, [dateRange]);

    const hasActiveFilters = dateRange.start || dateRange.end;

    const clearFilters = () => {
        setDateRange({ start: "", end: "" });
    };

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
                Showing {filteredFiles.length} of {files.length} files
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
                                <TableRow key={file.id}>
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
                                    <TableCell className="text-muted-foreground">{file.uploadedBy}</TableCell>
                                    <TableCell className="text-muted-foreground">{file.date}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Preview</span>
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No files found matching your date filter.
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
