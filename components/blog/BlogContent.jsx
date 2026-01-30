'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { blogPosts, blogCategories } from '@/data/blog';

export default function BlogContent() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredPosts = selectedCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.category === selectedCategory);

    return (
        <>
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge-primary mb-4">Blog</span>
                            <h1 className="heading-xl mb-6">
                                Amazon Seller <span className="text-primary">Insights</span> & Tips
                            </h1>
                            <p className="body-lg">
                                Expert insights, strategies, and tips to help you grow your Amazon business.
                                Stay updated with the latest marketplace trends.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Category Filter */}
            <section className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-lg border-b border-border py-4 shadow-sm">
                <div className="container-custom">

                    <div className="flex flex-wrap justify-center gap-2">
                        {blogCategories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${selectedCategory === category.name
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    {/* Results Counter */}
                    <div className="text-center mt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'post' : 'posts'}
                            {selectedCategory !== 'All' && (
                                <span> in <span className="font-semibold text-primary">{selectedCategory}</span></span>
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="section-padding">
                <div className="container-custom">
                    <StaggerContainer key={selectedCategory} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <StaggerItem key={post.id}>
                                <motion.article
                                    className="card-premium h-full flex flex-col overflow-hidden"
                                    whileHover={{ y: -5 }}
                                >
                                    {/* Thumbnail Image */}
                                    <Link href={`/blog/${post.slug}`} className="block mb-4">
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted group">
                                            <Image
                                                src={post.thumbnail}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>

                                    {/* Category Badge */}
                                    <div className="mb-4">
                                        <span className="badge-primary text-xs">{post.category}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="heading-sm mb-3">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pt-4 border-t border-border">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(post.publishDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readTime}
                                        </div>
                                    </div>

                                    {/* Read More */}
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-primary font-medium text-sm group"
                                    >
                                        Read More
                                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.article>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">
                                No posts found in this category.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
