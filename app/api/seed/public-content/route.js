
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import Plan from '@/models/Plan';
import BlogPost from '@/models/BlogPost';
import TeamMember from '@/models/TeamMember';
import Testimonial from '@/models/Testimonial';
import Faq from '@/models/Faq';
import PageContent from '@/models/PageContent';

import { servicesData } from '@/data/services';
import { pricingPlans } from '@/data/pricing';
import { blogPosts } from '@/data/blog';
import { leadershipTeam, aboutHero, companyOverview, whyChooseUs, timelineData, aboutCTA } from '@/data/about';
import { testimonials, socialTestimonials } from '@/data/testimonials';
import { homeFAQs, pricingFAQs } from '@/data/faq';
import { companyData, seoData } from '@/data/company';
import { navigationItems, footerLinks } from '@/data/navigation';
import { careerBenefits } from '@/data/career';

export async function GET() {
    try {
        await dbConnect();

        const results = {};

        // 1. Seed Services
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            const servicesToInsert = servicesData.map(service => ({
                serviceId: service.id,
                title: service.title,
                shortDescription: service.shortDescription,
                fullDescription: service.fullDescription,
                icon: service.icon,
                features: service.features || [],
                benefits: service.benefits || [],
                category: service.id === 'account-management' || service.id === 'reconciliation' ? 'Account Services' :
                    service.id === 'product-listing' || service.id === 'a-plus-content' ? 'Listing & Content' :
                        service.id === 'fba-operations' ? 'Operations' :
                            service.id === 'ads-management' || service.id === 'growth-strategy' ? 'Growth' : 'Account Services'
            }));
            await Service.insertMany(servicesToInsert);
            results.services = `Seeded ${servicesToInsert.length} services`;
        } else {
            results.services = 'Services already exist';
        }

        // 2. Seed Plans
        const planCount = await Plan.countDocuments();
        if (planCount === 0) {
            const plansToInsert = pricingPlans.map(plan => ({
                planId: plan.id,
                name: plan.name,
                subtitle: plan.subtitle,
                price: parseInt(plan.prices.monthly.replace(/[^0-9]/g, '')),
                currency: '₹',
                period: plan.period,
                description: plan.description,
                highlighted: plan.highlighted,
                features: plan.features,
                cta: plan.cta,
                sortOrder: plan.id === 'elite' ? 1 : plan.id === 'premium' ? 2 : 3
            }));
            await Plan.insertMany(plansToInsert);
            results.plans = `Seeded ${plansToInsert.length} plans`;
        } else {
            results.plans = 'Plans already exist';
        }

        // 3. Seed Blog Posts
        const blogCount = await BlogPost.countDocuments();
        if (blogCount === 0) {
            const blogsToInsert = blogPosts.map(post => ({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.excerpt + " (Full content to be added)",
                thumbnail: post.thumbnail,
                author: post.author,
                category: post.category,
                readTime: post.readTime,
                publishDate: new Date(post.publishDate),
                isPublished: true,
            }));
            await BlogPost.insertMany(blogsToInsert);
            results.blogs = `Seeded ${blogsToInsert.length} blog posts`;
        } else {
            results.blogs = 'Blog posts already exist';
        }

        // 4. Seed Team Members
        const teamCount = await TeamMember.countDocuments();
        if (teamCount === 0) {
            const members = [];
            if (leadershipTeam.core) members.push(...leadershipTeam.core.map((m, i) => ({ ...m, category: 'Core', sortOrder: i })));
            if (leadershipTeam.senior) members.push(...leadershipTeam.senior.map((m, i) => ({ ...m, category: 'Senior', sortOrder: i })));
            if (leadershipTeam.members) members.push(...leadershipTeam.members.map((m, i) => ({ ...m, category: 'Member', sortOrder: i })));

            await TeamMember.insertMany(members);
            results.team = `Seeded ${members.length} team members`;
        } else {
            results.team = 'Team members already exist';
        }

        // 5. Seed Testimonials
        const testimonialCount = await Testimonial.countDocuments();
        if (testimonialCount === 0) {
            const mainTestimonials = testimonials.map(t => ({
                clientName: t.name,
                clientDesignation: t.role,
                clientCompany: t.company,
                content: t.content,
                rating: t.rating,
                sortOrder: parseInt(t.id)
            }));
            const socialTestimonialsData = socialTestimonials.map((t, i) => ({
                clientName: t.name,
                clientDesignation: t.handle,
                clientImage: t.image,
                content: t.quote,
                rating: 5,
                sortOrder: 100 + i
            }));
            await Testimonial.insertMany([...mainTestimonials, ...socialTestimonialsData]);
            results.testimonials = `Seeded ${mainTestimonials.length + socialTestimonialsData.length} testimonials`;
        } else {
            results.testimonials = 'Testimonials already exist';
        }

        // 6. Seed FAQs
        const faqCount = await Faq.countDocuments();
        if (faqCount === 0) {
            const faqs = [];
            faqs.push(...homeFAQs.map((f, i) => ({ ...f, category: 'General', sortOrder: i })));
            faqs.push(...pricingFAQs.map((f, i) => ({ ...f, category: 'Pricing', sortOrder: i })));
            await Faq.insertMany(faqs);
            results.faqs = `Seeded ${faqs.length} FAQs`;
        } else {
            results.faqs = 'FAQs already exist';
        }

        // 7. Seed Page Content
        await PageContent.deleteMany({}); // Clear existing to ensure update
        const pages = [
            {
                page: 'home',
                hero: {
                    badge: 'Amazon Gold Partner',
                    title: companyData.tagline,
                    subtitle: companyData.description,
                    stats: companyData.stats.slice(0, 3)
                },
                seo: seoData.home
            },
            {
                page: 'company',
                sections: { info: companyData },
                seo: seoData.about
            },
            {
                page: 'about',
                hero: {
                    badge: aboutHero.badge,
                    title: aboutHero.title,
                    subtitle: aboutHero.subtitle,
                    stats: aboutHero.stats
                },
                sections: {
                    overview: companyOverview,
                    whyChooseUs: whyChooseUs,
                    timeline: timelineData,
                    cta: aboutCTA
                },
                seo: seoData.about
            },
            {
                page: 'services',
                hero: {
                    title: 'Amazon Marketplace Solutions',
                    subtitle: 'Scale your brand with our expert-led services.'
                },
                seo: seoData.services
            },
            {
                page: 'pricing',
                hero: {
                    title: 'Simple, Transparent Pricing',
                    subtitle: 'Choose a plan that fits your business stage.'
                },
                sections: {
                    disclaimer: "All prices are exclusive of taxes. Custom plans available for enterprise clients."
                },
                seo: seoData.pricing
            },
            {
                page: 'blog',
                hero: {
                    title: 'E-commerce Insights',
                    subtitle: 'Stay ahead with the latest Amazon marketplace trends.'
                },
                seo: seoData.blog
            },
            {
                page: 'career',
                hero: {
                    badge: 'Join our team',
                    title: 'Work at the Forefront of E-commerce',
                    subtitle: 'Help us shape the future of Amazon selling.'
                },
                sections: {
                    benefits: careerBenefits,
                    cta: {
                        title: "Don't see a perfect fit?",
                        description: "Send us your resume anyway! We're always looking for talented individuals."
                    }
                },
                seo: seoData.career
            },
            {
                page: 'within2hours',
                sections: {
                    info: {
                        badge: "Urgent Support",
                        title: "Priority Amazon Assistance",
                        description: "Critical issues need immediate attention. Our experts are ready to help within 2 hours."
                    }
                },
                seo: seoData.within2hours
            },
            {
                page: 'navigation',
                sections: {
                    main: navigationItems,
                    footer: footerLinks
                }
            },
            {
                page: 'testimonials',
                seo: {
                    title: "Client Testimonials | Fakhri IT Services",
                    description: "See what our clients say about our Amazon seller services.",
                    keywords: "Amazon seller reviews, testimonials, client success stories"
                }
            }
        ];

        await PageContent.insertMany(pages);
        results.pageContents = `Seeded ${pages.length} page contents`;

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
