import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import ServiceCard from '@/components/ui/ServiceCard';
import { servicesData, serviceCategories } from '@/data/services';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.services.title,
    description: seoData.services.description,
    keywords: seoData.services.keywords,
};

export default function ServicesPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge-primary mb-4">Our Services</span>
                            <h1 className="heading-xl mb-6">
                                Comprehensive <span className="text-primary">Amazon Seller</span> Solutions
                            </h1>
                            <p className="body-lg">
                                From account setup to strategic growth, we offer a full suite of services
                                designed to help your brand thrive on Amazon&apos;s marketplace.
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
                            <a
                                key={category.name}
                                href={`#${category.services[0]}`}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                {category.name}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Services */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="space-y-8">
                        {servicesData.map((service, index) => (
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
                                Not Sure Which Services You Need?
                            </h2>
                            <p className="body-md mb-8">
                                Our experts can analyze your Amazon business and recommend the perfect
                                combination of services to achieve your goals.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/contact" className="btn-primary group">
                                    Get Free Consultation
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
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
