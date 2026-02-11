"use client";
import { Download, Eye, CreditCard } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getInvoicesByClientId, getBillingSummaryByClientId } from "@/data/invoices";
import { getClientById } from "@/data/clients";
import { plans } from "@/data/pricingPlans";

const CURRENT_CLIENT_ID = 1;

const ClientBillingTab = () => {
    const client = getClientById(CURRENT_CLIENT_ID);
    const invoices = getInvoicesByClientId(CURRENT_CLIENT_ID);
    const billingSummary = getBillingSummaryByClientId(CURRENT_CLIENT_ID);

    if (!client) return <div>Loading...</div>;

    // Find current plan details
    const currentPlan = plans.find(p =>
        p.name.toLowerCase() === client.plan.toLowerCase() ||
        p.id.toLowerCase() === client.plan.toLowerCase()
    );

    // Default to a fallback if plan not found (shouldn't happen with correct data)
    const planPrice = currentPlan ? currentPlan.prices.monthly : "₹0";

    // Calculate next payment date (mock: 30 days from last invoice or today)
    const lastInvoiceDate = invoices.length > 0 ? new Date(invoices[0].date) : new Date();
    const nextPaymentDate = new Date(lastInvoiceDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
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
                    <p className="text-2xl font-heading font-bold">{client.plan}</p>
                    <p className="text-sm text-muted-foreground">{planPrice}/month</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Next Payment</span>
                    </div>
                    <p className="text-2xl font-heading font-bold">{nextPaymentDateString}</p>
                    <p className="text-sm text-muted-foreground">{planPrice} due</p>
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Total Paid</span>
                    </div>
                    <p className="text-2xl font-heading font-bold">₹{billingSummary.totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{billingSummary.paidCount} invoices</p>
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
                            <TableHead>Invoice</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={invoice.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
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

            {/* Payment Methods */}
            <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                        </div>
                        <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                </div>
            </div>
        </div>
    );
};

export default ClientBillingTab;
