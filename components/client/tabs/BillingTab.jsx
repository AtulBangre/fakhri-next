"use client";

import { useState, useEffect } from "react";
import { Download, Eye, CreditCard, Loader2, Trash2, Plus, Info } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { getInvoices, getInvoiceSummary } from "@/lib/actions/invoice";
import {
    updatePaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod
} from "@/lib/actions/user";
import { getPricingPlans } from "@/lib/actions/content";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { NoPlanState } from "@/components/client/NoPlanState";

const ClientBillingTab = ({ currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);

    // Dialog states
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);

    // New Card Form State
    const [newCard, setNewCard] = useState({
        brand: "Visa",
        last4: "",
        expiry: "",
        cardholderName: "",
        isDefault: false
    });

    const loadBillingData = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            // Fetch invoices, summary and master plan data
            const [invoicesRes, summaryRes, plans] = await Promise.all([
                getInvoices({ clientId: currentUser._id, limit: 10 }),
                getInvoiceSummary(currentUser._id),
                getPricingPlans()
            ]);

            setInvoices(invoicesRes.invoices || []);
            setSummary(summaryRes);

            // Find the user's current plan details
            if (currentUser.plan) {
                const currentPlan = plans.find(p =>
                    p.name.toLowerCase().trim() === currentUser.plan.toLowerCase().trim()
                );
                setPlanDetails(currentPlan);
            }
        } catch (error) {
            console.error("Error loading client billing data:", error);
            toast.error("Failed to load billing details");
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setClient(currentUser);
            await loadBillingData();
            setLoading(false);
        };
        init();
    }, [currentUser]);

    const handleSetDefault = async (index) => {
        try {
            const res = await setDefaultPaymentMethod(client._id, index);
            if (res.success) {
                setClient(res.user);
                toast.success("Default payment method updated");
            } else {
                toast.error(res.error || "Failed to update default method");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteMethod = async (index) => {
        if (!confirm("Are you sure you want to remove this payment method?")) return;
        try {
            const res = await deletePaymentMethod(client._id, index);
            if (res.success) {
                setClient(res.user);
                toast.success("Payment method removed");
            } else {
                toast.error(res.error || "Failed to remove method");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleAddCard = async () => {
        if (!newCard.last4 || !newCard.expiry || !newCard.cardholderName) {
            toast.error("Please fill in all card details");
            return;
        }

        if (newCard.last4.length !== 4) {
            toast.error("Last 4 digits must be exactly 4 numbers");
            return;
        }

        try {
            const res = await updatePaymentMethod(client._id, {
                ...newCard,
                providerId: `pm_fake_${Date.now()}` // Generating a mock provider ID for logic check
            });
            if (res.success) {
                setClient(res.user);
                setIsAddCardOpen(false);
                setNewCard({ brand: "Visa", last4: "", expiry: "", cardholderName: "", isDefault: false });
                toast.success("Payment method added successfully");
            } else {
                toast.error(res.error || "Failed to add method");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDownload = (invoice) => {
        const url = invoice.url || invoice.downloadUrl;
        if (!url) {
            toast.info("Invoice document is being generated. Please check back in a few minutes.", {
                icon: <Info className="h-4 w-4" />
            });
            return;
        }
        window.open(url, '_blank');
    };

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

    if (!client.plan && invoices.length === 0) {
        return (
            <NoPlanState
                title="Billing & Invoices"
                message="Your billing history and invoices will appear here once you have an active subscription or make a purchase."
            />
        );
    }

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
                    <p className="text-2xl font-heading font-bold uppercase">{client.plan || "No Active Plan"}</p>
                    <p className="text-sm font-medium text-primary">
                        {client.plan ? (planDetails?.prices?.monthly || "Custom Pricing") : "-"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Status: {client.plan ? (client.status || "Active") : "-"}</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Next Payment</span>
                    </div>
                    <p className="text-2xl font-heading font-bold">{client.plan ? nextPaymentDateString : "N/A"}</p>
                    <p className="text-sm text-muted-foreground">{client.plan ? "Monthly recurrence" : "No payment scheduled"}</p>
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setIsViewOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(invoice)}
                                            >
                                                <Download className="h-4 w-4" />
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

            {/* Invoice View Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center pr-8">
                            <span>Invoice {selectedInvoice?.invoiceNumber || 'Detail'}</span>
                            <StatusBadge status={selectedInvoice?.status} />
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice ? (
                        <div className="py-4 space-y-6">
                            <div className="flex justify-between border-b pb-6">
                                <div>
                                    <h3 className="text-lg font-bold">Fakhri IT Solutions</h3>
                                    <p className="text-sm text-muted-foreground">Invoice Date: {selectedInvoice?.date || new Date(selectedInvoice?.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted-foreground">Due Date: {selectedInvoice?.dueDate || 'On Receipt'}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="font-semibold text-sm uppercase text-muted-foreground">Bill To</h4>
                                    <p className="font-medium">{selectedInvoice?.client?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedInvoice?.client?.company}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInvoice?.items?.length > 0 ? (
                                            selectedInvoice.items.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{item.description}</TableCell>
                                                    <TableCell className="text-center">{item.qty}</TableCell>
                                                    <TableCell className="text-right">₹{formatINR(item.price)}</TableCell>
                                                    <TableCell className="text-right font-semibold">₹{formatINR(item.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-4">No items listed</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end pt-4">
                                    <div className="w-1/3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>₹{formatINR(selectedInvoice?.amount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                            <span>Total Paid</span>
                                            <span className="text-primary">₹{formatINR(selectedInvoice?.amount || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-accent/30 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Paid Via</p>
                                        <p className="text-sm font-semibold">{selectedInvoice?.paymentMethod || 'Default Card'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedInvoice)} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                            <p>Loading invoice details...</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Methods */}
            {/* <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading font-semibold mb-4">Payment Method</h2>
                {client.paymentMethods?.length > 0 ? (
                    <div className="space-y-4">
                        {client.paymentMethods.map((method, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${method.isDefault ? 'bg-primary/5 border border-primary/20' : 'bg-accent/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold uppercase relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-1 opacity-20">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        {method.brand || "Visa"}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">•••• •••• •••• {method.last4 || "4242"}</p>
                                            {method.isDefault && <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-primary/20">Default</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{method.cardholderName && `${method.cardholderName} • `}Expires {method.expiry || "12/2027"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!method.isDefault && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-8"
                                            onClick={() => handleSetDefault(idx)}
                                        >
                                            Set Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteMethod(idx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs h-8">Edit</Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed"
                            onClick={() => setIsAddCardOpen(true)}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Add Professional Payment Method
                        </Button>
                    </div>
                ) : (
                    <div className="p-8 rounded-xl border-2 border-dashed border-accent bg-accent/20 text-center">
                        <CreditCard className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-sm text-muted-foreground mb-4">No payment method on file yet.</p>
                        <Button variant="outline" size="sm" onClick={() => setIsAddCardOpen(true)}>Add Payment Method</Button>
                    </div>
                )}
            </div> */}

            {/* Add Card Dialog */}
            {/* <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Payment Method</DialogTitle>
                        <DialogDescription>
                            Your card details are stored securely. Only the last 4 digits are visible to us for billing purposes.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Cardholder Name</Label>
                            <Input
                                placeholder="e.g. Alex Johnson"
                                value={newCard.cardholderName}
                                onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Card Brand</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newCard.brand}
                                    onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                                >
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="Amex">American Express</option>
                                    <option value="Discover">Discover</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Last 4 Digits</Label>
                                <Input
                                    placeholder="e.g. 4242"
                                    maxLength={4}
                                    value={newCard.last4}
                                    onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date (MM/YY)</Label>
                            <Input
                                placeholder="e.g. 12/26"
                                maxLength={5}
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCard}>
                            <Plus className="h-4 w-4 mr-2" />
                            Securely Save Card
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    );
};

export default ClientBillingTab;
