'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { motion } from 'framer-motion';
import { Users, Target, Zap, BarChart, Shield, Trophy, ArrowRight, Quote } from 'lucide-react';
import { aboutHero, companyOverview, leadershipTeam, whyChooseUs, aboutCTA } from '@/data/about';
import Link from 'next/link';
import Image from 'next/image';

const iconMap = {
    Users,
    Target,
    Zap,
    BarChart,
    Shield,
    Trophy
};

export default function AboutContent() {
    return (
        <>
            {/* Hero Section */}
            <section className="section-padding pt-32 md:pt-40 bg-gradient-to-b from-primary/5 to-background overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

                <div className="container-custom relative z-10">
                    <ScrollReveal>
                        <div className="text-center max-w-4xl mx-auto">
                            <span className="badge-primary mb-4">{aboutHero.badge}</span>
                            <h1 className="heading-xl mb-6">
                                {aboutHero.title}
                            </h1>
                            <p className="body-lg mb-12">
                                {aboutHero.subtitle}
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {aboutHero.stats.map((stat, index) => (
                                <div key={index} className="card-premium text-center p-8 border border-border">
                                    <p className="text-4xl md:text-5xl font-bold text-primary mb-2 font-poppins">
                                        {stat.value}
                                    </p>
                                    <p className="text-muted-foreground font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Company Overview */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal direction="left">
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                                <Image
                                    src={companyOverview.image}
                                    alt="Office Culture"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <Quote className="w-8 h-8 mb-4 text-white/80" />
                                        <p className="text-lg font-medium italic">
                                            "Our mission is to empower Amazon sellers with expert services that drive sustainable growth."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <div>
                                <h2 className="heading-lg mb-6">{companyOverview.title}</h2>
                                <p className="body-md mb-8">
                                    {companyOverview.description}
                                </p>
                                <ul className="space-y-4">
                                    {companyOverview.points.map((point, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span className="text-foreground font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Team & Leadership */}
            <section className="section-padding bg-secondary/30">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="heading-lg mb-4">Meet Our Leadership</h2>
                        <p className="body-md">
                            The visionaries driving excellence and innovation at Fakhri IT Services.
                        </p>
                    </div>

                    {/* Core Leadership */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {leadershipTeam.core.map((member, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
                                    <div className="aspect-[4/5] relative overflow-hidden">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <p className="text-white/90 text-sm">{member.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold font-poppins mb-1">{member.name}</h3>
                                        <p className="text-primary font-medium">{member.designation}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Senior Management */}
                    <div className="mb-16">
                        <h3 className="heading-md text-center mb-10">Senior Management</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {leadershipTeam.senior.map((member, index) => (
                                <ScrollReveal key={index} delay={index * 0.05}>
                                    <div className="flex flex-col items-center text-center group w-full">
                                        <div className="w-32 h-32 rounded-full overflow-hidden relative mb-4 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300 border-4 border-transparent group-hover:border-primary/5">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <h4 className="font-bold font-poppins text-lg text-foreground mb-1">{member.name}</h4>
                                        <p className="text-sm text-primary mb-2 font-medium">{member.designation}</p>
                                        <span className="text-xs text-primary/80 hover:text-primary transition-colors cursor-pointer font-medium">Email</span>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>

                    {/* Other Team Members Grid */}
                    <div>
                        <h3 className="heading-md text-center mb-10">Our Rising Stars</h3>
                        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leadershipTeam.members.map((member, index) => (
                                <StaggerItem key={index}>
                                    <div className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border hover:border-primary/30 transition-colors hover:-translate-y-1 duration-300">
                                        <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold font-poppins text-sm">{member.name}</h4>
                                            <p className="text-xs text-muted-foreground">{member.designation}</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section-padding">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-lg mb-4">Why Brands Choose Us?</h2>
                            <p className="body-md">
                                Extensive experience, technical expertise, and a relentless focus on your growth.
                            </p>
                        </div>
                    </ScrollReveal>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {whyChooseUs.map((item, index) => {
                            const Icon = iconMap[item.icon] || Shield;
                            return (
                                <StaggerItem key={index}>
                                    <div className="card-premium h-full border border-border hover:border-primary/20">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="heading-sm mb-3">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </StaggerItem>
                            );
                        })}
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding py-24 mb-10">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-12 md:p-20 text-center overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-[50%] -left-[20%] w-[100%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
                                />
                            </div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="heading-lg text-white mb-6">
                                    {aboutCTA.title}
                                </h2>
                                <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed">
                                    {aboutCTA.description}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/contact" className="btn bg-white text-primary hover:bg-gray-100 min-w-[200px] py-4 rounded-lg font-bold transition-all hover:scale-105">
                                        {aboutCTA.primaryBtn}
                                    </Link>
                                    <Link href="/career" className="btn border-2 border-white/30 text-white hover:bg-white/10 min-w-[200px] py-4 rounded-lg font-bold transition-all hover:scale-105">
                                        {aboutCTA.secondaryBtn}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
