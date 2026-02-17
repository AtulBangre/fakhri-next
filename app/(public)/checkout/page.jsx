"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { getPricingPlans } from "@/lib/actions/content";
import { processCheckout, createRazorpayOrder, verifyPayment } from "@/lib/actions/checkout";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { cartItems, totalAmount: cartTotal, clearCart } = useCart();

    const [planId, setPlanId] = useState(searchParams.get("plan"));
    const [planDetails, setPlanDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: ""
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.id = 'razorpay-script';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?role=client&callbackUrl=/checkout${planId ? `?plan=${planId}` : ''}`);
        } else if (status === "authenticated" && session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
            }));
        }
    }, [status, session, router, planId]);

    useEffect(() => {
        const fetchPlan = async () => {
            if (planId) {
                try {
                    const plans = await getPricingPlans();
                    const selectedPlan = plans.find(p => p.planId === planId || p._id === planId);
                    if (selectedPlan) {
                        setPlanDetails(selectedPlan);
                    }
                } catch (error) {
                    console.error("Error fetching plan:", error);
                    toast.error("Failed to load plan details");
                }
            }
            setLoading(false);
        };
        fetchPlan();
    }, [planId]);

    const calculateTotals = () => {
        let subtotal = cartTotal;
        if (planDetails) {
            const planPrice = parseFloat((planDetails.prices?.monthly || "0").replace(/[^0-9.]/g, ''));
            subtotal += planPrice;
        }

        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        return { subtotal, tax, total };
    };

    const { subtotal, tax, total } = calculateTotals();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!session?.user?.id && !session?.user?._id) {
                toast.error("User ID missing. Please log in again.");
                return;
            }

            // 1. Create Razorpay Order
            const orderRes = await createRazorpayOrder({
                amount: total,
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            });

            if (!orderRes.success) {
                toast.error("Failed to create payment order. Please try again.");
                setSubmitting(false);
                return;
            }

            // 2. Open Razorpay Checkout
            if (typeof window !== 'undefined' && window.Razorpay) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_S8nBupaDcI7xxs", // Ideally from env public var
                    amount: orderRes.order.amount,
                    currency: orderRes.order.currency,
                    name: "Fakhri IT Services",
                    description: "Payment for order",
                    image: "/favicon.ico",
                    order_id: orderRes.order.id,
                    handler: async function (response) {
                        // 3. Payment Success Handler
                        try {
                            const result = await processCheckout({
                                userId: session.user.id || session.user._id,
                                planId: planDetails ? planDetails.planId : null,
                                cartItems: cartItems,
                                billingDetails: formData,
                                totalAmount: total,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature
                            });

                            if (result.success) {
                                toast.success("Payment successful!");
                                clearCart();
                                router.push(`/client/dashboard?orderSuccess=true&invoice=${result.invoiceNumber}`);
                            } else {
                                toast.error(result.error || "Failed to process order");
                            }
                        } catch (err) {
                            console.error("Post-payment processing failed:", err);
                            toast.error("Payment successful but failed to update order. Please contact support.");
                        } finally {
                            setSubmitting(false);
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: formData.email,
                        contact: formData.phone
                    },
                    notes: {
                        address: formData.address
                    },
                    theme: {
                        color: "#DC2626" // Brand red
                    },
                    modal: {
                        ondismiss: function () {
                            setSubmitting(false);
                            toast.info("Payment cancelled.");
                        }
                    }
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                toast.error("Razorpay SDK failed to load. Please verify connection.");
                setSubmitting(false);
            }

        } catch (error) {
            console.error("Checkout submission error:", error);
            toast.error("An unexpected error occurred");
            setSubmitting(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-heading text-gray-900">Checkout</h1>
                    <p className="mt-2 text-gray-600">Complete your secure payment to activate services.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Billing Details
                        </h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="john@example.com"
                                    disabled={!!session?.user?.email}
                                    className={session?.user?.email ? "bg-gray-50" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name (Optional)</Label>
                                <Input
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Your Company Pvt Ltd"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Billing Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Street, City, Zip"
                                />
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Payment Method
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Razorpay Secure</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Pay securely using Credit/Debit Card, UPI, Net Banking, or Wallets.
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[10px] font-mono bg-white p-1 px-2 rounded border border-blue-200 text-blue-800">UPI</span>
                                            <span className="text-[10px] font-mono bg-white p-1 px-2 rounded border border-blue-200 text-blue-800">Cards</span>
                                            <span className="text-[10px] font-mono bg-white p-1 px-2 rounded border border-blue-200 text-blue-800">NetBanking</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:sticky lg:top-8 h-fit">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/10">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {/* Plan Item */}
                                {planDetails && (
                                    <div className="flex justify-between items-start py-2 border-b border-dashed">
                                        <div>
                                            <p className="font-medium text-gray-900">{planDetails.name} Plan</p>
                                            <p className="text-xs text-muted-foreground">Monthly Subscription</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                                SUBSCRIPTION
                                            </span>
                                        </div>
                                        <p className="font-medium">{planDetails.prices?.monthly || "Custom"}</p>
                                    </div>
                                )}

                                {/* Cart Items */}
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-dashed last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.category} (x{item.quantity})</p>
                                        </div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}

                                {(!planDetails && cartItems.length === 0) && (
                                    <p className="text-center text-muted-foreground py-4 italic">Your cart is empty.</p>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (18% GST)</span>
                                    <span>₹{tax.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                type="submit"
                                form="checkout-form"
                                disabled={submitting || (!planDetails && cartItems.length === 0)}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Pay Now <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Processed securely via Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
