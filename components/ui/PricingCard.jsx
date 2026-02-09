'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronDown, Loader2 } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export const PricingCard = ({ plan, index }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleCardClick = (e) => {
        // Don't trigger if clicking the button
        if (e.target.closest('button')) return;

        // Scroll to compare plans section
        const comparePlansSection = document.getElementById('compare-plans');
        if (comparePlansSection) {
            comparePlansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handleBuyPlan = async () => {
        if (!session) {
            toast.error('Please sign in to purchase a plan');
            router.push('/auth/signin?callbackUrl=/pricing');
            return;
        }

        setIsLoading(true);

        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setIsLoading(false);
                return;
            }

            // Parse amount: "₹15,000" -> 15000
            const amountStr = plan.prices.monthly.replace(/[^0-9.]/g, '');
            const amount = parseFloat(amountStr);

            if (isNaN(amount)) {
                toast.error('Invalid price configuration');
                setIsLoading(false);
                return;
            }

            // Create Order
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: plan.id,
                    amount: amount,
                    planParams: {
                        name: plan.name,
                        period: plan.period
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Fakhri IT Services',
                description: `Payment for ${plan.name} Plan`,
                image: '/Fakhri_Icon.png', // Ensure this exists or use a valid URL
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: data.orderId // Internal Order ID
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            toast.success('Payment successful!');
                            router.push('/client/dashboard');
                        } else {
                            toast.error(verifyData.error || 'Payment verification failed');
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error(error);
                    }
                },
                prefill: {
                    name: session.user.name,
                    email: session.user.email,
                    contact: '', // Can ask user for phone or fetch from profile
                },
                notes: {
                    address: 'Razorpay Corporate Office',
                },
                theme: {
                    color: '#EF4444', // Primary color (red-500)
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Something went wrong');
            setIsLoading(false);
        }
    };

    // Show only first 10 features
    const displayFeatures = plan.features.slice(0, 10);
    const hasMoreFeatures = plan.features.length > 10;

    return (
        <ScrollReveal delay={index * 0.1}>
            <motion.div
                onClick={handleCardClick}
                className={`relative h-full rounded-2xl overflow-hidden cursor-pointer ${plan.highlighted
                    ? 'bg-primary text-primary-foreground shadow-red'
                    : 'bg-card border border-border'
                    }`}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
                {/* Popular Badge */}
                {plan.highlighted && (
                    <div className="absolute top-0 right-0 bg-background text-primary text-xs font-semibold px-4 py-1.5 rounded-bl-lg">
                        Most Popular
                    </div>
                )}

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <p className={`text-sm font-medium mb-1 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                            {plan.subtitle}
                        </p>
                        <h3 className="heading-md mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-poppins font-bold">{plan.prices.monthly || 1000}</span>
                            {plan.period && (
                                <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}>
                                    {plan.period}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-8 ${plan.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                        {plan.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                        {displayFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                {feature.included ? (
                                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-primary-foreground' : 'text-primary'
                                        }`} />
                                ) : (
                                    <X className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-primary-foreground/30' : 'text-muted-foreground/30'
                                        }`} />
                                )}
                                <span className={`text-sm ${feature.included
                                    ? ''
                                    : plan.highlighted
                                        ? 'text-primary-foreground/40'
                                        : 'text-muted-foreground/40'
                                    }`}>
                                    {feature.text}
                                    {feature.value && typeof feature.value === 'string' && (
                                        <span className={`block text-xs font-semibold mt-0.5 ${plan.highlighted ? 'text-primary-foreground/90' : 'text-primary'}`}>
                                            {feature.value}
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* See more features hint */}
                    {hasMoreFeatures && (
                        <div className={`flex items-center justify-center gap-1 mb-6 text-xs ${plan.highlighted ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            }`}>
                            <ChevronDown className="w-3 h-3" />
                            <span>Click to see all features</span>
                        </div>
                    )}

                    {/* CTA */}
                    <motion.button
                        onClick={handleBuyPlan}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-lg font-poppins font-semibold transition-all duration-300 flex items-center justify-center ${plan.highlighted
                            ? 'bg-background text-primary hover:bg-background/90'
                            : 'bg-primary text-primary-foreground hover:shadow-red'
                            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : null}
                        {plan.cta}
                    </motion.button>
                </div>
            </motion.div>
        </ScrollReveal>
    );
};
