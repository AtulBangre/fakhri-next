'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { timelineData } from '@/data/about';

export default function CompanyTimeline() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Translate the timeline content vertically based on scroll
    // From 0% (start) to -85% but with shorter container
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);
    // Opacity removed to ensure header is always visible when active

    return (
        <section ref={containerRef} className="relative h-[280vh] bg-background">
            <div className="sticky top-10 h-screen overflow-hidden flex flex-col pt-10 px-4">
                {/* Header Section */}
                <div
                    className="text-center z-20 bg-background/95 backdrop-blur-md py-6 border-b border-border/50 mb-8 max-w-full mx-auto w-full rounded-2xl shadow-sm"
                >
                    <h2 className="heading-lg mb-2">Our Company Milestone</h2>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]">
                        Wow...!!! What a journey so far...!!!
                    </p>
                </div>

                {/* Scrolling Timeline Container */}
                <div className="flex-1 relative w-full max-w-5xl mx-auto">
                    <motion.div
                        style={{ y }}
                        className="relative pb-24 pt-10" // Add padding to allow scrolling past last item
                    >
                        {/* Central Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 z-0" />

                        {timelineData.map((item, index) => (
                            <TimelineItem
                                key={index}
                                item={{ ...item, id: index }}
                                index={index}
                                isLast={index === timelineData.length - 1}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function TimelineItem({ item, index, isLast }) {
    const isEven = index % 2 === 0;

    return (
        <div className={`group relative flex flex-col md:flex-row items-center justify-between ${isLast ? 'mb-0' : 'mb-32 md:mb-48'} ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

            {/* Content Card */}
            <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} relative z-10`}>
                <div className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group-hover:border-primary/50 relative overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-bold text-primary mb-3">
                            {item.year}
                        </span>
                        <h3 className="heading-sm mb-3">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Center Node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full z-10 group-hover:scale-150 group-hover:bg-primary transition-all duration-300 shadow-[0_0_0_4px_rgba(var(--primary),0.1)]">
                <div className="w-full h-full rounded-full animate-ping opacity-20 bg-primary absolute inset-0" />
            </div>

            {/* Image Preview Slot (Opposite Side) */}
            <div className={`hidden md:block w-5/12 ${isEven ? 'pl-12' : 'pr-12'}`}>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl opacity-0 translate-y-4 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-700 ease-out">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            </div>

            {/* Mobile Image (Visible on simple Hover/Tap or always? Let's hide on mobile or show below) */}
            {/* For mobile layout, we might just show text to save space or stack image. */}
        </div>
    );
}
