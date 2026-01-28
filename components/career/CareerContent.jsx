'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { jobPositions, careerBenefits } from '@/data/career';

const benefitIcons = {
    Globe: MapPin,
    BookOpen: Briefcase,
    DollarSign: Clock,
    Heart: Clock,
    Users: MapPin,
    Calendar: Clock,
};

export default function CareerContent() {
    return (
        <>
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge-primary mb-4">Careers</span>
                            <h1 className="heading-xl mb-6">
                                Join Our <span className="text-primary">Growing Team</span>
                            </h1>
                            <p className="body-lg">
                                Be part of a dynamic team helping Amazon sellers achieve success.
                                Explore exciting career opportunities and grow with us.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Benefits */}
            <section className="section-padding">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-lg mb-4">Why Work With Us?</h2>
                            <p className="body-md">
                                We offer a collaborative environment with growth opportunities.
                            </p>
                        </div>
                    </ScrollReveal>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {careerBenefits.map((benefit, index) => {
                            const Icon = benefitIcons[benefit.icon] || Clock;
                            return (
                                <StaggerItem key={index}>
                                    <motion.div
                                        className="card-premium text-center h-full"
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="font-poppins font-semibold mb-2">{benefit.title}</h3>
                                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                                    </motion.div>
                                </StaggerItem>
                            );
                        })}
                    </StaggerContainer>
                </div>
            </section>

            {/* Job Openings */}
            <section className="section-padding bg-secondary/30">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-lg mb-4">Open Positions</h2>
                            <p className="body-md">
                                Find the perfect role that matches your skills and passion.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-6">
                        {jobPositions.map((job, index) => (
                            <ScrollReveal key={job.id} delay={index * 0.1}>
                                <motion.div
                                    className="bg-card rounded-2xl p-8 border border-border hover:border-primary/20 transition-all"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <h3 className="heading-sm">{job.title}</h3>
                                                <span className="badge-primary text-xs">{job.department}</span>
                                            </div>

                                            <p className="text-muted-foreground mb-4">{job.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {job.type}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {job.experience}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href="/contact"
                                            className="btn-primary whitespace-nowrap group"
                                        >
                                            Apply Now
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
