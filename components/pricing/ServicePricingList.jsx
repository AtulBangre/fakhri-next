'use client';


import { useState } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { within2HoursPageServices as within2HoursServices, within2HoursPageInfo as within2HoursInfo } from '@/data/within2hours';

export default function ServicePricingList() {
    const [quantities, setQuantities] = useState(
        within2HoursServices.reduce((acc, service) => ({ ...acc, [service.id]: 1 }), {})
    );

    const handleIncrement = (id) => {
        setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
    };

    const handleDecrement = (id) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, prev[id] - 1) }));
    };

    const handleAddToCart = (service) => {
        console.log(`Adding ${quantities[service.id]} x ${service.name} to cart`);
        // TODO: Integrate with cart functionality
    };

    return (
        <section className="section-padding bg-gradient-to-b from-secondary/30 to-background">
            <div className="container-custom">
                {/* Section Header */}
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <span className="badge-primary mb-4">{within2HoursInfo.badge}</span>
                        <h2 className="heading-lg mb-6">
                            {within2HoursInfo.title.split('Within 2 Hours')[0]}
                            <span className="text-primary">Within 2 Hours</span>
                        </h2>
                        <p className="body-md max-w-2xl mx-auto">
                            {within2HoursInfo.description}
                        </p>
                    </div>
                </ScrollReveal>

                {/* Pricing Card */}
                <ScrollReveal>
                    <div className="max-w-5xl mx-auto">
                        <div className="card-premium border border-border">
                            <div className="divide-y divide-border/50">
                                {within2HoursServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                        className="group py-5 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                            {/* Service Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-poppins font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                                                    {service.name}
                                                </h3>
                                                {service.category && (
                                                    <span className="inline-block mt-1 text-xs text-muted-foreground">
                                                        {service.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                                {/* Price */}
                                                <div className="flex-shrink-0">
                                                    <span className="font-poppins font-bold text-xl md:text-2xl text-foreground">
                                                        ₹{service.price}
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-1.5 py-1.5 border border-border">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDecrement(service.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-all duration-200"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-4 h-4 text-muted-foreground" />
                                                    </motion.button>
                                                    <span className="w-10 text-center font-poppins font-semibold text-foreground">
                                                        {quantities[service.id]}
                                                    </span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleIncrement(service.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-all duration-200"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-4 h-4 text-muted-foreground" />
                                                    </motion.button>
                                                </div>

                                                {/* Add to Cart Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAddToCart(service)}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-poppins font-semibold rounded-lg transition-all duration-300 hover:shadow-red whitespace-nowrap"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Add to cart</span>
                                                    <span className="sm:hidden">Add</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Notice */}
                        <ScrollReveal delay={0.3}>
                            <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border/50 text-center">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">Note:</span> All services are delivered within 2 hours of order confirmation.
                                    <span className="text-primary ml-1">24/7 support available</span>
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
