'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import ServiceCard from '@/components/ui/ServiceCard';
import { ContactDialog } from '@/components/dialogs/ContactDialog';

export default function ServicesContent({ initialServices, initialContent }) {
    const services = initialServices || [];
    const { sections, hero } = initialContent || {};

    // Hero content
    const heroTitle = hero?.title || (
        <>
            Comprehensive <span className="text-primary">Amazon Seller</span> Solutions
        </>
    );
    const heroSubtitle = hero?.subtitle || "From account setup to strategic growth, we offer a full suite of services designed to help your brand thrive on Amazon's marketplace.";

    // CTA content
    const ctaTitle = sections?.cta?.title || "Not Sure Which Services You Need?";
    const ctaDescription = sections?.cta?.description || "Our experts can analyze your Amazon business and recommend the perfect combination of services to achieve your goals.";

    // Derive categories
    const categoryOrder = ['Account Services', 'Listing & Content', 'Operations', 'Growth'];
    const categoriesMap = new Map();

    services.forEach(service => {
        const cat = service.category || 'Other';
        if (!categoriesMap.has(cat)) {
            categoriesMap.set(cat, []);
        }
        categoriesMap.get(cat).push(service.id); // Assuming 'id' is available on service objects
    });

    // Create unique categories list
    const uniqueCategories = Array.from(categoriesMap.keys());

    // Sort categories based on predefined order
    const sortedCategories = uniqueCategories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        // If not found in order list, push to end
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    const serviceCategories = sortedCategories.map(name => ({
        name,
        services: categoriesMap.get(name)
    }));

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge-primary mb-4">Our Services</span>
                            <h1 className="heading-xl mb-6">
                                {hero?.title ? <span dangerouslySetInnerHTML={{ __html: hero.title }} /> : heroTitle}
                            </h1>
                            <p className="body-lg">
                                {heroSubtitle}
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Service Categories Navigation */}
            <section className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-lg border-b border-border py-4">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-2">
                        {serviceCategories.map((category) => (
                            <Link
                                key={category.name}
                                href={`#${category.services[0]}`} // Link to the first service in the category
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(category.services[0]);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Services */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="space-y-8">
                        {services.map((service, index) => (
                            <ServiceCard key={service.id} service={service} index={index} variant="default" />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-secondary/30">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="heading-lg mb-6">
                                {ctaTitle}
                            </h2>
                            <p className="body-md mb-8">
                                {ctaDescription}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <ContactDialog
                                    trigger={
                                        <button className="btn-primary group inline-flex items-center">
                                            Get Free Consultation
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    }
                                />
                                <Link href="/pricing" className="btn-outline">
                                    View Pricing Plans
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
