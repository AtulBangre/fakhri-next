'use client';

import React from 'react';
import UnderConstruction from '@/components/ui/UnderConstruction';

export default function ConstructionShowcase() {
    return (
        <div className="section-padding">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <span className="badge-primary mb-4 text-xs font-bold uppercase tracking-widest">New Component</span>
                    <h2 className="heading-lg mb-4">Under Construction Variants</h2>
                    <p className="body-md max-w-2xl mx-auto">
                        These reusable components are designed to maintain <strong>Brand Consistency</strong> while
                        keeping users engaged on pages that are still being developed.
                    </p>
                </div>

                <div className="space-y-32">
                    {/* Variant 1: Default */}
                    <section className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                        <h3 className="heading-md mb-8 pl-6">1. Default View</h3>
                        <div className="bg-secondary/50 rounded-[2.5rem] p-4 md:p-12 border border-border/50 shadow-sm">
                            <UnderConstruction messageIndex={0} />
                        </div>
                    </section>

                    {/* Variant 2: Custom Message */}
                    <section className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                        <h3 className="heading-md mb-8 pl-6">2. Custom Title & Message</h3>
                        <div className="bg-secondary/50 rounded-[2.5rem] p-4 md:p-12 border border-border/50 shadow-sm">
                            <UnderConstruction
                                title="Service Portal Update"
                                customMessage="Our client management portal is currently being upgraded with AI-driven analytics. We'll be back online with enhanced features within 24 hours."
                            />
                        </div>
                    </section>

                    {/* Variant 3: Minimal (No Back Button) */}
                    <section className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                        <h3 className="heading-md mb-8 pl-6">3. Embedded Section Example</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-secondary/30 rounded-[2.5rem] p-8 md:p-12 border border-border/20">
                            <div className="space-y-6">
                                <span className="text-primary font-poppins font-bold text-sm tracking-widest uppercase">Integration</span>
                                <h4 className="heading-sm">Modular Deployment</h4>
                                <p className="body-md">
                                    The component is fully responsive and can be embedded within any existing page layout. This is perfect for marking specific features as "Coming Soon" without taking down the entire page.
                                </p>
                                <div className="flex gap-4">
                                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex-1">
                                        <p className="font-bold text-primary">Responsive</p>
                                        <p className="text-xs text-muted-foreground">Mobile optimized</p>
                                    </div>
                                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex-1">
                                        <p className="font-bold text-primary">Themed</p>
                                        <p className="text-xs text-muted-foreground">Brand aligned</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                                <UnderConstruction
                                    title="Coming Soon"
                                    messageIndex={3}
                                    showBackButton={false}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
