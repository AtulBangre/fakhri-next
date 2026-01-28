'use client';

import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { companyData } from '@/data/company';

export default function TrustBadges() {
    return (
        <section className="py-12 bg-secondary/50">
            <div className="container-custom">
                <StaggerContainer className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {companyData.badges.map((badge, index) => (
                        <StaggerItem key={index}>
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-poppins font-bold text-primary">
                                    {badge.title}
                                </p>
                                <p className="text-sm text-muted-foreground">{badge.subtitle}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
