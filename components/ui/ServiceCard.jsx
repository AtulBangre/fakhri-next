'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import {
    Settings,
    FileText,
    Package,
    Target,
    Image,
    DollarSign,
    TrendingUp
} from 'lucide-react';

const iconMap = {
    Settings,
    FileText,
    Package,
    Target,
    Image,
    DollarSign,
    TrendingUp,
};

export default function ServiceCard({ service, index, variant = 'default' }) {
    const Icon = iconMap[service.icon] || Settings;


    if (variant === 'compact') {
        const description = service.shortDescription || service.description;
        return (
            <ScrollReveal delay={index * 0.1} direction="up">
                <motion.div
                    className="group card-premium cursor-pointer h-full flex flex-col"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="heading-sm mb-3 group-hover:text-primary transition-colors">
                        {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                        {description}
                    </p>
                </motion.div>
            </ScrollReveal>
        );
    }

    return (
        <ScrollReveal delay={index * 0.1} direction="up">
            <motion.div
                id={service.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-500"
                whileHover={{ y: -5 }}
            >
                {/* Header */}
                <div className="p-8 pb-0">
                    <div className="flex items-start gap-5 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                            <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div>
                            <h3 className="heading-sm mb-2">{service.title}</h3>
                            <p className="text-muted-foreground text-sm">{service.shortDescription}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-4">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        {service.fullDescription}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                        <h4 className="font-poppins font-semibold text-sm mb-3">What&apos;s Included:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Benefits */}
                    {service.benefits && service.benefits.length > 0 && (
                        <div className="pt-6 border-t border-border">
                            <h4 className="font-poppins font-semibold text-sm mb-3">Key Benefits:</h4>
                            <div className="flex flex-wrap gap-2">
                                {service.benefits.map((benefit, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full"
                                    >
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </ScrollReveal>
    );
}
