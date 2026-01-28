'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { PricingCard } from '@/components/ui/PricingCard';
import { pricingPlans, pricingDisclaimer } from '@/data/pricing';
import { pricingFAQs } from '@/data/faq';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, HelpCircle } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import FaQ from '../home/FaQ';
import ServicePricingList from './ServicePricingList';

import { useState } from 'react';
import { within2HoursData } from '@/data/contact';

export default function PricingContent() {
    const [billingCycle, setBillingCycle] = useState('yearly');

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge-primary mb-4">Pricing</span>
                            <h1 className="heading-xl mb-6">
                                Transparent <span className="text-primary">Pricing</span> for Every Stage
                            </h1>
                            <p className="body-lg mb-8">
                                Choose the plan that fits your business needs. Scale up as you grow
                                with our flexible pricing options.
                            </p>

                            {/* Billing Toggle - Pill Style */}
                            <div className="flex flex-col items-center mt-8 gap-4">
                                <div className="relative flex w-max p-1 bg-background border border-border rounded-full shadow-sm">
                                    {/* Sliding Active Background */}
                                    <motion.div
                                        className="absolute top-1 bottom-1 bg-primary rounded-full z-0"
                                        initial={false}
                                        animate={{
                                            x: billingCycle === 'quarterly' ? 0 : '100%',
                                            width: '50%'
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />

                                    {/* Quarterly Option */}
                                    <button
                                        onClick={() => setBillingCycle('quarterly')}
                                        className={`relative z-10 px-8 py-2.5 min-w-[120px] text-sm font-poppins font-semibold rounded-full transition-colors duration-200 ${billingCycle === 'quarterly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Quarterly
                                    </button>

                                    {/* Yearly Option */}
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`relative z-10 px-8 py-2.5 min-w-[120px] text-sm font-poppins font-semibold rounded-full transition-colors duration-200 ${billingCycle === 'yearly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Yearly
                                    </button>
                                </div>

                                {/* Dynamic Offer Text */}
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={billingCycle}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full"
                                    >
                                        {billingCycle === 'quarterly' ? 'Save 5% on Quarterly' : 'Save 15% on Yearly'}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="section-padding pt-8">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <PricingCard
                                key={plan.id}
                                plan={{
                                    ...plan,
                                    price: plan.prices[billingCycle]
                                }}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <ScrollReveal>
                        <div className="mt-12 p-6 bg-secondary/50 rounded-xl max-w-4xl mx-auto">
                            <div className="flex items-start gap-3">
                                <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    <strong>Important:</strong> {pricingDisclaimer}
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Feature Comparison */}
            <section id="compare-plans" className="section-padding scroll-mt-20">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <h2 className="heading-lg mb-4">Compare Plans</h2>
                            <p className="body-md max-w-2xl mx-auto">
                                See a detailed breakdown of what's included in each plan
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal>
                        <div className="overflow-x-auto">
                            <table className="w-full max-w-5xl mx-auto">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-4 px-4 font-poppins font-semibold">Feature</th>
                                        {pricingPlans.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className={`text-center py-4 px-4 font-poppins font-semibold ${plan.highlighted ? 'text-primary' : ''
                                                    }`}
                                            >
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricingPlans[0].features.map((feature, idx) => (
                                        <motion.tr
                                            key={idx}
                                            className="border-b border-border/50"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            viewport={{ once: true }}
                                        >
                                            <td className="py-4 px-4 text-sm">{feature.text}</td>
                                            {pricingPlans.map((plan) => (
                                                <td key={plan.id} className="text-center py-4 px-4">
                                                    {plan.features[idx].included ? (
                                                        <Check className="w-5 h-5 text-primary mx-auto" />
                                                    ) : (
                                                        <span className="text-muted-foreground/30">—</span>
                                                    )}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Scenarios Section */}
            <section className="section-padding bg-secondary/30">
                <div className="container-custom">
                    <div className="max-w-6xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-border">
                        <div className="grid lg:grid-cols-2 gap-12 items-start relative">

                            {/* IMAGE FIRST ON MOBILE */}
                            <div className="order-1 lg:order-2">
                                <ScrollReveal direction="right">
                                    <div className="relative lg:pl-8">
                                        <div style={{ position: "relative", width: "100%", height: "300px" }}>
                                            <Image
                                                src="https://e7.pngegg.com/pngimages/630/420/png-clipart-price-tag-label-icon-best-price-label-best-price-logo-love-text-thumbnail.png"
                                                alt="Service Image"
                                                fill
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* CONTENT SECOND ON MOBILE */}
                            <div className="order-2 lg:order-1">
                                <ScrollReveal direction="left">
                                    <div>
                                        <h2 className="heading-lg mb-6">
                                            {within2HoursData.serviceInfo.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-8">
                                            {within2HoursData.serviceInfo.description}
                                        </p>
                                        <Link
                                            href={within2HoursData.serviceInfo.buttonLink}
                                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-poppins font-semibold rounded-lg transition-all duration-300 hover:shadow-lg group"
                                        >
                                            {within2HoursData.serviceInfo.buttonText}
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* Service Pricing List */}
            <ServicePricingList />

            {/* FAQ Section */}
            <FaQ data={pricingFAQs} />

            {/* CTA Section */}
            <section className="section-padding">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="heading-lg mb-6">
                                Ready to Get Started?
                            </h2>
                            <p className="body-md mb-8">
                                Contact us for a free consultation and let's discuss which plan
                                works best for your business.
                            </p>
                            <Link href="/contact" className="btn-primary">
                                Schedule a Call
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
