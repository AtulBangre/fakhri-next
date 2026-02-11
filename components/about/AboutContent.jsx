'use client';

import { useState, useMemo, useEffect } from 'react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import CompanyTimeline from './CompanyTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Zap, BarChart, Shield, Trophy, ArrowRight, Quote, Search, Filter, Loader2 } from 'lucide-react';
import { getTeamMembers, getCompanyData } from '@/lib/actions/content';
import Link from 'next/link';
import Image from 'next/image';
import { ContactDialog } from '@/components/dialogs/ContactDialog';
import { Button } from '@/components/ui/button';

const iconMap = {
    Users,
    Target,
    Zap,
    BarChart,
    Shield,
    Trophy
};

const whyChooseUs = [
    {
        title: "Amazon SPN & Affiliate Partner",
        description: "Officially recognized by Amazon for our expertise and service quality.",
        icon: "Shield"
    },
    {
        title: "Dedicated Account Managers",
        description: "Personalized attention with a single point of contact for your business.",
        icon: "Users"
    },
    {
        title: "Creative A+ & EBC Experts",
        description: "Award-winning design team that transforms listings into brand experiences.",
        icon: "Zap"
    },
    {
        title: "Performance-Driven Ads",
        description: "ROI-focused PPC campaigns that minimize ACOS and maximize sales.",
        icon: "Target"
    },
    {
        title: "Transparent Reporting",
        description: "Clear, actionable insights delivered weekly so you always know your standing.",
        icon: "BarChart"
    },
    {
        title: "Long-Term Growth Focus",
        description: "We don't just chase quick wins; we build sustainable brands.",
        icon: "Trophy"
    }
];

export default function AboutContent() {
    const [team, setTeam] = useState([]);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [teamData, companyData] = await Promise.all([
                getTeamMembers(),
                getCompanyData()
            ]);
            setTeam(teamData);
            setCompany(companyData);
            setLoading(false);
        }
        loadData();
    }, []);

    const teamCategories = useMemo(() => {
        const categories = ["All", ...new Set(team.map(m => m.category))];
        return categories.filter(Boolean);
    }, [team]);

    const filteredTeam = useMemo(() => {
        let filtered = team;

        if (activeCategory !== "All") {
            filtered = filtered.filter(member => member.category === activeCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(member =>
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered.sort((a, b) => (a.order || 99) - (b.order || 99));
    }, [activeCategory, searchQuery, team]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Getting everything ready...</p>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding pt-32 md:pt-40 bg-gradient-to-b from-primary/5 to-background overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

                <div className="container-custom relative z-10">
                    <ScrollReveal>
                        <div className="text-center max-w-4xl mx-auto">
                            <span className="badge-primary mb-4">About Fakhri IT Services</span>
                            <h1 className="heading-xl mb-6">
                                {company?.tagline || "We Are Your Growth Partners in the Amazon Marketplace"}
                            </h1>
                            <p className="body-lg mb-12">
                                {company?.description || "From account credentials to bestseller badges, we handle every aspect of your Amazon journey with precision and passion."}
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { value: "500+", label: "Clients Served" },
                                { value: "8+", label: "Years Experience" },
                                { value: "35+", label: "Team Members" }
                            ].map((stat, index) => (
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
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                                    alt="Office Culture"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <Quote className="w-8 h-8 mb-4 text-white/80" />
                                        <p className="text-lg font-medium italic">
                                            &ldquo;Our mission is to empower Amazon sellers with expert services that drive sustainable growth.&rdquo;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <div>
                                <h2 className="heading-lg mb-6">Amazon-First Approach to Digital Commerce</h2>
                                <p className="body-md mb-8">
                                    {company?.story || "Your trusted partner for Amazon success. We provide end-to-end Amazon seller services that help brands scale from startup to marketplace dominance. Our methodology combines data-driven insights with creative excellence to deliver measurable results."}
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Specialized Amazon Account Management",
                                        "Data-Backed Advertising Strategies",
                                        "Creative Design & Brand Storytelling",
                                        "Technical SEO & Listing Optimization"
                                    ].map((point, index) => (
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

            {/* Company Timeline Section */}
            <CompanyTimeline />

            {/* Team & Leadership with Filtering */}
            <section className="section-padding bg-secondary/30 overflow-hidden">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <ScrollReveal>
                            <h2 className="heading-lg mb-4">Meet the A-Team</h2>
                            <p className="body-md">
                                The experts and visionaries driving excellence and innovation for Amazon sellers globally.
                            </p>
                        </ScrollReveal>
                    </div>

                    {/* Team Filter Controls */}
                    <div className="mb-12 space-y-6">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {teamCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${activeCategory === category
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="max-w-md mx-auto relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search team member..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Team Grid with Animation */}
                    <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory + searchQuery}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredTeam.length > 0 ? (
                                    filteredTeam.map((member) => (
                                        <div
                                            key={member._id}
                                            className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full"
                                        >
                                            <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                                                <Image
                                                    src={member.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"}
                                                    alt={member.name}
                                                    fill
                                                    unoptimized={member.image?.startsWith('http')}
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                                    {member.description && (
                                                        <p className="text-white/90 text-sm mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                            {member.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                        {member.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold font-poppins mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                                                <p className="text-primary/80 text-sm font-medium">{member.role}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Filter className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">No members found</h3>
                                        <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                                            className="mt-2"
                                        >
                                            Reset all filters
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
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
                        <div className="relative bg-gradient-to-br from-primary to-brand-red-light rounded-3xl p-12 md:p-20 text-center overflow-hidden">
                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="heading-lg text-white mb-6">
                                    Ready to Transform Your Amazon Business?
                                </h2>
                                <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed">
                                    Join hundreds of successful brands that have scaled with Fakhri IT Services. Let's write your success story together.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <ContactDialog
                                        trigger={
                                            <button className="btn bg-white text-primary hover:bg-gray-100 min-w-[200px] py-4 rounded-lg font-bold transition-all hover:scale-105">
                                                Get in Touch
                                            </button>
                                        }
                                    />
                                    <Link href="/career" className="btn border-2 border-white/30 text-white hover:bg-white/10 min-w-[200px] py-4 rounded-lg font-bold transition-all hover:scale-105">
                                        View Careers
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
