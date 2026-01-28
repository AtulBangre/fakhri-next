'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import ServiceCard from '@/components/ui/ServiceCard';
import { servicesData } from '@/data/services';

export default function ServicesPreview() {
    return (
        <section className="section-padding">
            <div className="container-custom">
                <ScrollReveal>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="badge-primary mb-4">Our Services</span>
                        <h2 className="heading-lg mb-4">
                            Complete Amazon Seller Solutions
                        </h2>
                        <p className="body-md">
                            From account setup to strategic growth, we provide end-to-end services
                            that help you succeed on Amazon.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesData.slice(0, 6).map((service, index) => (
                        <ServiceCard key={service.id} service={service} index={index} variant="compact" />
                    ))}
                </div>

                <ScrollReveal>
                    <div className="text-center mt-12">
                        <Link href="/services" className="btn-outline group">
                            View All Services
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
