'use client';

import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';

export default function TrustBadges({ initialContent }) {
    const { sections } = initialContent || {};
    // Read from DB: sections.badges
    const badges = sections?.badges || [
        { title: "2016", subtitle: "Founded" },
        { title: "Ind & UAE", subtitle: "Locations" },
        { title: "100%", subtitle: "Bootstrapped" },
        { title: "50-100", subtitle: "Team Size" }
    ];

    return (
        <section className="py-12 bg-secondary/50">
            <div className="container-custom">
                <StaggerContainer className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {badges.map((badge, index) => (
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
