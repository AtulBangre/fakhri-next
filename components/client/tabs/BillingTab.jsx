"use client";

import { useState, useEffect } from "react";
import { Download, Eye, CreditCard, Loader2 } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { getInvoices, getInvoiceSummary } from "@/lib/actions/invoice";
import { getUsers } from "@/lib/actions/user";

const ClientBillingTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const loadBillingData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                setClient(currentUser);

                const invoicesResponse = await getInvoices({ clientId: currentUser._id, limit: 10 });
                setInvoices(invoicesResponse.invoices || []);

                const summaryResponse = await getInvoiceSummary(currentUser._id);
                setSummary(summaryResponse);
            } catch (error) {
                console.error("Error loading client billing data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadBillingData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading billing information...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="bg-card rounded-xl border p-12 text-center">
                <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
                <p className="text-muted-foreground">We couldn't load your billing details. Please contact support.</p>
            </div>
        );
    }

    // Calculate next payment date (mock logic)
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    nextPaymentDate.setDate(1); // Set to 1st of next month
    const nextPaymentDateString = nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Billing</h1>
                <p className="text-muted-foreground">View your invoices and payment history.</p>
            </div>

            {/* Payment Summary */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Current Plan</span>
                    </div>
                    <p className="text-2xl font-heading font-bold uppercase">{client.plan || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Status: {client.status || "Active"}</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Next Payment</span>
                    </div>
                    <p className="text-2xl font-heading font-bold">{nextPaymentDateString}</p>
                    <p className="text-sm text-muted-foreground">Monthly recurrence</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Total Paid</span>
                    </div>
                    <p className="text-2xl font-heading font-bold">₹{formatINR(summary?.totalAmount || 0)}</p>
                    <p className="text-sm text-muted-foreground">{summary?.paidCount || 0} invoices paid</p>
                </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-heading font-semibold">Invoice History</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <TableRow key={invoice._id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber || invoice._id.slice(-8).toUpperCase()}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(invoice.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>₹{formatINR(invoice.totalAmount || invoice.amount)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={invoice.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={invoice.url} download={`invoice-${invoice.invoiceNumber || invoice._id}.pdf`}>
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Payment Methods */}
            <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading font-semibold mb-4">Payment Method</h2>
                {client.paymentMethod ? (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold uppercase">
                                {client.paymentMethod.type || "Card"}
                            </div>
                            <div>
                                <p className="font-medium">•••• •••• •••• {client.paymentMethod.last4 || "4242"}</p>
                                <p className="text-sm text-muted-foreground">Expires {client.paymentMethod.expiry || "12/2027"}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                    </div>
                ) : (
                    <div className="p-4 rounded-lg bg-accent/50 text-center">
                        <p className="text-sm text-muted-foreground mb-4">No payment method on file.</p>
                        <Button variant="outline" size="sm">Add Payment Method</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientBillingTab;
